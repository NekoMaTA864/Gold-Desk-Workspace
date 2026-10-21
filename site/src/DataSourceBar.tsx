import {brokerPreviewEnabled,type BrokerMarket} from './brokerPreview';
import type {State} from './types';

type View='assistant'|'replay'|'live';

function timeLabel(value:string|number|null|undefined):string {
  if(value===null||value===undefined||value==='')return '時間未提供';
  if(typeof value==='number')return `${new Date(value*1000).toISOString().replace('T',' ').slice(0,16)} UTC`;
  return value;
}

export default function DataSourceBar({view,state,broker,brokerError}:{view:View;state:State|null;broker:BrokerMarket|null;brokerError:string|null}) {
  const replay=view!=='live';
  const brokerCurrent=!brokerError&&broker?.quote.status==='CURRENT';
  const brokerState=brokerError?'服務未連線':brokerCurrent?'報價可用':broker?.quote.status==='STALE'?'報價已過期':broker?.connection_status==='NOT_CONFIGURED'?'尚未連接帳戶':broker?'等待券商報價':'讀取中';
  return <section className="workspace-status" aria-label="使用模式與資料來源">
    <span className="mode-badge">模擬體驗</span>
    <span className="workspace-status-copy">{replay?'合成行情 · 確認後僅記錄模擬委託':'看盤參考 · 圖表價格不會填入模擬訂單'}</span>
    <details className="source-disclosure" onKeyDown={event=>{if(event.key==='Escape'){event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus();}}}>
      <summary>資料與連線</summary>
      <div className="source-detail-panel">
        <div><strong>{replay?'目前使用合成回放':'目前查看參考圖表'}</strong><p>{replay?`回放時間：${timeLabel(state?.quote.time)}`:'圖表來源以圖內標示為準，與模擬帳戶分開。'}</p><p>交易工作台只記錄本機模擬結果，不會送出券商訂單。</p></div>
        <div><strong>對話助手</strong><p>{state?.llm_enabled?'對話服務已啟用。':'示範回覆依本機規則產生，可整理交易草稿與查詢模擬持倉。'}</p></div>
        <div><strong>券商資料 · {brokerPreviewEnabled?brokerState:'未連線'}</strong><p>{brokerPreviewEnabled?'本地 cTrader DEMO 唯讀預覽。':'此展示尚未連接券商帳戶。'}</p>{brokerCurrent&&<p className="source-quote">BID {broker?.quote.bid} · ASK {broker?.quote.ask}<br/>{timeLabel(broker?.quote.source_time_utc)}</p>}</div>
      </div>
    </details>
    <span className="sr-only" role="status">{brokerPreviewEnabled?`券商資料 ${brokerState}`:'目前使用模擬體驗'}</span>
  </section>;
}
