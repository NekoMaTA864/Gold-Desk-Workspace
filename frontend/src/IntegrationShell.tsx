import {lazy,Suspense,useState} from 'react';
import EntryGate from './EntryGate';
import {FirstUseGuide} from './Education';
const App=lazy(()=>import('./App'));
const publicMode=import.meta.env.MODE==='pages';

export default function IntegrationShell(){
 const [started,setStarted]=useState(!publicMode);
 const [entry,setEntry]=useState(publicMode);
 const [guide,setGuide]=useState(false);
 const enter=()=>{setStarted(true);setEntry(false);};
 return <>
  {publicMode&&entry&&<EntryGate onDemo={enter} onSignIn={enter}/>}
  {started&&<div hidden={entry}>
   <div className="integration-bar">
    <span><strong>{publicMode?'模擬體驗':'本機整合工作台'}</strong> · {publicMode?'合成行情與模擬帳戶／公開歷史案例':'後端服務模式／依實際連線狀態顯示'}</span>
    <div className="integration-tools"><details><summary>資料與連線</summary><div className="integration-source">
     {publicMode?<><p>行情與帳戶：瀏覽器內合成回放，委託只記錄模擬結果。</p><p>案例：已公開的歷史案例與參考盤面；實際載入狀態以工作台為準。查詢盤面是合成資料，原始時鐘尚未獨立核實。</p><p>即時圖：TradingView 外部參考，不提供這裡的模擬成交價。</p><p>公開展示未連接私人後端或 cTrader 帳戶。歷史結果不是本次獲利機率。</p></>:<><p>案例、行情與帳戶由本機 FastAPI 提供，缺資料或未設定憑證時維持未就緒。</p><p>使用私人案例前須通過側檔完整性校驗；此入口不是登入或權限保護。</p></>}
    </div></details><button type="button" onClick={()=>setGuide(v=>!v)} aria-expanded={guide}>使用指引</button>{publicMode&&<button type="button" onClick={()=>setEntry(true)}>體驗入口</button>}</div>
   </div>
   {guide&&<FirstUseGuide onClose={()=>setGuide(false)}/>}
   <Suspense fallback={<p className="integration-loading" role="status">正在載入工作台…</p>}><App/></Suspense>
  </div>}
 </>;
}
