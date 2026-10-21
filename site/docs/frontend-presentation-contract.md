# 送單前確認畫面的前端資料入口

目前 `PreflightReview` 接受 `PreflightPresentation`，由 `site/src/preflightPresentation.ts` 的 `presentReplayPreflight()` 把本機回放 `Draft`、`State` 和個人提醒整理成畫面資料。UI 不再直接讀取回放 API 的草稿結構。

| 畫面區塊 | `PreflightPresentation` 欄位 | 後續資料提供者 |
| --- | --- | --- |
| 頂端來源與草稿 | `sourceLabel`、`sourceTime`、`order` | A／C 的登入與報價狀態、下單草稿 |
| 01 部位與價格風險 | `risk` | B 的風險結果 |
| 02 個人提醒 | `rules` | B 的規則比對結果 |
| 03 相似歷史案例 | `history` | D 的案例與匹配依據 |
| 04 證據是否充分 | `evidence` | D 的證據判準 |
| 05 檢查說明 | `explanation` | A 的解釋文字與可核對引用 |

接入正式服務時，由新的轉接函式建立同一個呈現物件，並核對每個欄位的資料來源、時間與失敗狀態。現有 `presentReplayPreflight()` 只使用本機回放結果；它不計算新風險值、不改案例排序，也不送出券商訂單。現階段畫面內的「待接入」文字仍以本機展示為準，正式服務接入時要一起更新。

頂端「展示情境」提供獨立的介面樣態預覽，選項會寫入網址的 `scenario` 參數。它不注入 API 回應，也不會影響確認畫面或帳戶狀態。
