import {lazy,Suspense,useState} from 'react';
import EntryGate from './EntryGate';
import ConnectionCenter from './ConnectionCenter';
import {FirstUseGuide} from './Education';
import type {DemoAccount} from './demoAuth';
const App=lazy(()=>import('./App'));
const publicMode=import.meta.env.MODE==='pages';

export default function IntegrationShell(){
 const [started,setStarted]=useState(false);
 const [entry,setEntry]=useState(true);
 const [guide,setGuide]=useState(false);
 const [connectionsOpen,setConnectionsOpen]=useState(false);
 const [demoAccount,setDemoAccount]=useState<DemoAccount|null>(null);
 const enter=()=>{setStarted(true);setEntry(false);};
 const enterDemo=()=>{setDemoAccount(null);enter();};
 const enterWithDemoAccount=(account:DemoAccount)=>{setDemoAccount(account);enter();};
 return <>
  {entry&&<EntryGate backendPreview={!publicMode} onDemo={enterDemo} onSignIn={enterWithDemoAccount}/>}
  {started&&<div hidden={entry}>
   <div className="integration-bar">
    <span><strong>Gold Desk</strong> · {publicMode?'黃金交易模擬體驗':'黃金交易 DEMO 工作台'}</span>
    <div className="integration-tools"><details><summary>資料來源</summary><div className="integration-source">
     {publicMode?<><p>歷史回放使用合成行情與模擬帳戶；委託只記錄在本次體驗中。</p><p>即時圖表來自 TradingView，僅供參考，與模擬成交價格不同。</p><p>歷史案例可供比較，過去結果不代表新交易的獲利機率。</p></>:<><p>即時報價與持倉以 cTrader DEMO 的連線狀態為準；未連線時不顯示舊報價。</p><p>能否比較相似案例，取決於已載入的資料及盤面是否完整；請查看服務狀態。</p></>}
    </div></details><button className="integration-connection-toggle" type="button" aria-expanded={connectionsOpen} aria-controls="connection-center" onClick={()=>setConnectionsOpen(value=>!value)}><span>服務狀態</span><small>{demoAccount?`展示帳號：${demoAccount.displayName}`:publicMode?'訪客體驗':'訪客模式'}</small></button><button type="button" onClick={()=>setGuide(v=>!v)} aria-expanded={guide}>使用指引</button><button type="button" onClick={()=>{setConnectionsOpen(false);setEntry(true);}}>返回入口</button></div>
   </div>
   {connectionsOpen&&<div id="connection-center"><ConnectionCenter publicMode={publicMode} account={demoAccount} onClose={()=>setConnectionsOpen(false)}/></div>}
   {guide&&<FirstUseGuide onClose={()=>setGuide(false)}/>}
   <Suspense fallback={<p className="integration-loading" role="status">正在載入工作台…</p>}><App/></Suspense>
  </div>}
 </>;
}
