import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resizePanelPair,validPanelWeights} from '../src/boundedLayout';
const start={context:250,chat:500,order:300};
test('moving either gutter changes only its adjacent pair and preserves total width',()=>{const left=resizePanelPair(start,'context','chat',50);assert.deepEqual(left,{context:300,chat:450,order:300});const right=resizePanelPair(start,'chat','order',-40);assert.deepEqual(right,{context:250,chat:460,order:340});assert.deepEqual(start,{context:250,chat:500,order:300});});
test('extreme drag distances stop at minimum readable widths without expanding the desk',()=>{assert.deepEqual(resizePanelPair(start,'context','chat',1e9),{context:450,chat:300,order:300});assert.deepEqual(resizePanelPair(start,'chat','order',-1e9),{context:250,chat:300,order:500});assert.deepEqual(resizePanelPair(start,'order','chat',-1e9),{context:250,chat:570,order:230});assert.deepEqual(resizePanelPair(start,'context','chat',NaN),start);});
test('saved proportions reject corrupt, zero, missing, or infinite values',()=>{assert.ok(validPanelWeights(start));for(const raw of [null,{},[],{...start,chat:Infinity},{...start,order:0},{...start,context:'300'}])assert.equal(validPanelWeights(raw),false);});
