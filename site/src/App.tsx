import {useCallback,useEffect,useRef,useState,type CSSProperties,type FormEvent} from 'react';
import {api,key} from './api';
import Chart from './Chart';
import LiveChart from './LiveChart';
import BrokerInsights from './BrokerInsights';
import DataSourceBar from './DataSourceBar';
import ScenarioGallery,{readScenario,type ScenarioKey} from './ScenarioGallery';
import {brokerPreviewEnabled,useBrokerMarket} from './brokerPreview';
import {AgentSummary, RuleEditor, evaluateRules, loadRuleConfig} from './DecisionSupport';
import type {RuleConfig} from './DecisionSupport';
import {AssistantColumnDivider,AssistantLayoutToolbar,ChartHeightDivider,ColumnDivider,LayoutToolbar,readAssistantLayoutSelection,readLayoutSelection} from './LayoutControls';
import type {LayoutMode,LayoutPreset} from './LayoutControls';
import PositionsCompact from './PositionsCompact';
import PositionsEmpty from './PositionsEmpty';
import EntryGate from './EntryGate';
import type {DemoAccount} from './demoAuth';
import PreflightReview from './PreflightReview';
import OrderHistory from './OrderHistory';
import {presentReplayPreflight} from './preflightPresentation';
import {FirstUseGuide,Term} from './Education';
import type {Audit,BarsResponse,Case,Draft,Retrieval,Side,State} from './types';

const actionName = (action:string) => ({FIRST:'首筆進場',ADD:'同向加倉',OPPOSITE:'反向部位',CLOSE:'平倉',SL:'停損',TP:'停利'}[action] || action);
const sourceName = (source:string) => source==='synthetic_demo'?'合成示範資料':source==='trader_history'?'交易員歷史紀錄':source==='private_audit'?'本機真實資料稽核':source==='private_market'?'第三方歷史行情':source;
const sideName = (side:Side) => side==='BUY'?'買進':'賣出';
const gainClass = (value:string|null|undefined) => value?.startsWith('-')?'negative':'positive';
const EMPTY_BARS:BarsResponse = {bars:[],markers:[],source:'',interval:'5m'};
const currencyName = (currency?:string) => !currency || /NOT_STATED|UNKNOWN/.test(currency)?'幣別未確認':currency;
const formatTime = (value?:string|number) => typeof value==='number'?`${new Date(value*1000).toISOString().replace('T',' ').slice(0,19)} UTC`:value||'—';
const behaviorName = (value:string) => ({NO_OBSERVED_POSITION:'可見首筆：當時未觀察到既有黃金持倉',ADVERSE_ADD:'價格逆向加單候選',FAVORABLE_ADD:'價格順向加單候選',TIME_TIE:'同分鐘操作順序未確認'}[value] || value);
const getAction = (state:State|null,side:Side) => !state?.positions.length?'FIRST':state.positions.every(p=>p.side===side)?'ADD':'OPPOSITE';

function Pool({pool}:{pool:Retrieval}) {
  return <div className="pool"><div className="pool-summary"><span>完整匹配池 <b>{pool.total}</b></span><span className="positive">獲利 {pool.wins}</span><span className="negative">虧損 {pool.losses}</span><span>持平 {pool.flat} · 未知 {pool.unknown}</span></div><p className="fine">歷史獲利比例 {pool.win_rate===null?'資料不足':`${pool.win_rate}%`}，僅描述匹配池，不是本次交易成功機率。展示虧損案例優先；盈虧不參與相似度排序。</p></div>;
}
function CaseRows({cases,onOpen}:{cases:Case[];onOpen:(id:string)=>void}) {
  return <div className="table-scroll"><table><thead><tr><th>案例／來源</th><th>操作</th><th>手數</th><th>事後損益／幣別</th><th>匹配依據</th><th/></tr></thead><tbody>{cases.map(c=><tr key={c.id}><td><strong>{c.label}</strong><small>{sourceName(c.source_kind)} · {c.time_alignment==='confirmed'?'時區已核對':'時區未確認'}</small></td><td><span className={c.side==='BUY'?'positive':'negative'}>{sideName(c.side)}</span> · {actionName(c.action)}</td><td className="number">{c.lot}</td><td className={`number ${gainClass(c.profit)}`}>{c.profit}<small>{currencyName(c.currency)}</small></td><td className="case-reasons">{c.match_reasons.join('、') || '條件資料不足'}</td><td><button className="text-button" onClick={()=>onOpen(c.id)} aria-label={`查看 ${c.label}`}>查看 ↗</button></td></tr>)}</tbody></table>{cases.length===0&&<div className="empty">目前沒有已成熟且可匹配的案例。仍可用價格情境檢查擬下單風險。</div>}</div>;
}

