import assert from 'node:assert/strict';
import test from 'node:test';
import {defaultRuleConfig, evaluateRules, getEvidence} from '../src/DecisionSupport';
import type {BarsResponse, Retrieval, State} from '../src/types';

const bars:BarsResponse={interval:'5m',source:'synthetic_demo',markers:[],bars:[
  {time:1,open:99,high:102,low:98,close:101,volume:1},
  {time:2,open:101,high:103,low:100,close:102,volume:1},
  {time:3,open:102,high:103,low:99,close:100,volume:1},
]};
const state={quote:{ask:'105.00',bid:'104.70'},market:{ma20:'100.00'}} as State;

test('personal reminders use current draft and bar inputs',()=>{
  const rules={...defaultRuleConfig,maEnabled:true,candleEnabled:true};
  const result=evaluateRules(rules,state,bars,'BUY','0.40','5m');
  assert.deepEqual(result.map(item=>item.state),['triggered','triggered','triggered']);
  assert.match(result[2].detail,/2 根陽線/);
});

test('missing market values are unknown rather than untriggered',()=>{
  const rules={...defaultRuleConfig,maEnabled:true,candleEnabled:true};
  const result=evaluateRules(rules,null,{...bars,bars:[]},'BUY','0.10','5m');
  assert.deepEqual(result.map(item=>item.state),['clear','unknown','unknown']);
});

test('retrieval failure differs from an empty match pool',()=>{
  const empty={total:0,cases:[]} as Retrieval;
  assert.equal(getEvidence(null,'error').label,'暫不可用');
  assert.equal(getEvidence(empty,'ready').label,'資料不足');
  assert.equal(getEvidence({...empty,total:8},'ready').label,'有限參考');
});
