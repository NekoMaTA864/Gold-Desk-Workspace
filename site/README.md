# Gold Desk：基於團隊網站的 E 前端改版

此資料夾以 [kuan35/Gold-Trading-Project](https://github.com/kuan35/Gold-Trading-Project) 的 `frontend/` 為基底，取用版本 `ba68c31e785f54e81b79e0039aa1335079a5ec12`（2026-10-01）。原有回放圖表、合成案例、草稿確認、對話和 TradingView 外部圖表均保留；本資料夾獨立於團隊 repo，供 E 先展示並蒐集意見。

## 本次改動

- `src/design-refresh.css`：套用深藍、金色與卡片式工作台風格。
- `src/DecisionSupport.tsx`：把既有案例檢索接到歷史 Agent 卡片；用「有限參考／資料不足／暫不可用」呈現證據狀態；加入三項可勾選的本機提醒。
- `src/App.tsx`：在回放工作台與原有草稿確認視窗顯示新區塊；確認視窗分為部位風險、個人規則、歷史案例、證據充分性、條件式說明五區。
- `tests/decision-support.test.ts`：檢查提醒計算、缺值與案例服務失敗的狀態區別。
- `src/LayoutControls.tsx`、`src/layout-experiments.css`：同一頁提供三種固定排列及自訂大小（拖拉）模式；持倉面板與相鄰欄位自適應，空持倉時顯示帳戶摘要與下單入口，提醒條件在右側第三個分頁；`tests/layout-controls.test.ts` 檢查網址參數與大小邊界。

提醒條件儲存在此瀏覽器的 `localStorage`，還沒有多裝置同步。MA20 使用現有回放狀態的 5 分鐘均線；K 棒條件使用目前選擇週期的已收盤圖表。歷史 Agent 目前只能比較原 repo 已實作的操作條件，沒有盤面相似度；因此有案例時也只顯示「有限參考」。沒有將案例比例當作本次交易勝率。

## 本機預覽

在 `site/` 內安裝依賴並建立 Pages 展示版：

```powershell
npm ci
npm run build:pages
npm run preview -- --mode pages --port 4173
```

開啟 `http://127.0.0.1:4173/Gold-Desk-Workspace/`。Pages 模式使用瀏覽器內合成資料，不需要後端、金鑰或券商帳戶。若要測試本機後端，需按團隊原 repo 的 README 啟動後端，再以一般 `pnpm run dev` 啟動前端。

版型切換會更新 `?layout=preset|resize&preset=standard|chart-focus|positions-right`。[GitHub Pages 展示網站](https://nekomata864.github.io/Gold-Desk-Workspace/) 可分享不同比較入口；範例與組員試用問題見 [版型比較](../docs/layout-comparison.md)。自訂大小模式支援滑鼠／觸控及方向鍵，大小會保存在此瀏覽器，並可按「重設大小」。

## 公開展示

此個人 repo 使用 GitHub Actions 將 `site/` 建置到 GitHub Pages；推送 `main` 後會重新發布。Pages 網站可由任何知道網址的人瀏覽，repository 本身維持私人。展示版採合成行情與瀏覽器內回放，沒有真實券商連線；團隊正式網站並未改動。
