import {useState} from 'react';
import type {State} from './types';

const statusLabels:Record<string,string>={PENDING:'待成交',FILLED:'模擬已成交',CANCELLED:'已取消',REJECTED:'未受理',FAILED:'未完成'};
const timeLabel=(time:string|number)=>typeof time==='number'?`${new Date(time*1000).toISOString().replace('T',' ').slice(0,16)} UTC`:time;

export default function OrderHistory({state,busy,error,onCancel,onReplay,onClose}:{state:State|null;busy:boolean;error:string;onCancel:(id:string)=>void;onReplay:()=>void;onClose:()=>void}) {
  const [filter,setFilter]=useState('all');
  const orders=(state?.orders||[]).slice().reverse().filter(order=>filter==='all'||order.status===filter);
  return <>
    <div className="dialog-heading"><div><span className="fine">模擬帳戶</span><h2 id="history-title">委託與成交紀錄</h2></div><button type="button" className="text-button" autoFocus onClick={onClose} aria-label="關閉紀錄">×</button></div>
    <div className="dialog-body history-body">
      {error&&<p className="modal-error" role="alert">{error}</p>}
      <div className="history-filters" role="group" aria-label="篩選委託狀態">{[['all','全部'],['PENDING','待成交'],['FILLED','已成交'],['CANCELLED','已取消']].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div>
      <p className="history-note">這些紀錄來自本次模擬工作階段。待成交限價單會在回放推進後檢查是否觸價。</p>
      {!state?<p className="history-empty">正在載入模擬帳戶…</p>:orders.length?<div className="history-list">{orders.map(order=><article key={order.id} className="history-record">
        <div className="history-record-heading"><strong className={order.side==='BUY'?'positive':'negative'}>{order.side==='BUY'?'買進':'賣出'} {order.lot} 手 <span>XAUUSD</span></strong><span className={`order-status status-${order.status.toLowerCase()}`}>{statusLabels[order.status]||order.status}</span></div>
        <dl><div><dt>{order.status==='FILLED'?'成交價':'委託價'}</dt><dd>{order.price} USD</dd></div><div><dt>類型／操作</dt><dd>{order.order_type==='LIMIT'?'限價':'市價'} · {({FIRST:'首筆進場',ADD:'加倉',OPPOSITE:'反向部位',CLOSE:'平倉',SL:'停損',TP:'停利'} as Record<string,string>)[order.action]||order.action}</dd></div><div><dt>時間</dt><dd>{timeLabel(order.filled_at??order.time)}</dd></div>{order.pnl!=null&&<div><dt>已實現損益</dt><dd className={order.pnl.startsWith('-')?'negative':'positive'}>{order.pnl} USD</dd></div>}</dl>
        <div className="history-record-footer"><span>編號 {order.id}</span>{order.status==='PENDING'&&<button type="button" disabled={busy} onClick={()=>onCancel(order.id)}>取消委託</button>}</div>
      </article>)}</div>:<div className="history-empty"><strong>{filter==='all'?'還沒有模擬委託':'沒有符合此狀態的委託'}</strong><p>建立草稿並確認後，會在這裡留下紀錄。</p></div>}
    </div>
    <div className="dialog-actions"><p>回放可推進行情，觀察部位與委託的變化。</p><button type="button" onClick={onReplay}>開啟回放演練</button><button type="button" className="primary" onClick={onClose}>返回工作台</button></div>
  </>;
}
