import type {ReactNode} from 'react';
import type {DemoMarket} from './demoMarket';
import {DeskIcon,DeskMarketHeader} from './DeskChrome';

export type DeskView='assistant'|'replay'|'live';
type Props={view:DeskView;market:DemoMarket|null;light:boolean;publicMode:boolean;busy:boolean;onNavigate:(view:DeskView)=>void;onSection:(section:'main'|'account'|'cases')=>void;onToggleTheme:()=>void;onResetLayout:()=>void;children:ReactNode};

export default function DeskRouteFrame({view,market,light,publicMode,busy,onNavigate,onSection,onToggleTheme,onResetLayout,children}:Props){
 // The public demo uses one route frame for all three workspaces.
 // The backend conversation has its own rail, so keep that route unchanged.
 const secondary=publicMode||view!=='assistant';
 // Keep both wrappers and the children slot stable across routes: shared drafts stay mounted.
 return <div className={`pd-route-frame pd-view-${view} ${secondary?'pd-route-secondary':''} ${publicMode?'pd-public':''}`}>
  {secondary&&<aside className="pd-rail pd-page-rail"><a className="pd-brand" href="#market-workspace"><span className="pd-monogram">GD</span><span><strong>Gold Desk</strong><small>黃金交易工作台</small></span></a>
   <nav aria-label="工作台頁面">{([['assistant','chat','交易對話'],['live','chart','即時看盤'],['replay','replay','歷史回放']] as const).map(([key,icon,label])=><button key={key} type="button" className={view===key?'pd-nav-active':undefined} aria-current={view===key?'page':undefined} disabled={busy} onClick={()=>onNavigate(key)}><DeskIcon name={icon}/><span>{label}</span></button>)}</nav>
   <div className="pd-page-outline"><span>本頁工作區</span><button type="button" disabled={busy} onClick={()=>onSection('main')}>{view==='assistant'?'對話助手':'行情圖表'}</button><button type="button" disabled={busy} onClick={()=>onSection('account')}>{view==='assistant'?'帳戶與提醒':view==='live'&&!publicMode?'DEMO 持倉與紀錄':'回放持倉與紀錄'}</button><button type="button" disabled={busy} onClick={()=>onSection('cases')}>相似歷史案例</button></div>
   <div className="pd-rail-foot"><span className="pd-demo-tag">{publicMode?'公開展示':view==='live'?'DEMO 工作區':'歷史回放'}</span><p>{publicMode?'合成回放與外部參考行情。':view==='live'?'即時觀察，委託回到交易對話。':'依回放時間推進，帳戶獨立。'}</p></div>
  </aside>}
  <div className="pd-route-body">
   {secondary&&<>{publicMode?<header className="pd-market pd-public-header"><span className="pd-symbol">Gold Desk <small>公開展示 · 外部參考行情／合成回放</small></span><div className="pd-public-header-actions">{view==='replay'&&<button type="button" onClick={onResetLayout}>還原委託版面</button>}<button type="button" aria-label={light?'切換深色':'切換淺色'} onClick={onToggleTheme}><DeskIcon name="sun"/></button></div></header>:<DeskMarketHeader market={market} light={light} onToggleTheme={onToggleTheme}/>}
    <div className="pd-page-heading"><div><h1>{view==='assistant'?'交易對話':view==='live'?'即時看盤':'歷史回放'}</h1><p>{view==='assistant'?'描述交易想法，核對風險與案例，再確認模擬委託。':view==='live'?'觀察行情與歷史案例，準備好再回到交易對話。':'查看當時盤面，逐步推進並檢查模擬委託。'}</p></div><span>{view==='assistant'?'合成回放 · 本機模擬':view==='live'?(publicMode?'TradingView 參考行情':'cTrader DEMO'):'回放行情 · 獨立模擬帳戶'}</span></div></>}
   {children}
  </div>
 </div>;
}
