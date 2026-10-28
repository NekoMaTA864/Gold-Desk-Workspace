import {ReviewSections,RiskReview,RulesReview,EvidenceReview} from './IntegratedReview';
import CaseComparison from './CaseComparison';
import type {Draft} from './types';
import type {MarketReply} from './LiveAssistant';

export type BrokerReviewDraft=Draft&{analysis_reply?:MarketReply|null;analysis_snapshot_id?:string;analysis_as_of_utc?:string};
const explanationStatus=(status:string)=>({not_requested:'未啟用模型，使用程式說明',disabled:'模型未啟用',ok:'已取得解讀',partial_grounding:'部分內容由程式補充',timeout:'模型逾時，保留程式資料',rate_limited:'模型使用量受限',market_unavailable:'原行情資料不足',invalid_grounding:'引用未通過檢查'}[status]??'請核對下方程式資料');

/** Only the reply belonging to this checked order may supply case/explanation content. */
export function matchingReviewReply(draft:BrokerReviewDraft):MarketReply|null {
 const r=draft.analysis_reply;
 if(!r||!draft.analysis_snapshot_id||r.snapshot_id!==draft.analysis_snapshot_id)return null;
 const a=Date.parse(draft.analysis_as_of_utc??''),b=Date.parse(r.as_of_utc);
 return Number.isFinite(a)&&a===b&&r.analysis_mode==='draft_snapshot'?r:null;
}

export default function BrokerReviewContents({draft}:{draft:BrokerReviewDraft}){
 const reply=matchingReviewReply(draft),comparison=reply?.case_comparison;
 const compatible=!!comparison&&comparison.snapshot_id===draft.analysis_snapshot_id&&comparison.side===draft.side;
 const stamp=draft.analysis_as_of_utc&&Number.isFinite(Date.parse(draft.analysis_as_of_utc))?new Date(draft.analysis_as_of_utc).toLocaleString('zh-TW',{hour12:false}):'未提供';
 const cases=compatible?<><p className="fine">只顯示本筆草稿的固定快照；零筆匹配也是有效結果。</p><CaseComparison comparison={comparison!} snapshotId={draft.analysis_snapshot_id!} hideCharts/></>:<p className="review-unavailable">本筆草稿尚無可核對的案例快照；不沿用上一輪對話案例。</p>;
 const explanation=reply?<><p className="fine">{reply.provider==='groq_market_analysis'?'Groq 與程式事實解讀':'程式快照說明'} · {explanationStatus(reply.llm_status)}。模型不會確認或送單。</p>
  {reply.market_status!=='FROZEN'&&<p role="status">原分析資料未就緒，請重新檢查草稿。</p>}
  {reply.sections.length?reply.sections.map((s,i)=><details key={i}><summary>{s.title}</summary><p>{s.text}</p><p className="fine">依據：{s.fact_ids.length?s.fact_ids.join('、'):'未提供引用編號'}</p></details>):<p>這份快照尚未提供分段說明。</p>}
  {!!reply.evidence.length&&<details><summary>查看原快照的數據依據</summary>{reply.evidence.map(f=><p key={f.id}><strong>{f.id}</strong> · {f.text.replace(/\{\{([a-z0-9_]+)\}\}/g,(_,key)=>f.values[key]??'資料不足')}</p>)}</details>}
 </>:<p className="review-unavailable">分析快照缺失或不一致，未顯示其他時間的說明。請重新檢查草稿。</p>;
 return <div className="broker-review-contents"><p className="fine">cTrader DEMO · 草稿分析時間：{stamp} · 固定快照，非持續更新</p>
  <ReviewSections risk={<RiskReview draft={draft} asOf={draft.analysis_as_of_utc}/>} rules={<RulesReview check={draft.personal_rules}/>} cases={cases} evidence={<EvidenceReview retrieval={draft.retrieval}/>} explanation={explanation}/>
 </div>;
}
