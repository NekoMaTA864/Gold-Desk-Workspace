const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const scenarios = {
  normal: { caseCount: 18, usableCount: 7, status: '可參考', reason: '7 筆案例在方向、波動區間與均線位置上接近。仍需逐筆查看差異；歷史結果不代表本次結果。', quote: '可參考', broker: '未連接' },
  noCases: { caseCount: 0, usableCount: 0, status: '資料不足', reason: '目前條件下找不到可比較案例。暫時只呈現已知行情與規則提醒，不估計本次交易結果。', quote: '可參考', broker: '未連接' },
  llmFail: { caseCount: 18, usableCount: 7, status: '可參考', reason: '案例檢索與規則計算正常，但自然語言說明服務暫時無法使用。以下改以固定欄位呈現可核對資料。', quote: '可參考', broker: '未連接' },
  stale: { caseCount: 18, usableCount: 7, status: '有限參考', reason: '報價已過期。案例比對仍可閱讀，但不可把過期價格用作新的確認依據。', quote: '已過期', broker: '未連接' },
  offline: { caseCount: 18, usableCount: 7, status: '有限參考', reason: '券商連線中斷。歷史資料可閱讀，但委託狀態無法確認。', quote: '可參考', broker: '已斷線' },
};
const state = { scenario: 'normal', mode: 'replay', side: 'buy' };
const fakeCases = [
  { id: 'H-204', detail: '買入 · 價格高於 MA20 · 相近波動', similarities: '同商品、同方向、價格同在 MA20 上方', differences: '當時波動略低，預計手數不同', outcome: '後續 1 小時 +0.6%', positive: true },
  { id: 'H-119', detail: '買入 · 價格高於 MA20 · 波動較大', similarities: '同商品、同方向、價格同在 MA20 上方', differences: '當時波動較大，最近 K 棒形態不同', outcome: '後續 1 小時 −0.8%', positive: false },
];

function drawChart() {
  const svg = $('#mock-chart');
  const prices = [113,119,108,104,110,94,91,98,86,75,80,73,68,77,86,78,69,59,64,50,46,55,42,38,46,35,41,28,33,29,20,26,19,23,14,22,11,17];
  const grid = [35,85,135,185].map(y => `<line x1="0" y1="${y}" x2="760" y2="${y}" stroke="#254155" stroke-width="1" stroke-dasharray="4 5"/>`).join('');
  const candles = prices.map((p,i) => {
    const x=19+i*19.5, next=prices[i+1]??p-3, up=next<p, color=up?'#5bcca0':'#e1787d';
    const top=Math.min(p,next)+43, height=Math.max(5,Math.abs(next-p));
    return `<line x1="${x}" y1="${top-12}" x2="${x}" y2="${top+height+11}" stroke="${color}" stroke-width="2"/><rect x="${x-4}" y="${top}" width="8" height="${height}" fill="${color}" rx="1"/>`;
  }).join('');
  const ma = prices.map((p,i)=>`${19+i*19.5},${p+60}`).join(' ');
  svg.innerHTML = `${grid}<polyline points="${ma}" fill="none" stroke="#e6b86c" stroke-width="2" opacity=".85"/>${candles}<line x1="0" y1="59" x2="760" y2="59" stroke="#648ba2" stroke-dasharray="5 4" opacity=".7"/>`;
}

function ruleResult() {
  const lots = Number($('#lots').value);
  const limit = Number($('#size-limit').value);
  const rules = [
    { id: 'rule-size', state: 'rule-size-state', hit: Number.isFinite(lots) && Number.isFinite(limit) && lots > limit, name: '手數上限' },
    { id: 'rule-ma', state: 'rule-ma-state', hit: true, name: '均線位置' },
    { id: 'rule-candle', state: 'rule-candle-state', hit: true, name: 'K 棒形態' },
  ];
  const hits = rules.filter(rule => $('#' + rule.id).checked && rule.hit);
  rules.forEach(rule => {
    const selected = $('#' + rule.id).checked;
    const el = $('#' + rule.state);
    el.textContent = selected ? (rule.hit ? '已觸發' : '未觸發') : '未啟用';
    el.className = `rule-state ${selected && rule.hit ? 'hit' : ''}`;
  });
  $('#rules-result').textContent = hits.length ? `目前有 ${hits.length} 項提醒：${hits.map(rule => rule.name).join('、')}。請自行核對條件與資料。` : '目前沒有觸發的提醒。';
  return hits;
}

