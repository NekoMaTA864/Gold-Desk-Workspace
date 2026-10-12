export default function PositionsEmpty({equity,orderCount,onOrder,compact=false}: {
  equity:string;
  orderCount:number;
  onOrder:()=>void;
  compact?:boolean;
}) {
  return <div className={`positions-empty ${compact?'compact':''}`}>
    <div className="positions-empty-icon" aria-hidden="true">◎</div>
    <strong>目前沒有本機模擬持倉</strong>
    <p>確認模擬成交後，這裡會同步顯示方向、手數與浮動損益。</p>
    <div className="positions-empty-summary">
      <span>本機淨值 <b>{equity} USD</b></span>
      <span>成交紀錄 <b>{orderCount} 筆</b></span>
    </div>
    <button type="button" onClick={onOrder}>前往下單</button>
  </div>;
}
