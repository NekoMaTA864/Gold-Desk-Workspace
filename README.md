# Gold Desk · 整合工作台

[開啟公開展示](https://nekomata864.github.io/Gold-Desk-Workspace/)

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
- site/：原展示版保留，現行 Pages 不再由此建置；prototype/ 是更早流程稿。
- [整合交接與驗證](docs/integration-20261024.md)、[團隊交接](TEAM_HANDOFF.md)、[API契約](API_CONTRACT.md)。
- 團隊基準：[kuan35/Gold-Trading-Project @ eb047ca](https://github.com/kuan35/Gold-Trading-Project/tree/eb047caaad2bbd6f544364293c69e17da9dc7421)；本站原基準 9fecc6eb53a8f0a687c7db7e36576120ed32284c。

main 推送會測試、下載並校驗公開資料、建置並部署 Pages。PR 執行前後端驗證。私人 ZIP、env、帳戶、日誌不可加入 Git。

---

以下為原工作區歷史說明；建置入口與現行狀態以上方整合說明為準。

## 原 Gold Desk 專題工作區

這個資料夾放本機 Python 虛擬環境、前端設計 skills、[五人分工表](docs/Gold%20Desk%20五人分工.md)、E 分工筆記，以及 [可操作的桌面流程原型](prototype/)。團隊正式網站仍以 Gold-Trading-Project repository 為準；此原型是獨立展示稿，沒有修改團隊網站。

三種 Agent 的可行性、責任分界與建議 JSON 見 [Agent 草案](docs/agent-feasibility.md)。這一輪先做桌面流程，手機版暫緩。

已另以團隊網站 React／Vite 前端為基底建立 [E 改版網站](site/)。目前以對話與下單前檢查為主，保留回放演練及即時圖表參考；也提供本地展示帳號的註冊、登入流程。來源、預覽步驟與展示限制見 [site README](site/README.md)。

工作台現在同時提供固定版型與自訂大小（拖拉）；組員可由 [GitHub Pages 展示網站](https://nekomata864.github.io/Gold-Desk-Workspace/) 比較，版型入口及回饋問題見 [版型比較](docs/layout-comparison.md)。

同步 repository：[NekoMaTA864/Gold-Desk-Workspace](https://github.com/NekoMaTA864/Gold-Desk-Workspace)（公開）。這個 repository 供家裡與公司同步專題工作區內容，與團隊的網站程式 repository 分開。請勿提交真實密碼、金鑰或私人交易資料。

## Python 環境

- 位置：`.venv/`
- 建立版本：Python 3.12
- 啟用（PowerShell）：`& .\.venv\Scripts\Activate.ps1`
- 不需啟用也能執行：`& .\.venv\Scripts\python.exe --version`
- 目前只含 Python 虛擬環境與 pip，沒有安裝網站套件。
- 換電腦時重新執行 `python -m venv .venv`；`.venv/` 已列入 `.gitignore`。

## 家裡與公司同步

在新電腦先 clone 此 repository，再於資料夾內建立 `.venv`。工作前 `git pull --ff-only`，工作後檢查 `git status`，只加入要分享的專題檔案再 commit／push。不要把金鑰、`.env`、私人交易資料或虛擬環境加入 Git；對應路徑已列入 `.gitignore`。

## 已下載的 skills

所有檔案放在 `.agents/skills/`。這些是第三方指引與附帶資源。本次桌面原型參考 `ui-ux-pro-max` 的深色儀表板配色、對比與鍵盤焦點原則；未執行 skill 附帶的安裝程式。日後以此資料夾作為 Codex 工作目錄時，可在任務中指定需要的 skill；每次選與任務相符的少數項即可。

| 本地目錄 | 來源 | 建議用途 |
| --- | --- | --- |
| `ui-ux-pro-max` | [NextLevelBuilder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-ux-pro-max) | 儀表板設計系統、配色、字級與 UX 查詢 |
| `impeccable` | [pbakaus](https://github.com/pbakaus/impeccable/tree/main/.agents/skills/impeccable) | 既有介面審查與打磨；其 launcher 首次執行可能另下載程式 |
| `web-design-guidelines` | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | 表單、可及性、互動與手機介面審查；使用時會讀取線上規則 |
| `composition-patterns` | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns) | 拆分共用 React 元件、減少元件參數膨脹 |
| `react-best-practices` | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) | React 資料載入、渲染與效能檢查 |
| `frontend-design` | [Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 建立新頁面與元件時的視覺指引 |
| `taste-skill` | [Taste Skill](https://github.com/Leonxlnx/taste-skill/tree/main/skills/taste-skill) | 視覺方向與整體一致性；公開規則檔不需註冊 |
| `hallmark` | [Hallmark](https://github.com/Nutlope/hallmark/tree/main/skills/hallmark) | 介面審查及重設；使用前先核對是否需要其外部服務 |
| `web-design-engineer` | [Garden Skills](https://github.com/ConardLi/garden-skills/tree/main/skills/web-design-engineer) | 網站與儀表板視覺原型 |
| `nothing-design` | [Nothing Design](https://github.com/dominikmartn/nothing-design-skill/tree/main/nothing-design) | 僅在選定 Nothing 黑白工業風時使用 |
| `gsap-core`, `gsap-react`, `gsap-performance` | [GSAP 官方](https://github.com/greensock/gsap-skills/tree/main/skills) | 將來確實需要複雜動畫時使用 |

Google Stitch 相關流程需要另接 Stitch 服務，本次未下載。以上 skills 來自公開 GitHub；下載的是原始檔案，沒有執行它們附帶的安裝程式或遠端服務。

## 建議使用順序

Gold Desk E 分工優先用 `ui-ux-pro-max` 定視覺系統、`composition-patterns` 拆共用元件、`web-design-guidelines` 檢查完成的畫面。現有畫面需要精修時再使用 `impeccable`。詳細工作順序見 [E 前端改善筆記](E-前端改善筆記.md)。
