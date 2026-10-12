import assert from 'node:assert/strict';
import test from 'node:test';
import {clampChartHeight,clampSplit,readLayoutSelection} from '../src/LayoutControls';

test('panel dimensions stay within usable desktop bounds',()=>{
  assert.equal(clampSplit(12),40);
  assert.equal(clampSplit(90),74);
  assert.equal(clampChartHeight(100),280);
  assert.equal(clampChartHeight(900),640);
});

test('comparison links select a layout without losing saved dimensions',()=>{
  const oldWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  const oldStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  try {
    Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{search:'?layout=resize&preset=positions-right'}}});
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>JSON.stringify({mode:'preset',preset:'standard',split:61,height:480})}});
    assert.deepEqual(readLayoutSelection(),{mode:'resize',preset:'positions-right',split:61,height:480});
  } finally {
    if(oldWindow)Object.defineProperty(globalThis,'window',oldWindow);else delete (globalThis as {window?:unknown}).window;
    if(oldStorage)Object.defineProperty(globalThis,'localStorage',oldStorage);else delete (globalThis as {localStorage?:unknown}).localStorage;
  }
});
