// ইনপুট, বিরতি, গ্রাফিক্স-মান, গেম-লুপ
import { saveQuality } from './save.js';
import { $, HQ, bn, cam, clamp, paused, renderer, scene, setHQ, setPaused, sun } from './core.js';
import { W, gr, where } from './world.js';
import { R, S, blob, body, fork, hg, inp, legs, rick, wheels } from './vehicles.js';
import { answer, ask, paxReset, paxStep, paxView, tripHud } from './passengers.js';
import { bigOpen, btns, closeBig, dot, drawBig, openBig, toast } from './ui.js';
import { rebuildV, trafficReset, trafficStep, trafficView } from './traffic.js';
import { NPC } from './npc.js';
import { EV } from './events.js';
import { PG } from './economy.js';
import { horn } from './audio.js';

let lastLoc='',hk=0,ht=0,lp=0;
function step(dt){
  S.st+=((inp.r-inp.l)-S.st)*Math.min(1,7*dt);
  if(inp.g)S.v+=(S.v<0?14:5)*dt;
  else if(inp.b)S.v-=(S.v>.3?13:4)*dt;
  else S.v-=Math.sign(S.v)*Math.min(Math.abs(S.v),2.2*dt);
  S.v-=S.v*.12*dt;S.v=clamp(S.v,-3,PG.vmax());S.v-=S.v*EV.drag(S.x,S.z)*dt;
  S.h-=S.st*1.7*dt*clamp(S.v/4,-1,1);
  S.x+=Math.sin(S.h)*S.v*dt;S.z+=Math.cos(S.h)*S.v*dt;
  W.collide(S,R);EV.collide(S,R);
  trafficStep(dt);EV.step(dt);
  paxStep(dt);PG.step(dt);
  pose(dt);
}
function pose(dt){
  W.update(S.x,S.z);
  const rx=S.x-W.ox,rz=S.z-W.oz;
  gr.position.set(rx,-.02,rz);
  rick.position.set(rx,.1,rz);rick.rotation.y=S.h;sun.position.set(rx+30,60,rz+20);sun.target.position.set(rx,0,rz);lp+=S.v*dt*1.1;legs[0].rotation.x=-.95+Math.sin(lp)*.4;legs[1].rotation.x=-.95-Math.sin(lp)*.4;
  body.rotation.z=S.st*clamp(Math.abs(S.v)/9,0,1)*.12;
  fork.rotation.y=-S.st*.5;
  hk+=(ht-hk)*Math.min(1,6*dt);hg.scale.z=1-.84*hk;
  wheels.forEach(w=>w.rotation.x+=S.v*dt/w.userData.r);
  const fx=Math.sin(S.h),fz=Math.cos(S.h),k=1-Math.exp(-4.5*dt);
  cam.position.x+=(rx-fx*7.5-cam.position.x)*k;
  cam.position.y+=(4.3-cam.position.y)*k;
  cam.position.z+=(rz-fz*7.5-cam.position.z)*k;
  cam.lookAt(rx+fx*3,1.2,rz+fz*3);
  $('spd').firstChild.nodeValue=bn(Math.round(Math.abs(S.v)*3.6));
  const l=where(S.x,S.z);
  if(l!==lastLoc){lastLoc=l;$('loc').textContent=l;}
  trafficView();paxView();EV.view();tripHud();dot();
}
function toggleHood(){ht^=1;$('hood').classList.toggle('on',!!ht);}
function reset(){
  Object.assign(S,{x:0,z:2,h:Math.PI,v:0,st:0});W.update(S.x,S.z,1);paxReset();trafficReset();EV.reset();
  cam.position.set(S.x-W.ox,4.3,S.z-W.oz+7.5);pose(.016);
}
const keys={KeyW:'g',ArrowUp:'g',KeyS:'b',ArrowDown:'b',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',KeyH:'h',Space:'h'};
addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat){bigOpen?closeBig():openBig();}if(ask&&!e.repeat){if(e.code==='KeyY')answer(1);else if(e.code==='KeyN')answer(0);}const k=keys[e.code];if(k){inp[k]=1;e.preventDefault();}if(e.code==='KeyP'||e.code==='Escape')setPause(!paused);if(e.code==='KeyO'&&!e.repeat)toggleHood();});
addEventListener('keyup',e=>{const k=keys[e.code];if(k)inp[k]=0;});
function setPause(p){
  setPaused(p);$('menu').classList.toggle('show',p);
  inp.g=inp.b=inp.l=inp.r=inp.h=0;btns.forEach(b=>b.classList.remove('on'));
  $('go').textContent='চালিয়ে যাও';
}
$('pause').onclick=()=>setPause(true);
$('hood').onclick=toggleHood;
$('go').onclick=()=>{setPause(false);setTimeout(()=>$('hint').style.opacity=0,8000);};
$('re').onclick=()=>{reset();setPause(false);};
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true);});
function rs(){renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
addEventListener('resize',rs);rs();

function applyQ(re){
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,HQ?1.5:1));rs();sun.castShadow=!!HQ;renderer.shadowMap.enabled=!!HQ;$('gq').textContent=HQ?'🎨 হাই':'🎨 লো';
  scene.traverse(o=>{if(o.isMesh&&o!==blob)o.castShadow=o.receiveShadow=!!HQ;if(o.material)[].concat(o.material).forEach(x=>x.needsUpdate=true);});
  if(re){for(const k of[...W.ch.keys()])W.unload(k);W.update(S.x,S.z,1);rebuildV();}
}
const saveQ=()=>saveQuality(HQ);
$('gq').onclick=()=>{setHQ(HQ^1);saveQ();fc=0;applyQ(1);toast(HQ?'গ্রাফিক্স: হাই (ছায়া + ডিটেইল)':'গ্রাফিক্স: লো');};
let fe=.017,fc=0,eb=null;
const err=e=>{if(!eb){eb=document.createElement('div');eb.style.cssText='position:fixed;left:8px;right:8px;top:120px;z-index:9;background:#600;color:#fff;font:12px monospace;padding:8px;border-radius:8px;pointer-events:none;white-space:pre-wrap';document.body.appendChild(eb);}eb.textContent='ERR: '+(e&&e.message||e)+'\n'+String(e&&e.stack||'').slice(0,300);};
addEventListener('error',e=>err(e.error||e.message));
applyQ();reset();
let last=performance.now();
(function loop(t){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(t-last)/1000);last=t;
  if(!paused&&!bigOpen){fe+=(dt-fe)*.04;NPC.perf(fe,dt);if(HQ&&++fc>150&&fe>.04){setHQ(0);saveQ();applyQ(1);toast('FPS কম — গ্রাফিক্স লো করা হলো');}}   // FPS কমলে ডিটেইল কমাও
  if(!paused&&!ask&&!bigOpen&&!PG.modal())step(dt);if(bigOpen)drawBig();horn(!paused&&!!inp.h);
  try{renderer.render(scene,cam);}catch(e){err(e);}
})(last);