import {useState,type FormEvent} from 'react';
import {registerDemoAccount,signInDemoAccount,type DemoAccount} from './demoAuth';

type AccessTab='login'|'register';

export default function EntryGate({onDemo,onSignIn}: {onDemo:()=>void;onSignIn:(account:DemoAccount)=>void}) {
  const [tab,setTab]=useState<AccessTab>('login');
  const [name,setName]=useState('');
  const [username,setUsername]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmation,setConfirmation]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState('');
  const [previewComplete,setPreviewComplete]=useState(false);
  const [identifier,setIdentifier]=useState('');
  const [loginPassword,setLoginPassword]=useState('');

  const switchTab=(next:AccessTab)=>{
    setTab(next);
    setName('');setUsername('');setEmail('');setPassword('');setConfirmation('');
    setLoginPassword('');setError('');setPreviewComplete(false);setShowPassword(false);
  };
  const previewRegistration=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(password!==confirmation){setError('兩次輸入的密碼不一致。');return;}
    try {
      const account=registerDemoAccount({username,email,displayName:name,password});
      setIdentifier(account.username);
      setName('');setUsername('');setEmail('');setPassword('');setConfirmation('');
      setError('');setPreviewComplete(true);
    } catch(reason) {setError(reason instanceof Error?reason.message:'無法建立展示帳號。');}
  };
  const previewLogin=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    try {const account=signInDemoAccount(identifier,loginPassword);setLoginPassword('');setError('');onSignIn(account);}
    catch(reason) {setError(reason instanceof Error?reason.message:'無法登入展示帳號。');}
  };

  return <main className="entry-page">
    <div className="entry-shell">
      <div className="entry-brand"><span className="brand-mark">GD</span><span>GOLD DESK / 黃金交易助手</span></div>
      <div className="entry-intro"><span className="assistant-eyebrow">TRADE WITH CONTEXT</span><h1>從交易想法到下單前檢查</h1><p>透過對話或表單建立草稿，再逐項核對報價、風險、個人規則與歷史案例。</p></div>
      <div className="entry-options">
        <section className="entry-card entry-demo"><span className="entry-step">01 · 現在可用</span><h2>進入合成展示</h2><p>使用瀏覽器內的合成行情與模擬帳戶，體驗完整草稿、回放與確認流程。</p><ul><li>不需帳號，也不會連接券商</li><li>展示資料只留在目前瀏覽器工作階段</li></ul><button type="button" className="primary" onClick={onDemo}>進入展示工作台 →</button></section>
        <section className="entry-card entry-login"><span className="entry-step">02 · 本地帳號展示</span><h2>團隊帳號</h2><p>可先用測試資料走完註冊與登入流程。這不是正式驗證；後續由 A 的後端接管帳號和權限。</p>
          <div className="entry-tabs" role="group" aria-label="帳號功能"><button type="button" aria-pressed={tab==='login'} onClick={()=>switchTab('login')}>登入</button><button type="button" aria-pressed={tab==='register'} onClick={()=>switchTab('register')}>註冊</button></div>
          {tab==='login'?<div className="entry-login-panel"><p className="entry-preview-note">先在「註冊」建立暫存展示帳號。重新整理頁面後，帳號就會清除；請勿使用真實密碼。</p><form className="entry-login-form" onSubmit={previewLogin}><label htmlFor="team-account">帳號或電子郵件</label><input id="team-account" type="text" autoComplete="username" required value={identifier} onChange={event=>{setIdentifier(event.target.value);setError('');}} placeholder="輸入帳號名稱或電子郵件"/><label htmlFor="team-password">密碼</label><input id="team-password" type="password" autoComplete="current-password" required value={loginPassword} onChange={event=>{setLoginPassword(event.target.value);setError('');}} placeholder="輸入展示密碼"/>{error&&<p className="entry-form-error" role="alert">{error}</p>}<button type="submit" className="entry-auth-action">登入展示帳號</button></form><p className="entry-footnote">登入後使用同一份合成交易資料；帳號間的資料隔離待 A 後端接入。</p></div>
          :<div className="entry-register-panel">
            {previewComplete?<div className="entry-preview-result" role="status"><strong>暫存展示帳號已建立</strong><p>現在可用帳號名稱或電子郵件登入。帳號只存在於這次頁面開啟期間；重新整理後即清除，沒有建立正式帳號。</p><button type="button" onClick={()=>switchTab('login')}>前往登入 →</button></div>
            :<><p className="entry-preview-note">只用測試資料和測試密碼。資料留在此頁的暫存記憶體，不會送到伺服器；重新整理後清除。</p><form className="entry-register-form" onSubmit={previewRegistration}>
              <label htmlFor="register-username">帳號名稱</label><input id="register-username" type="text" autoComplete="username" required value={username} onChange={event=>{setUsername(event.target.value);setError('');}} aria-describedby="register-username-hint" placeholder="例如：gold_trader"/><small id="register-username-hint">3–24 個字元，不含空白或 @；也可使用中文。</small>
              <label htmlFor="register-email">電子郵件</label><input id="register-email" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@example.com"/>
              <label htmlFor="register-name">顯示名稱 <span>選填</span></label><input id="register-name" type="text" autoComplete="nickname" maxLength={60} value={name} onChange={event=>setName(event.target.value)} placeholder="例如：Gold Desk 組員"/>
              <label htmlFor="register-password">密碼</label><div className="entry-password-field"><input id="register-password" type={showPassword?'text':'password'} autoComplete="new-password" required value={password} onChange={event=>{setPassword(event.target.value);setError('');}} aria-describedby="register-password-hint" placeholder="至少 8 個字元"/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'隱藏密碼':'顯示密碼'}>{showPassword?'隱藏':'顯示'}</button></div><small id="register-password-hint">至少 8 個字元；不要求英文大小寫、數字或符號。</small>
              <label htmlFor="register-confirmation">再次輸入密碼</label><input id="register-confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={event=>{setConfirmation(event.target.value);setError('');}} placeholder="再輸入一次以確認"/>
              {error&&<p className="entry-form-error" role="alert">{error}</p>}
              <div className="entry-role-note"><strong>展示身分：一般使用者</strong><span>本地登入只展示操作流程，不提供權限保護；正式操作者由 A 的後端指派。</span></div>
              <button type="submit" className="entry-auth-action">建立暫存展示帳號</button>
            </form></>}
          </div>}
        </section>
      </div>
      <p className="entry-disclaimer">合成展示不是真實報價或交易服務。未連接券商時，不會顯示券商送單成功。</p>
    </div>
  </main>;
}
