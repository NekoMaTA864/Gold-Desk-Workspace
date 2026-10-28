import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import BrokerReviewContents,{matchingReviewReply} from '../src/BrokerReviewContents';
import {RulesReview} from '../src/IntegratedReview';
import {reviewFixture} from './fixtures/broker-review';

const render=(draft=reviewFixture())=>renderToStaticMarkup(createElement(BrokerReviewContents,{draft}));
test('broker review shows five sections from the checked snapshot without altering draft or exposing execution',()=>{
 const draft=reviewFixture(),before=JSON.stringify(draft),html=render(draft);
 for(const s of ['01 部位','02 個人','03 相似','04 證據','05 檢查','本次無符合案例','尚待後端接入','資料不足','4000','固定快照'])assert.ok(html.includes(s),s);
 assert.doesNotMatch(html,/確認送出 DEMO|尚未設定個人提醒/);
 assert.equal(JSON.stringify(draft),before);
});
test('mismatched or missing reply never borrows unrelated case and explanation text',()=>{
 for(const change of [{snapshot_id:'another'},{as_of_utc:'2026-10-28T06:01:00Z'},{analysis_mode:'live'}]){
  const d=reviewFixture();Object.assign(d.analysis_reply!,change);
  assert.equal(matchingReviewReply(d),null);
  const html=render(d);assert.match(html,/快照缺失或不一致/);assert.doesNotMatch(html,/不放寬規則/);
 }
 const d=reviewFixture();d.analysis_reply=null;assert.doesNotThrow(()=>render(d));
});
test('case side and snapshot must match even when the explanation belongs to the draft',()=>{
 for(const change of [{side:'SELL'},{snapshot_id:'other'}]){
  const d=reviewFixture();Object.assign(d.analysis_reply!.case_comparison!,change);
  assert.match(render(d),/尚無可核對的案例快照/);
 }
});
test('missing, empty, clear and unknown rule results remain distinct',()=>{
 const renderRules=(check?:Parameters<typeof RulesReview>[0]['check'])=>renderToStaticMarkup(createElement(RulesReview,{check}));
 assert.match(renderRules(),/未提供個人提醒檢查結果/);
 assert.match(renderRules({source:'program',reminder_only:true,results:[]}),/沒有參與檢查/);
 for(const status of ['clear','unknown'] as const){
  const html=renderRules({source:'program',reminder_only:true,results:[{id:'test',text:'手數提醒',status,actual:null,reason:'原快照結果'}]});
  assert.match(html,status==='clear'?/未觸發/:/無法評估/);
 }
});
test('missing evidence does not become a positive sufficiency claim',()=>{
 const d=reviewFixture();delete d.retrieval.sufficiency;
 assert.match(render(d),/尚未提供證據充分性等級/);
});
test('matched case details preserve similarities and differences, without upgrading sufficiency',()=>{
 const d=reviewFixture(),c=d.analysis_reply!.case_comparison!;
 c.cases=[{ref:'案例甲',event:'區間內',tail_direction:'上行',similarities:['同方向'],differences:['波動較大'],metrics:[]}];
 c.counts={eligible:12,passed:1,displayed:1};
 const html=render(d);assert.match(html,/案例甲/);assert.match(html,/相同條件：同方向/);assert.match(html,/不同條件：波動較大/);assert.match(html,/資料不足/);
});
