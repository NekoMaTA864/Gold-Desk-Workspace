import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import TeamVerification from '../src/TeamVerification';
test('teammates can inspect all 30 sentences and see test limits inside the site',()=>{
 const html=renderToStaticMarkup(createElement(TeamVerification));
 for(const prefix of ['P','R','F'])for(let i=1;i<=10;i++)assert.ok(html.includes(`${prefix}${String(i).padStart(2,'0')} ·`));
 for(const text of ['沒有呼叫券商或 LLM','並非 30 句皆逐句以瀏覽器操作','實體手機鍵盤','不是即時監控','待共同驗收'])assert.ok(html.includes(text),text);
});
