import type {Position} from './types';
import PositionsEmpty from './PositionsEmpty';

export default function PositionsCompact({positions,busy,connected,equity,orderCount,onClose,onOrder}: {positions:Position[];busy:boolean;connected:boolean;equity:string;orderCount:number;onClose:(id:string)=>void;onOrder:()=>void}) {
  if(!positions.length)return <PositionsEmpty compact equity={equity} orderCount={orderCount} onOrder={onOrder}/>;
  return <div className="compact-positions">{positions.map(position=><article key={position.id} className="compact-position">
    <div className="compact-position-head"><strong>XAU/USD · {position.side==='BUY'?'買入':'賣出'} {position.lot} 手</strong><span className={position.pnl.startsWith('-')?'negative':'positive'}>{position.pnl} USD</span></div>
    <dl><dt>進場價</dt><dd>{position.entry}</dd><dt>停損</dt><dd>{position.sl||'未設定'}</dd><dt>停利</dt><dd>{position.tp||'未設定'}</dd></dl>
    <button type="button" disabled={busy||!connected} onClick={()=>onClose(position.id)}>平倉本機模擬部位</button>
  </article>)}</div>;
}
