# 2026-10-24 整合交接

> 這是整合當日的紀錄。文中 `site/` 的保留與回復步驟描述當時狀態；舊來源已於 2026-10-26 從現行追蹤樹移出，可由 [清理前提交](https://github.com/NekoMaTA864/Gold-Desk-Workspace/tree/7c1c71931b38d7b443d42f3071c273e3bd429678/site) 取回。目前部署仍以 `frontend/` 為準。

## 來源與變更

從 kuan35/Gold-Trading-Project 的 eb047caaad2bbd6f544364293c69e17da9dc7421 匯入追蹤的產品程式、API 契約、測試與交接文件。原 site/ 保留，Pages 改由 frontend/ 建置，base 改為 /Gold-Desk-Workspace/。

從 site/ 保留 EntryGate、demoAuth、Education 的入口／教學；IntegrationShell 在 pages 模式提供入口與來源說明，返回入口不卸載工作台。帳號仍是記憶體展示，不能當登入保護。App 採延遲載入。

IntegratedReview 沿用五區核對方式，改讀團隊 Draft、RuleCheck、Retrieval，直接呈現程式結果。RiskReview 也供 ConversationOrderReview 使用。原有草稿版本、冪等 key、到期、確認／取消／UNKNOWN 邏輯保持；沒有修改 context_contract_v1、API 或金額計算。

公開三份 data 由 scripts/fetch_public_data.py 依固定 commit 與 SHA-256 取得；manifest 在 scripts/public-data-manifest.json。資料已由上游授權公開，並非將私人 ZIP 新增公開。下載失敗或 hash 不符會阻止 build。private/、env、帳戶與 SQLite 日誌不進 Git 或 Pages artifact。

## 本輪驗證

- 前端 npm test：103 passed。新增兩項測試驗缺值風險、警示、證據與不修改草稿。
- npm run build、npm run build:pages 均成功。
- 後端 python -B -X utf8 -m pytest -q backend/tests research/test_context_similarity_ab.py research/test_assistant_case_acceptance.py：463 passed，一項 Starlette/httpx 棄用警告。
- 瀏覽器：入口、合成行情＋公開歷史案例、五區核對、人工確認本機模擬成交與持倉／損益更新。
- 私人資料此前已驗 7 檔 SHA-256、loader READY、10887 profiles、ContextIndex 6542；本輪僅在本機放入受忽略 private/，不發布。

測試使用假串流或本機模擬。無 cTrader 真送單、平倉或外部 LLM 呼叫。GitHub Actions 與線上部署是否成功以 PR／main commit 的 workflow 結果為準。

## 後續與回復

公開展示採 path_indicator_pattern_v1；完整後端沿用 context_contract_v1，不混稱相同能力。私人包沒有 bars.json／audit.json，案例就緒不表示回放與稽核來源是真實。

本輪部署範圍是 GitHub Pages。完整雲端站仍需認證、帳戶／資源隔離、Secrets、持久日誌與單 owner 常駐連線；不要只移除 loopback 限制就公開。依 docs/team_handoff_20261023/DEPLOYMENT.md 繼續。

回復可 Git revert 整合提交，Pages workflow 恢復由 site/ 建置。私人資料和憑證不受程式版本回復控制。原站基準 9fecc6eb53a8f0a687c7db7e36576120ed32284c。
