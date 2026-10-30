import {initLanguage} from './i18n.js';
import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ASSETS} from './assets.js';
import {createPortfolio} from './portfolio.js';
initLanguage();
let portfolio;

const $=s=>document.querySelector(s),v=(x,y,z)=>new T.Vector3(x,y,z),clamp=T.MathUtils.clamp;
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=motionQuery.matches,mobile=innerWidth<=760,mode='home',active=0,busy=false,elapsed=0,frame=0,stopped=false,last=performance.now(),tween=null;
let pointerDown=null,dragged=false,pulse=0,hover=0,enterAmount=0,enterTarget=0;
const offset=new T.Vector2(),pointer=new T.Vector2(),aim=new T.Vector2(),touchPoint=v(0,0,0),portalCenter=v(3.45,3.05,-1.8);
const projects=[
 {name:'万物生花',en:'Everything Blooms',type:'01 / PLAYABLE · WAKU',desc:'触碰日常，让一座花园慢慢生长。\n把生成的想象，变成指尖可以参与的体验。',detail:'从日常的物体和空间出发，让花朵沿着画面生长。视觉、动态与触碰反馈共同构成一段轻盈的探索。',tags:'生成美术 · 触碰交互 · 情绪体验',note:'首页原型展示：已接入本项目的真实开场影像。完整种花玩法尚未接入，当前用于评审首页空间与进入作品的体验。',image:ASSETS.blooms,video:ASSETS.bloomVideo},
 {name:'今天再喜欢我一次',en:'Meet Me Again',type:'02 / INTERACTIVE STORY',desc:'走近一个人，走进一段故事。\n用人物、镜头与选择，让观看成为参与。',detail:'用角色设计、表演与镜头建立亲密感，让观众的选择参与故事。这里展示该项目现有的一段影像。',tags:'角色设计 · 影像叙事 · 交互剧集',note:'首页原型展示：已接入本项目现有的一个真实片段。完整分支播放器尚未接入，当前用于评审转场与观看方式。',image:ASSETS.meet,video:ASSETS.meetVideo}
];
const scene=new T.Scene(),camera=new T.PerspectiveCamera(43,innerWidth/innerHeight,.1,180);
const base=v(0,0,0),look=v(0,0,0),cameraPosition=v(0,0,0),cameraLook=v(0,0,0);
let renderer,reflector,env,particleMaterial,particles,art,portalLight,frameMat,sky;
let randomSeed=918;const random=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;};
const ownedTextures=new Set(),anim=[];
function texture(draw,n=512){const c=document.createElement('canvas');c.width=c.height=n;draw(c.getContext('2d'),n);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;ownedTextures.add(t);return t;}
const plaster=texture((c,n)=>{c.fillStyle='#f5e6dc';c.fillRect(0,0,n,n);const d=c.getImageData(0,0,n,n);for(let i=0;i<d.data.length;i+=4){const a=(random()-.5)*17;for(let j=0;j<3;j++)d.data[i+j]+=a;}c.putImageData(d,0,0);});
plaster.wrapS=plaster.wrapT=T.RepeatWrapping;plaster.repeat.set(3,3);
const tile=texture((c,n)=>{c.fillStyle='#eee8d4';c.fillRect(0,0,n,n);c.strokeStyle='#bac8b9';c.lineWidth=1.5;for(let x=0;x<=n;x+=n/4){c.beginPath();c.moveTo(x,0);c.lineTo(x,n);c.stroke();c.beginPath();c.moveTo(0,x);c.lineTo(n,x);c.stroke();}});tile.wrapS=tile.wrapT=T.RepeatWrapping;tile.repeat.set(3,2);
const grass=texture((c,n)=>{c.fillStyle='#80955c';c.fillRect(0,0,n,n);for(let i=0;i<45000;i++){const a=random();c.fillStyle=`rgba(${40+a*50},${65+a*75},${28+a*40},.28)`;c.fillRect(random()*n,random()*n,.5,1+random()*3);}});grass.wrapS=grass.wrapT=T.RepeatWrapping;grass.repeat.set(9,9);
const pink=new T.MeshStandardMaterial({color:'#dc94a2',roughness:.56,map:plaster,bumpMap:plaster,bumpScale:.009});
const pinkEdge=new T.MeshPhysicalMaterial({color:'#e3a8b3',roughness:.28,clearcoat:.6,clearcoatRoughness:.24});
const cream=new T.MeshStandardMaterial({color:'#f3d8bb',roughness:.66,map:plaster});
const floorMat=new T.MeshStandardMaterial({color:'#bdcfc5',roughness:.32,map:tile,bumpMap:tile,bumpScale:.006});
const mint=new T.MeshPhysicalMaterial({color:'#7cbcaf',roughness:.23,clearcoat:.85,clearcoatRoughness:.18,metalness:.08});
const metal=new T.MeshStandardMaterial({color:'#d3b18b',metalness:.8,roughness:.25});
const lampMat=new T.MeshBasicMaterial({color:'#fff4ca',toneMapped:false});
function mesh(g,m,parent=scene){const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(w,h,d,x,y,z,mat=cream,r=.04,parent=scene){const o=mesh(r?new RoundedBoxGeometry(w,h,d,3,r):new T.BoxGeometry(w,h,d),mat,parent);o.position.set(x,y,z);return o;}
function roundedPath(x,y,w,h,r){const s=new T.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;}
function ring(x,y,z,w,h,r,t,depth,mat){const s=roundedPath(-w/2,-h/2,w,h,r);s.holes.push(new T.Path(roundedPath(-w/2+t,-h/2+t,w-t*2,h-t*2,Math.max(.02,r-t)).getPoints(32)));const o=mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:24}),mat);o.position.set(x,y,z);return o;}
function sign(text,w,h,x,y,z){const c=document.createElement('canvas');c.width=1024;c.height=128;const a=c.getContext('2d');a.fillStyle='#554751';a.textAlign='center';a.textBaseline='middle';a.font='32px Arial';a.fillText(text,512,64);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;ownedTextures.add(t);const o=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),scene);o.position.set(x,y,z);o.castShadow=false;return o;}
const contactTex=texture((c,n)=>{let g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(63,47,63,.38)');g.addColorStop(.45,'rgba(63,47,63,.16)');g.addColorStop(1,'rgba(63,47,63,0)');c.fillStyle=g;c.fillRect(0,0,n,n);},128);
function contact(x,z,w,d,y){const o=mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:contactTex,transparent:true,depthWrite:false}));o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.castShadow=false;}

