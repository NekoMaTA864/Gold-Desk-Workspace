# 第三階段：前端服務接線與待確認契約

## 已完成的前端工作

backendTransport.ts 統一同源 /api 的 URL、JSON 請求、取消訊號、錯誤類型與 SSE 建立入口。api.ts 保留 Pages 的 browserAPI 模擬分流；一般模式使用共用 transport。ConversationWorkspace 與 LiveAssistant 的聊天請求、BrokerClosePanel 的確認請求、useLiveCandles 的串流建立皆已改用共用入口。

401 顯示登入失效；403 顯示目前無權使用，亦可能是既有本機存取限制，不推測為帳號角色已確認；409 保留後端原因；429 顯示請求／額度限制；斷線及成功回應中的無效 JSON 皆回報錯誤，不把代理 HTML 或驗證 JSON 直接當成成功結果。沒有自動登出、丟棄草稿或自動登入。

所有請求維持同源。HTTP 明確使用 credentials:same-origin 和 no-store，POST 沒有自動重試。確認請求仍僅在原有白名單 HTTP 狀態、JSON Content-Type 和明確 detail 都存在時判為明確拒絕；斷線、格式錯誤、5xx等維持未知，不能重送。原冪等 key 和查回報流程未改。

SSE 僅統一建立入口，保留原生重連、可見性切換、STALE與原有已收棒 fallback。EventSource 的 error 不提供 HTTP 狀態，不將串流斷線猜成401或自動清除Session；正式SSE認證策略仍待A確認。

publicHistory.ts 讀取公開靜態案例資料、groqProxy.ts 讀取既有外部代理，來源與 /api 不同，保留各自通道，不強行加平台登入或券商憑證。

## 組員需要交付什麼

| 負責人 | 待確認／交付 | 前端如何接入 |
| --- | --- | --- |
| A | 登入／登出／Session查詢URL、資料格式、401/403語意；Cookie或token、CSRF及SSE認證策略 | 正式帳號入口、角色與逾期處理；不以展示登入取代後端權限 |
| A＋C | 使用者可存取的券商帳戶清單、唯讀／送單能力、目前帳戶、切帳戶時的草稿失效規則 | 帳戶選擇、可用動作；帳戶ID不能由前端任意指定即取得權限 |
| B | 正式DEMO草稿的規則檢查結果、版本、缺值原因與波動來源 | 五區核對的提醒與風險區；未提供保持未接入 |
| D＋A | 證據充分性等級、逐項原因、版本、固定快照的案例引用 | 原樣呈現，不從案例數或PASSED自行推定充分性 |
| C | 連線／報價／帳戶新鮮度、委託／成交／拒絕／UNKNOWN及重連對帳 | 延續現有帳戶、核對與回報元件；不自動重送 |

以上是交接問題，不是新增已上線的API契約。現有API_CONTRACT.md和loopback限制未改。未加入API網域設定、跨站Cookie或瀏覽器token保存；與A確認後再處理部署。

## 尚不能宣稱完成

本輪 TypeScript、156項前端測試、一般與Pages build、diff空白檢查通過。請求與SSE以mock測試，尚未有遠端登入服務的端到端驗收。修改留在本機，未commit／push。

正式帳號與跨裝置同步、多人帳戶隔離、規則後端接入、真券商授權、遠端Session/SSE驗收。這些需要相應組員的服務與契約。E仍可獨立補教學、測試句及操作展示腳本。
