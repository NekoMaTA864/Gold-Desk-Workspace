import {getEvidence,type Evidence,type RuleResult} from './DecisionSupport';
import type {Draft,Retrieval,Side,State} from './types';

// Keep the review screen independent from the local replay response shape.
// A future team API can supply this view without changing the five review sections.
export type PreflightPresentation={
  sourceLabel:string;
  sourceTime:string;
  order:{side:Side;lot:string;price:string;sl:string|null;tp:string|null;type:'MARKET'|'LIMIT'};
  risk:Draft['risk'];
  rules:RuleResult[];
  history:Retrieval;
  evidence:Evidence;
  explanation:string;
};

export function presentReplayPreflight(draft:Draft,state:State|null,rules:RuleResult[]):PreflightPresentation {
  const sourceTime=state?.quote.time;
  return {
    sourceLabel:state?.mode==='replay'?'合成回放 · 本機模擬':'券商練習帳戶未連線',
    sourceTime:typeof sourceTime==='number'?`${new Date(sourceTime*1000).toISOString().slice(0,16).replace('T',' ')} UTC`:sourceTime||'—',
    order:{side:draft.side,lot:draft.lot,price:draft.price,sl:draft.sl,tp:draft.tp,type:draft.order_type||'MARKET'},
    risk:draft.risk,
    rules,
    history:draft.retrieval,
    evidence:getEvidence(draft.retrieval,'ready'),
    explanation:draft.explanation,
  };
}
