import AssistantExplanation from './AssistantExplanation';
import WorkspaceDialog from './WorkspaceDialog';
import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import EntryGate from './EntryGate';
import ConnectionCenter from './ConnectionCenter';
import {FirstUseGuide} from './Education';
import type {DemoAccount} from './demoAuth';
const App=lazy(()=>import('./App'));
const publicMode=import.meta.env.MODE==='pages';

export default function IntegrationShell(){
 const connectionTrigger=useRef<HTMLButtonElement>(null);
 const closeConnections=()=>{setConnectionsOpen(false);window.requestAnimationFrame(()=>connectionTrigger.current?.focus());};
 const [started,setStarted]=useState(false);
 const [entry,setEntry]=useState(true);
 const [info,setInfo]=useState<'source'|'guide'|'assistant'|null>(null);
 useEffect(()=>{const open=()=>setInfo('assistant');window.addEventListener('gold-assistant-help',open);return()=>window.removeEventListener('gold-assistant-help',open);},[]);
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
    <div className="integration-tools"><button type="button" aria-haspopup="dialog" aria-expanded={info==='source'} onClick={()=>setInfo('source')}>資料來源</button><button ref={connectionTrigger} className="integration-connection-toggle" type="button" aria-haspopup="dialog" aria-expanded={connectionsOpen} aria-controls="connection-center" onClick={()=>setConnectionsOpen(value=>!value)}><span>連線狀態</span><small>{publicMode?'展示模式':'DEMO 工作區'}</small></button><button type="button" onClick={()=>setInfo('guide')} aria-haspopup="dialog" aria-expanded={info==='guide'}>使用指引</button><button type="button" onClick={()=>{setConnectionsOpen(false);setEntry(true);}}>返回入口</button></div>
   </div>
   {connectionsOpen&&<ConnectionCenter publicMode={publicMode} account={demoAccount} onClose={closeConnections}/>}
   {info&&<WorkspaceDialog title={info==='source'?'資料來源':info==='assistant'?'助手如何回答':'使用指引'} onClose={()=>setInfo(null)}>{info==='assistant'?<AssistantExplanation publicMode={publicMode}/>:info==='source'?<>
     {publicMode?<><p>歷史回放使用合成行情與模擬帳戶；委託只記錄在本次體驗中。</p><p>即時圖表來自 TradingView，僅供參考，與模擬成交價格不同。</p><p>歷史案例可供比較，過去結果不代表新交易的獲利機率。</p></>:<><p>即時報價與持倉以 cTrader DEMO 的連線狀態為準；未連線時不顯示舊報價。</p><p>能否比較相似案例，取決於已載入的資料及盤面是否完整；請查看連線狀態。</p></>}
    </>:<><button type="button" className="assistant-help-link" onClick={()=>setInfo('assistant')}>助手如何回答？查看回答原則 →</button><FirstUseGuide onClose={()=>setInfo(null)}/></>}</WorkspaceDialog>}
   <Suspense fallback={<p className="integration-loading" role="status">正在載入工作台…</p>}><App/></Suspense>
  </div>}
 </>;
}
