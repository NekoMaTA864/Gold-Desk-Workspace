# Kuan cTrader DEMO 本地唯讀預覽

對照來源：[kuan35/Gold-Trading-Project](https://github.com/kuan35/Gold-Trading-Project) `main`，2026-10-20 提交 `5b0171f300fe3c8194699309ff832aad603ae72a`。

目前只讀取 Kuan 後端的兩個端點：`GET /api/broker/market`、`GET /api/broker/bars?interval=5m|15m|1h`。前者提供 DEMO BID／ASK 與帳戶摘要；後者提供已收 K 線。E 前端的合成回放、提醒、案例計算及下單流程維持原狀。Kuan 新增的券商案例檢索、草稿與確認送單尚未納入這版。

此整合只在本地 Vite 開發模式且 `VITE_CTRADER_LOCAL_PREVIEW=true` 時啟用。GitHub Pages 的正式建置不會呼叫 `/api/broker/*`，也不會打包或讀取券商憑證。前端從本機 `/api/broker/*` 透過 Vite proxy 連 `127.0.0.1:8765`；cTrader OAuth 資料只由 Kuan 後端在本機處理。

## 重新啟動預覽

在專題根目錄：

```powershell
git clone https://github.com/kuan35/Gold-Trading-Project.git .tmp/kuan-gold-20261021
cd .tmp/kuan-gold-20261021
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8765
```

另開一個終端，在 `site/` 中執行：

```powershell
$env:VITE_CTRADER_LOCAL_PREVIEW='true'
npm ci
npm exec vite -- --mode pages --host 127.0.0.1 --port 4175
```

開啟 `http://127.0.0.1:4175/Gold-Desk-Workspace/`。目前機器沒有 `.env.ctrader`，因此 API 回應 `NOT_CONFIGURED`，頁面會顯示 DEMO 未連線，TradingView 作為外部參考圖。若由 Kuan 提供經授權的 DEMO 設定，還需要依上游 README 安裝 `requirements-ctrader.txt`，並把設定放在**上游 repo 根目錄**受 Git 忽略的 `.env.ctrader`。請勿把 Client Secret 或 Access Token 放入 Vite 環境變數、前端程式碼或聊天訊息。

判讀頁面時，可由頂端「資料與連線」展開查看 cTrader DEMO 連線狀態；券商報價與合成回放價格是兩種資料，只有 `CURRENT` 狀態才顯示為最新券商報價。即時圖表有當前且已收的券商 K 線時才切換至券商圖，其餘情況顯示明確標記的 TradingView 圖。帳戶數值不可用時顯示 `—`，不以合成帳戶代替。
