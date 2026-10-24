import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import IntegratedReview,{RiskReview} from '../src/IntegratedReview';
import type {Draft} from '../src/types';

const draft={side:'BUY',lot:'0.10',price:'4000',sl:'3900',tp:null,risk:{before_lot:'0.20',after_lot:'0.30',average_entry:'3999',stop_loss_usd:null,reward_risk:null,scenarios:[],warnings:['來源缺少商品規格']},personal_rules:{source:'program',reminder_only:true,results:[{id:'sl',text:'檢查停損',status:'unknown',actual:null,reason:'資料不足'}]},retrieval:{cases:[],total:0,limitations:['原始時鐘尚未核實'],sufficiency:{label:'本次無符合案例',reasons:['條件未通過']}}} as unknown as Draft;
test('review distinguishes unavailable risk from missing stop and keeps warnings visible',()=>{
 const html=renderToStaticMarkup(createElement(RiskReview,{draft}));
 assert.match(html,/無法計算/);assert.doesNotMatch(html,/未設定停損/);assert.match(html,/來源缺少商品規格/);
 const withoutStop=renderToStaticMarkup(createElement(RiskReview,{draft:{...draft,sl:null}}));
 assert.match(withoutStop,/未設定停損/);
});
test('five-part presentation preserves program results without upgrading evidence or mutating draft',()=>{
 const original=JSON.stringify(draft);
 const html=renderToStaticMarkup(createElement(IntegratedReview,{draft,source:'合成行情',cases:'零符合',explanation:'原快照說明'}));
 for(const text of ['01 部位','02 個人','03 相似','04 證據','05 檢查','無法評估','本次無符合案例','原快照說明'])assert.ok(html.includes(text));
 assert.equal(JSON.stringify(draft),original);assert.doesNotMatch(html,/onClick|確認送出 DEMO/);
});
