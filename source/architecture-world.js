import * as T from 'three';

// Three individually composed pavilions: no tiled buildings or primitive sculpture array.
export function buildArchitecture({scene,geo,mat,mesh,stone}){
 const anchors=[],blockers=[],animated=[],occluders=[];
 const cream=mat(new T.MeshStandardMaterial({color:'#ece0cb',map:stone,bumpMap:stone,bumpScale:.035,roughness:.8}));
 const rose=mat(new T.MeshStandardMaterial({color:'#cba8a0',map:stone,bumpMap:stone,bumpScale:.025,roughness:.86}));
 const chalk=mat(new T.MeshStandardMaterial({color:'#f3e8db',roughness:.72}));
 const jade=mat(new T.MeshPhysicalMaterial({color:'#8fb4ac',roughness:.28,metalness:.12,clearcoat:.6}));
 const trim=mat(new T.MeshStandardMaterial({color:'#9d8464',metalness:.65,roughness:.38}));
 const dark=mat(new T.MeshStandardMaterial({color:'#6b7770',roughness:.8}));
 const glow=mat(new T.MeshBasicMaterial({color:'#ffedce',toneMapped:false}));
 const glass=mat(new T.MeshPhysicalMaterial({color:'#c0ded4',roughness:.3,metalness:.12,transparent:true,opacity:.33,depthWrite:false,side:T.DoubleSide}));
 const regions=[
  {name:'天光庭',english:'THE SKY COURT',x:0,z:-17,eye:[10,4.5,10],look:[-6,4.8,-24],color:'#e4d9cd'},
  {name:'水镜廊',english:'THE WATER GALLERY',x:65,z:-62,eye:[65,4.2,-35],look:[65,4.2,-71],color:'#d8e7df'},
  {name:'暮色剧场',english:'THE ROSE THEATRE',x:3,z:-124,eye:[3,5.2,-96],look:[3,5,-133],color:'#e5d1ce'}
 ];
 function outline(w,d,r=1){const x=-w/2,z=-d/2,s=new T.Shape();s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;}
 function solid(shape,depth,m,x,y,z,rotation=0){const g=geo(new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSize:.055,bevelThickness:.045,bevelSegments:2,curveSegments:40}));const o=mesh(g,m,x,y,z);o.rotation.set(-Math.PI/2,0,rotation);o.castShadow=o.receiveShadow=true;return o;}
 function slab(w,d,h,x,y,z,m=cream,r=.12){return solid(outline(w,d,r),h,m,x,y,z);}
 function wall(w,h,d,x,y,z,m=cream,angle=0,collide=true){const o=slab(w,d,h,x,y,z,m);o.rotation.z=angle;if(!m.transparent)occluders.push(o);if(collide&&angle===0)blockers.push({x,z,w:w+.5,d:d+.5,minY:y,maxY:y+h});return o;}
 function lightLine(w,x,y,z){slab(w,.045,.025,x,y,z,glow,.01);}
 function label(text,x,y,z,angle=0,size=3.5){const c=document.createElement('canvas');c.width=1024;c.height=256;const q=c.getContext('2d');q.fillStyle='#695d55';q.font='36px Georgia';q.textAlign='center';q.fillText(text,512,144);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=mat(new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false}));const o=mesh(geo(new T.PlaneGeometry(size,size/4)),m,x,y,z);o.rotation.y=angle;return tex;}
 const labels=[];
 function inset(x,z,angle,zone,y=3.3){anchors.push({x,y,z,angle,zone});}
 // 01: a low mineral shell, with a real off-centre elliptical opening to the sky.
 slab(46,61,.48,0,-.02,-14,cream,7);
 const roof=outline(49,53,10),opening=new T.Path();opening.absellipse(6,1,10,15,0,Math.PI*2,true);roof.holes.push(opening);
 const shell=solid(roof,.55,chalk,0,12,-15);const p=shell.geometry.attributes.position;
 // The ceiling is hand-shaped into a shallow saddle; its cut edge retains material thickness.
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,p.getZ(i)+.7*Math.sin(x*.075)+.55*Math.cos(y*.1));}shell.geometry.computeVertexNormals();
 // Side walls contain continuous recessed galleries with a shared lintel and stone bench.
 function curvedGallery(side){
  const s=new T.Shape(),sign=side;
  s.moveTo(sign*19,-10);s.bezierCurveTo(sign*25,6.666,sign*25,23.333,sign*19,40);
  s.lineTo(sign*19.8,40);s.bezierCurveTo(sign*25.8,23.333,sign*25.8,6.666,sign*19.8,-10);s.closePath();
  const w=solid(s,11.3,cream,0,0,0);occluders.push(w);
  const benchShape=new T.Shape();benchShape.moveTo(sign*17.6,-9);benchShape.bezierCurveTo(sign*23.7,6.6,sign*23.7,23.3,sign*17.6,39);benchShape.lineTo(sign*19,39);benchShape.bezierCurveTo(sign*25,23.3,sign*25,6.6,sign*19,-9);benchShape.closePath();solid(benchShape,.48,cream,0,.46,0);
  for(let i=0;i<7;i++){const z=2-i*5.8,t=(10-z)/50,x=side*(19+18*t*(1-t))-.32*side,angle=Math.atan2(-side,-.36*(1-2*t));inset(x,z,angle,0,4.2);}
  for(let i=0;i<28;i++){const t=i/27,z=10-50*t,x=side*(19+18*t*(1-t));blockers.push({x,z,w:1.25,d:2.3,minY:0,maxY:11.3});}
 }
 curvedGallery(-1);curvedGallery(1);
 // The rear wall frames the distant landscape with a single deliberately offset opening.
 wall(16,11,1,-14.5,0,-39);wall(14,11,1,15.5,0,-39);wall(14,3.1,1,1,7.9,-39,chalk);
 for(const x of [-17,-12,12,17])inset(x,-38.4,0,0,4.2);
 labels.push(label('01  /  THE SKY COURT',-11,8.1,-38.35,0,7));
 // Carved rectangular reflecting pool in the court, with a thin brass waterline.
 slab(12,21,.09,4,.47,-17,dark,1.8);slab(.06,19,.03,-2,.58,-17,trim);slab(.06,19,.03,10,.58,-17,trim);
 const pool=mesh(geo(new T.PlaneGeometry(11.8,20.8)),mat(new T.MeshPhysicalMaterial({color:'#b2cebe',roughness:.13,metalness:.36,transparent:true,opacity:.78})),4,.59,-17);pool.rotation.x=-Math.PI/2;
 // Low sculptural bench grows from the wall; a slotted opening leads toward the next pavilion.
 slab(7,1.7,.55,-9,.46,-29,cream,.7);slab(7,1.1,.12,-9,1.01,-29,chalk,.4);
 // A cloud of luminous dust moves only inside the shaft of light.
 const dustPositions=[];for(let i=0;i<150;i++)dustPositions.push(4+Math.sin(i*17.2)*4,1+(i%31)*.3,-17+Math.cos(i*7.3)*8);
 const dg=geo(new T.BufferGeometry());dg.setAttribute('position',new T.Float32BufferAttribute(dustPositions,3));const dust=new T.Points(dg,mat(new T.PointsMaterial({color:'#fff4d5',size:.045,transparent:true,opacity:.65,depthWrite:false})));scene.add(dust);animated.push(dust);
 // 02: a water garden under a cantilevered roof; images live in deep translucent screens.
 slab(43,57,.52,65,-.02,-62,chalk,2);
 slab(22,50,.1,65,.52,-64,jade,1.5);
 for(const side of [-1,1]){
  slab(7,57,.2,65+side*18,.5,-62,cream,1);
  for(let k=0;k<7;k++)wall(.38,10.5,.38,65+side*21,.4,-37-k*8,jade);
  for(let j=0;j<3;j++){
   const z=-44-j*17;
   // Thick end fins and reveals make these screens architectural, not freestanding posters.
   wall(1,8.5,11,65+side*13.2,.7,z,chalk);
   wall(.12,7.6,10,65+side*12.55,1.1,z,glass,0,false);
   for(let k=0;k<3;k++)inset(65+side*12.4,z+3.5-k*3.5,side<0?Math.PI/2:-Math.PI/2,1,4.8);
  }
 }
 const canopy=outline(48,62,2),slot=new T.Path();slot.moveTo(-5,-28);slot.lineTo(-5,28);slot.lineTo(5,28);slot.lineTo(5,-28);slot.closePath();canopy.holes.push(slot);solid(canopy,.32,chalk,65,11,-62);
 for(let j=0;j<28;j++){slab(.11,55,.18,44+j*1.55,10.7,-62,cream,.03);}
 labels.push(label('02  /  STILL WATER',65,8,-87,0,9));
 // Floating stepping stones and a single suspended textile sculpture at the end of the pool.
 for(let j=0;j<9;j++)slab(4.8,1.6,.16,65+Math.sin(j*.7)*1.7,.61,-38-j*5.5,cream,.12);
 const veilGeo=geo(new T.PlaneGeometry(8,7,40,40)),vp=veilGeo.attributes.position;
 for(let i=0;i<vp.count;i++){const x=vp.getX(i),y=vp.getY(i);vp.setX(i,x*(.82+.13*Math.sin(y*.8)));vp.setY(i,y+.4*Math.cos(x));vp.setZ(i,Math.sin(x*1.3+y*.35)*1.2+Math.cos(y*.7)*.4);}veilGeo.computeVertexNormals();
 const veil=mesh(veilGeo,mat(new T.MeshPhysicalMaterial({color:'#d2cab8',metalness:.62,roughness:.27,side:T.DoubleSide})),65,5.4,-83);veil.rotation.z=-.12;animated.push(veil);
 // 03: a rose-coloured topographic theatre. Terraces are continuous custom annular sectors.
 function terrace(outer,inner,a,b,height){const s=new T.Shape();s.absarc(0,0,outer,a,b,false);s.lineTo(Math.cos(b)*inner,Math.sin(b)*inner);s.absarc(0,0,inner,b,a,true);s.closePath();return solid(s,height,rose,3,0,-128);}
 for(let i=0;i<8;i++)terrace(12+i*1.8,10.3+i*1.8,.15,Math.PI-.15,.38+i*.32);
 slab(48,48,.4,3,-.02,-124,rose,12);
 // A folded wall defines intimate bays: each surface folds toward the visitor.
 for(const side of [-1,1]){
  wall(.8,12,42,3+side*22,0,-124,rose);
  for(let j=0;j<6;j++){const z=-107-j*5.9;inset(3+side*21.4,z,side<0?Math.PI/2:-Math.PI/2,2,5.1);wall(1.4,8.8,.22,3+side*21.2,.6,z-2.8,rose,0,false);}
 }
 wall(47,3.5,1,3,8.5,-147,rose);wall(47,1.3,1,3,0,-147,rose);
 for(let j=0;j<5;j++){const x=-13+j*8;wall(3.3,7.2,1,x,1.3,-147,rose);inset(x,-146.4,0,2,4.8);}
 // Recessed illuminated horizon and ribbons of ceiling: the final view opens back to the sea.
 lightLine(45,3,8.35,-146.45);
 for(let i=0;i<7;i++){const s=outline(48,2.8,.4);const o=solid(s,.3,rose,3,10.6+i*.15,-106-i*6);const v=o.geometry.attributes.position;for(let j=0;j<v.count;j++){const x=v.getX(j);v.setZ(j,v.getZ(j)+3.8*Math.cos(x/24*Math.PI/2)+.6*Math.sin(x*.12+i*.6));}o.geometry.computeVertexNormals();}
 labels.push(label('03  /  AFTERGLOW',3,10.6,-146.3,0,9));
 // Two continuous land bridges connect the three unique buildings.
 function bridge(points,width){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),pos=[],idx=[];for(let i=0;i<=100;i++){const t=i/100,p=curve.getPoint(t),d=curve.getTangent(t),n=new T.Vector3(-d.z,0,d.x).normalize();for(const sign of [-1,1])pos.push(p.x+n.x*width/2*sign,p.y,p.z+n.z*width/2*sign);if(i<100){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=geo(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const o=mesh(g,chalk,0,0,0);o.material=mat(chalk.clone());o.material.side=T.DoubleSide;o.receiveShadow=true;}
 bridge([[17,.5,-37],[32,.8,-38],[43,.6,-28],[65,.5,-32]],7);
 bridge([[65,.5,-89],[48,.8,-97],[26,.6,-92],[3,.5,-99]],8);
 // Non-repeating distant topography is a continuous displaced surface, not more gallery props.
 const terrain=geo(new T.PlaneGeometry(900,900,100,100));terrain.rotateX(-Math.PI/2);const tp=terrain.attributes.position;
 for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),dist=Math.hypot(x,z);tp.setY(i,dist<155?-5:Math.max(-3,(Math.sin(x*.019+z*.008)+Math.cos(z*.023))*9+Math.sin(x*.041)*3-3));}terrain.computeVertexNormals();mesh(terrain,mat(new T.MeshStandardMaterial({color:'#b2bea7',roughness:1})),0,-1,-50);
 return {anchors,regions,blockers,occluders,update(time,reduced){dust.position.y=reduced?0:Math.sin(time*.3)*.15;veil.rotation.y=reduced?0:Math.sin(time*.23)*.12;},dispose(){labels.forEach(t=>t.dispose());}};
}
