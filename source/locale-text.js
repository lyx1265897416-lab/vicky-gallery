import CONTENT_EN from '../content/locales/en.json' with {type:'json'};
import {UI_EN} from './locale-ui.js';

const translations={...UI_EN,...CONTENT_EN};
const keys=Object.keys(translations).sort((a,b)=>b.length-a.length);
const pattern=new RegExp(keys.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
const han=/[\u3400-\u9fff]/;
const cache=new Map();
export function translateFor(value,language='en'){
 const text=String(value??'');
 if(language!=='en'||!han.test(text))return text;
 if(cache.has(text))return cache.get(text);
 let result=translations[text];
 if(result===undefined){
  result=text.replace(/交互创作 · (\d+) 个想象入口/g,'Interactive works · $1 doors to imagination')
   .replace(/(\d+) 件作品/g,(_,n)=>`${n} ${n==='1'?'work':'works'}`)
   .replace(/^展开(.+)的生活记录$/, 'Read $1 — journal entry')
   .replace(/相册$/, ' — album');
  result=result.replace(pattern,key=>translations[key]);
 }
 cache.set(text,result);return result;
}
