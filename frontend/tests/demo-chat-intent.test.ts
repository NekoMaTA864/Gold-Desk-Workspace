import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DemoEngine} from '../src/demo';
import {parseRuleMessage} from '../src/personalRules';

test('negative, malformed, conflicting and conditional inputs never become positive market drafts',()=>{
 for(const text of ['買進-0.1手','買進- 0.1手','買進1e3手','買進1,001手','買進0.1.2手','買進0手','買進0.1手或賣出0.2手','買進0.1手和0.2手','如果改成賣出0.2手呢？','不要買進0.1手','買進0.1手限價2900','買進0.1手停損20點','買進0.1手停損2910停損2920','分析買進0.1手的風險','買進0.1手SL2910']){
  const e=new DemoEngine();assert.equal(e.chat(text,'BUY').draft,null,text);assert.equal(e.state().positions.length,0);assert.equal(e.drafts.size,0,text);
 }
});
test('missing fields ask specifically; editing does not borrow the selected direction',()=>{
 const e=new DemoEngine();assert.match(e.chat('我想買進黃金').message,/還需要多少手/);
 assert.match(e.chat('0.1手','BUY').message,/還缺買進或賣出方向/);
 assert.equal(e.chat('改成0.2手','BUY').draft,null);
});
test('hypothetical and negative trade sentences do not route to reminder settings',()=>{
 for(const text of ['如果改成賣出0.2手呢？','不要買進0.1手'])assert.equal(parseRuleMessage(text,[]),null);
 assert.ok(parseRuleMessage('單筆超過0.1手提醒我',[])?.proposal);
 assert.equal(parseRuleMessage('假設買進0.2手提醒我',[])?.proposal,undefined);
});
test('explicit side, lot and protection still create an unexecuted draft',()=>{
 const e=new DemoEngine(),r=e.chat('買進黃金0.10手停損2910停利2950');
 assert.equal(r.draft?.side,'BUY');assert.equal(r.draft?.lot,'0.1');assert.equal(r.draft?.sl,'2910');assert.equal(r.draft?.tp,'2950');
 assert.equal(e.state().positions.length,0);assert.equal(e.state().orders.length,0);
});
test('basic explanations and account questions disclose simulation and do not create drafts',()=>{
 const e=new DemoEngine();assert.match(e.chat('手數是什麼').message,/交易數量/);assert.match(e.chat('目前有多少持倉').message,/0 筆持倉/);
 assert.match(e.chat('你覺得黃金會漲嗎').message,/未連接 Groq/);
});
