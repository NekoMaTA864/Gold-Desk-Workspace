export default function EntryGate({onDemo}: {onDemo:()=>void}) {
  return <main className="entry-page">
    <div className="entry-shell">
      <div className="entry-brand"><span className="brand-mark">GD</span><span>GOLD DESK / 黃金交易助手</span></div>
      <div className="entry-intro"><span className="assistant-eyebrow">TRADE WITH CONTEXT</span><h1>從交易想法到下單前檢查</h1><p>透過對話或表單建立草稿，再逐項核對報價、風險、個人規則與歷史案例。</p></div>
      <div className="entry-options">
        <section className="entry-card entry-demo"><span className="entry-step">01 · 現在可用</span><h2>進入合成展示</h2><p>使用瀏覽器內的合成行情與模擬帳戶，體驗完整草稿、回放與確認流程。</p><ul><li>不需帳號，也不會連接券商</li><li>展示資料只留在目前瀏覽器工作階段</li></ul><button type="button" className="primary" onClick={onDemo}>進入展示工作台 →</button></section>
        <section className="entry-card entry-login"><span className="entry-step">02 · 待後端接入</span><h2>團隊帳號登入</h2><p>正式版將由後端驗證帳號與角色；一般使用者可建立草稿，展示操作者才可送至券商練習帳戶。</p><div className="entry-login-fields"><label htmlFor="team-account">帳號</label><input id="team-account" placeholder="由團隊預設帳號登入" disabled autoComplete="username"/><label htmlFor="team-password">密碼</label><input id="team-password" type="password" placeholder="登入服務尚未啟用" disabled autoComplete="current-password"/></div><button type="button" disabled>登入服務尚未開放</button><small>此介面目前不接收或儲存密碼。</small></section>
      </div>
      <p className="entry-disclaimer">合成展示不是真實報價或交易服務。未連接券商時，不會顯示券商送單成功。</p>
    </div>
  </main>;
}
