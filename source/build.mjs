import './check-locales.mjs';
import {translateFor} from './locale-text.js';
import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const delivered=new URL('.',import.meta.url).pathname.endsWith('/source/');
const out=new URL(delivered?'../':'../../outputs/vicky-dream-gallery/',import.meta.url);
const data=async(path,mime)=>'data:'+mime+';base64,'+(await readFile(new URL(path,import.meta.url))).toString('base64');
const videoData=async name=>'data:video/mp4;base64,'+(await readFile(new URL('media/'+name+'.mp4',out))).toString('base64');
const assets={sky:await data('./sky.png','image/png'),stone:await data('./travertine.png','image/png'),blooms:await data('./blooms.jpg','image/jpeg'),meet:await data('./meet.jpg','image/jpeg')};
await writeFile(new URL('./assets.js',import.meta.url),'export const ASSETS='+JSON.stringify(assets)+';');
// Public catalogue is the editable source of truth; bitmap textures are embedded for local-file previews.
try {
 const catalogue=JSON.parse(await readFile(new URL('content/catalog.json',out),'utf8'));
 // Method downloads match the currently selected interface language.
 for(const item of catalogue.library){
  const content='# '+item.englishTitle+'\n\n'+translateFor(item.description)+'\n\n'+item.sections.map(s=>'## '+translateFor(s.title)+'\n\n'+translateFor(s.text)).join('\n\n')+'\n\n## Template\n\n```text\n'+translateFor(item.template)+'\n```\n\n---\nA showcase edition of Vicky’s creative methods.\n';
  await writeFile(new URL(item.download.replace(/\.md$/,'.en.md'),out),content);
 }
 const imageData=async path=>{const bytes=await readFile(new URL(path,out));return 'data:image/'+(path.endsWith('.svg')?'svg+xml':path.endsWith('.png')?'png':'jpeg')+';base64,'+bytes.toString('base64');};
 for(const [key,prefix] of [['waku','waku-'],['dramas','drama-']])for(const item of catalogue[key]){
  try{item.texture=await imageData(key==='dramas'?item.cover:'content/thumbs/'+prefix+item.id+'.jpg');}catch{item.texture=await imageData(item.cover);}
 }
 catalogue.profile.texture=await imageData(catalogue.profile.portrait);
 await writeFile(new URL('./portfolio-data.js',import.meta.url),'export const DATA='+JSON.stringify(catalogue)+';');
}catch(e){if(e.code!=='ENOENT')throw e;}
const result=await build({entryPoints:[new URL('./main.js',import.meta.url).pathname],bundle:true,minify:true,format:'iife',target:'es2020',write:false,legalComments:'inline'});
const html=(await readFile(new URL('./index.template.html',import.meta.url),'utf8')).replace('__PORTFOLIO_CSS__',await readFile(new URL('./portfolio.css',import.meta.url),'utf8')).replace('__BUNDLE__',()=>result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
await mkdir(out,{recursive:true});await writeFile(new URL('index.html',out),html);
if(!delivered){await mkdir(new URL('source/',out),{recursive:true});for(const file of ['continuous-environment.js','check-locales.mjs','i18n.js','locale-ui.js','locale-text.js','life-media.js','life-section.js','walk-motion.js','travertine.png','architecture-world.js','main.js','immersive-gallery.js','museum-layouts.js','portfolio.js','portfolio-data.js','portfolio.css','build.mjs','index.template.html','package.json','package-lock.json','blooms.jpg','meet.jpg','sky.png'])await copyFile(new URL(file,import.meta.url),new URL('source/'+file,out));}
await copyFile(new URL('./node_modules/three/LICENSE',import.meta.url),new URL('THREE-LICENSE.txt',out));
console.log('Built portable HTML:',(Buffer.byteLength(html)/1024/1024).toFixed(2),'MB');
