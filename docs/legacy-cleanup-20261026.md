# 2026-10-26 舊版檔案清理紀錄

這次只移出不參與現行 Pages、FastAPI、研究回歸或部署流程的舊版資料；現行產品的 `frontend/`、`backend/`、`research/`、`scripts/`、`groq-proxy/`、API 契約及交接文件仍留在 repo。

| 從現行追蹤樹移出 | 追蹤檔數 | 原因 |
| --- | ---: | --- |
| `.agents/skills/` | 382 | 第三方設計／開發指引與資料檔，供舊原型開發參考；網站、API 與 CI 都不讀取 |
| `site/` | 40 | 2026-10-24 已由 `frontend/` 取代的舊版展示入口；Pages workflow 只建置 `frontend/` |
| `prototype/` | 4 | 更早的獨立桌面流程稿，沒有進入目前網站或測試 |

合計 **426 個追蹤檔、7,604,805 bytes（約 7.25 MiB）**。清理前提交為 [`7c1c719`](https://github.com/NekoMaTA864/Gold-Desk-Workspace/tree/7c1c71931b38d7b443d42f3071c273e3bd429678)。檔案仍在 Git 歷史；需要暫時取回時，可在 repo 根目錄執行：

```powershell
git restore --source=7c1c71931b38d7b443d42f3071c273e3bd429678 -- .agents/skills site prototype
```

此指令會把舊檔放回工作樹；若要重新納入新提交，需先討論用途並調整 `.gitignore`。清理前另在資料擁有者本機建立只含上述追蹤檔的 ZIP，驗得 426 個檔案，SHA-256 為 `CA0D020AE1C7DCD2E9E0559FB64F114AD468F044829F11CB82E486A2988845AF`。ZIP 不在 repo，也沒有 `private/`、憑證或執行紀錄。

這次清理讓**目前 checkout** 更專注且少約 7.25 MiB；Git 歷史仍可下載舊 blob，因此不宣稱完整歷史 clone 也縮小同等大小。沒有改寫 Git 歷史，以免影響組員既有 clone。

根目錄 README 已收斂為現行入口；舊說明保留於 `docs/workspace-original-readme.md`，但其中舊目錄連結需從清理前提交查看。其餘歷史文件保留研究與產品決策的時間脈絡，不納入這次刪除。
