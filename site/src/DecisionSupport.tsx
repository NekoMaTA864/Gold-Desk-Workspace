import Decimal from 'decimal.js';
import type {BarsResponse, Case, Retrieval, Side, State} from './types';

export type RuleConfig = {
  maxLotsEnabled: boolean;
  maxLots: string;
  maEnabled: boolean;
  maPosition: 'above' | 'below';
  candleEnabled: boolean;
  candleDirection: 'bullish' | 'bearish';
};

export const defaultRuleConfig: RuleConfig = {
  maxLotsEnabled: true,
  maxLots: '0.30',
  maEnabled: false,
  maPosition: 'above',
  candleEnabled: false,
  candleDirection: 'bullish',
};

export function loadRuleConfig(): RuleConfig {
  try {
    const saved = JSON.parse(localStorage.getItem('gold-desk-rules-v1') || 'null') as Partial<RuleConfig> | null;
    if (!saved || typeof saved !== 'object') return defaultRuleConfig;
    return {
      maxLotsEnabled: typeof saved.maxLotsEnabled === 'boolean' ? saved.maxLotsEnabled : true,
      maxLots: typeof saved.maxLots === 'string' && /^\d+(?:\.\d{1,2})?$/.test(saved.maxLots) ? saved.maxLots : '0.30',
      maEnabled: typeof saved.maEnabled === 'boolean' ? saved.maEnabled : false,
      maPosition: saved.maPosition === 'below' ? 'below' : 'above',
      candleEnabled: typeof saved.candleEnabled === 'boolean' ? saved.candleEnabled : false,
      candleDirection: saved.candleDirection === 'bearish' ? 'bearish' : 'bullish',
    };
  } catch { return defaultRuleConfig; }
}

type RuleState = 'triggered' | 'clear' | 'unknown' | 'disabled';
export type RuleResult = {id: string; name: string; state: RuleState; detail: string};

function decimal(value: string | null | undefined): Decimal | null {
  try { return value && new Decimal(value).isFinite() ? new Decimal(value) : null; }
  catch { return null; }
}

export function evaluateRules(config: RuleConfig, state: State | null, bars: BarsResponse, side: Side, lot: string, interval: string): RuleResult[] {
  const lots = decimal(lot), limit = decimal(config.maxLots);
  const price = decimal(side === 'BUY' ? state?.quote.ask : state?.quote.bid);
  const ma20 = decimal(state?.market.ma20);
  const lastThree = bars.bars.slice(-3);
  const desired = config.candleDirection === 'bullish' ? '陽線' : '陰線';
  const candleCount = lastThree.filter(bar => config.candleDirection === 'bullish' ? bar.close > bar.open : bar.close < bar.open).length;
  return [
    {id:'max_lots', name:'手數上限', state:!config.maxLotsEnabled?'disabled':!lots||!limit||limit.lte(0)?'unknown':lots.gt(limit)?'triggered':'clear', detail:!lots||!limit||limit.lte(0)?'手數或上限無效，無法評估':`${lot} lots ${lots.gt(limit)?'>':'≤'} 個人上限 ${config.maxLots} lots`},
    {id:'ma20', name:'5 分 MA20 位置', state:!config.maEnabled?'disabled':!price||!ma20?'unknown':(config.maPosition==='above'?price.gt(ma20):price.lt(ma20))?'triggered':'clear', detail:!price||!ma20?'缺少可核對的報價或 MA20':`${side==='BUY'?'買入':'賣出'}參考價 ${price.toFixed(2)}；MA20 ${ma20.toFixed(2)}；觀察${config.maPosition==='above'?'上方':'下方'}`},
    {id:'candles', name:'最近 3 根 K 棒', state:!config.candleEnabled?'disabled':lastThree.length<3?'unknown':candleCount>=2?'triggered':'clear', detail:lastThree.length<3?`目前 ${interval} 已收盤 K 棒不足 3 根`:`${interval} 最近 3 根有 ${candleCount} 根${desired}；門檻為至少 2 根`},
  ];
}

export type Evidence = {label: string; tone: 'good' | 'warn' | 'bad'; explanation: string};
export function getEvidence(pool: Retrieval | null, status: 'loading'|'ready'|'error'): Evidence {
  if (status === 'loading') return {label:'檢索中',tone:'warn',explanation:'正在查詢目前草稿的操作條件案例。'};
  if (status === 'error') return {label:'暫不可用',tone:'bad',explanation:'案例服務未回應；不能把查詢失敗當成沒有案例。'};
  if (!pool || pool.total === 0) return {label:'資料不足',tone:'bad',explanation:'目前沒有符合操作條件且已成熟的案例。保留風險情境與個人提醒供核對。'};
  return {label:'有限參考',tone:'warn',explanation:`找到 ${pool.total} 筆操作條件案例。目前未完成盤面相似度比對；歷史結果不代表本次結果。`};
}

type SharedProps = {pool:Retrieval|null; poolStatus:'loading'|'ready'|'error'; state:State|null; bars:BarsResponse; side:Side; lot:string; interval:string; rules:RuleConfig};

