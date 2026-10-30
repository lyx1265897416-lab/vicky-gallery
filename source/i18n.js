import {translateFor} from './locale-text.js';
export {translateFor} from './locale-text.js';

export const STORAGE_KEY='vicky-gallery-language';
let language='zh';
try{
 const saved=localStorage.getItem(STORAGE_KEY);
 language=saved==='en'||saved==='zh'?saved:(navigator.language?.toLowerCase().startsWith('zh')?'zh':'en');
}catch{language=typeof navigator!=='undefined'&&navigator.language?.toLowerCase().startsWith('zh')?'zh':'en';}
export const getLanguage=()=>language;
export const t=value=>translateFor(value,language);

// Preserve source text per node: switching languages never rebuilds the 3D scene,
// changes option values, or reloads a currently playing experience.
export function initLanguage(){
 const textSources=new WeakMap(),attributeSources=new WeakMap();
 const attrs=['aria-label','title','placeholder','alt'];
 const ignored=node=>node.parentElement?.closest('script,style,textarea,[data-no-translate]');
 function renderText(node){
  if(ignored(node))return;
  let record=textSources.get(node),value=node.nodeValue;
  if(!record||value!==record.output){record={source:value,output:value};textSources.set(node,record);}
  const next=t(record.source);record.output=next;
  if(value!==next)node.nodeValue=next;
 }
 function renderAttributes(el){
  if(el.closest('script,style,[data-no-translate]'))return;
  let records=attributeSources.get(el);if(!records){records={};attributeSources.set(el,records);}
  for(const attr of attrs){
   const value=el.getAttribute(attr);if(value===null){delete records[attr];continue;}
   let record=records[attr];if(!record||value!==record.output)record=records[attr]={source:value,output:value};
   const next=t(record.source);record.output=next;if(next!==value)el.setAttribute(attr,next);
  }
 }
 function renderTree(root){
  if(root.nodeType===3){renderText(root);return;}
  if(root.nodeType!==1)return;
  renderAttributes(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){const node=walker.currentNode;if(node.nodeType===3)renderText(node);else renderAttributes(node);}
 }
 const observer=new MutationObserver(records=>{
  // Observe only actual content changes, never the per-frame style/camera updates.
  const trees=new Set(),texts=new Set(),attributes=new Set();
  for(const record of records){
   if(record.type==='characterData')texts.add(record.target);
   else if(record.type==='attributes')attributes.add(record.target);
   else for(const node of record.addedNodes)trees.add(node);
  }
  for(const node of trees)if(node.isConnected)renderTree(node);
  for(const node of texts)if(node.isConnected)renderText(node);
  for(const node of attributes)if(node.isConnected)renderAttributes(node);
 });
 function sync(){
  document.documentElement.lang=language==='zh'?'zh-CN':'en';
  document.documentElement.dataset.language=language;
  document.querySelectorAll('[data-language-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.languageChoice===language)));
  document.querySelector('meta[name="description"]')?.setAttribute('content',language==='en'?'Vicky’s portfolio of AIGC design, interactive experiences, stories and creative tools.':'Vicky 的 AIGC 设计作品集：交互体验、互动剧集、创作工具与生活记录。');
  renderTree(document.body);
  // Library downloads follow the selected language without changing their content in place.
  document.querySelectorAll('a[data-method-download]').forEach(a=>{
   const id=a.dataset.methodDownload;a.href=`content/library/${id}${language==='en'?'.en':''}.md`;
  });
 }
 function select(next){
  if(next!=='zh'&&next!=='en')return;
  language=next;try{localStorage.setItem(STORAGE_KEY,next);}catch{}
  sync();document.dispatchEvent(new CustomEvent('languagechange',{detail:{language}}));
 }
 document.addEventListener('click',event=>{const button=event.target.closest('[data-language-choice]');if(button)select(button.dataset.languageChoice);});
 addEventListener('storage',event=>{if(event.key===STORAGE_KEY&&(event.newValue==='en'||event.newValue==='zh')){language=event.newValue;sync();}});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
 sync();
 return {select};
}
