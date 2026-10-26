# 團隊功能接入位置（本地規劃）

這份圖以目前 `frontend/` 一般建置與 Pages 建置為準，供 A–E 組延續同一個工作台。畫面上的空缺只呈現實際未就緒狀態；新增 API 或權限前，不用假資料填滿區塊。舊 `site/` 已從目前追蹤樹移出，現行 Pages 建置來源是 `frontend/`；原件可由 Git 歷史還原。

| 組員與能力 | 現有畫面／程式接點 | 接入時要保持的界線 | 尚待交付與驗收 |
| --- | --- | --- | --- |
| A：登入、角色、會話、LLM | `IntegrationShell.tsx` 的帳號狀態、`ConnectionCenter.tsx` 的身分與 AI 連線資訊；`EntryGate.tsx` 是暫存展示；`frontend/src/api.ts`、`ConversationWorkspace.tsx` 為服務請求入口 | 展示帳號不能授予 FastAPI 權限；正式帳號、角色與資源歸屬必須由後端核定；使用者自備金鑰尚無安全保存機制；LLM 不得送單 | 確認登入／登出／會話逾期契約、Cookie 或 token 策略、逐資源授權；一般建置再接正式入口。若改 API，同步 `API_CONTRACT.md` |
| B：風險、個人規則、報價過期 | 回放 `App.tsx` 的草稿檢查與提醒分頁；一般模式 `ConversationOrderReview.tsx`、`IntegratedReview.tsx` 中的 `RiskReview` | 金額由程式計算、缺值不補零；報價不新鮮時不能確認；規則的瀏覽器儲存尚非登入隔離 | 提供風險／規則版本與缺資料原因；用邊界值及無案例情境驗收 |
| C：cTrader DEMO 行情、帳戶、委託 | `ConnectionCenter.tsx` 的帳戶連線資訊、`DeskChrome.tsx` 的 `DeskMarketHeader`、`LivePageGuide.tsx`、`DeskAccountTray.tsx`、`BrokerAccountPanel.tsx`；後端 `demo_market_stream.py`、`broker_orders.py` | Pages TradingView 只供觀察；個人券商連線應走授權流程，不要求網頁貼密碼或應用程式密鑰；DEMO 委託要後端重驗、人工確認及防重送；未知結果不重送 | 連線、報價時間、持倉、訂單編號、拒絕／部分成交／UNKNOWN 真回報與持久狀態驗收 |
| D：案例、證據與驗證 | `ConnectionCenter.tsx` 的資料就緒列、`CaseComparison.tsx`、`ConversationReply.tsx`、`frontend/src/App.tsx` 回放案例分頁；後端 `case_context.py`、`context_retrieval.py`、`/api/data/readiness` | 私有案例不放 `public/`；候選側檔 `READY` 不代表合成回放或即時盤面可匹配；歷史結果不是成功機率 | 提供檢索狀態、比較依據、來源／時區限制與盲評報告；改規則先同步負責人及契約 |
| E：共用介面與教學 | `DeskRouteFrame.tsx`、`DeskChrome.tsx`、`IntegrationShell.tsx`、`Education.tsx`、確認視窗 | 三頁維持同一導覽、來源標示與草稿；確認視窗只呈現後端核定結果 | 桌面與手機流程、失敗／未連線／資料不足狀態、非組員操作驗收 |

## 接入順序

1. A 與 C 先定義登入、會話、帳戶歸屬、行情與訂單狀態契約；公開 Pages 仍保持合成展示。
2. B 與 D 按既有下單前檢查區塊接入版本化風險與案例結果，不複製第二份草稿或改寫原始資料。
3. E 將各狀態放入既有對話、回放、看盤和核對區；缺服務時顯示原因與可行下一步。
4. 用假串流與多使用者資料驗權限、斷線、過期、重啟、冪等；真 DEMO 最終送單／平倉交由帳戶擁有者驗收。

目前本機完整模式已能載入私有案例側檔，但沒有正式登入、角色或 cTrader 帳戶連線。這份接入圖不代表那些服務已完成。
