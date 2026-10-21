import {useEffect,useRef,useState} from 'react';
import Chart from './Chart';
import {brokerPreviewEnabled,useBrokerBars,type BrokerMarket} from './brokerPreview';

// The cTrader chart uses only closed bars; TradingView remains a separate reference fallback.
export default function LiveChart({light,market}:{light:boolean;market:BrokerMarket|null}) {
  const host=useRef<HTMLDivElement>(null);
  const [status,setStatus]=useState<'loading'|'embedded'|'failed'>('loading');
  const [attempt,setAttempt]=useState(0);
  const [interval,setInterval]=useState<'5m'|'15m'|'1h'>('5m');
  const {bars:brokerBars,loading}=useBrokerBars(interval,true);
  const brokerChart=brokerPreviewEnabled&&brokerBars?.status==='CURRENT'&&brokerBars.closed_only&&Boolean(brokerBars.bars.length);
  useEffect(()=>{
    if(brokerChart||loading)return;
    const target=host.current;if(!target)return;
    setStatus('loading');let active=true;
    const container=document.createElement('div');
    container.className='tradingview-widget-container';
    container.style.height='100%';container.style.width='100%';
    const widget=document.createElement('div');
    widget.className='tradingview-widget-container__widget';
    widget.style.height='100%';widget.style.width='100%';
    container.append(widget);target.replaceChildren(container);
    const timeout=window.setTimeout(()=>{if(active)setStatus('failed');},20000);
    const observer=new MutationObserver(()=>{
      const frame=container.querySelector('iframe');
      if(frame&&active){
        frame.title='TradingView 黃金即時參考圖表';
        // Frame creation is observable; cross-origin feed freshness is not.
        window.clearTimeout(timeout);setStatus('embedded');observer.disconnect();
      }
    });
    observer.observe(container,{childList:true,subtree:true});
    const script=document.createElement('script');
    script.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async=true;
    script.textContent=JSON.stringify({autosize:true,symbol:'OANDA:XAUUSD',interval:interval==='1h'?'60':interval==='15m'?'15':'5',timezone:'Etc/UTC',theme:light?'light':'dark',style:'1',locale:'zh_TW',allow_symbol_change:false,hide_side_toolbar:false,withdateranges:true,save_image:false,support_host:'https://www.tradingview.com'});
    script.onerror=()=>{if(active){window.clearTimeout(timeout);setStatus('failed');}};
    container.append(script);
    return ()=>{active=false;window.clearTimeout(timeout);observer.disconnect();script.onerror=null;target.replaceChildren();};
  },[light,attempt,interval,brokerChart,loading]);
  return <section className="live-market" aria-label="即時看盤">
    <div className="instrument-header"><div><h2>XAU / USD <span>{brokerChart?'cTrader DEMO 已收 K 線':'即時參考行情'}</span></h2><div className="market-subtitle">{brokerChart?'cTrader DEMO · UTC':'TradingView · OANDA:XAUUSD · UTC'}</div></div><span className="fine">{brokerChart?'券商 DEMO 盤面':'外部參考圖'}</span></div>
    {brokerPreviewEnabled&&<div className="broker-timeframes" aria-label="即時 K 線週期">{(['5m','15m','1h'] as const).map(value=><button key={value} className={interval===value?'active':''} aria-pressed={interval===value} onClick={()=>setInterval(value)}>{value==='1h'?'1 小時':value==='5m'?'5 分':'15 分'}</button>)}</div>}
    <div className="live-status" role="status">{brokerChart?'目前顯示 cTrader DEMO 已收 K 線；未完成的 K 線不計入。':loading?'正在讀取 cTrader DEMO K 線…':status==='loading'?'正在載入 TradingView 圖表…':status==='failed'?'無法載入圖表。請重新載入，或前往 TradingView 查看。':brokerPreviewEnabled?'cTrader K 線尚未取得；目前顯示 TradingView 外部參考圖。':'圖表載入狀態無法由本站確認；請以圖表內容為準。'}{status==='failed'&&!brokerChart&&<button onClick={()=>setAttempt(n=>n+1)}>重新載入圖表</button>}<a href="https://www.tradingview.com/symbols/XAUUSD/?exchange=OANDA" target="_blank" rel="noopener noreferrer">前往 TradingView ↗</a></div>
    {brokerPreviewEnabled&&<div className="broker-quote" role="status"><strong>{market?.quote.status==='CURRENT'?'cTrader DEMO · 最新報價':market?.quote.status==='STALE'?'cTrader DEMO · 報價已過期':'cTrader DEMO · 尚未連線'}</strong><span>賣出 BID <b>{market?.quote.bid??'—'}</b></span><span>買進 ASK <b>{market?.quote.ask??'—'}</b></span><small>{market?.quote.source_time_utc??'來源時間未提供'}</small></div>}
    <div className="live-chart">{brokerChart?<Chart bars={brokerBars!.bars} light={light}/>:loading?<div className="chart-loading">正在讀取 cTrader DEMO 行情…</div>:<div className="tradingview-host" ref={host}/>}</div>
    {!brokerChart&&<div className="live-attribution"><a href="https://www.tradingview.com/symbols/XAUUSD/?exchange=OANDA" target="_blank" rel="noopener noreferrer">XAUUSD 圖表</a><span>由 TradingView 提供；與 cTrader DEMO 報價來源不同</span></div>}
    <div className="limitations"><p>開市且來源正常時行情自動更新；休市、延遲或斷線狀態請依圖表顯示判讀。</p><p>{brokerChart?'券商 K 線只供本地觀察；回放委託與券商帳戶仍分開。':'外部圖表價格不會填入模擬委託或歷史案例查詢。'}</p></div>
  </section>;
}
