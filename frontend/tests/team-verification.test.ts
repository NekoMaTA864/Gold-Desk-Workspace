import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import TeamVerification from '../src/TeamVerification';
test('guide shows only the three sentence groups and expected behavior',()=>{
 const html=renderToStaticMarkup(createElement(TeamVerification));
 for(const prefix of ['P','R','F'])for(let i=1;i<=10;i++)assert.ok(html.includes(`${prefix}${String(i).padStart(2,'0')} ·`));
 for(const text of ['30句測試與操作驗收','公開模擬下單','提醒設定','正式草稿解析','只建立待確認草稿'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/組員查看|本輪驗證紀錄|178 項|390px|目前可展示與待接入項目|待共同驗收/);
});
