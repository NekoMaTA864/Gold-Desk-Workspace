import {RuleReview} from './DecisionSupport';
import {getEvidence} from './DecisionSupport';
import type {RuleResult} from './DecisionSupport';
import type {Case,Draft,Side,State} from './types';
import {Term} from './Education';

const sideName=(side:Side)=>side==='BUY'?'買進':'賣出';
const gainClass=(value:string)=>value.startsWith('-')?'negative':'positive';

function CaseGroup({title,cases,onOpen}: {title:string;cases:Case[];onOpen:(id:string)=>void}) {
  return <div className="review-case-group"><h4>{title} <span>{cases.length} 筆展示</span></h4>{cases.length?cases.map(item=><button type="button" className="review-case-card" key={item.id} onClick={()=>onOpen(item.id)}><span><strong>{item.label}</strong><b className={gainClass(item.profit)}>{item.profit} {item.currency||'幣別未確認'}</b></span><small>相似：{item.match_reasons.join('、')||'操作條件資料有限'}</small><small>差異：{item.differences.join('、')||'資料未提供'}</small><em>查看案例詳情 ↗</em></button>):<p className="review-empty-case">目前沒有可展示案例</p>}</div>;
}

export default function PreflightReview({draft,state,rules,onOpenCase}: {draft:Draft;state:State|null;rules:RuleResult[];onOpenCase:(id:string)=>void}) {
  const pool=draft.retrieval;
  const evidence=getEvidence(pool,'ready');
  const losses=pool.cases.filter(item=>Number(item.profit)<0).slice(0,3);
  const wins=pool.cases.filter(item=>Number(item.profit)>0).slice(0,3);
  return <div className="preflight-review">
    <div className="preflight-context"><div><span>資料來源</span><strong>{state?.mode==='replay'?'合成回放 · 本機模擬':'券商練習帳戶未連線'}</strong></div><div><span>擬用價格</span><strong>{draft.price} USD</strong></div><div><span>方向與手數</span><strong>{sideName(draft.side)} {draft.lot} 手</strong></div><div><span>停損</span><strong>{draft.sl||'未設定'}</strong></div><div><span>停利</span><strong>{draft.tp||'未設定'}</strong></div><div><span>資料時間</span><strong>{typeof state?.quote.time==='number'?new Date(state.quote.time*1000).toISOString().slice(0,16).replace('T',' ')+' UTC':state?.quote.time||'—'}</strong></div></div>
    <p className="preflight-source-note">此檢查使用合成回放資料；即時 TradingView 圖表不會作為委託報價。正式券商報價與過期判斷待 C、B 接入。</p>
    <div className="preflight-grid">
      <section className="preflight-card"><div className="preflight-card-heading"><span>01</span><div><h3>部位與價格風險</h3><p>檢查加倉後的部位與不同價格情境 <Term id="scenario"/></p></div></div><div className="risk-grid"><span>原有手數<b>{draft.risk.before_lot}</b></span><span>檢查後手數<b>{draft.risk.after_lot}</b></span><span>同方向均價<b>{draft.risk.average_entry}</b></span><span>停損情境 USD<b>{draft.risk.stop_loss_usd??'未設定'}</b></span><span>本筆風險報酬比 <Term id="ratio"/><b>{draft.risk.reward_risk??'資料不足'}</b></span></div><div className="review-scenarios">{draft.risk.scenarios.map((item,index)=><span key={index}>價格移動 {item.move}<b className={item.loss.startsWith('-')?'positive':'negative'}>{item.loss.startsWith('-')?'獲利':'損失'} {item.loss.startsWith('-')?item.loss.slice(1):item.loss} USD</b></span>)}</div>{draft.risk.warnings.length>0&&<div className="warning-box">{draft.risk.warnings.map((item,index)=><p key={index}>{item}</p>)}</div>}<p className="fine">價格情境不是損失上限；無匹配案例時的歷史波動範圍待 B 接入。</p></section>
      <section className="preflight-card"><div className="preflight-card-heading"><span>02</span><div><h3>個人提醒</h3><p>目前依本機條件檢查，提醒不會自動下單</p></div></div><RuleReview results={rules}/><p className="fine">正式規則 ID、版本與觸發紀錄待 B 接入。</p></section>
      <section className="preflight-card preflight-cases"><div className="preflight-card-heading"><span>03</span><div><h3>相似歷史案例</h3><p>看相似與不同條件，以及事後結果</p></div></div><div className="preflight-pool"><strong>完整匹配池 {pool.total} 筆</strong><span>獲利 {pool.wins} · 虧損 {pool.losses} · 持平 {pool.flat} · 未知 {pool.unknown}</span></div>{pool.total===0?<div className="review-no-cases"><strong>目前沒有可比案例</strong><p>仍可核對上方的價格情境與個人提醒。查無案例不代表交易安全或危險。</p></div>:<div className="review-case-columns"><CaseGroup title="接近的虧損案例" cases={losses} onOpen={onOpenCase}/><CaseGroup title="接近的獲利案例" cases={wins} onOpen={onOpenCase}/></div>}<p className="fine">目前只比較可核對的操作條件；案例來源、每盎司結果與完整比對方法待 D 接入。歷史結果不代表本次勝率。</p></section>
      <section className="preflight-card"><div className="preflight-card-heading"><span>04</span><div><h3>證據是否充分 <Term id="evidence"/></h3><p>說明資料能參考到什麼程度</p></div></div><span className={`evidence-pill ${evidence.tone}`}>{evidence.label}</span><p className="evidence-description">{evidence.explanation}</p><div className="evidence-checks"><div><span>已成熟的匹配池</span><b>{pool.total?`${pool.total} 筆`:'0 筆 · 資料不足'}</b></div><div><span>結果兩側是否都有</span><b>{pool.wins&&pool.losses?'獲利／虧損皆有':'其中一側不足'}</b></div><div><span>盤面與時區對齊</span><b>尚未核實</b></div></div><p className="fine">這是本機展示的初步提示。D 的逐項判準與版本接入後，才顯示正式證據檢查表；不轉換為成功機率。</p></section>
      <section className="preflight-card preflight-explanation"><div className="preflight-card-heading"><span>05</span><div><h3>檢查說明</h3><p>把可核對的風險、提醒與案例整理成一句話</p></div></div><p className="explanation">{draft.explanation}</p><p className="fine">目前是本機模板說明。A 的 LLM 引用檢查接入後，案例與規則編號應可點開核對。</p></section>
    </div>
    {draft.order_type==='LIMIT'&&<div className="warning-box"><p>限價單確認後先列為待成交；回放僅以 K 棒高低價判定觸價，不含排隊、滑價與 K 棒內成交順序。</p></div>}
  </div>;
}
