import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BackendError,backendURL,requestBackendJSON,openBackendEvents} from '../src/backendTransport';

test('requests preserve same-origin routing, cookies, body and abort signal, with no retry',async()=>{
 const original=globalThis.fetch,controller=new AbortController();let calls=0;
 try{
  globalThis.fetch=async(url,init)=>{
   calls++;assert.equal(url,'/api/assistant/interpret');assert.equal(init?.credentials,'same-origin');assert.equal(init?.cache,'no-store');assert.equal(init?.signal,controller.signal);assert.equal(init?.method,'POST');assert.deepEqual(JSON.parse(String(init?.body)),{message:'測試'});
   return new Response(JSON.stringify({intent:'DISCUSS'}));
  };
  assert.deepEqual(await requestBackendJSON('/assistant/interpret',{message:'測試'},{signal:controller.signal}),{intent:'DISCUSS'});assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('HTTP errors keep machine-readable status and rejection detail without dumping validation JSON',async()=>{
 const original=globalThis.fetch;
 try{
  for(const [status,kind,message] of [[401,'unauthorized','重新登入'],[403,'forbidden','沒有權限'],[409,'conflict','草稿已過期'],[429,'rate_limited','稍後再試'],[503,'unavailable','草稿已過期']] as const){
   globalThis.fetch=async()=>new Response(JSON.stringify({detail:'草稿已過期'}),{status,headers:{'content-type':'application/json'}});
   await assert.rejects(requestBackendJSON('/test'),e=>e instanceof BackendError&&e.status===status&&e.kind===kind&&e.detail==='草稿已過期'&&e.message.includes(message)&&e.jsonResponse);
  }
  globalThis.fetch=async()=>new Response(JSON.stringify({detail:[{secret:'not for UI'}]}),{status:422});
  await assert.rejects(requestBackendJSON('/test'),e=>e instanceof BackendError&&!e.message.includes('secret'));
 }finally{globalThis.fetch=original;}
});
test('invalid successful JSON is an error, not a successful detail object; server HTML never leaks into UI',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response('<html>proxy internals</html>');
  await assert.rejects(requestBackendJSON('/test'),e=>e instanceof BackendError&&e.kind==='invalid_response'&&!e.message.includes('proxy internals'));
  globalThis.fetch=async()=>new Response('<html>proxy internals</html>',{status:401});
  await assert.rejects(requestBackendJSON('/test'),e=>e instanceof BackendError&&e.kind==='unauthorized'&&e.detail===null&&!e.jsonResponse);
 }finally{globalThis.fetch=original;}
});
test('network failure does not retry POST and aborts preserve cancellation semantics',async()=>{
 const original=globalThis.fetch;let calls=0;
 try{
  globalThis.fetch=async()=>{calls++;throw new TypeError('offline');};
  await assert.rejects(requestBackendJSON('/broker/drafts/id/confirm',{revision:1}),e=>e instanceof BackendError&&e.kind==='network'&&e.message.includes('勿重送'));assert.equal(calls,1);
  const controller=new AbortController();controller.abort();const abort=new DOMException('cancelled','AbortError');
  globalThis.fetch=async()=>{throw abort;};
  await assert.rejects(requestBackendJSON('/test',{}, {signal:controller.signal}),e=>e===abort);
 }finally{globalThis.fetch=original;}
});
test('paths cannot escape API prefix; encoded IDs and query values are preserved',()=>{
 for(const path of ['https://example.org','//example.org','/../other','/%2e%2e/other','/a\\b','/a#b','/%'])assert.throws(()=>backendURL(path));
 assert.equal(backendURL('/cases/%E6%B8%AC%E8%A9%A6?x=1'),'/api/cases/%E6%B8%AC%E8%A9%A6?x=1');
});
test('SSE uses the same URL policy and creates only one source',()=>{
 const original=globalThis.EventSource,urls:string[]=[];
 try{
  globalThis.EventSource=class{constructor(url:string){urls.push(url);}} as unknown as typeof EventSource;
  openBackendEvents('/broker/chart-stream?interval=5m');assert.deepEqual(urls,['/api/broker/chart-stream?interval=5m']);
 }finally{globalThis.EventSource=original;}
});
