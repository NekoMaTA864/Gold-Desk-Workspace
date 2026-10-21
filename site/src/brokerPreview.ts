import {useEffect,useState} from 'react';
import type {Bar} from './types';

// Only the explicitly enabled local Vite preview talks to Kuan's loopback API.
// Published Pages builds never request broker data or expose credentials.
export const brokerPreviewEnabled = import.meta.env.DEV && import.meta.env.VITE_CTRADER_LOCAL_PREVIEW === 'true';

export type BrokerMarket = {
  source:string;environment:'demo';connection_status:string;token_scope:string;order_connection:boolean;
  quote:{status:string;bid:string|null;ask:string|null;source_time_utc:string|null;age_seconds:number|null};
  account:{status:string;balance:string|null;equity:string|null;currency:string|null;
    positions:unknown[];pending_orders:unknown[];updated_at_utc:string|null}|null;
};

export type BrokerBars = {source:string;environment:'demo';status:string;interval:string;closed_only:boolean;bars:Bar[]};

async function brokerGet<T>(path:string):Promise<T> {
  const response=await fetch(`/api/broker${path}`,{cache:'no-store'});
  const value=await response.json().catch(()=>({detail:'券商資料回應格式錯誤'}));
  if(!response.ok)throw new Error(value.detail || `券商資料服務錯誤 (${response.status})`);
  return value as T;
}
export function useBrokerMarket():{market:BrokerMarket|null;error:string|null} {
  const [market,setMarket]=useState<BrokerMarket|null>(null);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    if(!brokerPreviewEnabled)return;
    let active=true;
    let timer:number|undefined;
    const refresh=async()=>{
      try{const next=await brokerGet<BrokerMarket>('/market');if(active){setMarket(next);setError(null);}}
      catch(e){if(active){setMarket(null);setError(e instanceof Error?e.message:'券商資料服務未連線');}}
      if(active)timer=window.setTimeout(refresh,2000);
    };
    void refresh();
    return()=>{active=false;if(timer)window.clearTimeout(timer);};
  },[]);
  return {market,error};
}

export function useBrokerBars(interval:'5m'|'15m'|'1h',enabled:boolean):{bars:BrokerBars|null;loading:boolean} {
  const [bars,setBars]=useState<BrokerBars|null>(null);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    if(!brokerPreviewEnabled||!enabled)return;
    let active=true;
    let timer:number|undefined;
    setBars(null);setLoading(true);
    const refresh=async()=>{
      try{const next=await brokerGet<BrokerBars>(`/bars?interval=${interval}`);if(active)setBars(next);}
      catch{if(active)setBars(null);}
      if(active){setLoading(false);timer=window.setTimeout(refresh,15000);}
    };
    void refresh();
    return()=>{active=false;if(timer)window.clearTimeout(timer);};
  },[interval,enabled]);
  return {bars,loading};
}
