import {useRef,type PointerEvent as ReactPointerEvent} from 'react';

export type LayoutMode = 'preset' | 'resize';
export type LayoutPreset = 'standard' | 'chart-focus' | 'positions-right';

export const clampSplit = (value:number) => Math.max(40,Math.min(74,Math.round(value)));
export const clampChartHeight = (value:number) => Math.max(280,Math.min(640,Math.round(value)));

export function readLayoutSelection(): {mode:LayoutMode;preset:LayoutPreset;split:number;height:number} {
  const query=new URLSearchParams(window.location.search);
  let stored:Record<string,unknown>={};
  try { const parsed=JSON.parse(localStorage.getItem('gold-desk-layout-v1')||'{}') as unknown; if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))stored=parsed as Record<string,unknown>; } catch { /* defaults below */ }
  const mode=(query.get('layout')||stored.mode)==='resize'?'resize':'preset';
  const requestedPreset=query.get('preset')||stored.preset;
  const preset=requestedPreset==='chart-focus'||requestedPreset==='positions-right'?requestedPreset:'standard';
  return {
    mode,preset,
    split:typeof stored.split==='number'&&Number.isFinite(stored.split)?clampSplit(stored.split):65,
    height:typeof stored.height==='number'&&Number.isFinite(stored.height)?clampChartHeight(stored.height):420,
  };
}

export function LayoutToolbar({mode,preset,onMode,onPreset,onReset}: {
  mode:LayoutMode;preset:LayoutPreset;
  onMode:(next:LayoutMode)=>void;onPreset:(next:LayoutPreset)=>void;onReset:()=>void;
}) {
  return <div className="layout-toolbar" aria-label="工作台版型比較">
    <div className="layout-toolbar-title"><span>工作台版型比較</span><small>同一份行情與草稿資料</small></div>
    <div className="layout-toolbar-controls">
      <div className="layout-choice" role="group" aria-label="調整方式">
        <button type="button" aria-pressed={mode==='preset'} className={mode==='preset'?'active':''} onClick={()=>onMode('preset')}>預設版型</button>
        <button type="button" aria-pressed={mode==='resize'} className={mode==='resize'?'active':''} onClick={()=>onMode('resize')}>拖分隔線</button>
      </div>
      <label className="layout-preset-label" htmlFor="layout-preset">排列</label>
      <select id="layout-preset" value={preset} onChange={event=>onPreset(event.target.value as LayoutPreset)}>
        <option value="standard">標準工作台</option>
        <option value="chart-focus">大盤置頂 · 持倉／對話並列</option>
        <option value="positions-right">大盤靠左 · 持倉右側</option>
      </select>
      {mode==='resize'&&<button type="button" className="layout-reset" onClick={onReset}>重設大小</button>}
    </div>
    <p className="layout-toolbar-help">{mode==='resize'?'拖動面板間的分隔線；也可聚焦分隔線後用方向鍵調整。':'選擇固定排列，觀察哪種流程更順手。'}</p>
  </div>;
}

export function ColumnDivider({active,value,onChange}: {active:boolean;value:number;onChange:(value:number)=>void}) {
  if(!active) return <div className="layout-spacer" aria-hidden="true"/>;
  const update=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const workspace=event.currentTarget.closest('.workspace');
    if(!workspace)return;
    const bounds=workspace.getBoundingClientRect();
    onChange(clampSplit(((event.clientX-bounds.left)/bounds.width)*100));
  };
  return <div className="column-divider" role="separator" aria-label="調整左右面板寬度" aria-orientation="vertical" aria-valuemin={40} aria-valuemax={74} aria-valuenow={value} tabIndex={0}
    onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);update(event);}}
    onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))update(event);}}
    onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
    onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();onChange(clampSplit(value+(event.key==='ArrowRight'?3:-3)));}if(event.key==='Home'){event.preventDefault();onChange(65);}}}>
    <span aria-hidden="true"/>
  </div>;
}

export function ChartHeightDivider({active,value,onChange}: {active:boolean;value:number;onChange:(value:number)=>void}) {
  const drag=useRef({startY:0,startHeight:value});
  if(!active)return null;
  return <div className="chart-height-divider" role="separator" aria-label="調整圖表高度" aria-orientation="horizontal" aria-valuemin={280} aria-valuemax={640} aria-valuenow={value} tabIndex={0}
    onPointerDown={event=>{event.preventDefault();drag.current={startY:event.clientY,startHeight:value};event.currentTarget.setPointerCapture(event.pointerId);}}
    onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))onChange(clampChartHeight(drag.current.startHeight+event.clientY-drag.current.startY));}}
    onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
    onKeyDown={event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();onChange(clampChartHeight(value+(event.key==='ArrowDown'?20:-20)));}if(event.key==='Home'){event.preventDefault();onChange(420);}}}>
    <span aria-hidden="true"/>
  </div>;
}
