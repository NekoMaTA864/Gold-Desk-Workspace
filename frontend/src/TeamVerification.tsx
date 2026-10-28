import cases from '../../docs/interaction-cases-30.json';

export default function TeamVerification(){
 return <details className="team-verification"><summary>30句測試與操作驗收</summary>
  {([['pages','公開模擬下單'],['rules','提醒設定'],['formal','正式草稿解析']] as const).map(([target,label])=><details key={target}><summary>{label} · 10 句</summary><ol>{cases.filter(c=>c.target===target).map(c=><li key={c.id}><strong>{c.id} · {c.text}</strong><p>{c.note}</p></li>)}</ol></details>)}
 </details>;
}

