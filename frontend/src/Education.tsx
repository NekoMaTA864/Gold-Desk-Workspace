import {useState} from 'react';

const terms = {
  mode: {name:'合成回放',text:'目前使用預先準備的合成行情與瀏覽器內模擬帳戶；畫面上的確認只記錄本機模擬結果，不會送到券商。'},
  bid: {name:'賣價／Bid',text:'你賣出黃金時參考的價格。本展示以 Bid 模擬賣出；正式交易仍以券商回傳的報價與成交結果為準。'},
  ask: {name:'買價／Ask',text:'你買進黃金時參考的價格。買價通常高於賣價，兩者的差距稱為點差。'},
  spread: {name:'點差',text:'同一時刻買價與賣價的差距。即使行情未變，買進後立刻賣出也會受到點差影響。'},
  lot: {name:'手數／Lot',text:'下單數量。本機合成展示以 1 手＝100 盎司試算，0.10 手＝10 盎司；正式交易須以券商的 XAUUSD 商品規格核對。'},
  market: {name:'市價單',text:'以送出當時可取得的價格嘗試成交；送出前看到的報價不保證就是實際成交價。此展示只做本機模擬。'},
  limit: {name:'限價單',text:'指定願意買進的最高價或賣出的最低價。價格符合條件也不保證成交；本機回放只模擬是否觸價。'},
  stop: {name:'停損',text:'預先設定價格觸及時嘗試出場。可能因市況或執行方式而與設定價格不同；未設定停損時，風險情境不是損失上限。'},
  target: {name:'停利',text:'預先設定希望獲利出場的價格；觸及價格或實際成交仍需依委託類型與券商結果判斷。'},
  scenario: {name:'價格情境',text:'假設價格移動指定幅度後，以目前部位與手數試算損益。這是情境比較，不是價格預測或損失上限。'},
  ratio: {name:'風險報酬比',text:'比較預設停利距離與停損距離；沒有足夠設定時顯示資料不足。比值不代表獲利機率。'},
  evidence: {name:'證據充分性',text:'檢查相似案例數量、結果分布與資料限制，說明歷史資料能參考到什麼程度；不會換算成本次交易勝率。'},
} as const;

export type TermId = keyof typeof terms;

export function Term({id}: {id:TermId}) {
  const term=terms[id];
  return <details className="term-help"><summary aria-label={`說明：${term.name}`} title={`說明：${term.name}`}>?</summary><div className="term-popover" role="note"><strong>{term.name}</strong><p>{term.text}</p></div></details>;
}

const guideSteps=[
  {title:'先辨認目前模式',text:'頂端「模擬體驗」表示草稿與成交只記錄在展示帳戶。點「資料來源」與「連線狀態」可查看目前資料用途與服務狀況；即時看盤的價格不會填入模擬訂單。'},
  {title:'確認買價與賣價',text:'想買進看 BUY／ASK，想賣出看 SELL／BID。兩個價格不同，點問號可查看點差與報價的說明。'},
  {title:'建立草稿再檢查',text:'可以在對話描述想法，或在下單草稿填方向、手數、停損與停利。檢查後先核對摘要，再展開詳細資料；確認後可直接查看委託與成交紀錄。'},
] as const;

export function FirstUseGuide({onClose}: {onClose:()=>void}) {
  const [step,setStep]=useState(0);
  const finish=()=>{try{localStorage.setItem('gold-desk-guide-v1','done');}catch{/* The guide remains usable with storage disabled. */}onClose();};
  return <section className="first-use-guide" aria-label="首次使用指引"><div className="guide-icon">?</div><div className="guide-copy"><div className="guide-kicker">首次使用指引 <span>{step+1} / {guideSteps.length}</span></div><h2>{guideSteps[step].title}</h2><p>{guideSteps[step].text}</p><div className="guide-progress" aria-hidden="true">{guideSteps.map((_,index)=><i key={index} className={index===step?'active':''}/>)}</div></div><div className="guide-actions"><button type="button" className="guide-dismiss" onClick={finish}>略過指引</button><div>{step>0&&<button type="button" onClick={()=>setStep(step-1)}>上一步</button>}<button type="button" className="primary" onClick={()=>step===guideSteps.length-1?finish():setStep(step+1)}>{step===guideSteps.length-1?'開始使用':'下一步'}</button></div></div></section>;
}
