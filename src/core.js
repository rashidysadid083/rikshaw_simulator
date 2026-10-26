// রেন্ডারার, দৃশ্য, ক্যামেরা, আলো, শেয়ার্ড হেল্পার
import * as THREE from 'three';
import { loadQuality } from './save.js';

const T=THREE,$=id=>document.getElementById(id);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
let HQ=loadQuality();
function setHQ(v){HQ=v;}
T.Texture.DEFAULT_ENCODING=T.sRGBEncoding;
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=!!HQ;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,HQ?1.5:1));
document.body.prepend(renderer.domElement);
const SKY=0xcdd9de,scene=new T.Scene();
{const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d'),q=g.createLinearGradient(0,0,0,256);q.addColorStop(0,'#5d8bbd');q.addColorStop(.55,'#9dbcd6');q.addColorStop(1,'#d8e0e0');g.fillStyle=q;g.fillRect(0,0,2,256);scene.background=new T.CanvasTexture(c);}   // আকাশের গ্রেডিয়েন্ট
scene.fog=new T.Fog(SKY,60,175);
const cam=new T.PerspectiveCamera(60,1,.1,200);
scene.add(new T.HemisphereLight(0xcfe3f5,0x8a7d6a,.8));
const sun=new T.DirectionalLight(0xfff0d8,1.4);sun.position.set(30,60,20);scene.add(sun,sun.target);
Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:160});sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0006;   // ছায়া শুধু প্লেয়ারের আশেপাশে
const mute=c=>{const y=c.r*.3+c.g*.59+c.b*.11;return c.setRGB(c.r+(y-c.r)*.28,c.g+(y-c.g)*.28,c.b+(y-c.b)*.28);},lin=c=>new T.Color(c).convertSRGBToLinear();   // কম-সংতৃপ্ত রং, sRGB→linear
const _sc=T.InstancedMesh.prototype.setColorAt,_mc=new T.Color();
T.InstancedMesh.prototype.setColorAt=function(i,c){_mc.copy(c);if(!this.userData.nm)mute(_mc);return _sc.call(this,i,_mc.convertSRGBToLinear());};
const clamp=(a,lo,hi)=>Math.max(lo,Math.min(hi,a));
let paused=true;
function setPaused(p){paused=p;}
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const NP=40,PD=[];

export { $, HQ, NP, PD, T, bn, cam, clamp, lin, mute, paused, renderer, scene, setHQ, setPaused, sun };