function architecture(){
 // A single open station facade, with two actual openings and no back wall.
 const wall=roundedPath(-5,0,10,6.6,.24);wall.holes.push(new T.Path(roundedPath(-4.25,1.65,3.2,3.85,.64).getPoints(40)));wall.holes.push(new T.Path(roundedPath(.04,.57,2.9,4.85,.82).getPoints(48)));
 const facade=mesh(new T.ExtrudeGeometry(wall,{depth:.58,bevelEnabled:true,bevelSegments:3,bevelSize:.07,bevelThickness:.07,curveSegments:32}),pink);facade.position.set(2,0,-2.5);
 ring(3.49,2.995,-1.87,3.13,5.1,.92,.115,.1,cream);ring(-.65,3.575,-1.87,3.38,4.04,.7,.09,.05,pinkEdge);
 box(10.7,.22,2.45,2,6.55,-1.75,pinkEdge,.08);box(10.3,.08,1.9,2,6.39,-1.65,cream);
 box(.075,5.9,.075,6.7,3.1,-.52,metal,.028);box(.075,5.9,.075,-2.75,3.1,-.52,metal,.028);
 box(12,.32,6,1.5,.16,-.1,pink,.11);box(11.8,.07,5.85,1.5,.355,-.1,floorMat,.04);
 // Broad steps catch the sunset; their volumes remain visible during the entry dolly.
 for(let i=0;i<3;i++){box(4.15-i*.18,.16,1.7-i*.36,3.45,.08+i*.105,3.24-i*.35,cream,.035);}
 box(10.3,.08,.08,2,.48,2.68,cream,.02);sign('S O M E W H E R E   /   0 1',3,.32,3.45,5.9,-1.83);
 // Small mint bench, formed upholstery rather than a rectangular placeholder.
 for(let i=0;i<3;i++){let x=-1.72+i*1.03;box(.99,.18,.9,x,.98,-.55,mint,.15);let b=box(.99,1.1,.19,x,1.55,-.94,mint,.16);b.rotation.x=-.13;box(.72,.05,.07,x,.8,-.55,metal,.02);}
 for(let x of[-1.85,.45]){box(.06,.58,.06,x,.67,-.7,metal,.02);box(.06,.58,.06,x,.67,-.1,metal,.02);box(.06,.07,.8,x,.43,-.4,metal,.02);}contact(-.7,-.45,4,2,.397);
 // Few engraved seams and warm ceiling strips — details stay restrained.
 for(let x of[-2.5,-1,.5,2,3.5,5,6.5])box(.014,.01,5.6,x,.396,-.1,new T.MeshStandardMaterial({color:'#a5b7ac',roughness:.6}),0);
 box(1.85,.025,.08,3.45,6.325,-1.35,lampMat,.01);box(1.8,.025,.08,-.65,6.325,-1.35,lampMat,.01);
 // One quiet curved path beyond the open doorway.
 const landGeo=new T.PlaneGeometry(100,90,100,80);landGeo.rotateX(-Math.PI/2);const p=landGeo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i)-48;const y=-.7+2.2*Math.exp(-((x+10)**2/180+(z+24)**2/150))+3.5*Math.exp(-((x-18)**2/240+(z+39)**2/350));p.setZ(i,z);p.setY(i,y);}landGeo.computeVertexNormals();const land=mesh(landGeo,new T.MeshStandardMaterial({map:grass,color:'#80935d',roughness:1}));land.castShadow=false;
 const pathPos=[],pathIdx=[];for(let i=0;i<=60;i++){const z=-7-i*.45,x=3.5+Math.sin(i*.075)*2.6;for(const side of[-1,1]){const xx=x+side*.5;const y=-.7+2.2*Math.exp(-((xx+10)**2/180+(z+24)**2/150))+3.5*Math.exp(-((xx-18)**2/240+(z+39)**2/350))+.035;pathPos.push(xx,y,z);}if(i<60){const k=i*2;pathIdx.push(k,k+2,k+1,k+1,k+2,k+3);}}const roadGeo=new T.BufferGeometry();roadGeo.setAttribute('position',new T.Float32BufferAttribute(pathPos,3));roadGeo.setIndex(pathIdx);roadGeo.computeVertexNormals();const road=mesh(roadGeo,cream);road.castShadow=false;
  // Oversized pearl sun is deliberately surreal, beyond the station.
 const sunBall=mesh(new T.SphereGeometry(1.8,48,32),new T.MeshStandardMaterial({color:'#ffd5a2',emissive:'#eaa878',emissiveIntensity:.25,roughness:1}));sunBall.position.set(10,6,-28);sunBall.castShadow=false;
 // A tiny patch of stems, kept at the platform edge.
 const stemMat=new T.MeshStandardMaterial({color:'#81946d',roughness:.8});const petalMat=new T.MeshStandardMaterial({color:'#ffefdd',roughness:.7,side:T.DoubleSide});
 const flowers=new T.Group();scene.add(flowers);const stems=new T.InstancedMesh(new T.CylinderGeometry(.009,.014,1,4),stemMat,22),petals=new T.InstancedMesh(new T.SphereGeometry(1,5,4),petalMat,132),centers=new T.InstancedMesh(new T.SphereGeometry(.032,6,5),new T.MeshStandardMaterial({color:'#d9ad51'}),22);flowers.add(stems,petals,centers);const dummy=new T.Object3D();
 for(let i=0;i<22;i++){const x=6.1+random()*1.6,z=.2+random()*1.6,h=.25+random()*.6;dummy.position.set(x,.38+h/2,z);dummy.rotation.set(0,0,(random()-.5)*.15);dummy.scale.set(1,h,1);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix);dummy.position.y=.38+h;dummy.scale.setScalar(1);dummy.rotation.set(0,0,0);dummy.updateMatrix();centers.setMatrixAt(i,dummy.matrix);for(let j=0;j<6;j++){const a=j*Math.PI/3;dummy.position.set(x+Math.cos(a)*.055,.38+h,z+Math.sin(a)*.055);dummy.scale.set(.065,.012,.024);dummy.rotation.y=-a;dummy.updateMatrix();petals.setMatrixAt(i*6+j,dummy.matrix);}}
 anim.push(flowers);contact(6.65,.85,2.2,2.2,.4);
}
function water(){
 const shader={uniforms:{...T.UniformsUtils.clone(Reflector.ReflectorShader.uniforms),uTime:{value:0},uTouch:{value:new T.Vector2(0,0)},uRipple:{value:0}},vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 p;void main(){vUv=textureMatrix*vec4(position,1.);p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime;uniform vec2 uTouch;uniform float uRipple;varying vec4 vUv;varying vec3 p;void main(){vec2 uv=vUv.xy/vUv.w;float t=uTime*.27;float d=distance(p.xy,uTouch);float ripple=sin(d*8.-uTime*4.)*exp(-d*.32)*uRipple;vec2 wave=vec2(sin(p.x*1.5+p.y*.7+t)+sin(p.y*3.5-t),cos(p.y*1.5-p.x*.6+t)+sin(p.x*2.3+t))*.0014+vec2(ripple*.002);vec3 reflected=texture2D(tDiffuse,uv+wave).rgb;float sunline=pow(max(0.,sin(p.x*3.7+p.y*2.+sin(p.y+t))*cos(p.y*2.7-t)),24.);vec3 col=mix(vec3(.31,.46,.46),reflected,.83)+sunline*.025;gl_FragColor=vec4(col,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`};
 reflector=new Reflector(new T.PlaneGeometry(180,160),{textureWidth:mobile?512:1024,textureHeight:mobile?512:1024,multisample:0,clipBias:.003,shader});reflector.rotation.x=-Math.PI/2;reflector.position.set(0,-.04,2);scene.add(reflector);
}
function buildParticles(){
 const count=6200,positions=new Float32Array(count*3),seeds=new Float32Array(count),colors=new Float32Array(count*3),targets=new Float32Array(count*3),c=new T.Color();
 for(let i=0;i<count;i++){const a=random()*Math.PI*2,b=random()*Math.PI*2;const r=.95+.18*Math.sin(a*5)+random()*.065;positions[i*3]=Math.cos(a*2)*(.78+.22*Math.cos(a*3))+Math.cos(b)*.075;positions[i*3+1]=Math.sin(a*2)*(.78+.22*Math.cos(a*3))+Math.sin(b)*.075;positions[i*3+2]=Math.sin(a*3)*.4+(random()-.5)*.12;seeds[i]=random();const spread=1.6+random()*2.7;targets[i*3]=Math.cos(a)*spread;targets[i*3+1]=Math.sin(a)*spread;targets[i*3+2]=(random()-.5)*7;c.setHSL(.07+random()*.12,.4+random()*.2,.66+random()*.23);if(i%3===0)c.set('#c4e9db');if(i%7===0)c.set('#f1c4e0');c.toArray(colors,i*3);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));g.setAttribute('aSeed',new T.BufferAttribute(seeds,1));g.setAttribute('color',new T.BufferAttribute(colors,3));g.setAttribute('aTarget',new T.BufferAttribute(targets,3));
 particleMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending,uniforms:{uTime:{value:0},uScatter:{value:0},uEnter:{value:0},uPointer:{value:new T.Vector3(100,100,0)},uScale:{value:innerHeight/720},uOpacity:{value:1}},vertexShader:`attribute float aSeed;attribute vec3 aTarget;uniform float uTime,uScatter,uEnter,uScale;uniform vec3 uPointer;varying vec3 vColor;varying float vAlpha;void main(){vec3 p=position;float a=uTime*.15;mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));p.xz=rot*p.xz;p.y+=sin(uTime*.65+aSeed*40.)*.035;float d=distance(p.xy,uPointer.xy);vec2 dir=normalize(p.xy-uPointer.xy+vec2(.001));p.xy+=dir*exp(-d*d*3.)*uScatter*.8;p=mix(p,aTarget,smoothstep(0.,1.,uScatter)*.48);p+=aTarget*uEnter*2.6;p.z+=uEnter*(3.+aSeed*12.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((17.+aSeed*16.)*uScale/max(1.,-mv.z),1.,7.);vColor=color;vAlpha=.45+.55*sin(aSeed*130.+uTime*.6)*sin(aSeed*130.+uTime*.6);}`,fragmentShader:`varying vec3 vColor;varying float vAlpha;uniform float uOpacity;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=pow(1.-d*2.,1.6);gl_FragColor=vec4(vColor*1.3,a*vAlpha*uOpacity);\n#include <colorspace_fragment>\n}`});
 particles=new T.Points(g,particleMaterial);particles.position.copy(portalCenter);particles.frustumCulled=false;scene.add(particles);
 // A sparse halo lends the sculpture a soft edge without fullscreen post effects.
 const halo=texture((ctx,n)=>{const grd=ctx.createRadialGradient(n/2,n/2,0,n/2,n/2,n*.5);grd.addColorStop(0,'rgba(255,222,177,.1)');grd.addColorStop(.3,'rgba(255,219,197,.05)');grd.addColorStop(1,'rgba(255,200,200,0)');ctx.fillStyle=grd;ctx.fillRect(0,0,n,n);},128);portalLight=mesh(new T.PlaneGeometry(4,4),new T.MeshBasicMaterial({map:halo,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));portalLight.position.copy(portalCenter);portalLight.position.z+=.3;portalLight.castShadow=false;
}
function homeCamera(){return mobile?{p:v(6.8,5.3,31),l:v(2,6.6,-1)}:{p:v(11,5.4,18.3),l:v(-.8,2.9,-1.5)};}
function worksCamera(){return mobile?{p:v(3.6,3.7,11.5),l:v(3.45,1.05,-2)}:{p:v(7.1,3.7,11.4),l:v(.75,3,-2)};}
function moveCamera(target,duration=1600,done){tween={from:base.clone(),to:target.p,fromLook:look.clone(),toLook:target.l,start:performance.now(),duration:reduced?100:duration,done};busy=true;document.body.classList.add('busy');offset.set(0,0);}
function pulseParticles(){pulse=1.35;$('#status').textContent='';if(reduced){$('#status').textContent='已开启静态模式；点击 ≈ 可恢复粒子动态。';setTimeout(()=>$('#status').textContent='',2800);}}
function explore(){if(busy||portfolio?.active)return;mode='entering';$('#intro').classList.add('hide');$('#intro').inert=true;enterTarget=1;moveCamera({p:v(3.45,3.1,1.7),l:v(3.45,3.1,-5)},1100,()=>{enterTarget=0;mode='gallery';portfolio.show('waku');});}
function goHome(){mode='home';document.body.dataset.view='home';$('#intro').classList.remove('hide');$('#intro').inert=false;$('#scene-label').hidden=false;enterTarget=0;const h=homeCamera();base.copy(h.p);look.copy(h.l);camera.position.copy(base);}
function ui(){
 $('#explore').onclick=explore;$('#portal-button').onclick=explore;$('#home').onclick=()=>{if(portfolio?.active)portfolio.home();else goHome();};$('#catalog-open').onclick=()=>{if(portfolio)portfolio.show('waku');};$('#particles').onclick=pulseParticles;
 const setMotion=()=>{$('#motion').setAttribute('aria-pressed',String(reduced));$('#motion').setAttribute('aria-label',reduced?'恢复动态效果':'减少动态效果');};setMotion();$('#motion').onclick=()=>{reduced=!reduced;setMotion();};motionQuery.addEventListener('change',e=>{reduced=e.matches;setMotion();});
}
const ray=new T.Raycaster(),worldPoint=v(0,0,0),intersectPlane=new T.Plane(v(0,0,1),1.8),screen=v(0,0,0);
function input(){const c=renderer.domElement;c.addEventListener('pointerdown',e=>{if(busy||portfolio?.active)return;const bounds=c.getBoundingClientRect();pointer.set((e.clientX-bounds.left)/bounds.width*2-1,1-(e.clientY-bounds.top)/bounds.height*2);pointerDown={x:e.clientX,y:e.clientY,time:performance.now()};dragged=false;c.setPointerCapture(e.pointerId);pulse=.7;});c.addEventListener('pointermove',e=>{if(portfolio?.active)return;const rect=c.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);aim.copy(pointer);ray.setFromCamera(pointer,camera);if(ray.ray.intersectPlane(intersectPlane,worldPoint)){touchPoint.copy(worldPoint).sub(portalCenter);hover=touchPoint.length()<1.8?1:0;particleMaterial.uniforms.uPointer.value.copy(touchPoint);}if(pointerDown){const dx=e.clientX-pointerDown.x,dy=e.clientY-pointerDown.y;if(Math.abs(dx)+Math.abs(dy)>8)dragged=true;if(mode==='home'){offset.x=clamp(dx/innerWidth,-.7,.7);offset.y=clamp(dy/innerHeight,-.3,.3);}pulse=Math.max(pulse,hover*.6);}c.style.cursor=hover?'pointer':pointerDown?'grabbing':'grab';});
 c.addEventListener('pointerup',e=>{if(portfolio?.active||!pointerDown)return;const dx=e.clientX-pointerDown.x,dy=e.clientY-pointerDown.y;if(mode==='works'&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){if(!busy)selectProject(active+(dx<0?1:-1));}else if(!dragged&&mode==='home'){ray.setFromCamera(pointer,camera);if(ray.ray.intersectPlane(intersectPlane,worldPoint)&&worldPoint.distanceTo(portalCenter)<2){explore();}else pulseParticles();}pointerDown=null;if(c.hasPointerCapture(e.pointerId))c.releasePointerCapture(e.pointerId);});c.addEventListener('pointercancel',()=>pointerDown=null);c.addEventListener('pointerleave',()=>{hover=0;aim.set(0,0);});
 let wheelSum=0;c.addEventListener('wheel',e=>{e.preventDefault();if(busy||portfolio?.active||mode!=='home')return;wheelSum+=e.deltaY;if(wheelSum>100){wheelSum=0;explore();}},{passive:false});
}
function resize(){const wasMobile=mobile;mobile=innerWidth<=760;camera.aspect=innerWidth/innerHeight;camera.fov=mobile?43:43;camera.updateProjectionMatrix();if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.4:1.6));renderer.setSize(innerWidth,innerHeight);reflector?.getRenderTarget().setSize(mobile?512:1024,mobile?512:1024);}if(particleMaterial)particleMaterial.uniforms.uScale.value=innerHeight/720;if(wasMobile!==mobile||!tween){const t=mode==='home'?homeCamera():worksCamera();base.copy(t.p);look.copy(t.l);}if(wasMobile!==mobile&&tween){const t=mode==='home'?homeCamera():worksCamera();tween.to.copy(t.p);tween.toLook.copy(t.l);} }
function setup(){ui();try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(err){$('#load-label').textContent='当前浏览器无法开启三维画面，可以先查看作品。';$('#load-label').textContent='当前浏览器无法开启三维画面，请使用支持 WebGL 的浏览器。';return;}
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.info.autoReset=false;$('#world').append(renderer.domElement);
 const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();env=pm.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.45;room.dispose();pm.dispose();scene.background=new T.Color('#94b4d5');
 scene.add(new T.HemisphereLight('#c5dcff','#bb9a91',.8));const sun=new T.DirectionalLight('#ffe0bf',3.1);sun.position.set(-12,13,10);sun.target.position.set(2,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:14,bottom:-12,near:1,far:55});sun.shadow.bias=-.00015;sun.shadow.normalBias=.03;sun.shadow.radius=4;scene.add(sun,sun.target);const blue=new T.DirectionalLight('#adbfff',.65);blue.position.set(4,8,-7);scene.add(blue);
 const manager=new T.LoadingManager();let loadFailed=false;manager.onProgress=(_,loaded,total)=>$('#progress').style.width=(20+loaded/total*80)+'%';manager.onError=()=>{loadFailed=true;$('#status').textContent='部分素材未载入，可从作品索引继续浏览。';};manager.onLoad=()=>{setTimeout(()=>{$('#loader').classList.add('hide');$('#loader').inert=true;},100);};const loader=new T.TextureLoader(manager);
 const skyTex=loader.load(ASSETS.sky);skyTex.colorSpace=T.SRGBColorSpace;ownedTextures.add(skyTex);sky=mesh(new T.PlaneGeometry(480,210),new T.MeshBasicMaterial({map:skyTex,toneMapped:false,depthWrite:false}));sky.position.set(-30,40,-65);sky.castShadow=false;sky.receiveShadow=false;sky.renderOrder=-10;
 architecture();water();buildParticles();
 for(const p of projects){p.texture=loader.load(p.image);p.texture.colorSpace=T.SRGBColorSpace;ownedTextures.add(p.texture);}
 art=mesh(new T.PlaneGeometry(2.43,4.12),new T.MeshBasicMaterial({map:projects[0].texture,transparent:true,opacity:0,toneMapped:false}));art.position.set(3.45,2.95,-1.99);art.visible=false;art.castShadow=false;
 portfolio=createPortfolio(renderer,env.texture,goHome);resize();const h=homeCamera();base.copy(h.p);look.copy(h.l);camera.position.copy(base);camera.lookAt(look);input();frame=requestAnimationFrame(loop);addEventListener('resize',resize);if(location.search.includes('debug'))document.body.classList.add('debug');
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();stopped=true;$('#status').textContent='三维画面暂时中断，请刷新恢复。作品索引仍可浏览。';});
}
let fpsFrames=0,fpsSince=performance.now();
function loop(now){if(stopped)return;frame=requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden||document.querySelector('dialog[open]')){fpsSince=now;fpsFrames=0;return;}if(!reduced&&!document.querySelector('dialog[open]'))elapsed+=dt;
 if(portfolio?.active){portfolio.update(dt,elapsed,reduced);return;}
 if(tween){const a=clamp((now-tween.start)/tween.duration,0,1),e=a*a*a*(a*(a*6-15)+10);base.lerpVectors(tween.from,tween.to,e);look.lerpVectors(tween.fromLook,tween.toLook,e);if(a===1){const done=tween.done;tween=null;busy=false;document.body.classList.remove('busy');done?.();}}
 cameraPosition.copy(base);cameraLook.copy(look);if(!reduced&&!busy){cameraPosition.x+=aim.x*.12+offset.x*1.5;cameraPosition.y+=aim.y*.055-offset.y*.4;cameraLook.x+=offset.x*.65;}camera.position.lerp(cameraPosition,1-Math.exp(-dt*8));camera.lookAt(cameraLook);
 pulse=Math.max(0,pulse-dt*.6);enterAmount=T.MathUtils.lerp(enterAmount,enterTarget,1-Math.exp(-dt*3));const scatter=reduced?0:clamp(pulse+hover*.25,0,1);particleMaterial.uniforms.uScatter.value=T.MathUtils.lerp(particleMaterial.uniforms.uScatter.value,scatter,1-Math.exp(-dt*4));particleMaterial.uniforms.uTime.value=elapsed;particleMaterial.uniforms.uEnter.value=reduced?0:enterAmount;particleMaterial.uniforms.uOpacity.value=T.MathUtils.lerp(particleMaterial.uniforms.uOpacity.value,mode==='home'?1:enterTarget?1:.055,1-Math.exp(-dt*3));particles.rotation.z=Math.sin(elapsed*.12)*.1;
 reflector.material.uniforms.uTime.value=elapsed;reflector.material.uniforms.uRipple.value=scatter;reflector.material.uniforms.uTouch.value.set(worldPoint.x,worldPoint.z);if(art.visible)art.material.opacity=T.MathUtils.lerp(art.material.opacity,1,1-Math.exp(-dt*2.5));portalLight.visible=mode==='home';anim.forEach(o=>{o.rotation.z=Math.sin(elapsed*.6)*.002;});
 screen.copy(portalCenter).project(camera);const hotspot=$('#portal-button');if(mode==='home'&&!busy&&screen.z<1){hotspot.style.display='block';hotspot.style.left=(screen.x*.5+.5)*innerWidth+'px';hotspot.style.top=(-screen.y*.5+.5)*innerHeight+'px';}else hotspot.style.display='none';
 renderer.info.reset();renderer.render(scene,camera);fpsFrames++;if(now-fpsSince>1000){const fps=Math.round(fpsFrames*1000/(now-fpsSince));$('#debug').textContent=`${innerWidth}×${innerHeight} | ${fps} fps | ${renderer.info.render.calls} calls | ${renderer.info.render.triangles} triangles | ${mode} | particle ${scatter.toFixed(2)}`;$('#debug').dataset.view=mode;$('#debug').dataset.scatter=scatter.toFixed(2);fpsSince=now;fpsFrames=0;}
}
addEventListener('pagehide',()=>{stopped=true;cancelAnimationFrame(frame);portfolio?.dispose();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());ownedTextures.forEach(t=>t.dispose());reflector?.dispose();env?.dispose();renderer?.dispose();});addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
setup();
