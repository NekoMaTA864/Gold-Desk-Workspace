# 第二階段：正式 DEMO 五區核對

前端整合，尚未 commit／push。正式 ConversationOrderReview 改用 BrokerReviewContents；IntegratedReview 與正式核對共用 ReviewSections、RulesReview、EvidenceReview 和 RiskReview。五區固定為部位風險、個人提醒、歷史案例、證據充分性、檢查說明。

資料皆來自傳入的同一份已檢查草稿。analysis_reply 的 snapshot_id、分析時間與 draft_snapshot 模式必須相符，案例另核對其快照 ID 及方向；不一致就顯示缺資料，不借用上一輪對話。案例沿用 CaseComparison，可展開條件、操作明細；補顯示既有 differences 欄位，不改排序。既有操作明細需使用者展開才向原快照請求。查無案例與資料未提供分開顯示。

正式 /api/broker/drafts 目前沒有 personal_rules 結果，畫面明示尚待後端接入，不能以瀏覽器本地規則冒充正式檢查。空結果、未觸發、觸發、未知各有文字。證據標籤只讀 retrieval.sufficiency；缺等級就說未提供，不從 PASSED 或案例數量自行提高等級。

本輪不修改 backend 或 API 契約，不增加前端自行計算的規則／充分性，不改期限、確認 key、後端重驗、UNKNOWN 鎖定及回報查詢。正式權限、規則版本及帳戶隔離仍待 A／B／C 提供。

本機驗收頁：/Gold-Desk-Workspace/dev/review-preview.html，由 Vite 開發伺服器提供。頁面使用測試 fixture，可切換零案例／提醒未接、觸發提醒、快照不一致；沒有送單元件，也不假裝券商已連線。此入口不在一般或 Pages 的單入口 build 產物內，正式工作台已接入同一個 BrokerReviewContents。

驗證：TypeScript、150 項前端測試、一般／Pages build 通過；瀏覽器確認觸發與錯快照文字，390px 下 scrollWidth375 無水平溢出。未做真 DEMO 委託或外部模型呼叫。完整正式後端帳戶操作尚待整合環境驗收。

下一階段：統一 API／SSE 接線前，先盤點請求入口與 Session／Cookie 錯誤狀態，列出要與 A、C 確認的契約；不自行解除本機限制。
