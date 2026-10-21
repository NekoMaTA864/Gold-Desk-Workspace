export type ScenarioKey='normal'|'no-cases'|'stale-quote'|'broker-offline'|'assistant-offline';

type Scenario={label:string;eyebrow:string;title:string;description:string;quote:[string,string];history:[string,string];assistant:[string,string];confirmation:[string,string]};

const scenarios:Record<ScenarioKey,Scenario>={
  normal:{label:'一般流程',eyebrow:'01 / 正常展示',title:'完成草稿後逐項核對',description:'以合成回放示範完整流程。模擬報價、風險、提醒與案例會在確認前分區呈現。',quote:['合成回放報價','顯示 BID、ASK 與回放時間；與券商報價分開。'],history:['案例僅供參考','展示匹配池、相同和不同條件，以及事後結果。'],assistant:['本機規則回覆','協助整理草稿；文字不會直接送單。'],confirmation:['本機模擬確認','核對草稿版本後，才在展示帳戶記錄模擬委託。']},
  'no-cases':{label:'沒有可比案例',eyebrow:'02 / 資料不足',title:'案例為零時，仍保留可核對的資訊',description:'這是「查詢成功但沒有可比案例」的畫面；與案例服務故障分開表示。',quote:['報價仍可查看','價格來源與時間照常顯示。'],history:['目前沒有可比案例','不產生相似理由或勝率；說明資料不足的原因。'],assistant:['只整理已知事實','仍可顯示部位、提醒與價格情境，不補造案例。'],confirmation:['先核對資料缺口','沒有案例不代表交易安全或危險。']},
  'stale-quote':{label:'報價過期',eyebrow:'03 / 時間異常',title:'價格變舊時，標出時間與下一步',description:'券商報價的來源時間過期時，不能把最後一筆價格標成「即時」。',quote:['報價已過期','保留最後來源時間；價格旁顯示過期狀態。'],history:['先停用當前盤面比較','等待新的已收 K 線，再重新檢查資料。'],assistant:['說明不能代替報價','文字只能說明缺口，不宣稱現在的可成交價。'],confirmation:['等待重新檢查','連線版應要求新報價與新版草稿；此預覽不會送單。']},
  'broker-offline':{label:'券商未連線',eyebrow:'04 / 連線異常',title:'明確區分外部圖與券商帳戶',description:'無法連到 DEMO 帳戶時，TradingView 仍能用來看圖，但不能冒充券商報價或成交。',quote:['券商未連線','BID、ASK 與帳戶數值顯示「—」，標明資料不可用。'],history:['回放仍可另行展示','合成回放與券商即時案例屬不同資料來源。'],assistant:['可回答一般說明','帳戶和成交結果無法由對話補造。'],confirmation:['券商確認不可用','保留本機展示流程；不顯示券商送單成功。']},
  'assistant-offline':{label:'助手暫不可用',eyebrow:'05 / 服務異常',title:'保留可核對的數值與固定說明',description:'對話或外部 LLM 服務失敗時，不應讓既有風險、提醒和案例結果一起消失。',quote:['行情狀態獨立','既有報價與來源標示仍可查看。'],history:['保留原始分析','案例、提醒與風險數值照常呈現。'],assistant:['助手暫不可用','提示稍後再試，必要時改以固定模板呈現已知事實。'],confirmation:['仍需逐項核對','文字服務失敗不代表草稿已確認。']},
};

const choices=Object.keys(scenarios) as ScenarioKey[];

export function readScenario():ScenarioKey {
  const value=new URLSearchParams(window.location.search).get('scenario');
  return value&&Object.hasOwn(scenarios,value)?value as ScenarioKey:'normal';
}

export default function ScenarioGallery({value,onChange,onClose}:{value:ScenarioKey;onChange:(value:ScenarioKey)=>void;onClose:()=>void}) {
  const scenario=scenarios[value];
  return <section className="scenario-gallery" aria-label="介面展示情境">
    <div className="scenario-heading"><div><span className="assistant-eyebrow">展示工具 · 介面樣態</span><h2 id="scenario-title">預覽資料異常時的提示</h2><p>此視窗只預覽提示與版型，不代表當前服務狀態，也不會改變草稿、帳戶或連線。</p></div><button type="button" autoFocus onClick={onClose} aria-label="關閉展示情境">關閉 ×</button></div>
    <div className="scenario-options" role="group" aria-label="選擇展示情境">{choices.map(key=><button key={key} type="button" className={value===key?'active':''} aria-pressed={value===key} onClick={()=>onChange(key)}>{scenarios[key].label}</button>)}</div>
    <div className="scenario-preview" key={value}><div className="scenario-intro"><span>{scenario.eyebrow}</span><h3>{scenario.title}</h3><p>{scenario.description}</p></div><div className="scenario-cards">{([['報價與來源',scenario.quote],['案例與證據',scenario.history],['對話說明',scenario.assistant],['確認動作',scenario.confirmation]] as const).map(([title,[headline,detail]],index)=><article key={title}><span>0{index+1} · {title}</span><strong>{headline}</strong><p>{detail}</p></article>)}</div></div>
  </section>;
}
