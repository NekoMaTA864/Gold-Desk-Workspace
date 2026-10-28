import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {snapshot} from '../src/rangeMath';
import {snapshotUsableAt} from '../src/volatilityContext';
import {withVolatility} from '../src/groqFacts';
import VolatilityRange from '../src/VolatilityRange';
import type {Draft} from '../src/types';

const draft={side:'BUY',lot:'0.10',price:'4000',sl:'3980',tp:null} as Draft;
test('future or undated snapshots do not enter the decision facts',()=>{
 for(const clock of ['2025-03-04T06:00:00Z','2026-10-27T19:35:00Z','invalid',undefined]){
  assert.equal(snapshotUsableAt(snapshot,clock),false);
  const base={clock_utc:clock};assert.deepEqual(withVolatility(base,draft),base);
 }
 assert.equal(snapshotUsableAt(snapshot,'2026-10-28T00:00:00Z'),true);
 assert.equal(snapshotUsableAt(snapshot,Date.parse('2026-10-28T00:00:00Z')/1000),true);
});
test('replay reference clearly discloses its separate date and collapses the full table',()=>{
 const out=renderToStaticMarkup(createElement(VolatilityRange,{draft,asOf:'2025-03-04T06:00:00Z'}));
 assert.match(out,/獨立資料示範/);assert.match(out,/2026-09-30 至 2026-10-27/);
 assert.match(out,/<details class="vol-details"><summary>/);
 assert.doesNotMatch(out,/最多可以下/);
 assert.match(out,/情境試算預算/);
});
test('multiple reference cards do not share an input id',()=>{
 const out=renderToStaticMarkup(createElement('div',null,createElement(VolatilityRange,{draft}),createElement(VolatilityRange,{draft})));
 const ids=[...out.matchAll(/<input id="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,2);assert.equal(new Set(ids).size,2);
});
