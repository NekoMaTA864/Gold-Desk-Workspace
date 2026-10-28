# 第一階段：波動參考前端整合

來源：brianlab0/Gold-Desk-Workspace，固定提交 1808aaebd1720c5621204bc37be50291ec2dfb32。沿用 rangeMath.ts、volatility-snapshot.json、VolatilityRange.tsx、groqFacts.ts 及三組測試；數值算法不變。原始說明與重建腳本見來源 repo 的 docs/B_volatility_range_20261028.md、scripts/build_volatility_snapshot.py。快照不是自動更新的行情。

本階段只整合 frontend，不搬 backend/evidence.py、volatility.py 或改券商／API／個人規則契約；後端事實目錄接入待 A、B 確認。本次不是 Brian 整個分支覆蓋，保留本站版型及提醒浮層。

共享 RiskReview 使用波動元件，因此回放核對與正式 DEMO 核對皆可查看獨立參考。畫面直接顯示固定資料期間、期貨來源；表格、停損比較與預算試算預設收合。預算結果稱「此情境下的參考手數」，不改草稿、不授予送單權限、不保證損失。

快照期間為 2026-09-30 至 2026-10-27，產生時間 2026-10-27T19:41:08Z。早於資料可用時間或缺乏可信分析時間時，顯示「獨立資料示範」，不得解讀成回放當時的風險檢查。Groq facts 同時檢查資料期間及產生時間；未通過就完全不附加波動資訊。可用時仍遵守既有字數保護。正式 DEMO 未使用 cTrader 商品規格計算此參考，畫面明示期貨、非券商報價。

保留限制：分布視窗重疊、混合時段，4 小時僅粗略參考；停損比例來自百分位網格近似，不是未來觸發機率。未含費用或滑價。沒有真實券商操作或外部模型呼叫。

下一階段：正式委託五區核對共用，先核對正式回覆欄位，不以回放資料替代缺少的後端結果。
