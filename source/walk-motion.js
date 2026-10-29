// Camera-relative walking. Split-axis swept collision lets the visitor slide along walls.
export function stepWalk(position,velocity,input,yaw,dt,blockers,bounds={minX:-38,maxX:102,minZ:-165,maxZ:34}) {
 dt=Math.min(Math.max(dt,0),.05);
 let forward=input.forward||0,side=input.side||0;
 const magnitude=Math.hypot(forward,side);if(magnitude>1){forward/=magnitude;side/=magnitude;}
 const speed=input.fast?11:6,active=magnitude>0,k=1-Math.exp(-dt*(active?10:22));
 const vx=(Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed;
 const vz=(-Math.cos(yaw)*forward+Math.sin(yaw)*side)*speed;
 velocity.x+=(vx-velocity.x)*k;velocity.z+=(vz-velocity.z)*k;
 if(!active&&Math.hypot(velocity.x,velocity.z)<.025){velocity.x=velocity.z=0;}
 const dx=velocity.x*dt,dz=velocity.z*dt,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.18));
 const blocked=(x,z)=>blockers.some(b=>position.y>b.minY-.25&&position.y<b.maxY+.25&&Math.abs(x-b.x)<b.w/2+.35&&Math.abs(z-b.z)<b.d/2+.35);
 for(let i=0;i<steps;i++){
  const x=Math.max(bounds.minX,Math.min(bounds.maxX,position.x+dx/steps));
  if(!blocked(x,position.z))position.x=x;else velocity.x=0;
  const z=Math.max(bounds.minZ,Math.min(bounds.maxZ,position.z+dz/steps));
  if(!blocked(position.x,z))position.z=z;else velocity.z=0;
 }
 return active;
}
