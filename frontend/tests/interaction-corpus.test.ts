import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DemoEngine} from '../src/demo';
import {parseRuleMessage,type PersonalRule} from '../src/personalRules';

const cases=JSON.parse(readFileSync(new URL('../../docs/interaction-cases-30.json',import.meta.url),'utf8')) as {id:string;target:string;text:string;reject?:boolean;expected:Record<string,unknown>|null}[];
const seed:PersonalRule={id:'seed',kind:'order_lot',value:'0.1',op:'gt',enabled:true,side:'ANY'};
test('interaction corpus has exactly 30 unique cases across separate product paths',()=>{
 assert.equal(cases.length,30);assert.equal(new Set(cases.map(c=>c.id)).size,30);
 for(const target of ['pages','rules','formal'])assert.equal(cases.filter(c=>c.target===target).length,10);
});
for(const c of cases.filter(c=>c.target==='pages'))test(`${c.id} Pages: ${c.text}`,()=>{
 const engine=new DemoEngine();
 if(c.reject)assert.throws(()=>engine.chat(c.text));
 else{const result=engine.chat(c.text);if(c.expected){assert.ok(result.draft);for(const [k,v] of Object.entries(c.expected))assert.equal((result.draft as unknown as Record<string,unknown>)[k],v);}else assert.equal(result.draft,null);}
 assert.equal(engine.state().positions.length,0);assert.equal(engine.state().orders.length,0);
});
for(const c of cases.filter(c=>c.target==='rules'))test(`${c.id} reminder: ${c.text}`,()=>{
 const rules=[structuredClone(seed)],before=JSON.stringify(rules),r=parseRuleMessage(c.text,rules);
 assert.ok(r);
 if(c.expected){assert.ok(r.proposal);for(const [k,v] of Object.entries(c.expected))assert.equal((r.proposal.rule as unknown as Record<string,unknown>)[k],v);}else assert.equal(r.proposal,undefined);
 assert.equal(JSON.stringify(rules),before);
});
