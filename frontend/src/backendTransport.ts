/** Same-origin FastAPI transport. No retries, token storage, redirects or implicit broker actions. */
export type BackendErrorKind='unauthorized'|'forbidden'|'conflict'|'rate_limited'|'unavailable'|'http'|'network'|'invalid_response';

export class BackendError extends Error {
 constructor(message:string,public readonly kind:BackendErrorKind,public readonly status:number|null=null,public readonly detail:string|null=null,public readonly jsonResponse=false){super(message);this.name='BackendError';}
}

export function backendURL(path:string):string {
 let decoded:string;
 try{decoded=decodeURIComponent(path.split('?')[0]);}catch{throw new Error('後端路徑格式無效');}
 if(!path.startsWith('/')||path.startsWith('//')||/[\\#\r\n]/.test(path)||/[\\\r\n]/.test(decoded)||decoded.split('/').some(p=>p==='.'||p==='..'))throw new Error('後端路徑格式無效');
 return '/api'+path;
}

function httpError(response:Response,content:unknown):BackendError {
 const detail=content&&typeof content==='object'&&'detail' in content&&typeof content.detail==='string'?content.detail:null;
 const status=response.status;
 const kind:BackendErrorKind=status===401?'unauthorized':status===403?'forbidden':status===409?'conflict':status===429?'rate_limited':status>=500?'unavailable':'http';
 const message=status===401?'登入狀態無效或已逾期，請重新登入後再試。':status===403?'目前沒有權限使用此功能，請確認帳號角色與服務存取設定。':status===429?'請求過於頻繁或服務額度受限，請稍後再試。':detail??(status>=500?'後端服務暫時無法使用，請稍後再試。':'服務未接受這次請求，請核對輸入內容。');
 return new BackendError(message,kind,status,detail,!!response.headers.get('content-type')?.includes('application/json'));
}

export async function requestBackendJSON<T>(path:string,body?:unknown,options:{signal?:AbortSignal}={}):Promise<T> {
 const url=backendURL(path);
 let response:Response;
 try {
  response=await fetch(url,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:options.signal});
 }catch(error){
  if(options.signal?.aborted||(error instanceof Error&&error.name==='AbortError'))throw error;
  throw new BackendError('無法連接後端服務，請確認連線。若剛確認委託，請先核對結果，勿重送。','network');
 }
 let content:unknown;
 try{content=await response.json();}
 catch{if(!response.ok)throw httpError(response,null);throw new BackendError('後端回應格式無效，未取得可用結果。若剛確認委託，請先核對結果，勿重送。','invalid_response',response.status);}
 if(!response.ok)throw httpError(response,content);
 return content as T;
}

/** Native SSE shares the same-origin cookie policy; reconnect/fallback remains owned by the chart hook. */
export function openBackendEvents(path:string):EventSource{return new EventSource(backendURL(path));}
