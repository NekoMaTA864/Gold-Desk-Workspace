# Gold Desk · 整合工作台

[開啟公開展示](https://nekomata864.github.io/Gold-Desk-Workspace/)

組員接手請先讀 [目前 Pages 能力與下一步](docs/pages-current-handoff-20261025.md)，再依工作項目查看 `TEAM_HANDOFF.md`、`API_CONTRACT.md` 與角色文件。

整合團隊案例檢索與交易工作台，以及原本站的體驗入口、使用指引、資料來源說明與五區委託核對。確認流程保留人工操作。

| | GitHub Pages 公開展示 | 本機完整服務 |
|---|---|---|
| 前端 | frontend/ 的 pages build | frontend/ 一般 build |
| 行情／帳戶 | 合成回放、瀏覽器模擬帳戶；TradingView 僅外部參考 | FastAPI 與另行設定的 cTrader DEMO |
| 案例 | 已授權公開的歷史案例與舊公開索引 | 受控私人側檔；context_contract_v1 |
| 委託 | 僅瀏覽器模擬 | 草稿、人工確認、版本及防重送保護 |
| 帳號 | 暫存展示流程，無正式驗證／隔離 | 本機原型，雲端認證及隔離待完成 |

Pages 不執行 Python，沒有私人 ZIP、券商憑證或私人後端。歷史結果不是獲利機率；原始券商時鐘仍 UNKNOWN／PROJECT_REFERENCE。

## 本機前端

需 Python 3.11+、Node 22+。在 repo 根目錄：

```powershell
python scripts/fetch_public_data.py
cd frontend
npm ci
npm test
npm run build:pages
npm run preview -- --mode pages --port 4173
```

開啟 http://127.0.0.1:4173/Gold-Desk-Workspace/ 。公開資料下載器只讀固定上游提交的三個公開檔，逐檔比對 SHA-256，不讀私人 ZIP。

## 本機完整服務

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt -r research/requirements.txt
cd frontend
npm ci
npm run build
cd ..
.\.venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8765
```

開啟 http://127.0.0.1:8765/ 。無私有資料或憑證時顯示示範／未連線。受控 private/ 的取得與 loader 校驗見 [部署交接](docs/team_handoff_20261023/DEPLOYMENT.md)。cTrader 另需 requirements-ctrader.txt 與擁有者授權；沒有部署雲端券商服務。

## 目錄與來源

- frontend/、backend/、scripts/、research/：團隊主幹及整合改動。
- `site/`、`prototype/` 為已封存的舊版程式；現行 Pages 只由 `frontend/` 建置。
- [整合交接與驗證](docs/integration-20261024.md)、[團隊交接](TEAM_HANDOFF.md)、[API契約](API_CONTRACT.md)。
- 團隊基準：[kuan35/Gold-Trading-Project @ eb047ca](https://github.com/kuan35/Gold-Trading-Project/tree/eb047caaad2bbd6f544364293c69e17da9dc7421)；本站原基準 9fecc6eb53a8f0a687c7db7e36576120ed32284c。

main 推送會測試、下載並校驗公開資料、建置並部署 Pages。PR 執行前後端驗證。私人 ZIP、env、帳戶、日誌不可加入 Git。

## 舊版程式與設計參考

早期 `site/`、`prototype/` 與 repo 內附的 `.agents/skills/` 已於 2026-10-26 從現行追蹤樹移出，不參與 Pages、FastAPI 或自動測試。需要取回時可從 [清理前提交](https://github.com/NekoMaTA864/Gold-Desk-Workspace/tree/7c1c71931b38d7b443d42f3071c273e3bd429678) 還原；原工作區文字保留在 [歷史 README](docs/workspace-original-readme.md)。
