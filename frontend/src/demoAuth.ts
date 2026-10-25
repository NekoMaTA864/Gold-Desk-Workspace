// Frontend-only identity flow for Pages and the local preview. Never use this as real authentication.
export type DemoAccount={username:string;email:string;displayName:string};
type StoredDemoAccount=DemoAccount&{password:string};

const accounts:StoredDemoAccount[]=[];
const normalize=(value:string)=>value.trim().toLowerCase();
const characterCount=(value:string)=>Array.from(value).length;

export function registerDemoAccount(input:DemoAccount&{password:string}):DemoAccount {
  const username=input.username.trim();
  const email=input.email.trim();
  const displayName=input.displayName.trim()||username;
  if(characterCount(username)<3||characterCount(username)>24||/[\s@]/u.test(username))throw new Error('帳號名稱需為 3–24 個字元，且不能包含空白或 @。');
  if(!email||!email.includes('@'))throw new Error('請輸入有效的電子郵件。');
  if(characterCount(input.password)<8)throw new Error('密碼至少需要 8 個字元。');
  if(accounts.some(account=>normalize(account.username)===normalize(username)))throw new Error('此展示帳號名稱已被使用。');
  if(accounts.some(account=>normalize(account.email)===normalize(email)))throw new Error('此展示電子郵件已被使用。');
  const account={username,email,displayName};
  accounts.push({...account,password:input.password});
  return account;
}

export function signInDemoAccount(identifier:string,password:string):DemoAccount {
  const key=normalize(identifier);
  const account=accounts.find(item=>normalize(item.username)===key||normalize(item.email)===key);
  if(!account||account.password!==password)throw new Error('帳號或密碼不正確；展示帳號在重新整理後會清除。');
  return {username:account.username,email:account.email,displayName:account.displayName};
}
