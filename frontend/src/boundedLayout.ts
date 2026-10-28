export type DeskPanel='context'|'chat'|'order';
export type PanelWidths=Record<DeskPanel,number>;
export const PANEL_MIN:PanelWidths={context:190,chat:300,order:230};
export const BOUNDED_KEY='gold-bounded-widths-v4';
export function resizePanelPair(widths:PanelWidths,left:DeskPanel,right:DeskPanel,delta:number):PanelWidths{
 if(!Number.isFinite(delta)||left===right)return {...widths};
 const change=Math.max(PANEL_MIN[left]-widths[left],Math.min(widths[right]-PANEL_MIN[right],delta));
 return {...widths,[left]:widths[left]+change,[right]:widths[right]-change};
}
export function validPanelWeights(raw:unknown):raw is PanelWidths{return !!raw&&typeof raw==='object'&&['context','chat','order'].every(p=>{const v=(raw as Record<string,unknown>)[p];return typeof v==='number'&&Number.isFinite(v)&&v>0&&v<=10000;});}
