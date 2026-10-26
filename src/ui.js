// HUD, টোস্ট, মিনিম্যাপ ও বড় ম্যাপ
import { $, bn, clamp, paused } from './core.js';
import { BS, HB, RC, TH, W, area, band, bstart, hash, mainRow, tileType } from './world.js';
import { S, inp } from './vehicles.js';
import { ask, money, route, trip } from './passengers.js';
import { EV } from './events.js';

let bigOpen=false;

const mg=$('mm').getContext('2d');
function dot(){drawMap(mg,240,184,1.2,.68,2);}
function toast(m){const t=$('toast');t.textContent=m;t.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.opacity=0,2600);}
/* ---------- মানচিত্র: এলাকা-রং, বাজারের নাম, ঘটনার আইকন ---------- */
const BZS=['কাঁচা বাজার','নতুন বাজার','মাছের হাট','সবজি মার্কেট','কাপড় পট্টি','চৌমাথা বাজার','স্টেশন বাজার','ফল মার্কেট','মসলা পট্টি','পুরান হাট'];
const bazName=(cx,cz)=>{const nm=TH[area(cx,cz).t].nm[0],h=hash(cx,cz,57);return nm[h%nm.length]+' '+BZS[(h>>>6)%BZS.length];};
const areaHue=(a,b)=>(a*137.5+b*223.6)%360;
function mapAreas(c,sc,Rv,big){   // রোটেটেড ফ্রেমে: প্রতিটা এলাকার ঠিক সীমানা একটা আলাদা রঙে + বাজার-টাইল হলুদে
  const Rl=Math.min(Rv,big?1800:500),o={bz:[],ar:[]},x0=Math.floor((S.x-Rl)/BS),x1=Math.ceil((S.x+Rl)/BS),z0=Math.floor((S.z-Rl)/BS),z1=Math.ceil((S.z+Rl)/BS);
  for(let bi=band(0,x0);bi<=band(0,x1);bi++)for(let bj=band(1,z0);bj<=band(1,z1);bj++){
    const ax0=bstart(0,bi)*BS-HB,ax1=bstart(0,bi+1)*BS-HB,az0=bstart(1,bj)*BS-HB,az1=bstart(1,bj+1)*BS-HB;
    c.fillStyle='hsla('+areaHue(bi,bj)+',62%,45%,.5)';c.fillRect(ax0-S.x,az0-S.z,ax1-ax0,az1-az0);
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2.4/sc;c.strokeRect(ax0-S.x,az0-S.z,ax1-ax0,az1-az0);
    if(big){const A=area(bstart(0,bi),bstart(1,bj)),lx0=Math.max(ax0,S.x-Rl),lx1=Math.min(ax1,S.x+Rl),lz0=Math.max(az0,S.z-Rl),lz1=Math.min(az1,S.z+Rl);
      o.ar.push({x:(lx0+lx1)/2,z:(lz0+lz1)/2,n:A.name,s:TH[A.t].n+' · '+bn(Math.round(ax1-ax0))+'×'+bn(Math.round(az1-az0))+' মি'});}
  }
  const R2=Math.min(Rl,big?1100:420);
  for(let cx=Math.floor((S.x-R2)/BS);cx<=Math.ceil((S.x+R2)/BS);cx++)for(let cz=Math.floor((S.z-R2)/BS);cz<=Math.ceil((S.z+R2)/BS);cz++){
    if(tileType(cx,cz)!=='bazaar')continue;
    c.fillStyle='rgba(255,196,40,.5)';c.fillRect(cx*BS-HB-S.x,cz*BS-HB-S.z,BS,BS);c.strokeStyle='#ffc428';c.lineWidth=2/sc;c.strokeRect(cx*BS-HB-S.x,cz*BS-HB-S.z,BS,BS);
    o.bz.push({x:cx*BS,z:cz*BS,n:bazName(cx,cz)});
  }
  return o;
}
function mapLabels(c,AL,pj,cw,ch,k,big){   // স্ক্রিন-ফ্রেমে সোজা লেখা (ম্যাপ ঘুরলেও লেখা ঘোরে না)
  c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  const tx=(s,x,y,sz,col,b)=>{c.font=(b?'bold ':'')+sz+'px sans-serif';c.lineWidth=sz*.28;c.strokeStyle='rgba(20,14,8,.9)';c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);};
  for(const a of AL.ar){const q=pj(a.x,a.z);if(q[0]<0||q[0]>cw||q[1]<0||q[1]>ch)continue;tx(a.n,q[0],q[1]-8*k,13*k,'#fff',1);tx(a.s,q[0],q[1]+8*k,10*k,'#ffe9b0');}
  for(const b of AL.bz){const q=pj(b.x,b.z);if(q[0]<-30||q[0]>cw+30||q[1]<-10||q[1]>ch+10)continue;tx('🛍️ '+b.n,q[0],q[1],(big?11:7.5)*k,'#ffe08a',1);}
  c.textAlign='left';c.textBaseline='alphabetic';c.lineWidth=1;
}
function mapEvents(c,pj,cw,ch,k){   // ঘটনার আইকন: কাছে হলে জায়গায়, দূরে হলে কিনারায় (দিক বোঝাতে); অবরোধে লাল বাধা-দাগ
  for(const e of EV.list){
    const q=pj(e.x,e.z),r=8*k,px=clamp(q[0],r,cw-r),py=clamp(q[1],r,ch-r),out=px!==q[0]||py!==q[1];
    if(e.cl&&!out){const a=e.ax?[e.L-6,e.a]:[e.a,e.L-6],b=e.ax?[e.L+6,e.a]:[e.a,e.L+6],p=pj(a[0],a[1]),s=pj(b[0],b[1]);c.strokeStyle='#e53935';c.lineWidth=5*k;c.lineCap='round';c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(s[0],s[1]);c.stroke();}
    c.globalAlpha=out?.85:1;c.fillStyle=e.cl?'#c62828':'#ef6c00';c.beginPath();c.arc(px,py,r,0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=1.5*k;c.stroke();
    c.textAlign='center';c.textBaseline='middle';c.font=(11*k)+'px sans-serif';c.fillStyle='#fff';c.fillText(e.d.ic,px,py+k*.5);c.textAlign='left';c.textBaseline='alphabetic';c.globalAlpha=1;
  }
}
/* মানচিত্র: রিকশার সামনে সবসময় উপরে (হেডিং-আপ), মাঝে রিকশার চিহ্ন, গন্তব্যে পিন, নীল রুট */
function drawMap(c,cw,ch,sc,cyf,k,bigM){
  const f=Math.sin(S.h),g=Math.cos(S.h),cx=cw/2,cy=ch*cyf,Rv=Math.hypot(cw,ch)/sc;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#2b2620';c.fillRect(0,0,cw,ch);
  c.setTransform(-g*sc,-f*sc,f*sc,-g*sc,cx,cy);
  const AL=mapAreas(c,sc,Rv,bigM);
  c.fillStyle='#a39b8f';
  for(let i=Math.floor((S.x-Rv+HB)/BS);i<=Math.ceil((S.x+Rv+HB)/BS);i++)c.fillRect(i*BS-HB-4-S.x,-Rv,8,2*Rv);
  for(let j=Math.floor((S.z-Rv+HB)/BS);j<=Math.ceil((S.z+Rv+HB)/BS);j++)c.fillRect(-Rv,j*BS-HB-4-S.z,2*Rv,8);
  for(let j=Math.floor((S.z-Rv)/BS);j<=Math.ceil((S.z+Rv)/BS);j++)if(mainRow(j))c.fillRect(-Rv,j*BS-7-S.z,2*Rv,14);
  for(const r of W.ch.values())for(const[x,z,w,d,col]of r.o.road){c.fillStyle=col===RC?'#a39b8f':'#c4a574';c.fillRect(r.cx*BS+x-w/2-S.x,r.cz*BS+z-d/2-S.z,w,d);}
  c.setTransform(1,0,0,1,0,0);
  const pj=(x,z)=>{const dx=x-S.x,dz=z-S.z;return[cx+(-dx*g+dz*f)*sc,cy-(dx*f+dz*g)*sc];};
  if(route){
    c.lineJoin=c.lineCap='round';c.beginPath();c.moveTo(cx,cy);route.pts.forEach(p=>{const q=pj(p[0],p[1]);c.lineTo(q[0],q[1]);});
    c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=7*k;c.stroke();c.strokeStyle='#2979ff';c.lineWidth=4.5*k;c.stroke();
  }
  mapLabels(c,AL,pj,cw,ch,k,bigM);mapEvents(c,pj,cw,ch,k);
  let h=pj(0,0);h=[clamp(h[0],6*k,cw-6*k),clamp(h[1],6*k,ch-6*k)];
  c.fillStyle='#e53935';c.fillRect(h[0]-3*k,h[1]-3*k,6*k,6*k);
  c.fillStyle='#fff';c.font=(10*k)+'px sans-serif';c.fillText('🏠 '+bn(Math.round(Math.hypot(S.x,S.z)))+'মি',3*k,ch-3*k);
  if(trip){
    const q=pj(trip.x,trip.z),r=6*k,px=clamp(q[0],r+2,cw-r-2),py=clamp(q[1],r*2.2+2,ch-2);
    c.fillStyle='#e53935';c.beginPath();c.arc(px,py-r*1.9,r,0,7);c.fill();
    c.beginPath();c.moveTo(px-r*.75,py-r*1.5);c.lineTo(px,py);c.lineTo(px+r*.75,py-r*1.5);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(px,py-r*1.9,r*.4,0,7);c.fill();
  }
  c.save();c.translate(cx,cy);c.fillStyle='#ffc83c';c.strokeStyle='#1c1712';c.lineWidth=1.5*k;
  c.beginPath();c.moveTo(0,-9*k);c.lineTo(6*k,7*k);c.lineTo(0,3*k);c.lineTo(-6*k,7*k);c.closePath();c.fill();c.stroke();c.restore();
}
const bm=$('bm'),bg=bm.getContext('2d');
function openBig(){   // বড় ম্যাপ: খেলা থেমে থাকে, পুরো রুট এঁটে যায়
  if(bigOpen||paused||ask)return;bigOpen=true;inp.g=inp.b=inp.l=inp.r=inp.h=0;btns.forEach(b=>b.classList.remove('on'));
  const k=Math.min(devicePixelRatio||1,2),w=Math.min(innerWidth-24,720),h=Math.min(innerHeight-80,900);
  bm.width=w*k;bm.height=h*k;bm.style.width=w+'px';bm.style.height=h+'px';bm.k=k;$('big').classList.add('show');
}
function closeBig(){bigOpen=false;$('big').classList.remove('show');}
function drawBig(){
  const k=bm.k||1,cw=bm.width,ch=bm.height,f=Math.sin(S.h),g=Math.cos(S.h);let sc=.6*k;
  if(trip&&route){
    let mr=40,mf=40;
    for(const p of[[trip.x,trip.z],...route.pts]){const dx=p[0]-S.x,dz=p[1]-S.z;mr=Math.max(mr,Math.abs(-dx*g+dz*f));mf=Math.max(mf,Math.abs(dx*f+dz*g));}
    sc=clamp(Math.min((cw/2-26*k)/mr,(ch/2-30*k)/mf),.1*k,1.2*k);
  }
  drawMap(bg,cw,ch,sc,.5,k,1);
}
$('mm').onclick=openBig;$('big').onclick=closeBig;
const btns=document.querySelectorAll('.b[data-k]');
btns.forEach(b=>{
  const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();inp[k]=1;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,()=>{inp[k]=0;b.classList.remove('on');}));
  b.addEventListener('contextmenu',e=>e.preventDefault());
});
const showMoney=()=>{$('money').textContent='৳ '+bn(money);};

export { bigOpen, btns, closeBig, dot, drawBig, openBig, showMoney, toast };
