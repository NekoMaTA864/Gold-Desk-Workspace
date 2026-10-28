import {useEffect,useId,useRef,type ReactNode} from 'react';
export default function WorkspaceDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null),titleId=useId();
 useEffect(()=>{const el=dialog.current;if(!el)return;const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;window.requestAnimationFrame(()=>{if(previous?.isConnected)previous.focus({preventScroll:true});});};},[]);
 return <dialog ref={dialog} className="workspace-info-dialog" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}><header><h2 id={titleId}>{title}</h2><button autoFocus type="button" aria-label={'關閉'+title} onClick={onClose}>關閉</button></header><div className="workspace-info-content">{children}</div></dialog>;
}
