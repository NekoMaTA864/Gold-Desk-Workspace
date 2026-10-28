import type {ReactNode} from 'react';
import type {Draft} from './types';
import {RuleResults} from './PersonalRulesPanel';
import {Term} from './Education';
import VolatilityRange from './VolatilityRange';

export function RiskReview({draft,asOf}:{draft:Draft;asOf?:string|number}){
 const {risk}=draft;
 return <section className="integrated-risk" aria-label="部位與價格風險">
  <div className="risk-grid"><span>總曝險手數<b>{risk.before_lot} → {risk.after_lot}</b></span><span>同方向均價<b>{risk.average_entry}</b></span><span>停損價格情境 <Term id="scenario"/><b>{risk.stop_loss_usd===null?(draft.sl?'無法計算':'未設定停損'):risk.stop_loss_usd+' USD'}</b></span><span>風險報酬比 <Term id="ratio"/><b>{risk.reward_risk??'資料不足'}</b></span></div>
  {risk.warnings.length>0&&<div className="warning-box" role="note">{risk.warnings.map((warning,i)=><p key={i}>{warning}</p>)}</div>}
  <details><summary>價格移動情境</summary><div className="scenario-row">{risk.scenarios.map((s,i)=><span key={i}>價格移動 {s.move}<b>{s.loss.startsWith('-')?'獲利 '+s.loss.slice(1):'損失 '+s.loss} USD</b></span>)}</div><p className="fine">情境試算不是價格預測或損失上限，不涵蓋所有滑價與費用。</p></details>
  <VolatilityRange draft={draft} asOf={asOf}/>
 </section>;
}

export function ReviewSections({risk,rules,cases,evidence,explanation}:{risk:ReactNode;rules:ReactNode;cases:ReactNode;evidence:ReactNode;explanation:ReactNode}){
 return <div className="review-sections">
  <section aria-label="01 部位與價格風險"><h3>01 部位與價格風險</h3>{risk}</section>
  <section aria-label="02 個人提醒"><h3>02 個人提醒</h3>{rules}</section>
  <section aria-label="03 相似歷史案例"><h3>03 相似歷史案例</h3>{cases}</section>
  <section aria-label="04 證據是否充分"><h3>04 證據是否充分</h3>{evidence}</section>
  <section aria-label="05 檢查說明"><h3>05 檢查說明</h3><p className="fine">以下保留原分析快照；確認仍由後端重驗版本與報價。</p>{explanation}</section>
 </div>;
}

export function RulesReview({check}:{check?:Draft['personal_rules']}){
 if(!check)return <p className="review-unavailable" role="status">本筆草稿未提供個人提醒檢查結果。正式 DEMO 規則尚待後端接入，不能視為已檢查或未觸發。</p>;
 const results=check.results,attention=results.filter(r=>r.status==='triggered'||r.status==='unknown');
 return <>{attention.length>0&&<div className="warning-box">{attention.map(r=><p key={r.id}><strong>{r.status==='unknown'?'無法評估':'觸發提醒'}：{r.text}</strong> · {r.reason}</p>)}</div>}
  {results.length===0?<p>本筆草稿沒有參與檢查的個人提醒。</p>:<details><summary>查看 {results.length} 項提醒結果</summary><RuleResults check={check}/></details>}
  <p className="fine">僅呈現這份草稿回傳的程式結果；提醒不代替你確認委託。</p></>;
}

export function EvidenceReview({retrieval}:{retrieval?:Draft['retrieval']}){
 if(!retrieval)return <p className="review-unavailable">尚未提供證據評估，無法判定參考程度。</p>;
 const reasons=[...new Set([...(retrieval.sufficiency?.reasons??[]),...(retrieval.limitations??[])])];
 return <><p>{retrieval.sufficiency?.label??'後端尚未提供證據充分性等級'}</p><p className="fine">歷史結果描述匹配案例，不是這筆交易的獲利機率。通過相似規則不等於證據充分。</p>
  <details><summary>資料限制與判斷依據</summary>{reasons.length?reasons.map((text,i)=><p className="fine" key={i}>{text}</p>):<p className="fine">尚未提供逐項原因。</p>}</details></>;
}

export default function IntegratedReview({draft,source,cases,explanation,asOf}:{draft:Draft;source:string;cases:ReactNode;explanation:ReactNode;asOf?:string|number}){
 return <div className="integrated-review">
  <div className="review-order"><span>{draft.order_type==='LIMIT'?'指定限價':'擬成交價'} <b>{draft.price}</b></span><span>停損 <b>{draft.sl??'未設定'}</b></span><span>停利 <b>{draft.tp??'未設定'}</b></span></div>
  <p className="fine">{source} · 尚未確認委託；以下保留草稿建立時的資料。</p>
  <ReviewSections risk={<RiskReview draft={draft} asOf={asOf}/>} rules={<RulesReview check={draft.personal_rules}/>} cases={cases} evidence={<EvidenceReview retrieval={draft.retrieval}/>} explanation={explanation}/>
 </div>;
}
