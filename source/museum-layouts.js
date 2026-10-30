import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export const LAYOUTS={
 rotunda:{title:'环形光庭',heading:'The light court.',note:'沿着弧形展台漫游，让每件作品成为聚光的主角。'},
 space:{title:'梦境漫游',heading:'A place between worlds.',note:'在无边的水面与悬浮建筑之间，发现想象的入口。'},
 cinema:{title:'故事放映厅',heading:'The story pavilion.',note:'在柔光里入座，让故事在你的选择中继续。'},
 atelier:{title:'灵感藏书室',heading:'The making room.',note:'把实践装订成册，让灵感成为可以带走的方法。'},
 corridor:{title:'梦境长廊',heading:'The playground.',note:'保留最初的悬浮长廊，拖动探索 52 个想象入口。'}
};
export function createMuseumLayouts(scene){
 const rotunda=new T.Group(),space=new T.Group(),cinema=new T.Group(),atelier=new T.Group();const rooms={rotunda,space,cinema,atelier};scene.add(...Object.values(rooms));
 const textures=[];
 const mat=color=>new T.MeshStandardMaterial({color,roughness:.64,metalness:.03});
 const cream=mat('#f2e4d3'),pink=mat('#e4bdc1'),mint=mat('#c3d5c9'),brass=new T.MeshStandardMaterial({color:'#c9b48a',roughness:.3,metalness:.6});
 function add(parent,geometry,material,x,y,z){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);parent.add(o);return o;}
 function box(parent,w,h,d,x,y,z,material=cream,r=.05){return add(parent,new RoundedBoxGeometry(w,h,d,2,r),material,x,y,z);}
 const poolCanvas=document.createElement('canvas');poolCanvas.width=poolCanvas.height=256;const ctx=poolCanvas.getContext('2d'),grad=ctx.createRadialGradient(128,128,0,128,128,128);grad.addColorStop(0,'rgba(110,91,86,.25)');grad.addColorStop(.4,'rgba(110,91,86,.12)');grad.addColorStop(1,'rgba(110,91,86,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);const shadowTexture=new T.CanvasTexture(poolCanvas);textures.push(shadowTexture);
 const shadowMat=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});
 const ground=add(rotunda,new T.PlaneGeometry(160,160),mint,0,-3.95,-10);ground.rotation.x=-Math.PI/2;
 add(rotunda,new T.CylinderGeometry(13.5,13.8,.32,96),cream,0,-3.75,-6);
 add(rotunda,new T.CylinderGeometry(12.9,13.2,.2,96),pink,0,-3.5,-6);
 const surface=add(rotunda,new T.CylinderGeometry(12.82,12.82,.04,96),mat('#eae4d5'),0,-3.38,-6);
 const wallMaterial=mat('#d8b5c1');wallMaterial.side=T.DoubleSide;
 add(rotunda,new T.CylinderGeometry(16,16,15,96,1,true,Math.PI/2,Math.PI),wallMaterial,0,3.6,-6);
 for(let i=0;i<13;i++){const a=Math.PI/2+i*Math.PI/12;const x=Math.sin(a)*15.5,z=Math.cos(a)*15.5-6;add(rotunda,new T.CylinderGeometry(.17,.2,13,16),cream,x,2.8,z);}
 const ring=add(rotunda,new T.TorusGeometry(13.5,.11,12,100),new T.MeshStandardMaterial({color:'#fff0d6',emissive:'#ffe2b5',emissiveIntensity:.7}),0,7.3,-6);ring.rotation.x=Math.PI/2;
 for(const radius of [10.8,12.5]){const line=add(rotunda,new T.TorusGeometry(radius,.014,6,100),brass,0,-3.348,-6);line.rotation.x=Math.PI/2;}
 for(let i=-3;i<=3;i++){const a=i*.35;const sh=add(rotunda,new T.PlaneGeometry(4,2.3),shadowMat,Math.sin(a)*10,-3.34,(Math.cos(a)-1)*10);sh.rotation.x=-Math.PI/2;}
 const light=new T.PointLight('#ffe2c2',12,35,1.6);light.position.set(-5,6,2);rotunda.add(light);
 // A single navigable sculpture garden. Every work has a fixed, unique position.
 const spaceFloor=add(space,new T.PlaneGeometry(350,350),mat('#b8cebf'),0,-4.25,0);spaceFloor.rotation.x=-Math.PI/2;
 for(const [radius,y,color] of [[30,-3.9,'#ead5cc'],[21,-3.5,'#e5ddc8'],[10.8,-3.1,'#c9d7ca']]){
  add(space,new T.CylinderGeometry(radius,radius+.2,.65,128),mat(color),0,y,0);
  const rim=add(space,new T.TorusGeometry(radius-.35,.025,6,128),brass,0,y+.34,0);rim.rotation.x=Math.PI/2;
 }
 add(space,new T.CylinderGeometry(3,3.2,1.2,64),cream,0,-2.25,0);
 const sculpture=add(space,new T.TorusKnotGeometry(1.55,.44,144,20,2,3),new T.MeshStandardMaterial({color:'#accdbd',roughness:.19,metalness:.42}),0,.1,0);sculpture.rotation.z=.4;
 const sculptureShadow=add(space,new T.PlaneGeometry(6,6),shadowMat,0,-1.64,0);sculptureShadow.rotation.x=-Math.PI/2;
 // Sparse architectural edges leave the orbit and all 53 exhibits unobstructed.
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6;add(space,new T.CylinderGeometry(.13,.18,9,12),cream,Math.sin(a)*31,.2,Math.cos(a)*31);
 }
 const canopy=add(space,new T.TorusGeometry(31,.10,12,144),cream,0,4.7,0);canopy.rotation.x=Math.PI/2;
 const halo=add(space,new T.TorusGeometry(3.9,.045,10,80),brass,0,4,0);halo.rotation.x=Math.PI/2;
 // Small, intimate screening pavilion: a scalloped backdrop, brass trim and curved seating.
 const plum=mat('#967984'),rose=mat('#d8b5ba');
 const cinemaFloor=add(cinema,new T.PlaneGeometry(150,150),mint,0,-3.6,-10);cinemaFloor.rotation.x=-Math.PI/2;
 add(cinema,new T.CylinderGeometry(15,15.4,.4,96),rose,0,-3.38,-7);
 add(cinema,new T.CylinderGeometry(14.5,14.8,.18,96),cream,0,-3.1,-7);
 const curtain=mat('#c6a1ac');curtain.side=T.DoubleSide;
 add(cinema,new T.CylinderGeometry(17,17,15,96,1,true,Math.PI/2,Math.PI),curtain,0,3,-7);
 for(let i=0;i<55;i++){const a=Math.PI/2+i*Math.PI/54;add(cinema,new T.CylinderGeometry(.19,.19,14,10),rose,Math.sin(a)*16.75,3,Math.cos(a)*16.75-7);}
 for(const r of [12.2,13.7]){const o=add(cinema,new T.TorusGeometry(r,.035,8,96),brass,0,-2.99,-7);o.rotation.x=Math.PI/2;}
 const ceiling=add(cinema,new T.TorusGeometry(14,.12,12,96),new T.MeshStandardMaterial({color:'#fff0db',emissive:'#ffe1b7',emissiveIntensity:.6}),0,7,-7);ceiling.rotation.x=Math.PI/2;
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const x=side*(5.8+i*1.5),z=3.5-i*.55;
  box(cinema,1.2,.45,1.1,x,-2.1,z,plum,.15);box(cinema,1.2,1.2,.28,x,-1.5,z+.4,rose,.12);
  for(const dx of [-.4,.4])box(cinema,.06,.6,.65,x+dx,-2.65,z,brass,.02);
 }
 // Reading atelier. Warm plaster, mint niches and real volumes on individual pedestals.
 const atelierFloor=add(atelier,new T.PlaneGeometry(180,150),mat('#d3dbcc'),0,-3.7,-10);atelierFloor.rotation.x=-Math.PI/2;
 add(atelier,new T.CylinderGeometry(15,15.4,.45,96),cream,0,-3.42,-7);
 const atelierWall=mat('#e4cac3');atelierWall.side=T.DoubleSide;
 add(atelier,new T.CylinderGeometry(17,17,15,96,1,true,Math.PI/2,Math.PI),atelierWall,0,3,-7);
 for(let i=-3;i<=3;i++){
  const a=i*.27,x=Math.sin(a)*15.5,z=Math.cos(a)*-15.5-7;
  const shelf=new T.Group();shelf.position.set(x,1,z);shelf.rotation.y=a;atelier.add(shelf);
  box(shelf,3.2,7,.45,0,1,0,mint,.3);
  for(let j=0;j<3;j++){box(shelf,2.8,.08,.6,0,-1+j*2,.4,cream);for(let k=0;k<5;k++)box(shelf,.28,.9+(k%3)*.15,.26,-1+k*.4,-.5+j*2,.42,[cream,pink,mint][k%3],.03);}
 }
 for(const radius of [11,13.8]){const o=add(atelier,new T.TorusGeometry(radius,.025,8,96),brass,0,-3.18,-7);o.rotation.x=Math.PI/2;}
 const readingHalo=add(atelier,new T.TorusGeometry(11.4,.1,12,96),cream,0,6.8,-7);readingHalo.rotation.x=Math.PI/2;
 for(let i=-2;i<=2;i++){const a=i*.55;add(atelier,new T.SphereGeometry(.32,20,14),new T.MeshStandardMaterial({color:'#fff4d6',emissive:'#ffe0ad',emissiveIntensity:.55}),Math.sin(a)*11,6.1,Math.cos(a)*-11-7);}
 function activate(mode){for(const [key,g] of Object.entries(rooms))g.visible=mode===key;}
 activate('rotunda');
 function dispose(){const gs=new Set(),ms=new Set();for(const g of Object.values(rooms))g.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());scene.remove(...Object.values(rooms));}
 return {activate,dispose,shadowTexture};
}
// Each collection retains its real index. No duplicated works are used to fake an infinite list.
export function exhibitionPose(mode,index,position,mobile,out){
 const d=index-position;
 if(mode==='rotunda'){
  const angle=d*.36;out.x=Math.sin(angle)*10;out.y=-.05;out.z=(Math.cos(angle)-1)*10;out.ry=-angle;out.rz=0;out.scale=1;out.visible=Math.abs(d)<(mobile?2.8:4.6);out.label=Math.abs(d)<.55;
 }else if(mode==='space'){
  const ring=index<12?0:index<30?1:2,start=[0,12,30][ring],count=[12,18,23][ring],radius=[8,17,26][ring];
  const angle=(index-start)/count*Math.PI*2+[0,.12,.04][ring];
  out.x=Math.sin(angle)*radius;out.y=[.3,-.1,-.5][ring];out.z=Math.cos(angle)*radius;out.ry=angle;out.rz=0;out.scale=1;out.visible=true;out.label=false;
 }else if(mode==='cinema'){
  const a=d*.42;out.x=Math.sin(a)*11;out.y=.1;out.z=(Math.cos(a)-1)*11;out.ry=-a;out.rz=0;out.scale=1.12;out.visible=Math.abs(d)<4;out.label=Math.abs(d)<.55;
 }else if(mode==='atelier'){
  const a=d*.36;out.x=Math.sin(a)*11;out.y=.05+Math.abs(d)*.08;out.z=(Math.cos(a)-1)*11;out.ry=-a-.12;out.rz=-.045;out.scale=1;out.visible=Math.abs(d)<4.2;out.label=Math.abs(d)<.55;
 }else{out.x=index*3.65;out.y=Math.sin(index*2.1)*.35-.3;out.z=Math.sin(index*1.3)*.45;out.ry=Math.sin(index*1.7)*.12;out.rz=Math.sin(index*1.4)*.035;out.scale=1;out.visible=Math.abs(d)<(mobile?2:5);out.label=!mobile||Math.abs(d)<.6;}
 return out;
}
