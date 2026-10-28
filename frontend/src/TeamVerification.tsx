import cases from '../../docs/interaction-cases-30.json';

export default function TeamVerification(){
 return <details className="team-verification"><summary>組員查看：30 句測試與操作驗收</summary>
  <p className="fine">本輪驗證紀錄 · 2026-10-28。這是開發驗收摘要，不是即時監控或 AI 準確率。</p>
  <ul><li>178 項前端測試、TypeScript、一般與 Pages 建置通過。</li><li>下方 30 句均經程式檢查：公開模擬 10 句、提醒設定 10 句、正式草稿解析 10 句。</li><li>390px 瀏覽器已走完草稿、取消、提醒、模擬成交、平倉、紀錄及五步教學；檢查點無水平溢出。</li></ul>
  <p>測試包含「不自動成交、不猜缺少欄位、設定須確認、假設不改草稿」。正式解析使用既有程式函式，沒有呼叫券商或 LLM；並非 30 句皆逐句以瀏覽器操作。</p>
  {([['pages','公開模擬下單'],['rules','提醒設定'],['formal','正式草稿解析']] as const).map(([target,label])=><details key={target}><summary>{label} · 10 句</summary><ol>{cases.filter(c=>c.target===target).map(c=><li key={c.id}><strong>{c.id} · {c.text}</strong><p>{c.note}</p></li>)}</ol></details>)}
  <details><summary>目前可展示與待接入項目</summary><p>已接入：固定快照波動參考、五區核對、提醒設定入口、共用服務錯誤處理及教學。公開 Pages 仍是模擬展示。</p><p>待共同驗收：正式登入與角色、跨裝置同步、個人規則後端、cTrader 授權及真實委託回報、遠端服務。實體手機鍵盤與外部模型回答品質尚未驗證。</p></details>
 </details>;
}

