# Gold Desk 公開 Pages 現況與接手指南

更新：2026-10-25。請先看[公開站](https://nekomata864.github.io/Gold-Desk-Workspace/)，再讀這份文件；API 細節以根目錄 `API_CONTRACT.md` 為準。此文件描述已部署到 `NekoMaTA864/Gold-Desk-Workspace` 的公開展示，不把本機原型或 `kuan35/Gold-Trading-Project` 的功能視為已上線。

## 一、現在公開站能做什麼

| 區域 | Pages 上實際可用 | 必須說清楚的限制 |
| --- | --- | --- |
| 入口 | 訪客可直接體驗；註冊／登入可用測試資料走展示流程 | 展示帳號與密碼只在此頁記憶體，重新整理清除；沒有後端驗證、角色或個人資料隔離，不要輸入真密碼 |
| 交易對話 | 本地規則助手整理想法；可看風險、提醒、案例入口與模擬持倉數；草稿需檢查及使用者確認 | 預設沒有 Groq；不讀 cTrader 即時行情；不是自動交易助手 |
| 歷史回放 | 合成黃金 K 線、時間推進、模擬帳戶／持倉／委託與紀錄；可查看已授權公開的歷史案例參考資料 | 價格與成交是瀏覽器模擬；公開舊索引不等於本機 `context_contract_v1` 私有側檔；歷史結果不代表新單勝率 |
| 即時看盤 | TradingView 的 OANDA:XAUUSD 外部參考圖；可回對話或進回放 | 圖表資料不會自動進入案例排名、對話分析或模擬成交；不是 cTrader 帳戶報價 |
| 服務狀態 | 顯示訪客／展示身分、程式解讀、外部報價及公開案例的可用情況 | 底部「後續預留」是規劃，不是已完成的個人帳號、AI 金鑰或 cTrader 連接 |

公開畫面已在桌面瀏覽器查看入口後的三頁及服務狀態。三頁使用同一左側導覽、頁首與來源提示，沒有阻止展示的排版問題。外部價格與合成回放價格可能相差很大，故將橫幅直接標為「外部參考價」及「不參與回放成交」。展示時應口頭指出兩者分開。

## 二、哪一份程式會被發布

- 此倉庫的 `frontend/` 是現行前端；`frontend/src/main.tsx` 掛載 `IntegrationShell.tsx`。舊 `site/` 已從目前追蹤樹移出，來源可由 [清理前提交](https://github.com/NekoMaTA864/Gold-Desk-Workspace/tree/7c1c71931b38d7b443d42f3071c273e3bd429678/site) 取回；它**不是**現行 Pages 建置來源。
- `.github/workflows/pages.yml` 在 `main` 推送後，下載並核對 `scripts/public-data-manifest.json` 鎖定的三份已公開資料，跑前端測試，執行 `npm run build:pages`，發布 `frontend/dist-pages/`。PR 另由 `.github/workflows/verify.yml` 跑前後端測試及兩種前端建置。
- `build:pages` 使用瀏覽器展示引擎；一般 `npm run build` 搭配本機 FastAPI。兩種建置的能力不同。GitHub Pages 不執行 Python，也沒有本機 `private/`、券商憑證或持久帳戶資料。
- 團隊參考實作在 `kuan35/Gold-Trading-Project`；本站目前不是自動追蹤該倉庫新提交。移植組員改動時，先核對共同 commit、來源與授權，再走此倉庫 PR。

## 三、乾淨 clone 的重現與驗證

需 Node 22+、Python 3.11+。在此倉庫根目錄執行：

```powershell
python scripts/fetch_public_data.py
cd frontend
npm ci
$tests = @(Get-ChildItem tests -Filter '*.test.ts' | ForEach-Object { $_.FullName })
& .\node_modules\.bin\tsx.cmd --test $tests
npm run build:pages
npm run preview -- --mode pages --port 4173
```

Windows PowerShell 的 `npm test` 未必展開 `tests/*.test.ts`，上述顯式展開命令用於本機；GitHub Actions 的 Linux `npm test` 已驗證可用。預覽網址為 `http://127.0.0.1:4173/Gold-Desk-Workspace/`。完整本機後端啟動、私有資料校驗與部署前置條件見 [部署交接](team_handoff_20261023/DEPLOYMENT.md)。沒有私有資料或憑證時，只能驗證示範／未連線狀態；不可把測試通過說成真 DEMO 已連接。

## 四、前端接下來負責什麼

1. **先維持公開展示穩定。** 驗入口、三頁跳轉、對話、草稿核對、回放持倉與空資料狀態；保留來源標籤與人工確認。可用假後端驗網路中斷、過期、拒絕、部分成交和 `UNKNOWN`，不得用假成功補畫面。
2. **整理 API 接點。** `frontend/src/api.ts` 不是唯一請求入口；`LiveAssistant.tsx`、`ConversationWorkspace.tsx`、`useLiveCandles.ts` 等也直接使用 `fetch`／`EventSource`。接雲端後端前，逐一盤點路徑、登入憑證、取消、重試與錯誤提示。不要只改一個 base URL 就宣稱接線完成。
3. **等 A／C 組確認契約後接正式服務。** 需要測試 URL、登入／登出／會話逾期與角色、帳戶歸屬、Cookie 或 token 策略、行情／持倉／委託狀態格式及來源時間。若 Pages 跨站呼叫 API，還需明確的 CORS 與事件串流認證方案；同源部署則沿用 `/api` 路徑。後端必須逐資源授權、保存憑證與委託狀態；前端畫面鎖不能替代權限。
4. **以實際後端狀態驗收。** 未登入不能看到他人帳戶；斷線或舊報價不能顯示為即時；送單結果 `UNKNOWN` 不能自行重送；真正 DEMO 最終確認與平倉由帳戶擁有者執行。詳細分工見 [前端交接](team_handoff_20261023/FRONTEND.md)與[團隊接入位置](team-integration-map-20261025.md)。

目前不建議再重做大版面。公開站最值得後續改善的兩點是：① 在窄桌面再驗外部價格橫幅及來源文字是否完整顯示；② 次要頁面目前有重複一級標題，且三頁切換只存在 React 記憶體，重新整理後不能直接回到指定頁，適合在下一輪可及性與可分享連結整理時處理。這些不是目前發布的阻礙。

## 五、資料與安全界線

`private/`、原始對帳單、帳戶資料、已填寫的 `.env`、憑證、SQLite 提交日誌與測試收據不進 Git。`GoldDesk_PRIVATE_CASE_DATA_20261023.zip` 只透過受控管道交給有權限的組員；它不放 `frontend/public/` 或 Pages。公開後端前，先完成身分驗證、使用者／帳戶隔離、持久儲存、密鑰管理與重啟驗收。保持草稿 → 人工確認 → 後端重驗 → 查回報的順序；LLM 不能確認或送單。

## 六、交付給下一位組員時請附上

- 改動分支／PR、共同 commit、實際 Pages 或測試站 URL，及使用的是 `build:pages` 還是一般 build。
- API 契約變更、測試後端 URL、登入方式、CORS／事件串流設定與可公開的錯誤狀態範例。
- 前端／後端測試指令與結果、瀏覽器操作路徑、已知限制及回復方式。
- 資料來源、私有側檔校驗結果、是否真的連到 cTrader DEMO；不可只用網頁成功載入作為連線證據。

此文件是入口摘要；歷史逐次改動見根目錄 `HANDOFF.md`，原任務背景見 `TEAM_HANDOFF.md`，API 欄位仍以 `API_CONTRACT.md` 為準。
