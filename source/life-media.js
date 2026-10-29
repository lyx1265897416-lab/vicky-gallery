const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mediaCover(story){
 const m=story.assets?.[0];
 if(!m)return '';
 const poster=m.poster||((m.type==='photo'||m.type==='live')?m.src:'');
 return `<div class="life-real-cover">${poster?`<img src="${esc(poster)}" alt="${esc(m.alt||story.title)}" loading="lazy">`:`<video src="${esc(m.src)}" muted playsinline preload="metadata" aria-label="${esc(m.alt||story.title)}"></video>`}<span>${m.type==='live'?'◉ LIVE':m.type==='video'?'▶ FILM':'PHOTO DIARY'} · ${story.assets.length}</span></div>`;
}
export function mediaAlbum(story){
 if(!story.assets?.length)return '';
 return `<div class="life-album" aria-label="${esc(story.title)}相册">${story.assets.map((m,i)=>`<button type="button" class="life-media-item" data-life-story="${esc(story.id)}" data-life-media="${i}" aria-label="${esc(m.type==='photo'?'放大照片':m.type==='live'?'播放 Live 动态':'播放视频')} ${i+1}">${m.poster||m.type!=='video'?`<img src="${esc(m.poster||m.src)}" alt="${esc(m.alt||story.title)}" loading="lazy">`:`<video src="${esc(m.src)}" muted playsinline preload="metadata"></video>`}<span>${m.type==='photo'?'↗':m.type==='live'?'◉ LIVE':'▶ PLAY'}</span></button>`).join('')}</div>`;
}
export function bindLifeMedia(root,stories){
 const viewer=document.createElement('dialog');
 viewer.className='life-media-viewer';viewer.setAttribute('aria-label','生活相册');
 viewer.innerHTML='<button class="life-media-close" aria-label="关闭相册">×</button><div class="life-media-stage"></div><div class="life-media-controls"><button data-step="-1" aria-label="上一张">←</button><span aria-live="polite"></span><button data-step="1" aria-label="下一张">→</button></div><p class="life-media-caption"></p>';
 root.append(viewer);
 let story,index=0,startX=0;
 function show(){
  const m=story.assets[index],stage=viewer.querySelector('.life-media-stage');
  stage.querySelector('video')?.pause();
  stage.innerHTML=m.type==='photo'?`<img src="${esc(m.src)}" alt="${esc(m.alt||story.title)}">`:`<video src="${esc(m.type==='live'?m.motion:m.src)}" ${m.poster||m.type==='live'?`poster="${esc(m.poster||m.src)}"`:''} controls playsinline preload="metadata" ${m.type==='live'?'muted loop':''}></video>`;
  viewer.querySelector('.life-media-controls span').textContent=`${index+1} / ${story.assets.length}`;
  viewer.querySelector('.life-media-caption').textContent=m.caption||story.quote||story.title;
  viewer.querySelectorAll('[data-step]').forEach(b=>b.disabled=story.assets.length<2);
  const video=stage.querySelector('video');
  if(video){video.addEventListener('error',()=>{const p=document.createElement('p');p.className='life-playback-error';p.textContent='视频暂时无法播放，请检查媒体文件。';stage.append(p);},{once:true});video.play().catch(()=>{});}
 }
 function next(step){index=(index+step+story.assets.length)%story.assets.length;show();}
 root.addEventListener('click',e=>{const b=e.target.closest('[data-life-media]');if(!b)return;story=stories.find(s=>s.id===b.dataset.lifeStory);if(!story?.assets?.length)return;index=Number(b.dataset.lifeMedia);viewer.showModal();show();});
 viewer.querySelector('.life-media-close').addEventListener('click',()=>viewer.close());
 viewer.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>next(Number(b.dataset.step))));
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();next(e.key==='ArrowRight'?1:-1);}});
 viewer.addEventListener('close',()=>{viewer.querySelector('video')?.pause();viewer.querySelector('.life-media-stage').replaceChildren();});
 const stage=viewer.querySelector('.life-media-stage');
 stage.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;},{passive:true});
 stage.addEventListener('touchend',e=>{if(e.target.closest('video'))return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>65)next(dx<0?1:-1);},{passive:true});
}