function update() {
  const data = scenarios[state.scenario];
  const isLive = state.mode === 'live';
  const isBroker = state.mode === 'broker';
  $('#quote-source').textContent = isLive ? 'TradingView 圖表示意' : isBroker ? '券商模擬報價' : '合成回放資料';
  $('#quote-time').textContent = state.scenario === 'stale' ? '展示時間 10:35:02' : '展示時間 10:42:18';
  $('#quote-status').textContent = data.quote;
  $('#quote-status').className = `status ${data.quote === '已過期' ? 'bad' : isLive ? 'warn' : 'good'}`;
  $('#broker-status').textContent = state.scenario === 'offline' ? '已斷線' : isBroker ? '模擬連線' : '未連接';
  $('#broker-status').className = `status ${state.scenario === 'offline' ? 'bad' : isBroker ? 'good' : 'neutral'}`;

  $('#history-content').innerHTML = data.caseCount ? `<p class="case-intro">檢索到 ${data.caseCount} 筆，符合目前比較條件 ${data.usableCount} 筆；點選案例看相似與差異。</p><div class="case-list">${fakeCases.map(c=>`<button type="button" class="case-row" data-case="${c.id}"><strong>${c.id} ↗</strong><b class="${c.positive?'positive':''}">${c.outcome}</b><small>${c.detail}</small></button>`).join('')}</div>` : '<span class="evidence-badge bad">沒有可比案例</span><p>可調整比較條件再查詢；目前不提供案例推論。</p>';
  const badge = data.status === '可參考' ? 'good' : data.status === '有限參考' ? 'warn' : 'bad';
  $('#sufficiency-content').innerHTML = `<span class="evidence-badge ${badge}">${data.status}</span><p>${data.reason}</p><div class="metric-line"><span>可比較案例 / 檢索總數</span><strong>${data.usableCount} / ${data.caseCount}</strong></div>`;
  const hits = ruleResult();
  $('#review-risk').textContent = `${state.side === 'buy' ? '買入' : '賣出'} XAU/USD，預計 ${Number($('#lots').value || 0).toFixed(2)} lots。參考價 2,651.80 為合成資料；實際風險值須由 B 的服務提供。`;
  $('#review-rules').textContent = hits.length ? `觸發 ${hits.length} 項提醒：${hits.map(rule=>rule.name).join('、')}。規則由使用者勾選，僅供提醒。` : '目前沒有觸發的已啟用條件。';
  $('#review-history').textContent = data.caseCount ? `${data.caseCount} 筆檢索結果中有 ${data.usableCount} 筆符合目前比較條件。展示案例 H-204、H-119 結果不同；請查看個別差異。` : '找不到可比較案例，不提供歷史結果推論。';
  $('#review-sufficiency').textContent = `${data.status}。${data.reason}`;
  $('#review-explanation').textContent = state.scenario === 'llmFail' ? '自然語言服務失敗；此段為固定模板。保留風險、規則、案例與證據狀態供人工核對。' : '此原型只展示資訊呈現與例外流程。未提供即時交易建議，亦不會送單。';
  const blocker = state.scenario === 'stale' ? '報價過期：須取得新報價後重新檢查。' : state.scenario === 'offline' ? '券商斷線：須恢復連線並核對委託狀態。' : isLive ? '即時圖表不能作為券商委託報價。' : '展示模式：僅完成畫面檢查。';
  $('#review-blocker').textContent = blocker;
  $('#action-hint').textContent = blocker;
}

$$('[data-scenario]').forEach(button=>button.addEventListener('click',()=>{state.scenario=button.dataset.scenario;$$('[data-scenario]').forEach(x=>x.classList.toggle('active',x===button));update()}));
$$('[data-mode]').forEach(button=>button.addEventListener('click',()=>{state.mode=button.dataset.mode;$$('[data-mode]').forEach(x=>x.classList.toggle('active',x===button));update()}));
$$('[data-side]').forEach(button=>button.addEventListener('click',()=>{state.side=button.dataset.side;$$('[data-side]').forEach(x=>x.classList.toggle('active',x===button));update()}));
$$('.rule-row input').forEach(input=>input.addEventListener('input',update));
$('#lots').addEventListener('input',update);
$('#review-button').addEventListener('click',()=>$('#review-dialog').showModal());
$('#close-dialog').addEventListener('click',()=>$('#review-dialog').close());
$('#dismiss-dialog').addEventListener('click',()=>$('#review-dialog').close());
$('#review-dialog').addEventListener('click',event=>{if(event.target===$('#review-dialog'))$('#review-dialog').close()});
$('#history-content').addEventListener('click', event => {
  const caseButton = event.target.closest('[data-case]');
  if (!caseButton) return;
  const item = fakeCases.find(c => c.id === caseButton.dataset.case);
  if (!item) return;
  $('#case-title').textContent = `案例 ${item.id}`;
  $('#case-detail').innerHTML = `<dl><dt>相似原因</dt><dd>${item.similarities}</dd><dt>主要差異</dt><dd>${item.differences}</dd><dt>觀察窗口與結果</dt><dd>${item.outcome}</dd><dt>資料來源</dt><dd>合成案例；正式版須連回 D 提供的原始案例與版本</dd></dl>`;
  $('#case-dialog').showModal();
});
$('#close-case').addEventListener('click',()=>$('#case-dialog').close());
$('#case-dialog').addEventListener('click',event=>{if(event.target===$('#case-dialog'))$('#case-dialog').close()});
drawChart();update();
