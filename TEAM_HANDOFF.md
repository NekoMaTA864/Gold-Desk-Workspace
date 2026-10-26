# Gold Desk 團隊交接入口

更新：2026-10-26。本文件只提供接手順序與分工入口；實際能力以目前程式、測試與 [公開 Pages 現況](docs/pages-current-handoff-20261025.md) 為準。

## 從哪裡開始

1. 從 [NekoMaTA864/Gold-Desk-Workspace](https://github.com/NekoMaTA864/Gold-Desk-Workspace) 的 `main` 取得同一版本，記下 commit，再依工作範圍開分支與 PR。`kuan35/Gold-Trading-Project` 是參考來源，不是本站自動部署來源。
2. 讀 [AGENTS.md](AGENTS.md)、[API_CONTRACT.md](API_CONTRACT.md)，依角色讀 [前端](docs/team_handoff_20261023/FRONTEND.md)或[後端](docs/team_handoff_20261023/BACKEND.md)任務。[HANDOFF.md](HANDOFF.md) 是按日期累積的變更紀錄，先看最新段落即可。
3. 依 [部署與驗收順序](docs/team_handoff_20261023/DEPLOYMENT.md) 重跑所負責的測試，交付 PR、實際測試結果、預覽網址、契約差異與未完成事項。

## 目前的兩種執行方式

| 方式 | 程式入口 | 已可展示 | 仍缺少 |
| --- | --- | --- | --- |
| GitHub Pages | `frontend/` 的 `build:pages` | 訪客／暫存展示帳號、交易對話、合成歷史回放、外部參考圖與本機模擬委託 | 真實帳號、cTrader DEMO 後端、私人資料與持久帳戶 |
| 本機完整模式 | 一般 `frontend/` build ＋ `backend/` FastAPI | 前後端程式與受限本機流程；可在具備資料與設定時驗證更多功能 | 受保護的多人雲端站尚待認證、授權隔離、持久儲存與部署驗收 |

Pages 部署成功只證明靜態展示可用。外部 TradingView 參考價不進入合成回放成交或相似案例計算。完整模式也不能因程式可啟動就宣稱已連接券商或真實案例資料；請按來源與狀態核對。

舊 `E-前端改善筆記.md` 是 10 月初的規劃稿，不能當作全部已完成的清單。正式登入、受權限保護的帳戶資料、真後端 API／事件串流與異常狀態驗收仍待前後端共同完成；以目前契約和角色文件追蹤。

## 分工與共同邊界

- 前端負責 `frontend/` 的顯示、登入與連線狀態、API／事件串流接線、草稿與人工確認體驗；需要後端契約時先與後端同步。細項見[前端任務](docs/team_handoff_20261023/FRONTEND.md)和[團隊接入位置](docs/team-integration-map-20261025.md)。
- 後端負責 `backend/`、`scripts/`、認證與逐資源授權、券商連線、持久狀態及部署；細項見[後端任務](docs/team_handoff_20261023/BACKEND.md)。相似檢索規則沿用現有 `context_contract_v1`，改規則須先與負責人確認。
- API 欄位與錯誤狀態以 [API_CONTRACT.md](API_CONTRACT.md) 為共同契約。價格、金額、手數維持十進位字串；缺資料標示原因。LLM 只解釋，不確認或送單。真正 DEMO 的最終送單／平倉由帳戶擁有者操作。
- `private/`、帳戶、憑證、填好的 `.env`、原始對帳單、提交日誌與測試收據不進公開 repo。私人案例資料包僅經受控管道提供，須完成完整性校驗；沒有載入時應明示未就緒。

原 2026-10-23 的分工說明仍可從 Git 歷史查閱；其中舊 clone 網址、測試數量與 Pages 畫面描述不應當成現況。
