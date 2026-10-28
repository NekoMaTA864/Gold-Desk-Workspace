import type {BrokerReviewDraft} from '../../src/BrokerReviewContents';

/** Synthetic display-only example; never supplied to a broker or confirmation endpoint. */
export function reviewFixture():BrokerReviewDraft {
 return {
  id:'display-only',revision:1,side:'BUY',lot:'0.10',price:'4000',sl:'3980',tp:null,action:'FIRST',status:'REVIEW',
  risk:{before_lot:'0.10',after_lot:'0.20',average_entry:'3995',stop_loss_usd:'200.00',reward_risk:null,scenarios:[],warnings:[]},
  retrieval:{total:0,wins:0,losses:0,flat:0,unknown:0,win_rate:null,cases:[],limitations:['來源時鐘未獨立核實'],sufficiency:{status:'insufficient',label:'資料不足',reasons:['本次無符合案例'],matched_groups:0,is_success_probability:false}},
  explanation:'程式草稿摘要',analysis_snapshot_id:'preview-snapshot',analysis_as_of_utc:'2026-10-28T06:00:00Z',
  analysis_reply:{message:'程式說明',provider:'local_market_rules',llm_status:'not_requested',model:null,source:'ctrader_demo_xauusd',market_status:'FROZEN',as_of_utc:'2026-10-28T06:00:00Z',quote_time_utc:'2026-10-28T05:59:59Z',snapshot_id:'preview-snapshot',analysis_mode:'draft_snapshot',followups:[],draft:null,
   sections:[{title:'盤面依據',text:'合成測試：保留建立草稿時的盤面，未使用最新對話替換。',fact_ids:['f5.trend'],source:'program'}],
   evidence:[{id:'f5.trend',text:'參考收盤 {{close}}',values:{close:'4000'}}],
   case_comparison:{status:'NO_RULE_MATCH',label:'本次無符合案例',reason:'合成測試：固定條件下零筆匹配，不放寬規則。',method:'context_contract_v1',side:'BUY',snapshot_id:'preview-snapshot',query_as_of_utc:1793167200,query_state:{event:'區間內',tail_direction:'上行'},counts:{eligible:12,passed:0,displayed:0},cases:[],rejections:[]}
  }
 };
}
