import {useState} from 'react';
import Decimal from 'decimal.js';
import type {Case, Draft, Retrieval, State} from './types';

export type RuleKind = 'order_lot'|'after_lot'|'missing_sl'|'stop_loss_usd';
export type PersonalRule = {kind:RuleKind; threshold:string|null; enabled:boolean};
export type RuleConfig = {rules:PersonalRule[]; legacyMarketRules?:boolean};
const ruleNames:Record<RuleKind,string>={order_lot:'本筆手數',after_lot:'下單後總手數',missing_sl:'未設定停損',stop_loss_usd:'停損價格情境損失'};
const ruleUnits:Record<RuleKind,string>={order_lot:'手',after_lot:'手',missing_sl:'',stop_loss_usd:'USD'};
const ruleKinds:RuleKind[]=['order_lot','after_lot','missing_sl','stop_loss_usd'];
const defaultThresholds:Record<RuleKind,string|null>={order_lot:'0.10',after_lot:'0.30',missing_sl:null,stop_loss_usd:'100'};
const quickThresholds:Record<Exclude<RuleKind,'missing_sl'>,string[]>={order_lot:['0.10','0.20','0.30','0.50','1.00'],after_lot:['0.10','0.30','0.50','1.00','2.00'],stop_loss_usd:['25','50','100','200','500']};
const completeRules=(rules:PersonalRule[]):PersonalRule[]=>ruleKinds.map(kind=>rules.find(rule=>rule.kind===kind)??{kind,threshold:defaultThresholds[kind],enabled:kind==='missing_sl'});
export const defaultRuleConfig:RuleConfig={rules:completeRules([])};
const validThreshold=(kind:RuleKind,value:unknown)=>{
  if(kind==='missing_sl')return value===null;
  if(typeof value!=='string'||!/^\d+(?:\.\d{1,2})?$/.test(value))return false;
  try {const n=new Decimal(value);return n.gt(0)&&n.lte(kind==='stop_loss_usd'?1000000000:100);} catch {return false;}
};

export function loadRuleConfig():RuleConfig {
  try {
    const saved=JSON.parse(localStorage.getItem('gold-desk-rules-v2')||'null') as RuleConfig|null;
    if(saved&&Array.isArray(saved.rules)){
      const seen=new Set<RuleKind>();
      const rules=saved.rules.filter(rule=>rule&&ruleKinds.includes(rule.kind)&&!seen.has(rule.kind)&&typeof rule.enabled==='boolean'&&validThreshold(rule.kind,rule.threshold)).map(rule=>{seen.add(rule.kind);return rule;});
      return {rules:completeRules(rules),legacyMarketRules:saved.legacyMarketRules===true};
    }
    const old=JSON.parse(localStorage.getItem('gold-desk-rules-v1')||'null') as {maxLotsEnabled?:boolean;maxLots?:string;maEnabled?:boolean;candleEnabled?:boolean}|null;
    if(!old)return defaultRuleConfig;
    const migrated:PersonalRule[]=[{kind:'missing_sl',threshold:null,enabled:true}];
    if(old.maxLotsEnabled&&validThreshold('order_lot',old.maxLots))migrated.push({kind:'order_lot',threshold:old.maxLots!,enabled:true});
    return {rules:completeRules(migrated),legacyMarketRules:Boolean(old.maEnabled||old.candleEnabled)};
  } catch {return defaultRuleConfig;}
}

type RuleState='triggered'|'clear'|'unknown'|'disabled';
export type RuleResult={id:RuleKind;name:string;state:RuleState;detail:string;value:string|null;threshold:string|null;version:'local-v2'};
function decimal(value:string|null|undefined):Decimal|null {
  try {return value&&new Decimal(value).isFinite()?new Decimal(value):null;} catch {return null;}
}
export function ruleText(rule:PersonalRule):string {
  return rule.kind==='missing_sl'?'本筆未設定停損時提醒':`${ruleNames[rule.kind]}超過 ${rule.threshold} ${ruleUnits[rule.kind]}時提醒`;
}
export function evaluateRules(config:RuleConfig,state:State|null,draft:Draft|null):RuleResult[] {
  return config.rules.map(rule=>{
    const name=ruleNames[rule.kind],threshold=rule.threshold;
    const base={id:rule.kind,name,threshold,version:'local-v2' as const};
    if(!rule.enabled)return {...base,state:'disabled' as const,value:null,detail:'這條提醒已暫停'};
    if(!state)return {...base,state:'unknown' as const,value:null,detail:'帳戶資料尚未載入，無法判斷'};
    if(!draft)return {...base,state:'unknown' as const,value:null,detail:'建立待確認草稿後才會比對'};
    if(rule.kind==='missing_sl'){
      const missing=!draft.sl;
      return {...base,state:missing?'triggered' as const:'clear' as const,value:missing?'未設定':'已設定',detail:missing?'本筆未設定停損；請自行核對風險':'本筆已設定停損；仍須核對價格與執行風險'};
    }
    const raw=rule.kind==='order_lot'?draft.lot:rule.kind==='after_lot'?draft.risk.after_lot:draft.risk.stop_loss_usd;
    const actual=decimal(raw),limit=decimal(threshold);
    if(!actual||!limit||limit.lte(0))return {...base,state:'unknown' as const,value:raw,detail:rule.kind==='stop_loss_usd'&& !draft.sl?'本筆未設定停損，無法試算停損情境損失':'試算或門檻資料不足，無法判斷'};
    const triggered=actual.gt(limit);
    const value=`${actual.toString()} ${ruleUnits[rule.kind]}`;
    return {...base,state:triggered?'triggered' as const:'clear' as const,value:actual.toString(),detail:`${name} ${value}，${triggered?'超過':'未超過'}你設定的 ${threshold} ${ruleUnits[rule.kind]}${rule.kind==='stop_loss_usd'?'；這是停損價格情境，不是損失上限':''}`};
  });
}

