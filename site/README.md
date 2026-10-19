# Gold Desk：E 前端展示版

此資料夾以 [kuan35/Gold-Trading-Project](https://github.com/kuan35/Gold-Trading-Project) 的 `frontend/` 為基底，最初取用版本 `ba68c31e785f54e81b79e0039aa1335079a5ec12`（2026-10-01）。這是獨立於團隊正式 repo 的介面展示版。

## 目前可展示的流程

- **對話與下單草稿：**主畫面由對話、帳戶／提醒和下單草稿組成。送出前可查看部位風險、個人提醒、歷史案例、證據充分性與說明。
- **輔助頁面：**回放演練和 TradingView 即時圖表參考仍可切換；圖表價格不會直接用於模擬委託。
- **版面配置：**對話工作台與回放頁可選固定排列或拖動分隔線調整大小。
- **個人提醒：**本筆手數、下單後總手數、未設定停損、停損價格情境損失共四項；建立草稿時才比對。提醒設定保存在目前瀏覽器的 `localStorage`，尚未依帳號隔離或跨裝置同步。
- **展示帳號：**可用帳號名稱、電子郵件、選填顯示名稱和至少 8 字元的測試密碼註冊；登入時可填帳號名稱或信箱。帳號與密碼只暫存在這次頁面開啟期間的 JavaScript 記憶體，重新整理後消失。這不是正式驗證，沒有後端權限與使用者資料隔離，請勿使用真實或慣用密碼。詳見 [與 A 後端的銜接說明](docs/registration-handoff.md)。

帳戶、報價、案例與限價委託目前使用合成展示資料。限價成交只依回放 K 棒高低價判定，未模擬盤中先後順序、排隊、滑價或可變價差。cTrader／Pepperstone 與 Groq 尚未串接；不會送出真實券商訂單。

## 本機預覽

在 `site/` 內安裝依賴並建立 Pages 展示版：

```powershell
npm ci
npm run build:pages
npm run preview -- --mode pages --port 4173
```

開啟 `http://127.0.0.1:4173/Gold-Desk-Workspace/`。Pages 模式使用瀏覽器內合成資料，不需要後端、金鑰或券商帳戶。若要測試本機後端，需按團隊原 repo 的 README 啟動後端，再以一般 `pnpm run dev` 啟動前端。

版型切換會更新網址參數。[GitHub Pages 展示網站](https://nekomata864.github.io/Gold-Desk-Workspace/) 可分享給組員；版型入口及回饋問題見 [版型比較](../docs/layout-comparison.md)。自訂大小支援滑鼠／觸控及方向鍵，設定會保存在此瀏覽器。

## 公開展示

此公開 repo 使用 GitHub Actions 將 `site/` 建置到 GitHub Pages；推送 `main` 後會重新發布。網站與原始碼都可公開瀏覽。展示版採合成行情與瀏覽器內回放，沒有真實券商連線；團隊正式網站並未改動。
