import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ASSETS} from './assets.js';
import {buildArchitecture} from './architecture-world.js';
import {stepWalk} from './walk-motion.js';

// Camera lives inside the architecture. All navigation moves the viewer, never the collection.
export function createImmersiveGallery(renderer,environment,{textureFor,onFocus,onOpen}) {
 const canvas=renderer.domElement,scene=new T.Scene();
 scene.background=new T.Color('#e7dedb');scene.fog=new T.Fog('#e7dedb',85,240);
 scene.environment=environment;scene.environmentIntensity=.55;
 const camera=new T.PerspectiveCamera(57,1,.1,450);
 const collection=new T.Group();scene.add(collection);
 const composer=new EffectComposer(renderer);composer.setPixelRatio(1);const renderPass=new RenderPass(scene,camera),ao=new GTAOPass(scene,camera,640,360),output=new OutputPass(),smaa=new SMAAPass();ao.blendIntensity=.48;composer.renderTarget1.samples=4;composer.renderTarget2.samples=4;composer.addPass(renderPass);composer.addPass(ao);composer.addPass(output);composer.addPass(smaa);
 let enabled=false,mobile=false,reduced=false,entries=[],pan=null,flight=null,returnPose=null,selected=-1,hovered=-1,focusLock=null,minZ=-93,yaw=0,targetYaw=0,pitch=0,targetPitch=0;
 const aim=new T.Vector3(0,3.9,13),look=new T.Vector3(),hover=new T.Vector2(),pointers=new Map();
 const ray=new T.Raycaster(),ndc=new T.Vector2(),normal=new T.Vector3(),projected=new T.Vector3();
 const geometries=new Set(),materials=new Set(),ownedTextures=new Set();
 const geo=g=>(geometries.add(g),g),mat=m=>(materials.add(m),m);
 const plaster=mat(new T.MeshStandardMaterial({color:'#e2cfbb',roughness:.81}));
 const pink=mat(new T.MeshStandardMaterial({color:'#d5ada9',roughness:.78}));
 const mint=mat(new T.MeshStandardMaterial({color:'#b4cfc3',roughness:.43,metalness:.08}));
 const brass=mat(new T.MeshStandardMaterial({color:'#b29c6f',roughness:.28,metalness:.7}));
 const ivory=mat(new T.MeshStandardMaterial({color:'#fff3de',roughness:.4}));
 function mesh(g,m,x,y,z,parent=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
 const cube=geo(new T.BoxGeometry(1,1,1));
 function box(w,h,d,x,y,z,m=plaster){const o=mesh(cube,m,x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;return o;}
 // The ocean and atmospheric dome follow the visitor; landmarks are recycled beyond the fog.
 const waterTime={value:0};
 const floor=mesh(geo(new T.PlaneGeometry(750,750)),mat(new T.MeshStandardMaterial({color:'#b8d2cd',roughness:.22,metalness:.26})),0,-.12,0);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 const sky=new T.TextureLoader().load(ASSETS.sky);sky.colorSpace=T.SRGBColorSpace;ownedTextures.add(sky);
 const dome=mesh(geo(new T.SphereGeometry(350,48,24)),mat(new T.MeshBasicMaterial({map:sky,side:T.BackSide,fog:false,color:'#f7e7df'})),0,0,0);
 const poolA=new T.PlaneGeometry(11.8,20.8).translate(4,17,0),poolB=new T.PlaneGeometry(22,50).translate(65,64,0);
 const reflection=new Reflector(geo(mergeGeometries([poolA,poolB])),{color:0xd7e5df,textureWidth:640,textureHeight:640,clipBias:.006});reflection.rotation.x=-Math.PI/2;reflection.position.y=.64;poolA.dispose();poolB.dispose();reflection.material.transparent=true;reflection.material.depthWrite=false;
 reflection.material.uniforms.uTime=waterTime;reflection.material.uniforms.uTouch={value:new T.Vector2()};reflection.material.uniforms.uTouchTime={value:-100};
 reflection.material.vertexShader='varying vec2 vPool;\n'+reflection.material.vertexShader.replace('void main() {','void main() { vPool=position.xy;');
 reflection.material.fragmentShader='uniform float uTime; uniform vec2 uTouch; uniform float uTouchTime; varying vec2 vPool;\n'+reflection.material.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );','vec2 uv=vUv.xy/vUv.w; float age=max(0.0,uTime-uTouchTime); float dist=length(vPool-uTouch); float ripple=sin(dist*5.0-age*8.0)*exp(-pow(dist-age*3.0,2.0)*.3)*exp(-age*.7)*.008; uv+=normalize(vPool-uTouch+vec2(.0001))*ripple; uv.x+=sin(uv.y*160.0+uTime*.7)*.0007; uv.y+=sin(uv.x*130.0+uTime*.45)*.0008; vec4 base=texture2D(tDiffuse,uv)*.4; base+=texture2D(tDiffuse,uv+vec2(.0018,0.0))*.15; base+=texture2D(tDiffuse,uv-vec2(.0018,0.0))*.15; base+=texture2D(tDiffuse,uv+vec2(0.0,.002))*.15; base+=texture2D(tDiffuse,uv-vec2(0.0,.002))*.15;').replace('blendOverlay( base.rgb, color ), 1.0','blendOverlay( base.rgb, color ), .58');scene.add(reflection);
 const stone=new T.TextureLoader().load(ASSETS.stone);stone.colorSpace=T.SRGBColorSpace;stone.wrapS=stone.wrapT=T.RepeatWrapping;stone.repeat.set(.17,.17);ownedTextures.add(stone);
 const architecture=buildArchitecture({scene,geo,mat,mesh,stone});
 const sun=new T.DirectionalLight('#fff0dc',3);sun.position.set(-30,40,20);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;sun.shadow.camera.near=.5;sun.shadow.camera.far=130;sun.shadow.bias=-.0003;sun.shadow.normalBias=.04;scene.add(sun,sun.target);
 scene.add(new T.HemisphereLight('#f7e9df','#7c9387',1.05));
 // Soft pools of light and contact shadows, not expensive full-scene bloom.
 function radial(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(84,79,66,.25)');g.addColorStop(.3,'rgba(84,79,66,.12)');g.addColorStop(1,'rgba(84,79,66,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);ownedTextures.add(t);return t;}
 const shadowMat=mat(new T.MeshBasicMaterial({map:radial(),transparent:true,depthWrite:false}));
 const shadowGeo=geo(new T.PlaneGeometry(5,3.5));
 const dustGeo=geo(new T.BufferGeometry()),dustArray=new Float32Array(240*3);
 for(let i=0;i<240;i++){dustArray[i*3]=Math.sin(i*73.1)*10;dustArray[i*3+1]=1+(i%23)*.32;dustArray[i*3+2]=18-(i*11.31%125);}
 dustGeo.setAttribute('position',new T.BufferAttribute(dustArray,3));
 const dust=new T.Points(dustGeo,mat(new T.PointsMaterial({color:'#fff4d9',size:.045,transparent:true,opacity:.5,depthWrite:false})));scene.add(dust);
 const frameGeo=geo(new RoundedBoxGeometry(2.94,4.29,.22,2,.04)),artGeo=geo(new T.PlaneGeometry(2.72,4.0)),stemGeo=geo(new T.CylinderGeometry(.018,.018,1,6));
 const labelGeo=geo(new T.PlaneGeometry(2.85,.48)),pedestalGeo=geo(new T.CylinderGeometry(1.7,2.1,.65,48));
 const tempMats=[],tempTextures=[];
 function clearCollection(){collection.clear();entries=[];tempMats.splice(0).forEach(m=>m.dispose());tempTextures.splice(0).forEach(t=>t.dispose());}
 function setItems(items){
  clearCollection();minZ=-Math.max(18,Math.ceil(items.length/5)*9.2-3);
  items.forEach((item,i)=>{
   const slot=architecture.anchors[i%architecture.anchors.length];
   const g=new T.Group();g.position.set(slot.x,slot.y,slot.z);g.rotation.y=slot.angle;collection.add(g);
   const frameMaterial=new T.MeshStandardMaterial({color:slot.zone===2?'#a67b70':'#a89d83',roughness:.4,metalness:.36});tempMats.push(frameMaterial);
   const frame=mesh(frameGeo,frameMaterial,0,0,0,g);frame.castShadow=true;frame.receiveShadow=true;
   const artMaterial=new T.MeshBasicMaterial({map:textureFor(item),toneMapped:false,side:T.DoubleSide});tempMats.push(artMaterial);
   const art=mesh(artGeo,artMaterial,0,0,.12,g);art.userData.index=i;const back=mesh(artGeo,artMaterial,0,0,-.12,g);back.rotation.y=Math.PI;back.userData.index=i;
   const c=document.createElement('canvas');c.width=760;c.height=128;const cx=c.getContext('2d');cx.fillStyle='#f5efdf';cx.fillRect(0,0,760,128);cx.fillStyle='#6b7061';cx.font='21px Arial';cx.fillText(String(i+1).padStart(2,'0')+'   /   '+item.category,27,39);cx.fillStyle='#414e43';cx.font='30px Arial';cx.fillText(item.title.slice(0,21),27,91);const labelTexture=new T.CanvasTexture(c);labelTexture.colorSpace=T.SRGBColorSpace;tempTextures.push(labelTexture);const lm=new T.MeshBasicMaterial({map:labelTexture,toneMapped:false});tempMats.push(lm);mesh(labelGeo,lm,0,-2.55,.06,g);const backLabel=mesh(labelGeo,lm,0,-2.55,-.06,g);backLabel.rotation.y=Math.PI;
   const stem=new T.Object3D();g.add(stem);
   const shadow=mesh(shadowGeo,shadowMat,g.position.x,.075,g.position.z,collection);shadow.rotation.x=-Math.PI/2;
   entries.push({g,frame,art,back,shadow,stem,item,materials:[frameMaterial,artMaterial,lm],opacity:1,baseY:g.position.y,bx:g.position.x,bz:g.position.z,zone:slot.zone});
  });minZ=entries.length?Math.min(...entries.map(e=>e.g.position.z))+6:-18;selected=-1;hovered=-1;reset(true);
 }
 const regionUI=document.createElement('nav');regionUI.id='architecture-regions';regionUI.setAttribute('aria-label','梦境建筑区域');regionUI.innerHTML=architecture.regions.map((r,i)=>`<button data-zone="${i}" aria-pressed="${i===0}"><small>0${i+1}</small>${r.name}</button>`).join('');document.querySelector('#gallery-ui').append(regionUI);
 const filterToggle=document.createElement('button');filterToggle.id='architecture-filter';filterToggle.textContent='查找';filterToggle.setAttribute('aria-expanded','false');filterToggle.setAttribute('aria-label','展开作品搜索和筛选');document.querySelector('#gallery-ui').append(filterToggle);filterToggle.onclick=()=>{const open=document.querySelector('#gallery-ui').classList.toggle('filters-open');filterToggle.setAttribute('aria-expanded',String(open));};
 const walkUI=document.createElement('div');walkUI.id='walk-controls';
 walkUI.innerHTML=`<div class="walk-pad" role="group" aria-label="按住方向键行走"><span class="walk-caption">按住行走</span><button data-walk="forward" aria-label="前进，按住持续行走"><b>↑</b><small>前进</small></button><button data-walk="left" aria-label="向左平移，按住持续行走"><b>←</b><small>左移</small></button><span class="walk-center">✧</span><button data-walk="right" aria-label="向右平移，按住持续行走"><b>→</b><small>右移</small></button><button data-walk="back" aria-label="后退，按住持续行走"><b>↓</b><small>后退</small></button></div><div class="walk-look" role="group" aria-label="转身与步速"><span class="walk-caption">拖动画面 · 环顾四周</span><div><button data-walk="turnLeft" aria-label="向左转身，按住持续转向">↶<small>左转</small></button><button data-walk="turnRight" aria-label="向右转身，按住持续转向">↷<small>右转</small></button></div><button id="walk-speed" aria-pressed="false">漫步 <span>／ 快走</span></button></div><div class="walk-reticle" aria-hidden="true"></div>`;
 document.querySelector('#gallery-ui').append(walkUI);
 const guide=document.createElement('section');guide.id='walk-guide';guide.setAttribute('aria-label','漫游操作指南');guide.hidden=true;
 guide.innerHTML=`<span class="guide-kicker">A LITTLE GUIDE</span><h3>自在走走，慢慢发现。</h3><div class="guide-desktop"><p><kbd>W A S D</kbd> / 方向键行走</p><p>拖动画面环顾 · 点击作品体验</p><small>Shift 快走 · Q / E 转身</small></div><div class="guide-mobile"><div><span>↕</span><p>左侧滑动行走</p></div><div><span>↔</span><p>右侧拖动环顾</p></div><small>轻点作品进入体验 · 松手停下</small></div><button id="walk-start">开始探索 ↗</button><div class="guide-extras"><button id="walk-assist" aria-pressed="false">显示辅助按键</button><button id="walk-home">回到入口</button></div>`;
 const guideButton=document.createElement('button');guideButton.id='walk-help';guideButton.textContent='?';guideButton.setAttribute('aria-label','查看漫游操作指南');guideButton.setAttribute('aria-expanded','false');guideButton.setAttribute('aria-controls','walk-guide');
 const joystick=document.createElement('div');joystick.id='walk-joystick';joystick.setAttribute('aria-hidden','true');joystick.innerHTML='<i></i>';
 document.querySelector('#gallery-ui').append(guide,guideButton,joystick);
 let guideSeen=false,assist=false,touchWalk=null,touchSide=0,touchForward=0;
 try{guideSeen=sessionStorage.getItem('vicky-walk-guide-v2')==='seen';}catch{}
 function closeGuide(remember=true){guide.hidden=true;guideButton.setAttribute('aria-expanded','false');if(remember){guideSeen=true;try{sessionStorage.setItem('vicky-walk-guide-v2','seen');}catch{}}}
 function showGuide(){clearInput();guide.hidden=false;guideButton.setAttribute('aria-expanded','true');}
 guideButton.onclick=()=>{if(guide.hidden)showGuide();else closeGuide();};
 guide.querySelector('#walk-start').onclick=()=>closeGuide();
 guide.querySelector('#walk-home').onclick=()=>{closeGuide();reset();};
 guide.querySelector('#walk-assist').onclick=e=>{assist=!assist;document.querySelector('#gallery-ui').classList.toggle('walk-assisted',assist);e.currentTarget.setAttribute('aria-pressed',String(assist));e.currentTarget.textContent=assist?'隐藏辅助按键':'显示辅助按键';closeGuide();};
 function stopTouchWalk(){touchWalk=null;touchSide=touchForward=0;joystick.classList.remove('active');}

 const heldKeys=new Set(),heldButtons=new Map(),velocity={x:0,z:0};let fastWalk=false;
 const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyQ:'turnLeft',KeyE:'turnRight'};
 function stopWalk(){heldKeys.clear();heldButtons.clear();velocity.x=velocity.z=0;walkUI.querySelectorAll('[data-walk]').forEach(b=>b.classList.remove('held'));}
 function clearInput(){stopWalk();stopTouchWalk();pan=null;pointers.clear();}
 function hasAction(action){return [...heldKeys].some(k=>keyMap[k]===action)||[...heldButtons.values()].some(b=>b.dataset.walk===action);}
 function stepButton(action){if(!eligible()||!cancelFlight())return;if(action==='turnLeft'||action==='turnRight')targetYaw+=action==='turnLeft'?.18:-.18;else{const forward=action==='forward'?1:action==='back'?-1:0,side=action==='right'?1:action==='left'?-1:0;stepWalk(aim,{x:0,z:0},{forward,side},yaw,.05,architecture.blockers);}}
 walkUI.querySelectorAll('[data-walk]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{if(!eligible()||!cancelFlight())return;closeGuide();e.preventDefault();heldButtons.set(e.pointerId,b);b.classList.add('held');b.setPointerCapture(e.pointerId);});
  const release=e=>{heldButtons.delete(e.pointerId);if(![...heldButtons.values()].includes(b))b.classList.remove('held');};
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>b.addEventListener(type,release));
  b.addEventListener('click',e=>{if(e.detail===0)stepButton(b.dataset.walk);});
 });
 walkUI.querySelector('#walk-speed').onclick=e=>{fastWalk=!fastWalk;e.currentTarget.setAttribute('aria-pressed',String(fastWalk));e.currentTarget.innerHTML=fastWalk?'快走 <span>／ 漫步</span>':'漫步 <span>／ 快走</span>';};
 function guardUI(e){if(e.target===canvas||walkUI.contains(e.target))return;clearInput();}
 function hidden(){if(document.hidden)clearInput();}
 addEventListener('blur',clearInput);document.addEventListener('visibilitychange',hidden);document.addEventListener('pointerdown',guardUI,true);document.addEventListener('focusin',guardUI);
 let lastRegion=-1;
 function visitRegion(i){closeGuide();const r=architecture.regions[i];if(!r||!enabled||document.querySelector('dialog[open]'))return;clearInput();focusLock=null;returnPose=null;pitch=targetPitch=0;const to=new T.Vector3(...r.eye),toward=new T.Vector3(...r.look);yaw=targetYaw=Math.atan2(toward.x-to.x,to.z-toward.z);flight={from:camera.position.clone(),to,lookFrom:look.clone(),lookTo:toward,age:0,duration:reduced?.01:2.2,arc:8,done:null};}
 regionUI.addEventListener('click',e=>{const b=e.target.closest('[data-zone]');if(b)visitRegion(Number(b.dataset.zone));});
 function resize(){mobile=innerWidth<=760;reflection.getRenderTarget().setSize(mobile?320:640,mobile?320:640);composer.setSize(innerWidth,innerHeight);ao.setSize(Math.round(innerWidth*.65),Math.round(innerHeight*.65));camera.aspect=innerWidth/innerHeight;camera.fov=mobile?76:66;camera.clearViewOffset();camera.updateProjectionMatrix();sun.shadow.mapSize.set(mobile?768:1536,mobile?768:1536);}
 function bound(){aim.y=T.MathUtils.clamp(aim.y,2.4,12);aim.x=T.MathUtils.clamp(aim.x,-38,102);aim.z=T.MathUtils.clamp(aim.z,-165,34);const dx=aim.x-camera.position.x,dz=aim.z-camera.position.z,n=Math.min(300,Math.ceil(Math.hypot(dx,dz)*2));let px=camera.position.x,pz=camera.position.z;for(let j=1;j<=n;j++){const x=camera.position.x+dx*j/n,z=camera.position.z+dz*j/n;if(architecture.blockers.some(b=>aim.y>b.minY-.2&&aim.y<b.maxY+.2&&Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2)){aim.x=px;aim.z=pz;break;}px=x;pz=z;}}
 function reset(instant=false){clearInput();pitch=targetPitch=0;flight=null;focusLock=null;returnPose=null;yaw=targetYaw=-.44;aim.set(10,4.5,10);if(instant){camera.position.copy(aim);look.set(-6,4.8,-24);camera.lookAt(look);}else{flight={from:camera.position.clone(),to:aim.clone(),lookFrom:look.clone(),lookTo:new T.Vector3(-6,4.8,-24),age:0,duration:reduced?.01:1.4,done:null};}setFocus(0);}
 function setFocus(i){if(i===selected||!entries[i])return;selected=i;onFocus(i);}
 function fly(i,open=false){
  const e=entries[i];if(!e)return;closeGuide();clearInput();setFocus(i);
  if(open&&!returnPose)returnPose={position:camera.position.clone(),aim:aim.clone(),look:look.clone(),yaw,targetYaw,pitch,targetPitch,focusLock};
  focusLock=i;
  const to=e.g.position.clone();normal.set(0,0,1).applyQuaternion(e.g.quaternion);to.addScaledVector(normal,mobile?6.4:6.8);to.y=e.g.position.y+.5;
  flight={from:camera.position.clone(),to,lookFrom:look.clone(),lookTo:e.g.position.clone(),age:0,duration:reduced?.01:Math.min(2,.75+camera.position.distanceTo(to)*.012),done:open?()=>onOpen(e.item):null};
 }
 function restore(){if(!returnPose)return;const saved=returnPose;returnPose=null;focusLock=saved.focusLock;yaw=saved.yaw;targetYaw=saved.targetYaw;pitch=saved.pitch;targetPitch=saved.targetPitch;flight={from:camera.position.clone(),to:saved.position,lookFrom:look.clone(),lookTo:saved.look,age:0,duration:reduced?.01:Math.min(2,.75+camera.position.distanceTo(saved.position)*.012),done:()=>aim.copy(saved.aim)};}
 function eligible(){return enabled&&!document.querySelector('dialog[open]')&&!document.querySelector('#gallery-list').checked;}
 function hit(e){const b=canvas.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2);ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(entries.filter(e=>e.g.visible&&e.opacity>.5).flatMap(e=>[e.art,e.back]))[0];if(!hit)return;const wall=ray.intersectObjects(architecture.occluders)[0];return wall&&wall.distance<hit.distance-.12?undefined:hit.object.userData.index;}
 function cancelFlight(){if(flight?.done)return false;if(focusLock!==null||flight){normal.subVectors(look,camera.position);yaw=targetYaw=Math.atan2(normal.x,-normal.z);pitch=targetPitch=Math.atan2(normal.y,Math.hypot(normal.x,normal.z));}focusLock=null;if(flight){flight=null;aim.copy(camera.position);}return true;}
 function pointerDown(e){
  if(!eligible()||!cancelFlight()||e.button>0)return;
  const move=(mobile||e.pointerType==='touch')&&e.clientX<innerWidth*.46&&!touchWalk;
  const gesture={id:e.pointerId,x:e.clientX,y:e.clientY,angle:targetYaw,pitch:targetPitch,moved:false,role:move?'walk':'look'};
  if(pointers.size){gesture.moved=true;pointers.forEach(g=>g.moved=true);}
  pointers.set(e.pointerId,gesture);if(move)touchWalk=gesture;else if(!pan)pan=gesture;
  canvas.setPointerCapture(e.pointerId);
 }
 function pointerMove(e){if(!eligible())return;
  const g=pointers.get(e.pointerId);
  if(g){const dx=e.clientX-g.x,dy=e.clientY-g.y,dist=Math.hypot(dx,dy);
   if(dist>8){g.moved=true;closeGuide();}
   if(g===touchWalk&&g.moved){
    const radius=46,scale=dist>radius?radius/dist:1,strength=Math.min(1,Math.max(0,(dist-6)/(radius-6)));
    touchSide=dist?dx/dist*strength:0;touchForward=dist?-dy/dist*strength:0;
    joystick.classList.add('active');joystick.style.left=g.x+'px';joystick.style.top=g.y+'px';joystick.firstElementChild.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
   }else if(g===pan){targetYaw=g.angle-dx*(mobile?.005:.0035);targetPitch=T.MathUtils.clamp(g.pitch+dy*(mobile?.0035:.0025),-.85,.85);}
   canvas.style.cursor='grabbing';
  }else if(e.pointerType!=='touch'){const h=hit(e);hovered=h??-1;canvas.style.cursor=h===undefined?'grab':'pointer';}
 }
 function pointerUp(e){const g=pointers.get(e.pointerId),click=eligible()&&g&&!g.moved&&pointers.size===1;
  pointers.delete(e.pointerId);if(g===touchWalk)stopTouchWalk();if(g===pan)pan=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  if(click){closeGuide();const i=hit(e);if(i!==undefined)fly(i,true);else if(!reduced){const waterHit=ray.intersectObject(reflection)[0];if(waterHit){reflection.material.uniforms.uTouch.value.set(waterHit.point.x,-waterHit.point.z);reflection.material.uniforms.uTouchTime.value=waterTime.value;}}}
 }
 function pointerCancel(e){const g=pointers.get(e.pointerId);pointers.delete(e.pointerId);if(g&&g===touchWalk)stopTouchWalk();if(g&&g===pan)pan=null;}
 function key(e){if(!eligible()||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  if(keyMap[e.code]||e.code==='ShiftLeft'||e.code==='ShiftRight'){closeGuide();e.preventDefault();if(!heldKeys.has(e.code)&&cancelFlight())heldKeys.add(e.code);}
  if(e.key==='Escape'){closeGuide();clearInput();if(!flight?.done)cancelFlight();}
  if(e.key==='Enter'&&!e.target.closest('button,a')&&selected>=0){e.preventDefault();fly(selected,true);}
 }
 function keyUp(e){heldKeys.delete(e.code);}
 const listeners=[['pointerdown',pointerDown],['pointermove',pointerMove],['pointerup',pointerUp],['pointercancel',pointerCancel],['lostpointercapture',pointerCancel]];listeners.forEach(([type,fn])=>canvas.addEventListener(type,fn));addEventListener('keydown',key);addEventListener('keyup',keyUp);
 let measuredFrames=0,measuredTime=0;
 function update(dt,time,isReduced){
  reduced=isReduced;dt=Math.min(dt,.05);
  if(!eligible())clearInput();
  if(!flight&&eligible()){
   const turn=Number(hasAction('turnLeft'))-Number(hasAction('turnRight'));targetYaw+=turn*dt*1.1;
   stepWalk(aim,velocity,{forward:Number(hasAction('forward'))-Number(hasAction('back'))+touchForward,side:Number(hasAction('right'))-Number(hasAction('left'))+touchSide,fast:fastWalk||heldKeys.has('ShiftLeft')||heldKeys.has('ShiftRight')},yaw,dt,architecture.blockers);
  }
  if(flight){flight.age+=dt;const t=Math.min(1,flight.age/flight.duration),s=t*t*t*(t*(t*6-15)+10);camera.position.lerpVectors(flight.from,flight.to,s);if(flight.arc)camera.position.y+=Math.sin(s*Math.PI)*flight.arc;look.lerpVectors(flight.lookFrom,flight.lookTo,s);camera.lookAt(look);if(t===1){aim.copy(camera.position);const done=flight.done;flight=null;done?.();}}
  else{camera.position.copy(aim);if(focusLock!==null&&entries[focusLock])look.copy(entries[focusLock].g.position);else{yaw=T.MathUtils.damp(yaw,targetYaw,reduced?40:8,dt);pitch=T.MathUtils.damp(pitch,targetPitch,reduced?40:12,dt);look.set(camera.position.x+Math.sin(yaw)*Math.cos(pitch)*24,camera.position.y+Math.sin(pitch)*24,camera.position.z-Math.cos(yaw)*Math.cos(pitch)*24);}camera.lookAt(look);}
  camera.updateMatrixWorld();sun.position.set(camera.position.x-30,40,camera.position.z+20);sun.target.position.set(camera.position.x,0,camera.position.z-20);sun.target.updateMatrixWorld();
  floor.position.set(camera.position.x,-.12,camera.position.z);reflection.position.set(0,.64,0);dome.position.copy(camera.position);waterTime.value=reduced?0:time;if(reduced)reflection.material.uniforms.uTouchTime.value=-100;
  architecture.update(time,reduced);
  let region=0,regionDist=Infinity;architecture.regions.forEach((r,i)=>{const d=Math.hypot(camera.position.x-r.x,camera.position.z-r.z);if(d<regionDist){regionDist=d;region=i;}});
  if(region!==lastRegion){lastRegion=region;regionUI.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===region)));document.querySelector('#gallery-ui').dataset.zone=region;}

  let nearest=selected,best=Infinity;normal.subVectors(look,camera.position).normalize();
  entries.forEach((e,i)=>{const dz=camera.position.distanceTo(e.g.position);e.g.visible=dz<160;e.shadow.position.set(e.g.position.x,.075,e.g.position.z);e.opacity=T.MathUtils.damp(e.opacity,focusLock!==null&&focusLock!==i?.08:1,reduced?100:7,dt);e.materials.forEach(m=>{m.transparent=e.opacity<.99;m.opacity=e.opacity;m.depthWrite=e.opacity>.5;});e.stem.visible=e.opacity>.5;e.frame.castShadow=e.opacity>.5;e.shadow.visible=false;if(e.g.visible){e.frame.material.emissive.set(i===hovered?'#a6b99d':'#000000');e.frame.material.emissiveIntensity=i===hovered?.16:0;projected.copy(e.g.position).project(camera);if((e.g.position.x-camera.position.x)*normal.x+(e.g.position.z-camera.position.z)*normal.z>3&&Math.abs(projected.x)<.85&&Math.abs(projected.y)<.7){const score=Math.abs(projected.x)*8+dz*.11;if(score<best){best=score;nearest=i;}}}});
  if(focusLock===null&&!flight&&!pan&&nearest>=0)setFocus(nearest);
  dust.position.set(camera.position.x,reduced?0:Math.sin(time*.3)*.1,camera.position.z-15);
  const oldExposure=renderer.toneMappingExposure;renderer.toneMappingExposure=.94;renderer.info.reset();composer.render(dt);renderer.toneMappingExposure=oldExposure;
  measuredFrames++;measuredTime+=dt;if(measuredTime>=1){const dbg=document.querySelector('#debug');dbg.textContent=`${innerWidth}×${innerHeight} | ${Math.round(measuredFrames/measuredTime)} fps | ${renderer.info.render.calls} calls | ${renderer.info.render.triangles} triangles | immersive`;dbg.dataset.view='immersive';dbg.dataset.camera=[camera.position.x,camera.position.y,camera.position.z].map(x=>x.toFixed(2)).join(',');dbg.dataset.works=entries.length;dbg.dataset.orientation=[yaw,pitch].map(x=>x.toFixed(3)).join(',');dbg.dataset.walking=String(Math.hypot(velocity.x,velocity.z)>.05);measuredTime=0;measuredFrames=0;}
 }
 function activate(value){enabled=value;clearInput();hovered=-1;if(value&&!guideSeen)showGuide();else closeGuide(false);if(!value){flight=null;returnPose=null;focusLock=null;}resize();}
 function dispose(){listeners.forEach(([type,fn])=>canvas.removeEventListener(type,fn));removeEventListener('keydown',key);removeEventListener('keyup',keyUp);removeEventListener('blur',clearInput);document.removeEventListener('visibilitychange',hidden);document.removeEventListener('pointerdown',guardUI,true);document.removeEventListener('focusin',guardUI);walkUI.remove();guide.remove();guideButton.remove();joystick.remove();clearCollection();regionUI.remove();filterToggle.remove();architecture.dispose();ao.dispose();renderPass.dispose();output.dispose();smaa.dispose();composer.dispose();reflection.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());ownedTextures.forEach(t=>t.dispose());sun.shadow.dispose();}
 return {setItems,activate,resize,update,reset,focus:i=>fly(i,false),open:i=>fly(i,true),restore,zoom:delta=>{if(cancelFlight()){aim.z+=delta*Math.cos(targetYaw);aim.x-=delta*Math.sin(targetYaw);bound();}},dispose};
}