export type Evidence = {label: string; tone: 'good' | 'warn' | 'bad'; explanation: string};
export function getEvidence(pool: Retrieval | null, status: 'loading'|'ready'|'error'): Evidence {
  if (status === 'loading') return {label:'檢索中',tone:'warn',explanation:'正在查詢目前草稿的操作條件案例。'};
  if (status === 'error') return {label:'暫不可用',tone:'bad',explanation:'案例服務未回應；不能把查詢失敗當成沒有案例。'};
  if (!pool || pool.total === 0) return {label:'資料不足',tone:'bad',explanation:'目前沒有符合操作條件且已成熟的案例。保留風險情境與個人提醒供核對。'};
  return {label:'有限參考',tone:'warn',explanation:`找到 ${pool.total} 筆操作條件案例。目前未完成盤面相似度比對；歷史結果不代表本次結果。`};
}

type SharedProps = {pool:Retrieval|null; poolStatus:'loading'|'ready'|'error'; ruleResults:RuleResult[]};

export function AgentSummary({pool,poolStatus,ruleResults,onOpenCase}:SharedProps & {onOpenCase:(id:string)=>void}) {
  const evidence = getEvidence(pool,poolStatus);
  const hits = ruleResults.filter(rule=>rule.state==='triggered');
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

function RuleRow({rule,result,onUpdate}: {rule:PersonalRule;result:RuleResult|undefined;onUpdate:(rule:PersonalRule)=>void}) {
  const kind=rule.kind;
  const choices=kind==='missing_sl'?[]:quickThresholds[kind];
  const [customOpen,setCustomOpen]=useState(false);
  const [customValue,setCustomValue]=useState(rule.threshold??'');
  const [error,setError]=useState('');
  const pending=result?.state==='unknown'&&result.detail.includes('建立待確認草稿');
  const status=result?.state==='triggered'?'已觸發':result?.state==='clear'?'未觸發':pending?'待檢查':result?.state==='unknown'?'無法判斷':'已關閉';
  const selected=customOpen?'custom':rule.threshold??'';
  const thresholdChoices=rule.threshold&&!choices.includes(rule.threshold)?[...choices,rule.threshold]:choices;
  const updateThreshold=(value:string)=>{
    if(value==='custom'){setCustomValue(rule.threshold??'');setCustomOpen(true);setError('');return;}
    setCustomOpen(false);setError('');onUpdate({...rule,threshold:value});
  };
  const saveCustom=()=>{
    const value=customValue.trim();
    if(!validThreshold(kind,value)){setError(kind==='stop_loss_usd'?'請輸入大於 0 的美元數值，最多兩位小數。':'請輸入 0.01 至 100 手，最多兩位小數。');return;}
    onUpdate({...rule,threshold:value});setCustomOpen(false);setError('');
  };
  return <div className={`personal-rule${rule.enabled?'':' inactive'}`}>
    <div className="personal-rule-top"><label htmlFor={`rule-enabled-${kind}`}><input id={`rule-enabled-${kind}`} type="checkbox" checked={rule.enabled} onChange={event=>onUpdate({...rule,enabled:event.target.checked})}/>{ruleNames[kind]}</label><span className={`rule-indicator ${pending?'pending':result?.state||'disabled'}`}>{status}</span></div>
    {kind!=='missing_sl'&&<div className="rule-options"><label htmlFor={`rule-threshold-${kind}`}>超過</label><select id={`rule-threshold-${kind}`} value={selected} onChange={event=>updateThreshold(event.target.value)}>{thresholdChoices.map(value=><option value={value} key={value}>{value} {ruleUnits[kind]}</option>)}<option value="custom">自訂數值…</option></select><span>時提醒</span></div>}
    {customOpen&&<div className="rule-custom"><input aria-label={`${ruleNames[kind]}自訂門檻`} type="number" min="0.01" max={kind==='stop_loss_usd'?'1000000000':'100'} step="0.01" value={customValue} onChange={event=>setCustomValue(event.target.value)}/><span>{ruleUnits[kind]}</span><button type="button" onClick={saveCustom}>套用</button><button type="button" onClick={()=>{setCustomOpen(false);setError('');}}>取消</button></div>}
    {error&&<p className="modal-error" role="alert">{error}</p>}
    {result&&rule.enabled&&<p className="rule-result-detail">{result.detail}</p>}
  </div>;
}

export function RuleEditor({config,onChange,results}: {config:RuleConfig;onChange:(value:RuleConfig)=>void;results:RuleResult[]}) {
  const rules=completeRules(config.rules);
  const update=(changed:PersonalRule)=>onChange({...config,rules:rules.map(rule=>rule.kind===changed.kind?changed:rule)});
  return <section className="rule-editor" aria-labelledby="rules-heading"><div className="rule-editor-heading"><span className="decision-kicker">PERSONAL AGENT</span><h2 id="rules-heading">我的提醒條件</h2><p>勾選啟用、下拉選門檻；變更會直接儲存在此瀏覽器。建立草稿時才比對，不自動下單。</p></div>
    <div className="rule-quick-list"><div className="saved-rule-title"><strong>已啟用 {rules.filter(rule=>rule.enabled).length} / 4 項</strong><span>可隨時調整</span></div>{rules.map(rule=><RuleRow key={rule.kind} rule={rule} result={results.find(result=>result.id===rule.kind)} onUpdate={update}/>)}</div>
    {config.legacyMarketRules&&<p className="rule-note">舊版 MA／K 棒提醒仍保留在瀏覽器舊設定中，這一版不參與下單檢查。</p>}
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