export function AgentSummary({pool,poolStatus,state,bars,side,lot,interval,rules,onOpenCase}:SharedProps & {onOpenCase:(id:string)=>void}) {
  const evidence = getEvidence(pool,poolStatus);
  const hits = evaluateRules(rules,state,bars,side,lot,interval).filter(rule=>rule.state==='triggered');
  return <section className="decision-support" aria-labelledby="decision-heading">
    <div className="decision-heading"><div><span className="decision-kicker">DECISION SUPPORT</span><h2 id="decision-heading">交易前分析</h2></div><span className="decision-version">接用目前回放資料</span></div>
    <div className="agent-cards">
      <article className="agent-card"><div className="agent-card-title"><span>01</span><div><h3>歷史 Agent</h3><p>依操作條件找相似案例，逐筆看差異</p></div></div>
        {poolStatus==='loading'?<p className="agent-empty">案例檢索中…</p>:poolStatus==='error'?<p className="agent-empty">案例檢索暫不可用，請稍後重試。</p>:pool?.cases.length?<><p className="agent-meta">完整匹配池 {pool.total} 筆 · 展示 {pool.cases.length} 筆</p><div className="agent-case-list">{pool.cases.slice(0,2).map((item:Case)=><button type="button" key={item.id} onClick={()=>onOpenCase(item.id)}><strong>{item.label} ↗</strong><small>{item.match_reasons.join('、') || '部分條件缺值'}</small><span>{item.profit} {item.currency||'幣別未確認'}</span></button>)}</div></>:<p className="agent-empty">目前沒有可比案例。仍可查看價格風險情境。</p>}
      </article>
      <article className="agent-card"><div className="agent-card-title"><span>02</span><div><h3>回復 Agent</h3><p>案例不足時保留可核對的資訊</p></div></div><span className={`evidence-pill ${evidence.tone}`}>{evidence.label}</span><p className="evidence-description">{evidence.explanation}</p><div className="agent-evidence-row"><span>已觸發個人提醒</span><strong>{hits.length} 項</strong></div></article>
    </div>
  </section>;
}

export function RuleEditor({config,onChange,results}: {config:RuleConfig;onChange:(value:RuleConfig)=>void;results:RuleResult[]}) {
  const update=(patch:Partial<RuleConfig>)=>onChange({...config,...patch});
  const status=(id:string)=>{const result=results.find(item=>item.id===id)!;return <span className={`rule-indicator ${result.state}`}>{result.state==='triggered'?'已觸發':result.state==='clear'?'未觸發':result.state==='unknown'?'無法評估':'未啟用'}</span>;};
  return <section className="rule-editor" aria-labelledby="rules-heading"><div className="rule-editor-heading"><span className="decision-kicker">PERSONAL AGENT</span><h2 id="rules-heading">我的提醒條件</h2><p>本機保存勾選條件；只提醒，不自動下單。</p></div>
    <div className="personal-rule"><div className="personal-rule-top"><label><input type="checkbox" checked={config.maxLotsEnabled} onChange={event=>update({maxLotsEnabled:event.target.checked})}/> 手數上限</label>{status('max_lots')}</div><div className="rule-options"><label htmlFor="rule-max-lots">超過</label><input id="rule-max-lots" type="number" min="0.01" max="100" step="0.01" value={config.maxLots} onChange={event=>update({maxLots:event.target.value})}/><span>lots 時提醒</span></div></div>
    <div className="personal-rule"><div className="personal-rule-top"><label><input type="checkbox" checked={config.maEnabled} onChange={event=>update({maEnabled:event.target.checked})}/> 5 分 MA20 位置</label>{status('ma20')}</div><div className="rule-options"><span>價格位於</span><select aria-label="MA20 條件" value={config.maPosition} onChange={event=>update({maPosition:event.target.value as RuleConfig['maPosition']})}><option value="above">上方</option><option value="below">下方</option></select><span>時提醒</span></div></div>
    <div className="personal-rule"><div className="personal-rule-top"><label><input type="checkbox" checked={config.candleEnabled} onChange={event=>update({candleEnabled:event.target.checked})}/> K 棒形態</label>{status('candles')}</div><div className="rule-options"><span>最近 3 根至少 2 根</span><select aria-label="K 棒方向" value={config.candleDirection} onChange={event=>update({candleDirection:event.target.value as RuleConfig['candleDirection']})}><option value="bullish">陽線</option><option value="bearish">陰線</option></select></div></div>
    <p className="rule-note">指標與 K 棒取自回放資料。缺值會顯示「無法評估」。</p>
  </section>;
}

export function RuleReview({results}:{results:RuleResult[]}) {
  const active=results.filter(rule=>rule.state!=='disabled');
  return <div className="review-mini-list">{active.length?active.map(rule=><div key={rule.id}><strong>{rule.name}</strong><span className={`rule-indicator ${rule.state}`}>{rule.state==='triggered'?'已觸發':rule.state==='clear'?'未觸發':'無法評估'}</span><p>{rule.detail}</p></div>):<p>尚未啟用個人提醒條件。</p>}</div>;
}

export function EvidenceReview({pool,status}: {pool:Retrieval|null;status:'loading'|'ready'|'error'}) {
  const evidence=getEvidence(pool,status);
  return <div className="evidence-review"><span className={`evidence-pill ${evidence.tone}`}>{evidence.label}</span><p>{evidence.explanation}</p><p className="fine">這是資料可參考程度，不是交易獲利機率。</p></div>;
}
