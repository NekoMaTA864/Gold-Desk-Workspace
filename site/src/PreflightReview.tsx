import {RuleReview} from './DecisionSupport';
import type {PreflightPresentation} from './preflightPresentation';
import type {Case,Side} from './types';
import {Term} from './Education';

const sideName=(side:Side)=>side==='BUY'?'買進':'賣出';
const gainClass=(value:string)=>value.startsWith('-')?'negative':'positive';

function CaseGroup({title,cases,onOpen}: {title:string;cases:Case[];onOpen:(id:string)=>void}) {
  return <div className="review-case-group"><h4>{title} <span>{cases.length} 筆展示</span></h4>{cases.length?cases.map(item=><button type="button" className="review-case-card" key={item.id} onClick={()=>onOpen(item.id)}><span><strong>{item.label}</strong><b className={gainClass(item.profit)}>{item.profit} {item.currency||'幣別未確認'}</b></span><small>相似：{item.match_reasons.join('、')||'操作條件資料有限'}</small><small>差異：{item.differences.join('、')||'資料未提供'}</small><em>查看案例詳情 ↗</em></button>):<p className="review-empty-case">目前沒有可展示案例</p>}</div>;
}

export default function PreflightReview({view,onOpenCase}: {view:PreflightPresentation;onOpenCase:(id:string)=>void}) {
  const {order,risk,rules,evidence,explanation}=view;
  const pool=view.history;
  const losses=pool.cases.filter(item=>Number(item.profit)<0).slice(0,3);
  const wins=pool.cases.filter(item=>Number(item.profit)>0).slice(0,3);
  const active=rules.filter(rule=>rule.state!=='disabled');
  const triggered=active.filter(rule=>rule.state==='triggered');
  const unknown=active.filter(rule=>rule.state==='unknown');
  const attention=[...risk.warnings,...triggered.map(rule=>rule.detail),...unknown.map(rule=>rule.name+'：'+rule.detail)];
  return <div className="preflight-review">
    <div className="preflight-context">
      <div><span>方向與手數</span><strong>{sideName(order.side)} {order.lot} 手</strong></div>
      <div><span>{order.type==='LIMIT'?'限價委託價':'擬用市價'} · USD</span><strong>{order.price}</strong></div>
      <div><span>停損／停利</span><strong>{order.sl||'未設定'} / {order.tp||'未設定'}</strong></div>
    </div>
    <p className="preflight-source-note">{view.sourceLabel} · {view.sourceTime}<br/>這一步尚未建立委託；核對後再確認。即時圖表不作為模擬成交價。</p>
    <div className="review-check-summary" aria-label="檢查摘要">
      <div><span>停損價格情境</span><strong>{risk.stop_loss_usd==null?(order.sl?'無法試算':'未設定停損'):risk.stop_loss_usd+' USD'}</strong><small>情境損益不代表損失上限</small></div>
      <div><span>個人提醒</span><strong>{active.length?triggered.length+' 項觸發':'尚未啟用'}</strong><small>{unknown.length?unknown.length+' 項尚無法評估':active.length?'已比對 '+active.length+' 項設定':'可在工作台設定提醒'}</small></div>
      <div><span>歷史資料參考程度</span><strong className="review-evidence-label">{evidence.label}</strong><small>{pool.total} 筆匹配案例 · 不代表本次勝率</small></div>
    </div>
    {attention.length>0&&<section className="review-attention" aria-label="需要留意的事項"><strong>確認前，請留意</strong><ul>{attention.map((item,index)=><li key={index}>{item}</li>)}</ul></section>}
    <p className="review-details-label">逐項查看檢查依據</p>
    <div className="review-sections">
      <details className="review-section">
        <summary><span className="review-step">01</span><strong>部位與價格風險</strong><span className="review-section-meta">檢查後 {risk.after_lot} 手</span></summary>
        <div className="review-section-body">
          <div className="risk-grid"><span>原有手數<b>{risk.before_lot}</b></span><span>檢查後手數<b>{risk.after_lot}</b></span><span>同方向均價<b>{risk.average_entry}</b></span><span>本筆風險報酬比 <Term id="ratio"/><b>{risk.reward_risk??'資料不足'}</b></span></div>
          <p className="fine">價格變動情境 <Term id="scenario"/> · 以下為假設價格移動後的試算。</p>
          <div className="review-scenarios">{risk.scenarios.map((item,index)=><span key={index}>價格移動 {item.move}<b className={item.loss.startsWith('-')?'positive':'negative'}>{item.loss.startsWith('-')?'獲利':'損失'} {item.loss.startsWith('-')?item.loss.slice(1):item.loss} USD</b></span>)}</div>
          <p className="fine">情境試算不是價格預測，也不包含所有成交與滑價風險。</p>
        </div>
      </details>
      <details className="review-section">
        <summary><span className="review-step">02</span><strong>個人提醒</strong><span className="review-section-meta">{triggered.length} 項觸發 · {unknown.length} 項待確認</span></summary>
        <div className="review-section-body"><RuleReview results={rules}/><p className="fine">依目前瀏覽器儲存的條件比對，只提醒，不自動下單。</p></div>
      </details>
      <details className="review-section">
        <summary><span className="review-step">03</span><strong>相似歷史案例</strong><span className="review-section-meta">{pool.total?pool.total+' 筆匹配':'沒有可比案例'}</span></summary>
        <div className="review-section-body"><div className="preflight-pool"><strong>完整匹配池 {pool.total} 筆</strong><span>獲利 {pool.wins} · 虧損 {pool.losses} · 持平 {pool.flat} · 未知 {pool.unknown}</span></div>
          {pool.total===0?<div className="review-no-cases"><strong>目前沒有可比案例</strong><p>仍可核對價格情境與個人提醒。查無案例不代表交易安全或危險。</p></div>:<div className="review-case-columns"><CaseGroup title="接近的虧損案例" cases={losses} onOpen={onOpenCase}/><CaseGroup title="接近的獲利案例" cases={wins} onOpen={onOpenCase}/></div>}
          <p className="fine">目前只比較可核對的操作條件，尚未完成盤面相似度比對。歷史結果不代表本次勝率。</p>
          {pool.limitations.length>0&&<ul className="review-limitations">{pool.limitations.map((text,index)=><li key={index}>{text}</li>)}</ul>}
        </div>
      </details>
      <details className="review-section">
        <summary><span className="review-step">04</span><strong>證據是否充分</strong><span className="review-section-meta">{evidence.label}</span></summary>
        <div className="review-section-body"><p className="evidence-description">{evidence.explanation} <Term id="evidence"/></p><div className="evidence-checks"><div><span>已成熟的匹配池</span><b>{pool.total} 筆</b></div><div><span>結果兩側是否都有</span><b>{pool.wins&&pool.losses?'獲利／虧損皆有':'其中一側不足'}</b></div><div><span>盤面與時區對齊</span><b>尚未核實</b></div></div><p className="fine">這是資料可參考程度，不是交易成功機率或下單建議。</p></div>
      </details>
      <details className="review-section">
        <summary><span className="review-step">05</span><strong>檢查說明</strong><span className="review-section-meta">依目前結果整理</span></summary>
        <div className="review-section-body"><p className="explanation">{explanation}</p><p className="fine">目前使用固定模板整理說明，請搭配上方數值與案例核對。</p></div>
      </details>
    </div>
    {order.type==='LIMIT'&&<div className="warning-box"><p>限價單確認後先列為待成交；回放僅以 K 棒高低價判定觸價，不含排隊、滑價與 K 棒內成交順序。</p></div>}
  </div>;
}
