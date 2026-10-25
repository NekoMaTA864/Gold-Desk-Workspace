import {useEffect,useState} from 'react';
import {api} from './api';
import type {DemoAccount} from './demoAuth';
import type {DemoMarket} from './demoMarket';
import {groqProxyAvailable} from './groqProxy';

type AssistantStatus={configured:boolean;enabled:boolean;model:string};
type DataReadiness={case_source:'trader_history'|'synthetic_demo';case_count:number;candidate_profile_status:string;replay_market_is_synthetic:boolean};
type Loadable<T>={state:'loading'|'ready'|'error';value:T|null};
const loading=<T,>():Loadable<T>=>({state:'loading',value:null});

export default function ConnectionCenter({publicMode,account,onClose}:{publicMode:boolean;account:DemoAccount|null;onClose:()=>void}){
 const [assistant,setAssistant]=useState<Loadable<AssistantStatus>>(loading);
 const [broker,setBroker]=useState<Loadable<DemoMarket>>(loading);
 const [data,setData]=useState<Loadable<DataReadiness>>(loading);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(publicMode)return;
  let active=true;
  const get=<T,>(path:string,update:(value:Loadable<T>)=>void)=>{
   void api<T>(path).then(value=>{if(active)update({state:'ready',value});}).catch(()=>{if(active)update({state:'error',value:null});});
  };
  get('/assistant/status',setAssistant);
  get('/broker/market',setBroker);
  get('/data/readiness',setData);
  return()=>{active=false;};
 },[publicMode,refresh]);
 const retry=()=>{setAssistant(loading());setBroker(loading());setData(loading());setRefresh(value=>value+1);};
 const assistantLabel=publicMode?(groqProxyAvailable?'可選用 AI 解讀':'目前使用程式說明'):
  assistant.state==='loading'?'查詢中':assistant.state==='error'?'狀態無法取得':assistant.value?.configured&&assistant.value.enabled?'可選用 AI 解讀':'目前使用程式說明';
 const assistantNote=assistantLabel==='查詢中'?'正在確認對話服務。':assistantLabel==='狀態無法取得'?'暫時無法確認對話服務，請重新檢查。':
  assistantLabel==='可選用 AI 解讀'?'AI 可補充盤面說明；交易決定仍由你確認。':'目前由程式提供說明；AI 補充解讀尚未開啟。';
 const brokerLabel=publicMode?'未連接':broker.state==='loading'?'查詢中':broker.state==='error'?'狀態無法取得':
  broker.value?.connection_status==='NOT_CONFIGURED'?'尚未設定':broker.value?.connection_status==='CONNECTING'?'連線中':
  broker.value?.connection_status==='CONNECTED'&&broker.value.account?.status==='CURRENT'&&broker.value.quote.status==='CURRENT'?'DEMO 行情與帳戶已連線':
  broker.value?.connection_status==='CONNECTED'&&broker.value.account?.status==='CURRENT'?'DEMO 帳戶已連線 · 報價未就緒':
  broker.value?.connection_status==='CONNECTED'?'DEMO 行情已連線 · 帳戶未就緒':'未連線';
 const brokerNote=brokerLabel==='查詢中'?'正在確認即時服務。':brokerLabel==='狀態無法取得'?'暫時無法確認連線，請重新檢查。':
  brokerLabel==='DEMO 行情與帳戶已連線'?'可查看 DEMO 行情與帳戶狀態；送單前仍須核對。':
  broker.value?.connection_status==='CONNECTED'?'部分即時資料可查看；報價或帳戶尚未齊備，暫不能據此送單。':
  '即時資料暫不可用；仍可使用歷史回放。';
 const dataLabel=publicMode?'公開案例展示':data.state==='loading'?'查詢中':data.state==='error'?'狀態無法取得':
  data.value?.case_source!=='trader_history'?'示範案例':data.value.candidate_profile_status==='READY'?'歷史資料已載入':'案例資料待確認';
 const dataNote=publicMode?'可在回放中查看案例；合成行情與即時盤面分開。':
  data.state!=='ready'?'暫時無法確認案例資料，請稍後重新檢查。':
  data.value?.case_source!=='trader_history'?'目前使用示範案例，可先體驗回放流程。':
  data.value.candidate_profile_status!=='READY'?'案例資料尚未完成核對，暫不提供盤面相似比較。':
  data.value.replay_market_is_synthetic?'歷史資料已載入；目前缺少可比較的即時盤面，暫無法進行相似案例分析。':
  '歷史資料已載入；相似比較仍須通過每次查詢的行情條件。';
 return <section className="connection-center" aria-labelledby="connection-center-title">
  <div className="connection-center-heading"><div><h2 id="connection-center-title">目前可用的服務</h2><p>報價、分析與案例會依實際連線狀態更新。</p></div><div className="connection-center-actions">{!publicMode&&<button type="button" onClick={retry}>重新檢查</button>}<button type="button" onClick={onClose} aria-label="關閉服務狀態">關閉</button></div></div>
  <div className="connection-center-rows">
   <div className="connection-center-row"><div><h3>使用身分</h3><p>{account?`目前以「${account.displayName}」體驗工作台。`:'目前以訪客身分體驗工作台。'}展示紀錄不會同步至個人帳號。</p></div><strong className="connection-center-state">{account?'展示帳號':'訪客模式'}</strong></div>
   <div className="connection-center-row"><div><h3>對話解讀</h3><p>{assistantNote}</p></div><strong className="connection-center-state">{assistantLabel}</strong></div>
   <div className="connection-center-row"><div><h3>即時報價與持倉</h3><p>{brokerNote}</p></div><strong className="connection-center-state">{brokerLabel}</strong></div>
   <div className="connection-center-row"><div><h3>歷史案例與盤面</h3><p>{dataNote}</p></div><strong className="connection-center-state">{dataLabel}</strong></div>
  </div>
  <p className="connection-center-foot"><strong>後續預留</strong> 個人帳號同步 · 自選 AI 服務 · 連接個人 cTrader DEMO 帳戶</p>
 </section>;
}
