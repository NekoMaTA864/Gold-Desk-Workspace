import type {BrokerMarket} from './brokerPreview';

export default function BrokerInsights({market,error}:{market:BrokerMarket|null;error:string|null}) {
  const connected=!error&&market?.connection_status==='CONNECTED';
  const account=connected&&market?.account?.status==='CURRENT'?market.account:null;
  const connectionLabel=error?'資料服務未連線':connected?'DEMO 已連線':!market?'正在讀取帳戶狀態':market.connection_status==='NOT_CONFIGURED'?'尚未連接 DEMO 帳戶':'DEMO 連線尚未就緒';
  return <section className="broker-insights" aria-label="cTrader DEMO 帳戶狀態">
    <div className="broker-insight-card">
      <span className="assistant-eyebrow">CTRADER DEMO / READ ONLY</span>
      <h2>券商帳戶狀態</h2>
      <p className="broker-connection">{connectionLabel}</p>
      <div className="broker-account-grid"><span>餘額 <b>{account?.balance??'—'} {account?.currency??''}</b></span><span>淨值 <b>{account?.equity??'—'} {account?.currency??''}</b></span><span>黃金持倉 <b>{account?.positions.length??'—'} 筆</b></span><span>待成交 <b>{account?.pending_orders.length??'—'} 筆</b></span></div>
      <p className="fine">{account?.status==='CURRENT'?`帳戶資料更新：${account.updated_at_utc??'時間未提供'}`:'帳戶資料尚未可用；不顯示合成數值。'}</p>
    </div>
    <div className="broker-insight-card"><span className="assistant-eyebrow">資料使用說明</span><h2>看盤與模擬帳戶分開</h2><p>這裡可查看 DEMO 報價、已收 K 線與帳戶摘要。交易工作台仍使用獨立的合成行情，不會向此帳戶送出訂單。</p></div>
  </section>;
}
