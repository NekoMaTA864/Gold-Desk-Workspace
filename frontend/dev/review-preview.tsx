import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import BrokerReviewContents from '../src/BrokerReviewContents';
import {reviewFixture} from '../tests/fixtures/broker-review';
import '../src/styles.css';
import '../src/integration.css';

function Preview(){
 const [scenario,setScenario]=useState('empty'),draft=reviewFixture();
 if(scenario==='mismatch')draft.analysis_reply!.snapshot_id='wrong';
 if(scenario==='rules')draft.personal_rules={source:'program',reminder_only:true,results:[{id:'lot',text:'單筆超過 0.05 手',status:'triggered',actual:'0.10',reason:'0.10 大於 0.05；合成測試'}]};
 return <main style={{maxWidth:850,margin:'24px auto',padding:'0 16px'}}><h1>五區核對 · 本機驗收</h1><p>合成測試資料，非券商查詢，沒有送單功能。</p><label>測試狀態 <select value={scenario} onChange={e=>setScenario(e.target.value)}><option value="empty">零案例／提醒未接入</option><option value="rules">觸發提醒</option><option value="mismatch">快照不一致</option></select></label><BrokerReviewContents key={scenario} draft={draft}/></main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
