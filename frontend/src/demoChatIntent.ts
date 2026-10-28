import type {Side} from './types';

type Interpretation={kind:'draft';side:Side;lot:string;sl?:string;tp?:string}|{kind:'reply';message:string};
const reply=(message:string):Interpretation=>({kind:'reply',message});

/** Conservative public-demo parser. Discussion never borrows a direction or changes a ticket. */
export function parseDemoTrade(raw:string):Interpretation|null {
 const text=raw.normalize('NFKC').trim();
 if(/手數|盎司|\blot\b/i.test(text)&&/是什麼|意思|多少盎司/.test(text))return reply('手數是交易數量。本機展示以1手＝100盎司試算，0.10手＝10盎司；不是風險預算。正式交易須核對券商商品規格。');
 const buy=/買進|買入|做多|\bBUY\b/i.test(text),sell=/賣出|賣空|做空|\bSELL\b/i.test(text);
 const trade=buy||sell||/手數|\blots?\b|\d\s*手|下單|草稿|停損|停利|平倉|撤單/i.test(text);
 if(!trade)return null;
 if(/不要|不用|別買|別賣|別下單|不買|不賣|不是|先不|取消/.test(text))return reply('這次沒有建立或修改草稿，也沒有取消任何既有委託。若要處理已建立的委託，請到持倉與紀錄核對。');
 if(/如果|假如|假設|^若|呢|嗎|怎麼|如何|是什麼|會怎樣|能不能|是否|超過|低於|高於|評估|分析|風險|建議|解釋|說明/.test(text))return reply('我把這句當作交易討論，不會修改草稿。展示版尚未支援假設交易的完整比較；你可以在草稿欄試填數值再檢查風險，送出前仍由你確認。');
 if(/平倉|撤單/.test(text))return reply('聊天不會直接平倉或撤單。請從持倉或待成交紀錄選擇目標，再核對並確認操作。');
 if(buy&&sell||/或|還是|以及|同時/.test(text))return reply('這句有多個方向或選項，尚未建立草稿。請一次指定一個方向與手數，例如「買進黃金0.10手」。');
 if(/改|調整|清空|移除/.test(text))return reply('展示版不會把這句自動套用到上一筆草稿。請直接編輯下單草稿欄，或重新完整輸入方向、手數與需要的價格，再檢查訂單。');
 if(/限價|掛單|進場價|指定價格|\blimit\b/i.test(text))return reply('指定進場價格請在下單草稿選擇「限價單」並填入價格；聊天目前只支援明確的市價草稿，未替你改成市價單。');
 if(/\b(?:sl|tp)(?=\s*[:=]?\s*[-+\d])|止損|止盈/i.test(text))return reply('展示版聊天目前只辨識「停損」與「停利」加完整價格。請改用這兩個標籤，或在草稿欄設定；這次沒有建立草稿。');
 if(/[-−]\s*(?:\d|\.\d)|\d[eE][-+]?\d|\d,\d/.test(text))return reply('收到負數或無法明確辨識的數字格式，沒有建立草稿。請使用正數小數手數與完整價格。');
 const lots=[...text.matchAll(/(?<![\d.])([-+]?(?:\d+(?:\.\d+)?|\.\d+))\s*(?:手|lots?\b)/gi)];
 if(lots.length>1)return reply('收到多個手數，尚未建立草稿。請只保留這一筆要使用的數量。');
 if(lots.length&&(!Number.isFinite(Number(lots[0][1]))||Number(lots[0][1])<=0))return reply('手數必須大於零，不能使用負數或零。這次沒有建立草稿。');
 if(/\d[.,]\d*[.,]\d|\d\s*(?:美元|點|%)/.test(text))return reply('數字或單位不明確，尚未建立草稿。手數請用小數與「手」，停損／停利請填完整價格，不使用點數或美元金額代替。');
 if(!buy&&!sell)return reply('還缺買進或賣出方向。請完整輸入，例如「買進黃金0.10手」；不會沿用先前方向下單。');
 if(!lots.length)return reply('你想'+(buy?'買進':'賣出')+'黃金，還需要多少手？請補成完整指令，例如「'+(buy?'買進':'賣出')+'黃金0.10手」，再建立待確認草稿。');
 const price=(name:string)=>text.match(new RegExp(name+'\\s*([0-9]+(?:\\.[0-9]+)?)'))?.[1];
 const sl=price('停損'),tp=price('停利');
 if((text.match(/停損/g)?.length??0)>1||(text.match(/停利/g)?.length??0)>1)return reply('同一欄位出現多個價格，尚未建立草稿。請只保留一個停損與一個停利價格。');
 if(/停損/.test(text)&&!sl||/停利/.test(text)&&!tp)return reply('停損或停利缺少完整價格，尚未建立草稿。請填寫明確價格，或直接在草稿欄位設定。');
 return {kind:'draft',side:buy?'BUY':'SELL',lot:lots[0][1],sl,tp};
}
