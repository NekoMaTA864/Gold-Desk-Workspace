import {useState,type FormEvent} from 'react';
import {registerDemoAccount,signInDemoAccount,type DemoAccount} from './demoAuth';

type AccessTab='login'|'register';

export default function EntryGate({onDemo,onSignIn,backendPreview=false}: {onDemo:()=>void;onSignIn:(account:DemoAccount)=>void;backendPreview?:boolean}) {
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

  return <main className={`entry-page${backendPreview?' entry-page--backend':''}`}>
    <div className="entry-shell">
      <div className="entry-brand"><span className="brand-mark">GD</span><span>GOLD DESK / 黃金交易助手</span></div>
      <div className="entry-intro"><span className="assistant-eyebrow">{backendPreview?'黃金交易 · DEMO 體驗':'黃金交易 · 模擬體驗'}</span><h1>把交易想法說清楚，<br/>確認之後再下一步。</h1><p>{backendPreview?'從這裡開始黃金交易演練。你可以使用展示帳號，或以訪客身分探索工作台。':'用對話或表單整理黃金交易草稿，核對部位風險、個人提醒與可參考案例。'}</p></div>
      <div className="entry-options">
        <section className="entry-card entry-demo"><span className="entry-step">{backendPreview?'免註冊 · 訪客體驗':'免註冊 · 無真實資金交易'}</span><h2>{backendPreview?'先看看交易工作台':'先體驗一筆模擬交易'}</h2><p>{backendPreview?'直接查看交易對話、即時看盤與歷史回放；未連線的功能會標明狀態。':'使用合成行情與模擬帳戶，搭配已公開的歷史案例，從草稿核對到模擬成交。'}</p><button type="button" className="primary" onClick={onDemo}>{backendPreview?'以訪客身分開始 →':'開始模擬體驗 →'}</button><p className="entry-session-note">{backendPreview?'展示模式不會連結你的個人帳戶。':'交易資料僅保留於本次工作階段。'}</p></section>
        <aside className="entry-journey" aria-label="體驗流程"><ol><li><span>01</span><div><strong>描述想法</strong><p>選擇方向、手數與預計價格。</p></div></li><li><span>02</span><div><strong>核對重點</strong><p>查看風險、個人提醒與案例限制。</p></div></li><li><span>03</span><div><strong>確認並查看結果</strong><p>記錄模擬委託，再用回放觀察變化。</p></div></li></ol></aside>
      </div>
      <details className="entry-account-preview" open={backendPreview}><summary><span>{backendPreview?'展示登入與假註冊':'想試用註冊與登入？'}</span><span>展開帳號體驗</span></summary>
        <section className="entry-card entry-login"><span className="entry-step">{backendPreview?'展示帳號':'帳號流程預覽'}</span><h2>註冊與登入</h2><p>{backendPreview?'用測試資料體驗登入流程。展示帳號只在這次開啟頁面期間有效。':'可用測試資料走完帳號流程。這是暫存展示帳號，尚無跨裝置同步與正式身分驗證。'}</p>
          <div className="entry-tabs" role="group" aria-label="帳號功能"><button type="button" aria-pressed={tab==='login'} onClick={()=>switchTab('login')}>登入</button><button type="button" aria-pressed={tab==='register'} onClick={()=>switchTab('register')}>註冊</button></div>
          {tab==='login'?<div className="entry-login-panel"><p className="entry-preview-note">{backendPreview?'第一次使用請先註冊展示帳號；請勿輸入真實密碼。':'先在「註冊」建立暫存展示帳號。重新整理頁面後，帳號就會清除；請勿使用真實密碼。'}</p><form className="entry-login-form" onSubmit={previewLogin}><label htmlFor="team-account">帳號或電子郵件</label><input id="team-account" type="text" autoComplete="username" required value={identifier} onChange={event=>{setIdentifier(event.target.value);setError('');}} placeholder="輸入帳號名稱或電子郵件"/><label htmlFor="team-password">密碼</label><input id="team-password" type="password" autoComplete="current-password" required value={loginPassword} onChange={event=>{setLoginPassword(event.target.value);setError('');}} placeholder="輸入展示密碼"/>{error&&<p className="entry-form-error" role="alert">{error}</p>}<button type="submit" className="entry-auth-action">登入展示帳號</button></form><p className="entry-footnote">{backendPreview?'展示登入不會同步個人資料；重新整理後需重新註冊。':'登入後共用本次合成交易資料，尚未提供各帳號獨立紀錄。'}</p></div>
          :<div className="entry-register-panel">
            {previewComplete?<div className="entry-preview-result" role="status"><strong>暫存展示帳號已建立</strong><p>現在可用帳號名稱或電子郵件登入。帳號只存在於這次頁面開啟期間；重新整理後即清除，沒有建立正式帳號。</p><button type="button" onClick={()=>switchTab('login')}>前往登入 →</button></div>
            :<><p className="entry-preview-note">只用測試資料和測試密碼。資料留在此頁的暫存記憶體，不會送到伺服器；重新整理後清除。</p><form className="entry-register-form" onSubmit={previewRegistration}>
              <label htmlFor="register-username">帳號名稱</label><input id="register-username" type="text" autoComplete="username" required value={username} onChange={event=>{setUsername(event.target.value);setError('');}} aria-describedby="register-username-hint" placeholder="例如：gold_trader"/><small id="register-username-hint">3–24 個字元，不含空白或 @；也可使用中文。</small>
              <label htmlFor="register-email">電子郵件</label><input id="register-email" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@example.com"/>
              <label htmlFor="register-name">顯示名稱 <span>選填</span></label><input id="register-name" type="text" autoComplete="nickname" maxLength={60} value={name} onChange={event=>setName(event.target.value)} placeholder="例如：Gold Desk 組員"/>
              <label htmlFor="register-password">密碼</label><div className="entry-password-field"><input id="register-password" type={showPassword?'text':'password'} autoComplete="new-password" required value={password} onChange={event=>{setPassword(event.target.value);setError('');}} aria-describedby="register-password-hint" placeholder="至少 8 個字元"/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'隱藏密碼':'顯示密碼'}>{showPassword?'隱藏':'顯示'}</button></div><small id="register-password-hint">至少 8 個字元；不要求英文大小寫、數字或符號。</small>
              <label htmlFor="register-confirmation">再次輸入密碼</label><input id="register-confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={event=>{setConfirmation(event.target.value);setError('');}} placeholder="再輸入一次以確認"/>
              {error&&<p className="entry-form-error" role="alert">{error}</p>}
              <div className="entry-role-note"><strong>展示身分：一般使用者</strong><span>{backendPreview?'這不是正式帳號，請勿使用真實密碼。':'本地登入只展示操作流程，不提供帳號權限保護。'}</span></div>
              <button type="submit" className="entry-auth-action">建立暫存展示帳號</button>
            </form></>}
          </div>}
        </section>
      </details>
      <p className="entry-disclaimer">{backendPreview?'此版本僅供展示與 DEMO 測試，沒有真實資金交易；資料與功能依連線狀態提供。':'合成展示不是真實報價或交易服務。未連接券商時，不會顯示券商送單成功。'}</p>
    </div>
  </main>;
}
