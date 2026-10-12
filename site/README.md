# Gold Desk：基於團隊網站的 E 前端改版

此資料夾以 [kuan35/Gold-Trading-Project](https://github.com/kuan35/Gold-Trading-Project) 的 `frontend/` 為基底，取用版本 `ba68c31e785f54e81b79e0039aa1335079a5ec12`（2026-10-01）。原有回放圖表、合成案例、草稿確認、對話和 TradingView 外部圖表均保留；本資料夾獨立於團隊 repo，供 E 先展示並蒐集意見。

## 本次改動

- `src/design-refresh.css`：套用深藍、金色與卡片式工作台風格。
- `src/DecisionSupport.tsx`：把既有案例檢索接到歷史 Agent 卡片；用「有限參考／資料不足／暫不可用」呈現證據狀態；加入三項可勾選的本機提醒。
- `src/App.tsx`：在回放工作台與原有草稿確認視窗顯示新區塊；確認視窗分為部位風險、個人規則、歷史案例、證據充分性、條件式說明五區。
- `tests/decision-support.test.ts`：檢查提醒計算、缺值與案例服務失敗的狀態區別。

提醒條件儲存在此瀏覽器的 `localStorage`，還沒有多裝置同步。MA20 使用現有回放狀態的 5 分鐘均線；K 棒條件使用目前選擇週期的已收盤圖表。歷史 Agent 目前只能比較原 repo 已實作的操作條件，沒有盤面相似度；因此有案例時也只顯示「有限參考」。沒有將案例比例當作本次交易勝率。

## 本機預覽

在 `site/` 內安裝依賴並建立 Pages 展示版：

```powershell
npm ci
npm run build:pages
npm run preview -- --mode pages --port 4173
```

開啟 `http://127.0.0.1:4173/Gold-Desk-Workspace/`。Pages 模式使用瀏覽器內合成資料，不需要後端、金鑰或券商帳戶。若要測試本機後端，需按團隊原 repo 的 README 啟動後端，再以一般 `pnpm run dev` 啟動前端。

## 公開前

目前尚未開啟 GitHub Pages，也未改動團隊正式網站。要讓組員公開測試時，先確認要以此個人 repo 的 Pages 發布，或交回團隊 repo 整合；發布路徑已設為 `/Gold-Desk-Workspace/`。發布前也應確認團隊原始碼與展示資料可公開，以及首頁明確標示合成行情、無券商連線與非投資建議。
