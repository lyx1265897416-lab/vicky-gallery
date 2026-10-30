import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {translateFor} from './locale-text.js';
const data=JSON.parse(await readFile(new URL('../content/catalog.json',import.meta.url),'utf8'));
const skip=new Set(['id','cover','texture','previewUrl','download','portrait','url','source']);
const missing=[];let checked=0;
function walk(value,path='catalog'){
 if(Array.isArray(value))return value.forEach((v,i)=>walk(v,path+'.'+i));
 if(value&&typeof value==='object')return Object.entries(value).forEach(([key,v])=>{if(!skip.has(key))walk(v,path+'.'+key);});
 if(typeof value==='string'&&/[\u3400-\u9fff]/.test(value)){
  checked++;const english=translateFor(value,'en');
  if(/[\u3400-\u9fff]/.test(english))missing.push({path,source:value,result:english});
  assert.equal(translateFor(value,'zh'),value);
 }
}
walk(data);
assert.deepEqual(missing,[],'Missing English catalog translations');
assert.equal(translateFor('交互创作 · 52 个想象入口'),'Interactive works · 52 doors to imagination');
assert.equal(translateFor('1 件作品'),'1 work');
assert.equal(translateFor('52 件作品'),'52 works');
assert.equal(translateFor('展开蓝调时刻的生活记录'),'Read Blue Hour — journal entry');
assert.equal(translateFor('返回展馆 ↙'),'Back to gallery ↙');
console.log(`Passed: ${checked} catalog strings, Chinese fallback and dynamic labels.`);
