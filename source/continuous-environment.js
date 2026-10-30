import * as T from 'three';

// Every sample depends on a 3D position/direction, never on a wrapped panorama UV.
// Adjacent cube faces therefore sample the same field along their shared edges.
const noiseGLSL=`
float fieldHash(vec3 p){
 p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);
}
float fieldNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(fieldHash(i),fieldHash(i+vec3(1,0,0)),f.x),mix(fieldHash(i+vec3(0,1,0)),fieldHash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(fieldHash(i+vec3(0,0,1)),fieldHash(i+vec3(1,0,1)),f.x),mix(fieldHash(i+vec3(0,1,1)),fieldHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float cloudField(vec3 p){
 float n=0.0,a=.55;
 for(int i=0;i<5;i++){n+=a*fieldNoise(p);p=p*2.03+vec3(7.1,3.7,11.3);a*=.48;}
 return n;
}`;

export const HORIZON_COLOR='#e7dedb';
export function createContinuousSky(renderer){
 const skyScene=new T.Scene();
 const material=new T.ShaderMaterial({
  side:T.BackSide,depthWrite:false,toneMapped:false,
  uniforms:{horizon:{value:new T.Color(HORIZON_COLOR)},zenith:{value:new T.Color('#89aacb')},peach:{value:new T.Color('#f2c3ad')},cloudLight:{value:new T.Color('#ffe7cd')},cloudShade:{value:new T.Color('#d2adbc')}},
  vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`varying vec3 vDirection;uniform vec3 horizon,zenith,peach,cloudLight,cloudShade;
  ${noiseGLSL}
  void main(){
   vec3 d=normalize(vDirection),sun=normalize(vec3(-.55,.3,.7));
   float height=max(d.y,0.0),warm=pow(max(dot(d,sun),0.0),3.0);
   vec3 color=mix(horizon,zenith,pow(height,.48));
   color=mix(color,peach,warm*.68*(1.0-height*.3));
   // Sample a continuous curved cloud layer; no longitude branch or pole pinch.
   vec3 p=d*vec3(5.8,9.5,5.8)+vec3(3.2,1.7,-5.4);
   float broad=cloudField(p),detail=fieldNoise(p*3.6+vec3(9.0));
   float density=smoothstep(.37,.66,broad+.035*detail);
   float light=clamp(.58+warm*.35+(fieldNoise(p+sun*.35)-broad)*1.4,0.0,1.0);
   vec3 clouds=mix(cloudShade,cloudLight,light);
   float haze=smoothstep(.01,.11,height);
   color=mix(color,clouds,density*haze*.93);
   color+=cloudLight*pow(max(dot(d,sun),0.0),44.0)*.1;
   color=mix(horizon,color,smoothstep(-.025,.09,d.y));
   gl_FragColor=vec4(color,1.0);
   #include <colorspace_fragment>
  }`
 });
 const geometry=new T.SphereGeometry(10,32,16);
 skyScene.add(new T.Mesh(geometry,material));
 // Bake once: cloud noise is not evaluated on every frame or every pool reflection.
 const target=new T.WebGLCubeRenderTarget(512,{type:T.HalfFloatType,generateMipmaps:true,minFilter:T.LinearMipmapLinearFilter});
 const camera=new T.CubeCamera(.1,20,target);
 const previousTarget=renderer.getRenderTarget();
 try{camera.update(renderer,skyScene);}finally{renderer.setRenderTarget(previousTarget);geometry.dispose();material.dispose();}
 return {texture:target.texture,dispose:()=>target.dispose()};
}

// A single world-space mineral field spans slabs, curved walls and bevels.
// Physical building joints remain, but texture edges and UV repeats disappear.
export function mineralMaterial(color,roughness=.8){
 const material=new T.MeshStandardMaterial({color,roughness});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vMineralPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvMineralPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
  shader.fragmentShader='varying vec3 vMineralPosition;\n'+noiseGLSL+'\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 stonePosition=vMineralPosition;
   float strata=fieldNoise(stonePosition*vec3(.24,3.2,.27));
   float mineral=fieldNoise(stonePosition*1.8+vec3(17.1));
   float grain=fieldNoise(stonePosition*29.0);
   float variation=(strata-.5)*.18+(mineral-.5)*.045+(grain-.5)*.018;
   diffuseColor.rgb*=1.0+variation;
  `);
 };
 material.customProgramCacheKey=()=> 'continuous-mineral-v1';
 return material;
}