export default function App() {
  const [layoutSeed]=useState(readLayoutSelection);
  const [layoutMode,setLayoutMode]=useState<LayoutMode>(layoutSeed.mode);
  const [layoutPreset,setLayoutPreset]=useState<LayoutPreset>(layoutSeed.preset);
  const [splitWidth,setSplitWidth]=useState(layoutSeed.split);
  const [chartHeight,setChartHeight]=useState(layoutSeed.height);
  const [assistantLayoutSeed]=useState(readAssistantLayoutSelection);
  const [assistantLayout,setAssistantLayout]=useState(assistantLayoutSeed.layout);
  const [assistantSizing,setAssistantSizing]=useState<LayoutMode>(assistantLayoutSeed.mode);
  const [assistantInfoWidth,setAssistantInfoWidth]=useState(assistantLayoutSeed.infoWidth);
  const [assistantOrderWidth,setAssistantOrderWidth]=useState(assistantLayoutSeed.orderWidth);
  const [marketView,setMarketView]=useState<'assistant'|'replay'|'live'>('assistant');
  const [accessView,setAccessView]=useState<'entry'|'demo'>(()=>sessionStorage.getItem('gold-desk-demo-entry')==='entered'?'demo':'entry');
  const [demoAccount,setDemoAccount]=useState<DemoAccount|null>(null);
  const [lastOrderId,setLastOrderId]=useState<string|null>(null);
  const [showGuide,setShowGuide]=useState(false);
  const [showHistory,setShowHistory]=useState(false);
  const [scenario,setScenario]=useState<ScenarioKey>(readScenario);
  const [showScenarios,setShowScenarios]=useState(false);
  const [state,setState]=useState<State|null>(null),[bars,setBars]=useState<BarsResponse>(EMPTY_BARS),[audit,setAudit]=useState<Audit|null>(null),[pool,setPool]=useState<Retrieval|null>(null);
  const [interval,setInterval]=useState('5m'),[side,setSide]=useState<Side>('BUY'),[lot,setLot]=useState('0.10'),[sl,setSl]=useState(''),[tp,setTp]=useState('');
  const [assistantTab,setAssistantTab]=useState<'account'|'rules'>('account'),[orderType,setOrderType]=useState<'MARKET'|'LIMIT'>('MARKET'),[limitPrice,setLimitPrice]=useState('');
  const [rightTab,setRightTab]=useState<'order'|'rules'>('order'),[bottomTab,setBottomTab]=useState('positions'),[draft,setDraft]=useState<Draft|null>(null),[selectedCase,setSelectedCase]=useState<Case|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[light,setLight]=useState(()=>localStorage.getItem('gold-theme')==='light'),[message,setMessage]=useState('');
  const [chat,setChat]=useState<{role:'user'|'assistant';text:string}[]>([]);
  const {market:brokerMarket,error:brokerError}=useBrokerMarket();
  const [ruleConfig,setRuleConfig]=useState<RuleConfig>(loadRuleConfig);
  const [poolStatus,setPoolStatus]=useState<'loading'|'ready'|'error'>('loading');
  const ruleResults=evaluateRules(ruleConfig,state,draft);
  const changeRuleConfig=(next:RuleConfig)=>{setRuleConfig(next);localStorage.setItem('gold-desk-rules-v2',JSON.stringify(next));};
  const choosePreset=(next:LayoutPreset)=>{setLayoutPreset(next);setRightTab('order');setBottomTab('positions');};
  const effectivePreset=marketView==='live'?'standard':layoutPreset;
  const displayedChartHeight=layoutMode==='resize'?chartHeight:effectivePreset==='chart-focus'?500:345;
  const workspaceStyle={'--layout-left':`${splitWidth}fr`,'--layout-right':`${100-splitWidth}fr`} as CSSProperties;
  const chartStyle={'--chart-height':`${displayedChartHeight}px`} as CSSProperties;
  const assistantGridStyle={'--assistant-info-width':`${assistantInfoWidth}px`,'--assistant-order-width':`${assistantOrderWidth}px`} as CSSProperties;
  useEffect(()=>{
    localStorage.setItem('gold-desk-layout-v1',JSON.stringify({mode:layoutMode,preset:layoutPreset,split:splitWidth,height:chartHeight}));
    const url=new URL(window.location.href);
    url.searchParams.set('layout',layoutMode);
    url.searchParams.set('preset',layoutPreset);
    window.history.replaceState(null,'',url);
  },[layoutMode,layoutPreset,splitWidth,chartHeight]);
  useEffect(()=>{
    localStorage.setItem('gold-desk-assistant-layout-v1',JSON.stringify({layout:assistantLayout,mode:assistantSizing,infoWidth:assistantInfoWidth,orderWidth:assistantOrderWidth}));
    const url=new URL(window.location.href);
    url.searchParams.set('assistantLayout',assistantLayout);
    url.searchParams.set('assistantSizing',assistantSizing);
    window.history.replaceState(null,'',url);
  },[assistantLayout,assistantSizing,assistantInfoWidth,assistantOrderWidth]);
  useEffect(()=>{const url=new URL(window.location.href);if(scenario==='normal')url.searchParams.delete('scenario');else url.searchParams.set('scenario',scenario);window.history.replaceState(null,'',url);},[scenario]);
  const reviewDialog=useRef<HTMLDialogElement>(null),caseDialog=useRef<HTMLDialogElement>(null),confirmKey=useRef({draft:'',key:''});
  const historyDialog=useRef<HTMLDialogElement>(null),scenarioDialog=useRef<HTMLDialogElement>(null),guideDialog=useRef<HTMLDialogElement>(null);
  const task=useCallback(async(fn:()=>Promise<void>)=>{setBusy(true);setError('');setNotice('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'操作失敗，請重試。');}finally{setBusy(false);}},[]);
  const bootstrap=useCallback(()=>task(async()=>{const [next,a]=await Promise.all([api<State>('/state'),api<Audit>('/audit')]);setState(next);setAudit(a);}),[task]);
  useEffect(()=>{void bootstrap();},[bootstrap]);
  useEffect(()=>{document.documentElement.dataset.theme=light?'light':'dark';localStorage.setItem('gold-theme',light?'light':'dark');},[light]);
  useEffect(()=>{if(!state)return;let cancelled=false;api<BarsResponse>(`/bars?interval=${interval}`).then(value=>{if(!cancelled)setBars(value);}).catch(e=>{if(!cancelled)setError(e.message);});return ()=>{cancelled=true;};},[state?.version,interval]);
  useEffect(()=>{if(!state)return;let cancelled=false;setPoolStatus('loading');const timeout=window.setTimeout(()=>{const action=getAction(state,side);api<Retrieval>(`/cases?side=${side}&action=${action}&lot=${encodeURIComponent(lot || '0.10')}`).then(value=>{if(!cancelled){setPool(value);setPoolStatus('ready');}}).catch(()=>{if(!cancelled){setPool(null);setPoolStatus('error');}});},250);return ()=>{cancelled=true;window.clearTimeout(timeout);};},[state?.version,side,lot]);
  useEffect(()=>{const dialog=reviewDialog.current;if(draft){confirmKey.current={draft:draft.id,key:key()};if(!dialog?.open)dialog?.showModal();}else if(dialog?.open)dialog.close();},[draft]);
  useEffect(()=>{const dialog=caseDialog.current;if(selectedCase){if(!dialog?.open)dialog?.showModal();}else if(dialog?.open)dialog.close();},[selectedCase]);
  useEffect(()=>{const dialog=historyDialog.current;if(showHistory){if(!dialog?.open)dialog?.showModal();}else if(dialog?.open)dialog.close();},[showHistory]);
  useEffect(()=>{const dialog=scenarioDialog.current;if(showScenarios){if(!dialog?.open)dialog?.showModal();}else if(dialog?.open)dialog.close();},[showScenarios]);
  useEffect(()=>{const dialog=guideDialog.current;if(showGuide){if(!dialog?.open)dialog?.showModal();}else if(dialog?.open)dialog.close();},[showGuide]);
  const cancelDraft=()=>task(async()=>{if(draft)await api(`/drafts/${draft.id}/cancel`,{});setDraft(null);});
  const pagesMode=import.meta.env.MODE==='pages';
  const makeDraft=(e:FormEvent)=>{e.preventDefault();void task(async()=>{setDraft(await api<Draft>('/drafts',{side,lot,sl:sl.trim()||null,tp:tp.trim()||null,order_type:pagesMode?orderType:'MARKET',limit_price:limitPrice.trim()||null}));});};
  const confirmDraft=()=>task(async()=>{if(!draft)return;const result=await api<{state:State;order_id:string;status?:string}>(`/drafts/${draft.id}/confirm`,{revision:draft.revision,idempotency_key:confirmKey.current.key});setState(result.state);setLastOrderId(result.order_id);setDraft(null);setBottomTab(result.status==='PENDING'?'orders':'history');if(marketView==='assistant')setAssistantTab('account');if(marketView==='replay')setNotice(result.status==='PENDING'?`已建立待成交限價單 · ${result.order_id}`:`已記錄本機回放成交 · ${result.order_id}`);});
  const cancelPendingOrder=(id:string)=>{if(!window.confirm('取消這筆尚未成交的本機限價單？'))return;void task(async()=>{const result=await api<{state:State}>(`/orders/${id}/cancel`,{confirmed:true});setState(result.state);setNotice('待成交限價單已取消。');});};
  const replay=(count:number)=>task(async()=>{setState(await api<State>('/replay/step',{bars:count}));});
  const reset=()=>{if(!window.confirm('重設回放會清除目前本機模擬持倉與成交紀錄。要重新開始嗎？'))return;void task(async()=>{setState(await api<State>('/replay/reset',{}));setNotice('回放已重設。');});};
  const closePosition=(id:string)=>{if(!window.confirm('確認以目前可見報價平倉這筆本機模擬部位？'))return;void task(async()=>{const result=await api<{state:State}>(`/positions/${id}/close`,{confirmed:true,idempotency_key:key()});setState(result.state);setNotice('已完成本機模擬平倉。');});};
  const openCase=(id:string)=>task(async()=>{
    const ranked=draft?.retrieval.cases.find(c=>c.id===id)||pool?.cases.find(c=>c.id===id);
    const detail=await api<Case>(`/cases/${encodeURIComponent(id)}`);
    setSelectedCase({...detail,match_reasons:ranked?.match_reasons||[],differences:ranked?.differences||[],distance:ranked?.distance??null});
  });
  const sendChat=(e:FormEvent)=>{e.preventDefault();if(!message.trim())return;const sent=message.trim();setChat(items=>[...items,{role:'user',text:sent}]);setMessage('');
    if(/持倉|部位|帳戶|淨值/.test(sent)&&state){setAssistantTab('account');const positions=state.positions;const detail=positions.length?positions.map(p=>`${sideName(p.side)} ${p.lot} 手，進場 ${p.entry}，目前損益 ${p.pnl} USD`).join('；'):'目前沒有模擬持倉';setChat(items=>[...items,{role:'assistant',text:`這是目前的本機回放帳戶摘要（合成行情）：${detail}。模擬淨值 ${state.account.equity} USD，餘額 ${state.account.balance} USD。此狀態只存在於展示工作階段。`}]);return;}
    if(/提醒|個人規則/.test(sent)){setAssistantTab('rules');const enabled=ruleResults.filter(rule=>rule.state!=='disabled');const triggered=enabled.filter(rule=>rule.state==='triggered');const detail=enabled.length?enabled.map(rule=>`${rule.name}：${rule.state==='triggered'?'已觸發':rule.state==='clear'?'未觸發':'無法評估'}`).join('；'):'目前沒有啟用提醒條件';setChat(items=>[...items,{role:'assistant',text:`目前的本機提醒狀態：${detail}。提醒只提供檢查，不會自動下單。${triggered.length?`目前已觸發 ${triggered.length} 項。`:''}`}]);return;}
    void task(async()=>{const result=await api<{message:string;draft:Draft|null;provider:string}>('/chat',{message:sent,lot,side});setChat(items=>[...items,{role:'assistant',text:result.message}]);if(result.draft){setSide(result.draft.side);setLot(result.draft.lot);setSl(result.draft.sl||'');setTp(result.draft.tp||'');setOrderType(result.draft.order_type||'MARKET');setDraft(result.draft);}});};
  const connected=state?.mode==='replay'&&marketView!=='live';
  const currentAction=getAction(state,side);
  const lastOrder=state?.orders.find(order=>order.id===lastOrderId);
  const orderForm=<form className="order-form assistant-order-form" onSubmit={makeDraft}>
    <div className="section-caption">XAUUSD · 黃金 <span>{actionName(currentAction)}</span></div>
    {pagesMode&&<><div className="order-type-toggle" aria-label="委託類型"><button type="button" className={orderType==='MARKET'?'selected':''} aria-pressed={orderType==='MARKET'} onClick={()=>setOrderType('MARKET')}>市價</button><button type="button" className={orderType==='LIMIT'?'selected':''} aria-pressed={orderType==='LIMIT'} onClick={()=>setOrderType('LIMIT')}>限價掛單</button></div><div className="order-type-explainer"><Term id={orderType==='MARKET'?'market':'limit'}/><span>{orderType==='MARKET'?'市價：報價不保證是最後成交價。':'限價：指定價格，不保證成交。'}</span></div></>}
    <div className="side-switch"><button type="button" className={side==='SELL'?'selected sell':'sell'} aria-pressed={side==='SELL'} onClick={()=>setSide('SELL')}>賣出 SELL<span>{state?.quote.bid||'—'}</span></button><button type="button" className={side==='BUY'?'selected buy':'buy'} aria-pressed={side==='BUY'} onClick={()=>setSide('BUY')}>買進 BUY<span>{state?.quote.ask||'—'}</span></button></div>
    <div className="quote-learning order-quote-note"><span>合成報價 · 買賣價差</span><Term id="spread"/></div>
    <div className="field-label"><label htmlFor="assistant-lot">交易手數 <span>Lot</span></label><Term id="lot"/></div><input id="assistant-lot" type="number" min="0.01" max="100" step="0.01" required value={lot} onChange={e=>setLot(e.target.value)}/><p className="lot-helper">本機展示：{lot&&Number.isFinite(Number(lot))?(Number(lot)*100).toLocaleString('zh-TW',{maximumFractionDigits:2}):'—'} 盎司 · 正式規格依券商</p>
    {pagesMode&&orderType==='LIMIT'&&<><label htmlFor="assistant-limit-price">委託價格 <span>USD</span></label><input id="assistant-limit-price" type="number" min="0.01" step="0.01" required value={limitPrice} onChange={e=>setLimitPrice(e.target.value)} placeholder="輸入目標價格"/><p className="fine">買進限價需低於 Ask；賣出限價需高於 Bid。確認後列為待成交委託。</p></>}
    <div className="two-fields"><div><div className="field-label"><label htmlFor="assistant-sl">停損 <span>選填</span></label><Term id="stop"/></div><input id="assistant-sl" type="number" min="0.01" step="0.01" placeholder="未設定" value={sl} onChange={e=>setSl(e.target.value)}/></div><div><div className="field-label"><label htmlFor="assistant-tp">停利 <span>選填</span></label><Term id="target"/></div><input id="assistant-tp" type="number" min="0.01" step="0.01" placeholder="未設定" value={tp} onChange={e=>setTp(e.target.value)}/></div></div>
    <div className="order-explainer"><span className="step-label">下一步：送出前檢查</span><p>先核對部位風險與個人提醒，再查看可參考案例。</p></div>
    <button className="primary full" disabled={busy||!connected||!state}>{busy?'處理中…':orderType==='LIMIT'&&pagesMode?'檢查限價掛單':`${actionName(currentAction)} · 檢查訂單`}</button>
    <p className="fine">{state?.mode==='broker_demo'?'券商尚未連線，暫時無法送單。':orderType==='LIMIT'&&pagesMode?'合成回放的限價模擬；未計入排隊、滑價與 K 棒內成交順序。':'這是本機模擬；確認後才會記錄成交。'}</p>
  </form>;
  const conversationPanel=<div className="chat-panel"><div className="provider-label">{state?.llm_enabled?'對話服務已啟用':'依本機規則回覆 · 可整理草稿與查詢持倉'}</div><div className="chat-log" role="log" aria-live="polite">{chat.length===0?<div className="chat-intro"><h2>這筆交易，想先確認什麼？</h2><p>輸入方向與手數，先整理草稿。也能查看目前持倉，或核對你的提醒條件。</p><button type="button" onClick={()=>setMessage('準備買進 0.10 手')}>買進 0.10 手</button><button type="button" onClick={()=>setMessage('查看我的持倉')}>查看持倉</button><button type="button" onClick={()=>setMessage('檢查我的提醒條件')}>查看提醒條件</button></div>:chat.map((item,index)=><div className={`chat-message ${item.role}`} key={index}><span>{item.role==='user'?'你':'助手'}</span><p>{item.text}</p></div>)}</div><form onSubmit={sendChat} className="chat-input"><label htmlFor="message" className="sr-only">輸入交易想法或問題</label><textarea id="message" value={message} onChange={e=>setMessage(e.target.value)} placeholder="例如：想買進 0.10 手，停損設在 2900" rows={3}/><button className="primary" disabled={busy||!message.trim()||!state}>送出訊息</button></form></div>;
  if(accessView==='entry')return <EntryGate onDemo={()=>{setDemoAccount(null);sessionStorage.setItem('gold-desk-demo-entry','entered');setAccessView('demo');}} onSignIn={account=>{setDemoAccount(account);sessionStorage.setItem('gold-desk-demo-entry','entered');setAccessView('demo');}}/>;
  return <div className="terminal">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">GD</span><div className="brand-copy"><small>GOLD DESK</small><strong>黃金交易助手</strong></div></div>
      <nav className="market-view-tabs" aria-label="主要頁面"><button type="button" disabled={busy||!!draft} className={marketView==='assistant'?'active':''} aria-current={marketView==='assistant'?'page':undefined} onClick={()=>setMarketView('assistant')}>對話助手</button><button type="button" disabled={busy||!!draft} className={marketView==='replay'?'active':''} aria-current={marketView==='replay'?'page':undefined} onClick={()=>setMarketView('replay')}>回放演練</button><button type="button" disabled={busy||!!draft} className={marketView==='live'?'active':''} aria-current={marketView==='live'?'page':undefined} onClick={()=>setMarketView('live')}>即時看盤</button></nav>
      <div className="header-tools">
        <button type="button" className="demo-entry-button" onClick={()=>setShowGuide(true)}>使用指引</button>
        <details className="workspace-settings" onKeyDown={event=>{if(event.key==='Escape'){event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus();}}}>
          <summary>版面與工具</summary>
          <div className="settings-panel">
            <strong>安排你的工作台</strong>
            {marketView==='assistant'?<AssistantLayoutToolbar mode={assistantSizing} layout={assistantLayout} onMode={setAssistantSizing} onLayout={setAssistantLayout} onReset={()=>{setAssistantInfoWidth(270);setAssistantOrderWidth(355);}}/>:marketView==='replay'?<LayoutToolbar mode={layoutMode} preset={layoutPreset} onMode={setLayoutMode} onPreset={choosePreset} onReset={()=>{setSplitWidth(65);setChartHeight(420);}}/>:<p>即時看盤使用完整圖表；工作台與回放頁可各自設定版面。</p>}
            <p>版面偏好儲存在此瀏覽器，可隨時調整。</p>
            <div className="settings-actions"><button type="button" onClick={()=>setLight(v=>!v)}>{light?'切換深色':'切換淺色'}</button><button type="button" onClick={()=>setShowScenarios(true)}>預覽展示情境</button></div>
            <small>展示情境供介面討論，不會改變交易資料。</small>
          </div>
        </details>
        <button type="button" className="demo-entry-button account-entry" title={demoAccount?'離開暫存展示帳號':'返回入口與帳號體驗'} onClick={()=>{setDemoAccount(null);sessionStorage.removeItem('gold-desk-demo-entry');setAccessView('entry');}}>{demoAccount?`${demoAccount.displayName} · 離開`:'體驗入口'}</button>
      </div>
    </header>
    <DataSourceBar view={marketView} state={state} broker={brokerMarket} brokerError={brokerError}/>
    {(error||notice)&&<div className={`feedback ${error?'error':'success'}`} role={error?'alert':'status'}><span>{error||notice}</span>{!state&&<button onClick={()=>void bootstrap()} disabled={busy}>重新連線</button>}<button className="text-button" aria-label="關閉通知" onClick={()=>{setError('');setNotice('');}}>×</button></div>}
    {marketView==='assistant'&&<main className="assistant-workspace">
      <div className="assistant-titlebar"><div><h1>交易工作台</h1><p>建立草稿，核對風險與提醒，再確認模擬委託。</p></div><button type="button" className="history-launch" onClick={()=>setShowHistory(true)}>委託與成交紀錄 <span>↗</span></button></div>
      {lastOrder&&<section className={`order-outcome outcome-${lastOrder.status.toLowerCase()}`} role="status" aria-label="最近一筆模擬委託"><div className="order-outcome-icon">{lastOrder.status==='PENDING'?'◷':lastOrder.status==='FILLED'?'✓':'·'}</div><div><span className="assistant-eyebrow">模擬委託結果</span><h2>{lastOrder.status==='PENDING'?'限價單等待回放觸價':lastOrder.status==='FILLED'?'模擬已成交':lastOrder.status==='CANCELLED'?'委託已取消':lastOrder.status}</h2><p>{sideName(lastOrder.side)} {lastOrder.lot} 手 · {lastOrder.order_type==='LIMIT'?'限價':'市價'} {lastOrder.price} USD</p></div><button type="button" onClick={()=>setShowHistory(true)}>查看紀錄 →</button><button type="button" className="text-button outcome-dismiss" onClick={()=>setLastOrderId(null)} aria-label="收起最近委託提示">×</button></section>}
      <div className={`assistant-main-grid assistant-layout-${assistantLayout} assistant-sizing-${assistantSizing}`} style={assistantGridStyle}>
        <aside className="assistant-context" aria-label="帳戶與提醒資訊">
          <div className="assistant-context-heading"><span>帳戶與提醒</span><small>下單前可隨時查看</small></div>
          <div className="assistant-dock-tabs" role="group" aria-label="帳戶與提醒切換">
            <button type="button" aria-pressed={assistantTab==='account'} className={assistantTab==='account'?'active':''} onClick={()=>setAssistantTab('account')}>帳戶</button>
            <button type="button" aria-pressed={assistantTab==='rules'} className={assistantTab==='rules'?'active':''} onClick={()=>setAssistantTab('rules')}>提醒 <span>{ruleResults.filter(rule=>rule.state==='triggered').length||''}</span></button>
          </div>
          {assistantTab==='account'&&<div className="assistant-account-pane">
            <div className="assistant-account-stats"><div><span>模擬淨值</span><strong>{state?.account.equity||'—'} <small>USD</small></strong></div><div><span>餘額</span><strong>{state?.account.balance||'—'} <small>USD</small></strong></div></div>
            <div className="assistant-list-heading"><span>目前持倉</span><span>{state?.positions.length||0} 筆</span></div>
            {state?.positions.length?<div className="assistant-position-list">{state.positions.map(position=><article className="assistant-position-card" key={position.id}><div><strong className={position.side==='BUY'?'positive':'negative'}>{sideName(position.side)} {position.lot} 手</strong><span>進場 {position.entry} · 損益 <b className={gainClass(position.pnl)}>{position.pnl} USD</b></span><span>停損 {position.sl||'未設定'} · 停利 {position.tp||'未設定'}</span></div><button disabled={busy||!connected} onClick={()=>closePosition(position.id)}>平倉</button></article>)}</div>:<div className="assistant-empty">尚無模擬持倉。從下單區建立草稿，確認後可在這裡查看。</div>}
            {pagesMode&&<><div className="assistant-list-heading pending-heading"><span>待成交委託</span><span>{state?.orders.filter(order=>order.status==='PENDING').length||0} 筆</span></div>{state?.orders.filter(order=>order.status==='PENDING').length?<div className="assistant-pending-list">{state.orders.filter(order=>order.status==='PENDING').map(order=><article className="assistant-position-card pending-order-card" key={order.id}><div><strong>{sideName(order.side)}限價 {order.lot} 手</strong><span>委託價 {order.price} · 等待回放觸價</span></div><button disabled={busy} onClick={()=>cancelPendingOrder(order.id)}>取消</button></article>)}</div>:<p className="assistant-muted">目前沒有待成交委託。</p>}</>}
            <button className="replay-link" onClick={()=>setShowHistory(true)}>所有委託與成交 <span>→</span></button>
          </div>}
          {assistantTab==='rules'&&<div className="assistant-rules-pane"><RuleEditor config={ruleConfig} onChange={changeRuleConfig} results={ruleResults}/></div>}
          {assistantTab==='account'&&<div className="assistant-integrations"><span>合成帳戶 · 僅保留本次模擬紀錄</span><button onClick={()=>setMarketView('live')}>開啟即時看盤 ↗</button></div>}
        </aside>
        <div className="assistant-divider-context"><AssistantColumnDivider active={assistantSizing==='resize'&&assistantLayout!=='conversation-focus'} side={assistantLayout==='order-left'?'right':'left'} value={assistantInfoWidth} min={240} max={340} resetValue={270} onChange={setAssistantInfoWidth} label="調整帳戶與提醒面板寬度"/></div>
        <section className="assistant-conversation"><div className="assistant-section-heading"><div><span>交易對話</span><p>把想法整理成可核對的草稿。</p></div><span className="assistant-live-label">{state?.llm_enabled?'對話助手':'示範助手'}</span></div>{conversationPanel}</section>
        <div className="assistant-divider-order"><AssistantColumnDivider active={assistantSizing==='resize'} side={assistantLayout==='order-left'?'left':'right'} value={assistantOrderWidth} min={300} max={440} resetValue={355} onChange={setAssistantOrderWidth} label="調整下單草稿面板寬度"/></div>
        <aside className="assistant-order-dock" aria-label="下單草稿"><div className="assistant-order-heading"><strong>下單草稿</strong><p>填寫方向、手數與價格，先檢查再確認。</p></div><div className="assistant-order-pane">{orderForm}</div></aside>
      </div>
    </main>}
    {marketView!=='assistant'&&<>
    {marketView==='live'&&<div className="live-page-intro"><div><h1>即時看盤</h1><p>{brokerPreviewEnabled?'查看 cTrader DEMO 已收 K 線；尚無券商資料時，提供 TradingView 參考圖。':'參考 TradingView 黃金圖表；圖表價格不會自動填入交易草稿。'}</p></div><div className="live-page-actions"><button type="button" onClick={()=>setMarketView('assistant')}>返回對話助手</button><a href="https://www.tradingview.com/symbols/XAUUSD/?exchange=OANDA" target="_blank" rel="noopener noreferrer">前往 TradingView ↗</a></div></div>}
    <div className={`workspace layout-grid preset-${effectivePreset} mode-${layoutMode} ${marketView==='live'?'live-workspace':''}`} style={workspaceStyle}>
      <main className="market-panel" aria-label={marketView==='live'?'即時看盤':'行情與回放'} style={chartStyle}>
        {marketView==='live'?<><LiveChart light={light} market={brokerMarket}/>{brokerPreviewEnabled&&<BrokerInsights market={brokerMarket} error={brokerError}/>}</>:<>
        <div className="instrument-header"><div><h1>XAU / USD <span>現貨黃金</span></h1><div className="market-subtitle">每手 100 oz · USD 計價</div></div><div className="quotes"><div><span>賣出價 BID</span><b className="negative">{state?.quote.bid||'—'}</b></div><div><span>買進價 ASK</span><b className="positive">{state?.quote.ask||'—'}</b></div></div></div>
        <div className="chart-toolbar"><div className="segments" aria-label="K 線週期">{['5m','15m','1h'].map(value=><button key={value} aria-pressed={interval===value} className={interval===value?'active':''} onClick={()=>setInterval(value)}>{value==='1h'?'1 小時':value==='5m'?'5 分':'15 分'}</button>)}</div><div className="legend"><span><i className="ma20"/>MA 20</span><span><i className="ma60"/>MA 60</span><span>已收盤 K 線</span></div></div>
        <div className="chart-area">{bars.bars.length?<Chart bars={bars.bars} markers={bars.markers} light={light}/>:<div className="chart-loading">{state?'此資料來源尚無可用行情。':'等待本機行情服務…'}</div>}</div>
        <ChartHeightDivider active={layoutMode==='resize'} value={chartHeight} onChange={setChartHeight}/>
        <div className="market-stats"><span>區間變動 <b className={gainClass(state?.market.change_pct)}>{state?.market.change_pct||'—'}%</b></span><span>區間高 <b>{state?.market.high||'—'}</b></span><span>區間低 <b>{state?.market.low||'—'}</b></span><span>波動區間 <b>{state?.market.range_pct||'—'}%</b></span><span className="chart-source">{bars.source?sourceName(bars.source):'—'}</span></div>
        <div className="replay-toolbar"><div className="replay-title"><span className="status-dot"/>回放控制<span className="fine">僅顯示決策當時可見行情</span></div><div className="replay-buttons"><button disabled={busy||!state||state.mode!=='replay'} onClick={()=>void replay(1)}>下一根 <span>＋5m</span></button><button disabled={busy||!state||state.mode!=='replay'} onClick={()=>void replay(6)}>＋30 分</button><button disabled={busy||!state||state.mode!=='replay'} onClick={()=>void replay(12)}>＋1 小時</button><button className="text-button" disabled={busy||!state||state.mode!=='replay'} onClick={reset}>重設</button></div></div>
        <AgentSummary pool={pool} poolStatus={poolStatus} ruleResults={ruleResults} onOpenCase={id=>void openCase(id)}/>
        </>}
      </main>
      {marketView==='replay'&&<ColumnDivider active={layoutMode==='resize'} value={splitWidth} onChange={setSplitWidth}/>}
      {marketView==='replay'&&<aside className="order-panel" aria-label="模擬下單與提醒"><div className="tabs right-tabs">{[['order','模擬下單'],['rules','提醒條件']].map(([value,label])=><button key={value} className={rightTab===value?'active':''} aria-pressed={rightTab===value} onClick={()=>setRightTab(value as 'order'|'rules')}>{label}</button>)}</div>{rightTab==='order'&&<div className="account-strip"><span>模擬淨值 <b>{state?.account.equity||'—'} <small>USD</small></b></span><span>餘額 <b>{state?.account.balance||'—'}</b></span></div>}
      {rightTab==='order'?orderForm:<RuleEditor config={ruleConfig} onChange={changeRuleConfig} results={ruleResults}/>}
      </aside>}
      {marketView==='replay'&&<section className={`bottom-panel ${layoutPreset==='positions-right'&&bottomTab==='positions'?'compact-mode':''}`} aria-label="帳戶與案例資料"><div className="bottom-heading"><div className="tabs">{[['positions',`持倉 ${state?.positions.length||0}`],['orders',`委託 ${state?.orders.filter(order=>order.status==='PENDING').length||0}`],['history','成交紀錄'],['cases','相似案例'],['audit','資料分群']].map(([value,label])=><button key={value} className={bottomTab===value?'active':''} aria-pressed={bottomTab===value} onClick={()=>setBottomTab(value)}>{label}</button>)}</div><span className="fine">本機展示帳戶 · USD</span></div>
      {bottomTab==='positions'&&layoutPreset==='positions-right'&&<PositionsCompact positions={state?.positions||[]} busy={busy} connected={Boolean(connected)} equity={state?.account.equity||'—'} orderCount={state?.orders.length||0} onClose={closePosition} onOrder={()=>setRightTab('order')}/>}
      {bottomTab==='positions'&&layoutPreset!=='positions-right'&&(!state?.positions.length?<PositionsEmpty equity={state?.account.equity||'—'} orderCount={state?.orders.length||0} onOrder={()=>setRightTab('order')}/>:<div className="table-scroll"><table><thead><tr><th>商品／時間</th><th>方向</th><th>手數</th><th>進場價</th><th>停損</th><th>停利</th><th>浮動損益 USD</th><th/></tr></thead><tbody>{state?.positions.map(p=><tr key={p.id}><td><strong>XAUUSD</strong><small>{formatTime(p.opened_at)}</small></td><td className={p.side==='BUY'?'positive':'negative'}>{sideName(p.side)}</td><td className="number">{p.lot}</td><td className="number">{p.entry}</td><td className="number">{p.sl||'—'}</td><td className="number">{p.tp||'—'}</td><td className={`number ${gainClass(p.pnl)}`}>{p.pnl}</td><td><button className="close-button" disabled={busy||!connected} onClick={()=>closePosition(p.id)}>平倉</button></td></tr>)}</tbody></table></div>)}
      {bottomTab==='orders'&&<div className="table-scroll"><table><thead><tr><th>委託編號</th><th>方向</th><th>類型</th><th>手數</th><th>價格</th><th>狀態</th><th/></tr></thead><tbody>{state?.orders.filter(order=>order.order_type==='LIMIT').slice().reverse().map(order=><tr key={order.id}><td><strong>{order.id}</strong><small>{formatTime(order.filled_at??order.time)}</small></td><td className={order.side==='BUY'?'positive':'negative'}>{sideName(order.side)}</td><td>限價</td><td className="number">{order.lot}</td><td className="number">{order.price}</td><td>{order.status==='PENDING'?'待成交':order.status==='FILLED'?'已成交':order.status==='CANCELLED'?'已取消':order.status}</td><td>{order.status==='PENDING'&&<button className="close-button" disabled={busy} onClick={()=>cancelPendingOrder(order.id)}>取消委託</button>}</td></tr>)}</tbody></table>{!state?.orders.some(order=>order.order_type==='LIMIT')&&<div className="empty">建立限價草稿後，可在這裡追蹤待成交委託。</div>}</div>}
      {bottomTab==='history'&&<div className="table-scroll"><table><thead><tr><th>成交編號／時間</th><th>方向</th><th>操作</th><th>手數</th><th>成交價</th><th>狀態</th><th>已實現損益 USD</th></tr></thead><tbody>{state?.orders.slice().reverse().map(o=><tr key={o.id}><td><strong>{o.id}</strong><small>{formatTime(o.time)}</small></td><td className={o.side==='BUY'?'positive':'negative'}>{sideName(o.side)}</td><td>{actionName(o.action)}</td><td className="number">{o.lot}</td><td className="number">{o.price}</td><td>{o.status==='FILLED'?'本機模擬成交':o.status}</td><td className={`number ${o.pnl?gainClass(o.pnl):''}`}>{o.pnl||'—'}</td></tr>)}</tbody></table>{!state?.orders.length&&<div className="empty">成交後可在此查看進場、加倉與平倉紀錄。</div>}</div>}
      {bottomTab==='cases'&&<div>{pool?<><Pool pool={pool}/><CaseRows cases={pool.cases} onOpen={id=>void openCase(id)}/><div className="limitations">{pool.limitations.map((text,index)=><p key={index}>{text}</p>)}</div></>:<div className="empty">案例檢索尚未完成；請確認服務與手數輸入。</div>}</div>}
      {bottomTab==='audit'&&<div className="audit-content">{audit?<><div className="audit-summary"><span>{sourceName(audit.source)}</span><span>來源檔 {audit.source_files}</span><span>黃金紀錄 {audit.total_gold_records}</span><span>期間 {typeof audit.period==='string'?audit.period:JSON.stringify(audit.period)}</span></div><div className="table-scroll"><table><thead><tr><th>分群</th><th>數量</th><th>定義與用途</th></tr></thead><tbody>{audit.groups.map(g=><tr key={g.code}><td><strong>{g.label}</strong><small>{g.code}</small></td><td className="number">{g.count}</td><td className="audit-description">{g.description}</td></tr>)}</tbody></table></div><div className="limitations">{[...audit.limitations,...(state?.data_quality||[])].map((text,index)=><p key={index}>{text}</p>)}<p>更新時間：{audit.refreshed_at}</p></div></>:<div className="empty">資料分群尚未載入。</div>}</div>}
      </section>}
    </div>
    </>}
    <footer><span>Gold Desk</span><span>{marketView==='assistant'?'交易草稿與送出前檢查':marketView==='live'&&brokerPreviewEnabled?'cTrader DEMO 本地唯讀預覽':marketView==='live'?'TradingView 圖表僅供參考':'合成行情與本機回放'}</span><span>無真實資金交易</span></footer>
    <dialog ref={historyDialog} className="history-dialog" aria-labelledby="history-title" onCancel={()=>setShowHistory(false)}>{showHistory&&<OrderHistory state={state} busy={busy} error={error} onCancel={cancelPendingOrder} onClose={()=>setShowHistory(false)} onReplay={()=>{setShowHistory(false);setMarketView('replay');setBottomTab('orders');}}/>}</dialog>
    <dialog ref={scenarioDialog} className="scenario-dialog" aria-labelledby="scenario-title" onCancel={()=>setShowScenarios(false)}>{showScenarios&&<ScenarioGallery value={scenario} onChange={setScenario} onClose={()=>setShowScenarios(false)}/>}</dialog>
    <dialog ref={guideDialog} className="guide-dialog" aria-label="使用指引" onCancel={()=>setShowGuide(false)}>{showGuide&&<FirstUseGuide onClose={()=>setShowGuide(false)}/>}</dialog>
    <dialog ref={reviewDialog} className="review-dialog" onCancel={e=>{e.preventDefault();void cancelDraft();}} aria-labelledby="review-title">{draft&&<><div className="dialog-heading"><div><span className="fine">{draft.order_type==='LIMIT'?'限價委託 · 送出前檢查':'市價委託 · 送出前檢查'}</span><h2 id="review-title">{actionName(draft.action)} · {sideName(draft.side)} {draft.lot} 手</h2></div><button className="text-button" autoFocus disabled={busy} onClick={()=>void cancelDraft()} aria-label="返回修改草稿">×</button></div><div className="dialog-body"><PreflightReview view={presentReplayPreflight(draft,state,ruleResults)} onOpenCase={id=>void openCase(id)}/>{error&&<p className="modal-error" role="alert">{error}</p>}</div><div className="dialog-actions"><p>核對完成後，才建立本次模擬委託。</p><button disabled={busy} onClick={()=>void cancelDraft()}>返回修改</button><button className="primary" disabled={busy||!connected} onClick={()=>void confirmDraft()}>{busy?'處理中…':draft.order_type==='LIMIT'?'確認模擬限價委託':'確認模擬市價委託'}</button></div></>}</dialog>
    <dialog ref={caseDialog} className="case-dialog" onCancel={()=>setSelectedCase(null)} aria-labelledby="case-title">{selectedCase&&<><div className="dialog-heading"><div><span className="fine">{sourceName(selectedCase.source_kind)} · {selectedCase.time_alignment==='confirmed'?'時區已核對':'時區未確認'}</span><h2 id="case-title">{selectedCase.label}</h2></div><button autoFocus className="text-button" onClick={()=>setSelectedCase(null)} aria-label="關閉案例">×</button></div><div className="dialog-body"><div className="case-overview"><span>{sideName(selectedCase.side)} · {actionName(selectedCase.action)}</span><span>{selectedCase.opened_at} → {selectedCase.closed_at}</span><strong className={gainClass(selectedCase.profit)}>{selectedCase.profit} {currencyName(selectedCase.currency)}</strong></div>{selectedCase.bars?.length?<div className="case-chart"><Chart bars={selectedCase.bars} markers={selectedCase.markers} light={light}/></div>:<div className="unavailable-chart"><strong>此案例沒有已核對的 K 線</strong><p>{selectedCase.chart_unavailable_reason||selectedCase.chart_reason||'資料源未提供可核對時區與成交位置的 OHLC，僅呈現原始操作序列。'}</p></div>}<p className="explanation">{behaviorName(selectedCase.behavior)}</p><details className="distance-details"><summary>操作條件距離 {selectedCase.distance ?? '未提供'} · 檢索說明</summary><p>目前比較買賣方向、首筆／加倉及手數等可核對操作條件；數值越小條件越接近。盤面未完成時區對齊時，沒有納入 K 線相似度；事後盈虧只決定展示次序。</p></details><h3>可見操作序列 {selectedCase.sequence_total&&selectedCase.sequence_total>selectedCase.sequence.length?<small>（顯示 {selectedCase.sequence.length} / {selectedCase.sequence_total} 筆）</small>:null}</h3><div className="table-scroll"><table><thead><tr><th>順序</th><th>角色</th><th>方向</th><th>手數</th><th>進場</th><th>平倉</th><th>損益／幣別</th></tr></thead><tbody>{selectedCase.sequence.map(s=><tr key={s.index}><td>{s.ordering_uncertain?'待確認':s.index}</td><td>{actionName(s.role)}</td><td>{sideName(s.side)}</td><td className="number">{s.lot}</td><td className="number">{s.entry}</td><td className="number">{s.exit}</td><td className={`number ${gainClass(s.profit)}`}>{s.profit}<small>{currencyName(selectedCase.currency)}</small></td></tr>)}</tbody></table></div><h3>相同與不同條件</h3><p>{selectedCase.match_reasons.join('；')}</p><div className="limitations">{selectedCase.differences.map((d,index)=><p key={index}>{d}</p>)}<p>操作群是候選；可見首筆不代表已確認空手。案例結果為事後資料。</p></div></div><div className="dialog-actions"><button className="primary" onClick={()=>setSelectedCase(null)}>返回交易工作台</button></div></>}</dialog>
  </div>;
}
