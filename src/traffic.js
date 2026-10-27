// ট্রাফিক গাড়ি, সিগনাল, পথচারী, পুলিশ
import { HQ, NP, PD, T, bn, clamp, scene } from './core.js';
import { BS, CC, HB, W, WM, geo, hash, mainRow, tileType } from './world.js';
import { MB, R, S } from './vehicles.js';
import { sg, tt } from './passengers.js';
import { NPC } from './npc.js';
import { EV } from './events.js';

/* ---------- ট্রাফিক: NPC গাড়ি (প্রতি ধরনে ১টা InstancedMesh) + মেইন রোডের সিগনাল ---------- */
const NV=28,LANE=2,MLANE=3.5,CYC=50,mainZ=Z=>Z%80===0;   // মেইন-রোড লাইন = ৮০-এর গুণিতক (গ্রিড লাইন = ৮০j−৪০)
const nextX=(x,d)=>d>0?(Math.floor((x+.01+HB)/BS)+1)*BS-HB:(Math.ceil((x-.01+HB)/BS)-1)*BS-HB;
function nextZ(z,d){   // পরের মোড় (গ্রিড লাইন বা মেইন রোড)
  if(d>0){const a=(Math.floor((z+.01+HB)/BS)+1)*BS-HB;let c=Math.floor((z+.01)/BS)+1;while(!mainRow(c))c++;return Math.min(a,c*BS);}
  const a=(Math.ceil((z-.01+HB)/BS)-1)*BS-HB;let c=Math.ceil((z-.01)/BS)-1;while(!mainRow(c))c--;return Math.max(a,c*BS);
}
const B_=(x,y,z,sx,sy,sz,c)=>[0,x,y,z,sx,sy,sz,c,0],wh=(x,z,r,w)=>B_(x,r,z,w||.22,r*2,r*2,0x151515),WG=0xf2f2f2,GL_=0x37474f;
const VT=[
{len:4.2,wid:1.8,vm:11,w:.12,tint:[0xe53935,0x1e88e5,0xfdd835,0x43a047,0xffffff,0x90a4ae,0x8e24aa,0xf57c00],g:[B_(0,.6,0,1.8,.5,4.2,WG),B_(0,1.1,-.2,1.6,.5,2.2,WG),B_(0,1.15,-.2,1.64,.28,1.9,GL_),
  wh(-.9,1.35,.35),wh(.9,1.35,.35),wh(-.9,-1.35,.35),wh(.9,-1.35,.35),B_(-.6,.7,2.12,.4,.18,.06,0xffe9a0),B_(.6,.7,2.12,.4,.18,.06,0xffe9a0),B_(-.6,.7,-2.12,.4,.18,.06,0xd32f2f),B_(.6,.7,-2.12,.4,.18,.06,0xd32f2f)]},
{len:2,wid:.7,vm:11,w:.14,g:[B_(0,.33,.75,.12,.66,.66,0x151515),B_(0,.33,-.75,.12,.66,.66,0x151515),B_(0,.75,0,.3,.35,1.2,0xc62828),B_(0,1.2,-.1,.34,.6,.3,0x1565c0),B_(0,1.65,-.05,.26,.26,.26,0xc68642),B_(0,1.05,.5,.7,.06,.06,0x222222)]},
{len:2.4,wid:1.4,vm:4,w:.07,g:[B_(0,.6,-.4,1.2,.15,1.1,0xc62828),B_(0,.95,-.95,1.2,.6,.1,0xc62828),B_(0,1.65,-.5,1.3,.08,1.5,0xe53935),B_(-.6,1.15,.1,.06,1,.06,0xcccccc),B_(.6,1.15,.1,.06,1,.06,0xcccccc),
  B_(0,1.1,.35,.4,.6,.3,0x1565c0),B_(0,1.55,.35,.24,.24,.24,0xc68642),B_(0,.5,.2,.5,.1,1.8,0x333333),B_(0,.4,1,.1,.8,.8,0x151515),B_(-.7,.4,-.6,.1,.8,.8,0x151515),B_(.7,.4,-.6,.1,.8,.8,0x151515)]},
{len:11,wid:2.5,vm:8,w:.02,tint:[0xc62828],g:[B_(0,1.6,0,2.5,2.4,11,WG),B_(0,2.1,0,2.54,.8,10.2,GL_),B_(0,2.1,5.52,2.2,.9,.05,GL_),B_(0,2.85,0,2.3,.1,10.6,0xd0d0d0),
  wh(-1.25,3.6,.5,.3),wh(1.25,3.6,.5,.3),wh(-1.25,-3.6,.5,.3),wh(1.25,-3.6,.5,.3)]},
{len:7.5,wid:2.5,vm:8,w:.05,tint:[0xff8f00,0x1565c0,0x43a047,0x757575],g:[B_(0,1.5,2.7,2.4,2.2,2,WG),B_(0,1.9,3.72,2.2,.8,.05,GL_),B_(0,1.9,-.9,2.5,2.6,5.6,0xe0e0e0),B_(0,.55,0,1.6,.3,7.2,0x333333),
  wh(-1.1,2.7,.45),wh(1.1,2.7,.45),wh(-1.1,-1.2,.45),wh(1.1,-1.2,.45),wh(-1.1,-2.6,.45),wh(1.1,-2.6,.45)]},
{len:4,wid:1.9,vm:11,w:.05,tint:[0x556b2f,0x8d6e63,0x37474f],g:[B_(0,.75,0,1.9,.7,4,WG),B_(0,1.4,-.3,1.8,.65,2.6,WG),B_(0,1.45,-.3,1.84,.35,2.3,GL_),B_(0,.8,-2.15,.8,.8,.2,0x222222),
  wh(-.95,1.3,.4),wh(.95,1.3,.4),wh(-.95,-1.3,.4),wh(.95,-1.3,.4)]},
{len:4.5,wid:1.8,vm:12,w:.02,g:[B_(0,.6,0,1.8,.5,4.5,0xf5f5f5),B_(0,.6,0,1.84,.2,4.3,0x1a237e),B_(0,1.1,-.2,1.6,.5,2.3,0xf5f5f5),B_(0,1.15,-.2,1.64,.28,2,GL_),B_(-.3,1.45,-.2,.5,.14,.35,0xff1744),B_(.3,1.45,-.2,.5,.14,.35,0x2979ff),
  wh(-.9,1.4,.35),wh(.9,1.4,.35),wh(-.9,-1.4,.35),wh(.9,-1.4,.35)]},
{len:5.5,wid:2.1,vm:13,w:.01,g:[B_(0,1.55,-.3,2.1,2,4.4,0xf5f5f5),B_(0,1.1,2.1,2,1.2,1.4,0xf5f5f5),B_(0,1.4,2.82,1.8,.6,.05,GL_),B_(0,1.4,-.3,2.14,.28,4.4,0xe53935),B_(0,2.62,1.9,1.2,.14,.3,0xff1744),
  wh(-1,1.8,.42),wh(1,1.8,.42),wh(-1,-1.8,.42),wh(1,-1.8,.42)]},
{len:10.8,wid:2.5,vm:7.5,w:.02,tint:[0xc62828]},   // ৮ বিআরটিসি ডবল ডেকার
{len:11,wid:2.5,vm:8,w:.03,tint:[0x1565c0]},       // ৯ আলম এশিয়া
{len:11,wid:2.5,vm:8,w:.03,tint:[0x2e7d32]},       // ১০ সৌখিন
{len:11,wid:2.5,vm:8,w:.03,tint:[0xef6c00]},       // ১১ হানিফ
{len:2.9,wid:1.4,vm:9,w:.14},                      // ১২ সিএনজি
{len:3,wid:1.3,vm:6.5,w:.08,tint:[0xffd54f,0x66bb6a,0x42a5f5,0xef5350,0xffa726]},   // ১৩ অটো (ই-রিকশা)
{len:2.2,wid:.6,vm:4.2,w:.09},                     // ১৪ সাইকেল
{len:2.4,wid:1.4,vm:4,w:.10}];
const pickT=()=>{let r=Math.random();for(let i=0;i<VT.length;i++){r-=VT[i].w;if(r<0)return i;}return 0;};
const V=[],dm2=new T.Object3D(),VG=VT.map((t,i)=>MB.veh(i,!HQ)),VM=VT.map((t,i)=>{const m=new T.InstancedMesh(VG[i].b,WM,NV);m.setColorAt(0,CC.setHex(0xffffff));m.frustumCulled=false;m.count=0;m.visible=false;m.castShadow=!!HQ;scene.add(m);return m;});
const LM=new T.MeshBasicMaterial({vertexColors:true}),XM=new T.MeshBasicMaterial({map:MB.ds}),
VL=VT.map((t,i)=>{const m=new T.InstancedMesh(VG[i].l,LM,NV);m.frustumCulled=false;m.count=0;m.visible=false;scene.add(m);return m;}),   // হেডলাইট/টেইললাইট (আলাদা, আলোকিত)
VX=VT.map((t,i)=>{if(!VG[i].x)return null;const m=new T.InstancedMesh(VG[i].x,XM,NV);m.frustumCulled=false;m.count=0;m.visible=false;scene.add(m);return m;});   // বাসের গন্তব্য-ফলক
function rebuildV(){VT.forEach((t,i)=>{const g=MB.veh(i,!HQ);VM[i].geometry.dispose();VM[i].geometry=g.b;VL[i].geometry.dispose();VL[i].geometry=g.l;if(VX[i]){VX[i].geometry.dispose();VX[i].geometry=g.x;}});}
let tClock=0,spawnT2=0,sRem=0;
const laneOf=(ax,l)=>ax===0&&mainZ(l)?MLANE:LANE;   // বাঁ-হাতি ট্রাফিক
function sigSt(ax,off){let ph=(tClock+off)%CYC;if(ax===0)ph=(ph+25)%CYC;if(ph<20){sRem=20-ph;return 0;}if(ph<23){sRem=23-ph;return 1;}sRem=CYC-ph;return 2;}   // চক্র ৫০সে: সবুজ ২০ · হলুদ ৩ · (লাল, উল্টো দিকের সবুজ আসার আগে ২সে সবার লাল)   // ০ সবুজ, ১ হলুদ, ২ লাল
function vPlace(v){const ln=laneOf(v.ax,v.L);if(v.ax){v.x=v.L+v.d*ln;v.z=v.p;v.hx=0;v.hz=v.d;}else{v.x=v.p;v.z=v.L-v.d*ln;v.hx=v.d;v.hz=0;}}
function vTurn(v){   // মোড়ের বাঁক: লেন থেকে লেনে কোয়াড্রাটিক বেজিয়ার
  const ax=v.ax,d=v.d,l0=v.L,ox=ax?0:d,oz=ax?d:0,jx=ax?l0:v.nj,jz=ax?v.nj:l0,nv=v.plan===1?[oz,-ox]:[-oz,ox],na=1-ax,dn=na?nv[1]:nv[0],Ln=ax?jz:jx,lnO=laneOf(ax,l0),lnN=laneOf(na,Ln),e=6;
  let cx,cz;if(ax){cx=l0+d*lnO;cz=Ln-dn*lnN;}else{cz=l0-d*lnO;cx=Ln+dn*lnN;}
  return{cx,cz,e,nv,na,dn,Ln,sp:ax?cz-d*e:cx-d*e};
}
function vNext(v){
  v.nj=v.ax?nextZ(v.p,v.d):nextX(v.p,v.d);const r=Math.random();v.plan=r<.68?0:r<.84?1:2;v.tg=v.plan?vTurn(v):null;
  if(v.ax?mainZ(v.nj):mainZ(v.L)){const jx=v.ax?v.L:v.nj,jz=v.ax?v.nj:v.L;v.off=hash(Math.round((jx+HB)/BS),Math.round(jz/BS),7)%CYC;v.stop=v.ax?9:6.5;}else v.off=-1;
}
function vArc(v){
  const t=v.tg,a=v.arc={A:[v.x,v.z],C:[t.cx,t.cz],B:[t.cx+t.nv[0]*t.e,t.cz+t.nv[1]*t.e],u:0,t};
  a.len=Math.max(1,(2*Math.hypot(a.B[0]-a.A[0],a.B[1]-a.A[1])+Math.hypot(a.C[0]-a.A[0],a.C[1]-a.A[1])+t.e)/3);
}
function vGap(v,x,z,hx,hz,len,wid,f){   // সামনের গাড়ি/প্লেয়ারের সাথে ফাঁক (শঙ্কু-পরীক্ষা)
  const dx=x-v.x,dz=z-v.z,fw=dx*v.hx+dz*v.hz;if(fw<=0||fw>45)return 1e9;
  if(Math.abs(-dx*v.hz+dz*v.hx)>=(v.wid+wid)/2+.6)return 1e9;
  if(f&&v.hx*hx+v.hz*hz<-.3)return 1e9;   // উল্টো দিকের গাড়ি এড়াও (ডেডলক ঠেকাতে)
  return fw-(v.len+len)/2-1.4;
}
function bodyGap(v,x,z,r){   // সামনের মানুষ/প্রাণী/পুলিশের জন্য ফাঁক (r = তার ব্যাসার্ধ)
  const dx=x-v.x,dz=z-v.z,fw=dx*v.hx+dz*v.hz;if(fw<=0||fw>25||Math.abs(-dx*v.hz+dz*v.hx)>v.wid/2+r+.6)return 1e9;return fw-v.len/2-r-1.2;
}
function vMove(v,dt){
  if((v.zt-=dt)<=0){v.zt=.6;v.vm=v.vb*zoneF(v)*EV.slow(v.x,v.z);}   // যানজট: এলাকা অনুযায়ী গতি কমে
  let gap=1e9;
  v.sw=0;let gv=1e9;for(const o of V)if(o!==v){const g=vGap(v,o.x,o.z,o.hx,o.hz,o.len,o.wid,1);if(g<gap)gap=g;if(g<gv)gv=g;}
  {const g=vGap(v,S.x,S.z,Math.sin(S.h),Math.cos(S.h),2.8,1.4,0);if(g<gap)gap=g;}
  for(const o of PD){if(o.y>.5)continue;const g=bodyGap(v,o.x+o.ox,o.z+o.oz,.3);if(g<gap)gap=g;}   // পথচারীর জন্য থামো
  for(const a of NPC.ANI){if(a.y>.5||a.mode==='fly')continue;const g=bodyGap(v,a.x+a.ox,a.z+a.oz,a.k==='goat'?.5:.25);if(g<gap)gap=g;}   // গরু-ছাগল-হাঁস
  for(const p of PO){const g=bodyGap(v,p.x,p.z,.45);if(g<gap)gap=g;}   // ট্রাফিক পুলিশ
  {const g=EV.gap(v,dt);if(g<gap)gap=g;}
  let tv=Math.min(v.vm,gap<1e8?Math.sqrt(8*Math.max(0,gap)):99);
  if(v.arc)tv=Math.min(tv,5);
  else if(v.off>=0){const st=sigSt(v.ax,v.off),g=v.d*((v.nj-v.d*v.stop)-(v.p+v.d*v.len/2));   // লাল/হলুদে স্টপ-লাইনে থামো
    if(st>0&&g>-1&&!(st===1&&g<Math.max(4,v.v*v.v/10))){v.sw=1;tv=Math.min(tv,Math.sqrt(8*Math.max(0,g)));}}
  v.v=Math.max(0,v.v+clamp(tv-v.v,-9*dt,2.6*dt));
  if(v.v<.3&&gv<2&&!v.sw){if((v.stuck+=dt)>(Math.hypot(v.x-S.x,v.z-S.z)>45?9:30))v.dead=1;}else v.stuck=Math.max(0,v.stuck-dt);   // আটকে গেলে (দূরে হলে দ্রুত) সরিয়ে ফেলো, কারো ভেতর দিয়ে যাবে না
  if(v.arc){
    const a=v.arc,t=a.t;a.u=Math.min(1,a.u+v.v*dt/a.len);const u=a.u,q=1-u,
    tx=2*q*(a.C[0]-a.A[0])+2*u*(a.B[0]-a.C[0]),tz=2*q*(a.C[1]-a.A[1])+2*u*(a.B[1]-a.C[1]),tl=Math.hypot(tx,tz)||1;
    v.x=q*q*a.A[0]+2*q*u*a.C[0]+u*u*a.B[0];v.z=q*q*a.A[1]+2*q*u*a.C[1]+u*u*a.B[1];v.hx=tx/tl;v.hz=tz/tl;
    if(u>=1){v.ax=t.na;v.L=t.Ln;v.d=t.dn;v.p=t.na?a.B[1]:a.B[0];v.arc=null;vNext(v);vPlace(v);}
  }else{
    v.p+=v.d*v.v*dt;
    if(v.plan){if(v.d*(v.p-v.tg.sp)>=0){vPlace(v);vArc(v);}}else if(v.d*(v.p-v.nj)>0)vNext(v);
    if(!v.arc)vPlace(v);
  }
  const dx=S.x-v.x,dz=S.z-v.z;   // প্লেয়ারের সাথে শুধু ফিজিক্যাল ধাক্কা: ঠেলে সরানো + গতি কমানো, কোনো শাস্তি নেই
  if(Math.abs(dx)<8&&Math.abs(dz)<8){
    const lz=dx*v.hx+dz*v.hz,lx=-dx*v.hz+dz*v.hx,hl=v.len/2+R,hw=v.wid/2+R;
    if(Math.abs(lz)<hl&&Math.abs(lx)<hw){
      const px=hw-Math.abs(lx),pz=hl-Math.abs(lz);
      if(px<pz){const k=px*sg(lx);S.x-=v.hz*k;S.z+=v.hx*k;}else{const k=pz*sg(lz);S.x+=v.hx*k;S.z+=v.hz*k;}
      S.v*=.9;v.v*=.6;
    }
  }
}
function vSpawn(){   // প্লেয়ারের আশেপাশের গ্রিড রাস্তায়, ৭৫–১৭০ মি দূরে (কুয়াশার কাছাকাছি)
  for(let n=0;n<30;n++){
    const ax=Math.random()<.5?1:0;let l;
    if(ax)l=(Math.round((S.x+HB)/BS)+((Math.random()*5)|0)-2)*BS-HB;
    else if(Math.random()<.55){const cz=Math.round(S.z/BS)+((Math.random()*5)|0)-2;if(!mainRow(cz))continue;l=cz*BS;}
    else l=(Math.round((S.z+HB)/BS)+((Math.random()*5)|0)-2)*BS-HB;
    const d=Math.random()<.5?1:-1,t=pickT(),Y=VT[t],p=(ax?S.z:S.x)+(Math.random()*2-1)*165,ln=laneOf(ax,l),x=ax?l+d*ln:p,z=ax?p:l-d*ln,dist=Math.hypot(x-S.x,z-S.z);
    if(dist<75||dist>170)continue;
    if(Math.random()>(zoneF({ax,L:l,x,z})<.7?1:.22))continue;   // বাজার/মেইন রোডে ঘনত্ব বেশি
    if(Math.abs((ax?nextZ(p,d):nextX(p,d))-p)<25)continue;
    if(V.some(o=>Math.hypot(o.x-x,o.z-z)<(o.len+Y.len)/2+7))continue;
    const sr=Y.len/2+2.5;if(PD.some(o=>Math.hypot(o.x-x,o.z-z)<sr)||NPC.ANI.some(a=>Math.hypot(a.x-x,a.z-z)<sr)||PO.some(o=>Math.hypot(o.x-x,o.z-z)<sr)||EV.hit(x,z,Y.len/2+2))continue;   // মানুষ/প্রাণী/ঘটনার জায়গায় জন্মাবে না
    const v={t,ax,L:l,d,p,len:Y.len,wid:Y.wid,vb:Y.vm*(.85+Math.random()*.25),vm:0,zt:0,tint:Y.tint?Y.tint[(Math.random()*Y.tint.length)|0]:0xffffff,arc:null,stuck:0,ghost:0,x,z,hx:0,hz:0};
    v.vm=v.vb*zoneF(v);v.v=v.vm*.7;vNext(v);vPlace(v);V.push(v);return;
  }
}
/* ---------- ওভারল্যাপ-রক্ষক: কেউ কারো ভেতরে ঢুকে গেলে ঠেলে সরানো (বাগ-ঢাল) ---------- */
let rsT=0;const PV={x:0,z:0,hx:0,hz:1,len:2.8,wid:1.4};   // PV = প্লেয়ারের রিকশার বক্স
function pushOut(v,x,z,r){   // গাড়ির বক্স থেকে r-ব্যাসার্ধের বৃত্ত বের করার সরণ-ভেক্টর; ছেদ না থাকলে null
  const dx=x-v.x,dz=z-v.z,lz=dx*v.hx+dz*v.hz,lx=-dx*v.hz+dz*v.hx,hl=v.len/2,hw=v.wid/2,cz=Math.max(-hl,Math.min(hl,lz)),cx=Math.max(-hw,Math.min(hw,lx)),ez0=lz-cz,ex0=lx-cx,d=Math.hypot(ez0,ex0);
  if(d>=r)return null;let ez,ex;
  if(d>1e-4){ez=ez0/d*(r-d);ex=ex0/d*(r-d);}else{const a=hl-Math.abs(lz),b=hw-Math.abs(lx);if(a<b){ez=(lz>=0?1:-1)*(a+r);ex=0;}else{ex=(lx>=0?1:-1)*(b+r);ez=0;}}
  return[ez*v.hx-ex*v.hz,ez*v.hz+ex*v.hx];
}
function obbDepth(a,b){   // দুই বক্সের ছেদের গভীরতা (০ = ছেদ নেই)
  const ha=[a.len/2,a.wid/2],hb=[b.len/2,b.wid/2],dx=b.x-a.x,dz=b.z-a.z;let m=1e9;
  for(const[x,z]of[[a.hx,a.hz],[-a.hz,a.hx],[b.hx,b.hz],[-b.hz,b.hx]]){
    const ra=ha[0]*Math.abs(a.hx*x+a.hz*z)+ha[1]*Math.abs(-a.hz*x+a.hx*z),rb=hb[0]*Math.abs(b.hx*x+b.hz*z)+hb[1]*Math.abs(-b.hz*x+b.hx*z),o=ra+rb-Math.abs(dx*x+dz*z);
    if(o<=0)return 0;if(o<m)m=o;}
  return m;
}
function yieldBack(v,d){v.v=0;if(v.arc){const a=v.arc;a.u=Math.max(0,a.u-d/a.len);}else{v.p-=v.d*d;vPlace(v);}}   // গাড়ি নিজের লেনে পেছনে সরে
function playerPush(){   // প্লেয়ারের রিকশা ↔ মানুষ/প্রাণী: কেউ ভেতরে ঢুকবে না (প্রতি ফ্রেম)
  PV.x=S.x;PV.z=S.z;PV.hx=Math.sin(S.h);PV.hz=Math.cos(S.h);
  for(const o of PD){if(o.y>.5)continue;const f=pushOut(PV,o.x+o.ox,o.z+o.oz,.3);if(f){NPC.nudge(o,f[0]*1.05,f[1]*1.05);S.v*=.98;}}
  for(const a of NPC.ANI){if(a.y>.5||a.mode==='fly')continue;const f=pushOut(PV,a.x+a.ox,a.z+a.oz,a.k==='goat'?.5:.25);if(f){NPC.nudge(a,f[0]*1.05,f[1]*1.05);S.v*=.98;}}
  for(const p of PO){const f=pushOut(PV,p.x,p.z,.45);if(f){S.x-=f[0];S.z-=f[1];S.v*=.9;}}
}
function overlapPass(){   // প্রতি ০.৪ সেকেন্ডে: গাড়ি-গাড়ি, গাড়ি-মানুষ/প্রাণী/পুলিশ/ঘটনার দল, মানুষ-মানুষ
  for(let i=0;i<V.length;i++){const a=V[i];
    for(let j=i+1;j<V.length;j++){const b=V[j],r=(a.len+b.len)/2+.5;if(Math.abs(a.x-b.x)>r||Math.abs(a.z-b.z)>r)continue;
      const d=obbDepth(a,b);if(d<=.02)continue;
      const fa=(b.x-a.x)*a.hx+(b.z-a.z)*a.hz,fb=(a.x-b.x)*b.hx+(a.z-b.z)*b.hz;let y;
      if(fa>0&&fb>0)y=a.v<=b.v?a:b;else if(fa>0)y=a;else y=b;   // যার সামনে অন্যজন, সে পেছনে সরবে
      yieldBack(y,Math.min(2,d+.15));}}
  for(const v of V){
    for(const o of PD){if(o.y>.5)continue;const x=o.x+o.ox,z=o.z+o.oz;if(Math.abs(x-v.x)>v.len/2+1||Math.abs(z-v.z)>v.len/2+1)continue;const f=pushOut(v,x,z,.3);if(f)NPC.nudge(o,f[0]*1.05,f[1]*1.05);}
    for(const a of NPC.ANI){if(a.y>.5||a.mode==='fly')continue;const x=a.x+a.ox,z=a.z+a.oz;if(Math.abs(x-v.x)>v.len/2+1||Math.abs(z-v.z)>v.len/2+1)continue;const f=pushOut(v,x,z,a.k==='goat'?.5:.25);if(f)NPC.nudge(a,f[0]*1.05,f[1]*1.05);}
    for(const p of PO){const f=pushOut(v,p.x,p.z,.45);if(f)yieldBack(v,Math.min(2,Math.hypot(f[0],f[1])+.2));}
    for(const e of EV.list){if(Math.abs(e.x-v.x)>60||Math.abs(e.z-v.z)>60)continue;for(const o of e.ob){const f=pushOut(v,o.x,o.z,o.r);if(f){yieldBack(v,Math.min(2,Math.hypot(f[0],f[1])+.2));break;}}}
  }
  for(let i=0;i<PD.length;i++){const a=PD[i];if(a.y>.5)continue;
    for(let j=i+1;j<PD.length;j++){const b=PD[j];if(b.y>.5||a.pt===b||b.pt===a)continue;
      const dx=b.x+b.ox-a.x-a.ox,dz=b.z+b.oz-a.z-a.oz;if(Math.abs(dx)>.4||Math.abs(dz)>.4)continue;const d=Math.hypot(dx,dz);if(d>=.35)continue;
      const k=d>1e-3?(.35-d)/2/d:0,ux=d>1e-3?dx*k:.1,uz=d>1e-3?dz*k:0;NPC.nudge(a,-ux,-uz);NPC.nudge(b,ux,uz);}}
}
function trafficStep(dt){
  tClock+=dt;
  for(let i=V.length-1;i>=0;i--)if(V[i].dead||Math.hypot(V[i].x-S.x,V[i].z-S.z)>230)V.splice(i,1);   // দূরে গেলে মুছে যাবে
  if(V.length<NV){spawnT2-=dt;if(spawnT2<=0){vSpawn();spawnT2=.25+Math.random()*.45;}}
  for(const v of V)vMove(v,dt);
  playerPush();if((rsT-=dt)<=0){rsT=.4;overlapPass();}
  pedStep(dt);
}
function trafficReset(){V.length=0;PD.length=0;tClock=Math.random()*CYC;sigKey='';for(let i=0;i<110&&V.length<NV;i++)vSpawn();NPC.reset();spawnT2=.6;}
/* ---------- বাস্তবসম্মত সিগনাল + পথচারী + ট্রাফিক পুলিশ (সব InstancedMesh; মোট সীমা: গাড়ি ১৬, পথচারী ৩৬, পুলিশ ৬, সিগনাল-মুখ ৪০) ---------- */
const NPO=6,sigB=new T.BoxGeometry(1,1,1),lampG=new T.SphereGeometry(1,7,5),
sigS=new T.InstancedMesh(sigB,new T.MeshStandardMaterial({color:0xffffff}),256),   // খুঁটি, মাস্ট-আর্ম, বাতির বাক্স, ব্যাকপ্লেট
sigL=new T.InstancedMesh(lampG,new T.MeshBasicMaterial({color:0xffffff}),256),    // গোল বাতি (instanceColor)
paint=new T.InstancedMesh(sigB,new T.MeshStandardMaterial({color:0xf4f4f4}),480),  // স্টপ-লাইন + জেব্রা ক্রসিং
dm3=new T.Object3D(),SP=[],SPM={},HB_=0x1a3a8a,
poS=new T.InstancedMesh(geo([B_(-.1,.4,0,.15,.8,.2,HB_),B_(.1,.4,0,.15,.8,.2,HB_),B_(0,.85,0,.5,.1,.3,HB_),B_(0,1.15,0,.48,.55,.28,0xf5f5f5),B_(0,1.58,0,.22,.22,.22,0xc68642),B_(0,1.75,0,.27,.12,.27,HB_),B_(0,1.83,0,.25,.04,.25,0xffffff)]),WM,NPO),
poA=new T.InstancedMesh(geo([B_(0,-.25,0,.12,.5,.12,0xf5f5f5),B_(0,-.57,0,.1,.14,.1,0xc68642)]),WM,NPO*2),   // হাত: কাঁধে পিভট
pdR=new T.InstancedMesh(geo([B_(-.1,.4,0,.14,.8,.2,0x37474f),B_(.1,.4,0,.14,.8,.2,0x37474f),B_(0,1.58,0,.22,.22,.22,0xc68642),B_(0,1.7,0,.24,.07,.24,0x1a1a1a)]),WM,NP),
pdB=new T.InstancedMesh(geo([B_(0,1.1,0,.46,.6,.26,0xffffff),B_(-.3,1.05,0,.1,.55,.12,0xffffff),B_(.3,1.05,0,.1,.55,.12,0xffffff)]),WM,NP);   // জামা (রঙ instanceColor)
sigL.userData.nm=1;
[paint,poS,poA,pdR].forEach(m=>{m.setColorAt(0,CC.setHex(0xffffff));m.instanceColor.array.fill(1);});   // সব InstancedMesh-এ instanceColor থাকুক
[sigS,sigL,pdB].forEach(m=>m.setColorAt(0,CC.setHex(0xffffff)));
[sigS,sigL,paint,poS,poA,pdR,pdB].forEach(m=>{m.frustumCulled=false;m.count=0;scene.add(m);});
const PTINT=[0xe8e8e8,0x4f8fd8,0x66bb6a,0xc2185b,0xef6c00,0x7e57c2,0xfdd835,0x8d6e63,0x26a69a];
let HD=[],PO=[],sigKey='',sigOx=NaN,sigOz=NaN,pedT=0;
function tm(st,n){const k=st*100+n;let m=SPM[k];if(!m){const c=document.createElement('canvas');c.width=64;c.height=32;const g=c.getContext('2d'),col=['#44ff88','#ffd23f','#ff4444'][st];
  g.fillStyle='#111';g.fillRect(0,0,64,32);g.strokeStyle=g.fillStyle=col;g.lineWidth=3;g.strokeRect(1.5,1.5,61,29);g.font='bold 22px "Hind Siliguri","Noto Sans Bengali",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(bn(n),32,17);
  m=SPM[k]=new T.SpriteMaterial({map:new T.CanvasTexture(c)});}return m;}
for(let i=0;i<10;i++){const sp=new T.Sprite(tm(2,0));sp.scale.set(1.6,.8,1);sp.visible=false;scene.add(sp);SP.push(sp);}
function zoneF(v){   // যানজট-গুণক: বাজার ও মেইন রোডে ধীর, সিগনাল মোড়ের কাছে আরও ধীর
  const F={bazaar:.4,main:.45,resi:.85};let f=1;
  const tz=(a,b)=>{const t=F[tileType(a,b)];if(t&&t<f)f=t;};
  if(v.ax){const i=Math.round((v.L+HB)/BS),c=Math.round(v.z/BS);tz(i,c);tz(i-1,c);}
  else if(mainZ(v.L))tz(Math.round(v.x/BS),Math.round(v.L/BS));
  else{const j=Math.round((v.L+HB)/BS),c=Math.round(v.x/BS);tz(c,j);tz(c,j-1);}
  if(v.off>=0&&Math.abs(v.nj-v.p)<30)f*=.8;
  return f;
}
function buildSig(){   // প্রতিটা মেইন-রোড মোড়ে ৪ দিকের সিগনাল-মুখ; প্রতি দ্বিতীয় মোড়ে পুলিশ
  HD=[];PO=[];const R2=160,i0=Math.floor((S.x-R2+HB)/BS),i1=Math.ceil((S.x+R2+HB)/BS),c0=Math.floor((S.z-R2)/BS),c1=Math.ceil((S.z+R2)/BS);
  for(let i=i0;i<=i1;i++)for(let c=c0;c<=c1;c++){
    if(!mainRow(c)||HD.length>36)continue;const jx=i*BS-HB,jz=c*BS;if(Math.abs(jx-S.x)>R2||Math.abs(jz-S.z)>R2)continue;
    const off=hash(i,c,7)%CYC;
    for(const[ax,d]of[[1,1],[1,-1],[0,1],[0,-1]]){
      const px=ax?jx+d*5:jx-d*6.5,pz=ax?jz-d*9:jz-d*8;
      HD.push({ax,d,off,jx,jz,px,pz,hx:ax?jx+d*LANE:px,hz:ax?pz:jz-d*MLANE,s:-1});
    }
    if(hash(i,c,11)%2===0&&PO.length<NPO)PO.push({x:jx+6.3,z:jz-7.8,yaw:Math.atan2(-6.3,7.8),ph:Math.random()*6});
  }
  sigOx=NaN;
}
function applySig(){   // ফ্লোটিং-অরিজিন বদলালে/নতুন সেট হলে ম্যাট্রিক্স আবার বসাও
  const ox=W.ox,oz=W.oz,set=(m,k,x,y,z,sx,sy,sz,c)=>{dm3.rotation.set(0,0,0);dm3.scale.set(sx,sy,sz);dm3.position.set(x-ox,y,z-oz);dm3.updateMatrix();m.setMatrixAt(k,dm3.matrix);if(c!=null)m.setColorAt(k,CC.setHex(c));};
  let np=0;const pa=(x,z,sx,sz)=>{if(np<480)set(paint,np++,x,.12,z,sx,.03,sz,null);};
  HD.forEach((h,k)=>{
    const a=h.ax,d=h.d,fx=a?0:-d,fz=a?-d:0,bx=-fx,bz=-fz,X=h.px,Z=h.pz,HX=h.hx,HZ=h.hz,S1=(w,t)=>a?[w,t]:[t,w];
    set(sigS,6*k,X,3.45,Z,.18,6.7,.18,0x4a4a4a);   // খুঁটি
    if(a)set(sigS,6*k+1,(X+HX)/2,6.5,Z,Math.abs(X-HX)+.2,.2,.2,0x4a4a4a);else set(sigS,6*k+1,X,6.5,(Z+HZ)/2,.2,.2,Math.abs(Z-HZ)+.2,0x4a4a4a);   // রাস্তার উপর মাস্ট-আর্ম
    let q=S1(.5,.35);set(sigS,6*k+2,HX,5.5,HZ,q[0],1.5,q[1],0x111111);                         // উপরের মাথা
    q=a?[.95,.06]:[.06,.95];set(sigS,6*k+3,HX+bx*.22,5.5,HZ+bz*.22,q[0],1.8,q[1],0x2b2b2b);    // ব্যাকপ্লেট
    q=S1(.45,.32);set(sigS,6*k+4,X,3.2,Z,q[0],1.25,q[1],0x111111);                             // খুঁটির রিপিটার মাথা
    q=a?[.8,.05]:[.05,.8];set(sigS,6*k+5,X+bx*.2,3.2,Z+bz*.2,q[0],1.5,q[1],0x2b2b2b);
    [5.95,5.5,5.05].forEach((y,i)=>set(sigL,6*k+i,HX+fx*.2,y,HZ+fz*.2,.19,.19,.19,null));
    [3.65,3.2,2.75].forEach((y,i)=>set(sigL,6*k+3+i,X+fx*.18,y,Z+fz*.18,.16,.16,.16,null));
    if(a){pa(h.jx+d*2.05,h.jz-d*9,3.5,.35);for(let i=-3;i<=3;i++)pa(h.jx+i,h.jz-d*8,.5,1.2);}   // স্টপ-লাইন + জেব্রা
    else{pa(h.jx-d*6.5,h.jz-d*3.55,.35,6.5);for(let i=-5;i<=5;i++)pa(h.jx-d*5.4,h.jz+i*1.1,1.2,.5);}
  });
  PO.forEach((p,k)=>{dm3.rotation.set(0,p.yaw,0);dm3.scale.set(1,1,1);dm3.position.set(p.x-ox,.1,p.z-oz);dm3.updateMatrix();poS.setMatrixAt(k,dm3.matrix);});
  sigS.count=sigL.count=6*HD.length;paint.count=np;poS.count=PO.length;
  sigS.instanceMatrix.needsUpdate=sigL.instanceMatrix.needsUpdate=paint.instanceMatrix.needsUpdate=poS.instanceMatrix.needsUpdate=sigS.instanceColor.needsUpdate=true;
  sigOx=ox;sigOz=oz;
}
function pedStep(dt){NPC.step(dt);}
function trafficView(){
  const cnt=VT.map(()=>0);
  for(const v of V){const k=cnt[v.t]++,m=VM[v.t];dm2.position.set(v.x-W.ox,.1,v.z-W.oz);dm2.rotation.set(0,Math.atan2(v.hx,v.hz),0);dm2.updateMatrix();m.setMatrixAt(k,dm2.matrix);m.setColorAt(k,CC.setHex(v.tint));VL[v.t].setMatrixAt(k,dm2.matrix);if(VX[v.t])VX[v.t].setMatrixAt(k,dm2.matrix);}
  VM.forEach((m,i)=>{m.count=cnt[i];m.visible=cnt[i]>0;if(cnt[i]){m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;}});
  VL.forEach((m,i)=>{m.count=cnt[i];m.visible=cnt[i]>0;m.instanceMatrix.needsUpdate=true;const x=VX[i];if(x){x.count=cnt[i];x.visible=cnt[i]>0;x.instanceMatrix.needsUpdate=true;}});
  const key=Math.round(S.x/BS)+','+Math.round(S.z/BS);if(key!==sigKey){sigKey=key;buildSig();}
  if(sigOx!==W.ox||sigOz!==W.oz)applySig();
  HD.forEach((h,k)=>{const st=sigSt(h.ax,h.off);if(h.s!==st){h.s=st;[0xff2a2a,0xffc400,0x2ee66b].forEach((c,q)=>{CC.setHex(c);if(q!==2-st)CC.multiplyScalar(.15);sigL.setColorAt(6*k+q,CC);sigL.setColorAt(6*k+3+q,CC);});sigL.instanceColor.needsUpdate=true;}});
  let u=0;   // কাউন্টডাউন: কাছের ১০টা মুখে
  for(const h of HD){if(u>=10)break;const dx=h.hx-S.x,dz=h.hz-S.z;if(dx*dx+dz*dz>3600)continue;const st=sigSt(h.ax,h.off),sp=SP[u++];sp.material=tm(st,Math.ceil(sRem));sp.position.set(h.hx-W.ox,7.35,h.hz-W.oz);sp.visible=true;}
  for(;u<10;u++)SP[u].visible=false;
  PO.forEach((p,k)=>{const c=Math.cos(p.yaw),sn=Math.sin(p.yaw);   // পুলিশের হাত: ডান হাত তুলে নাড়ে, বাম হাত নিচে
    for(const sd of[1,-1]){dm3.position.set(p.x+sd*.3*c-W.ox,1.5,p.z-sd*.3*sn-W.oz);dm3.rotation.set(0,p.yaw,sd>0?Math.PI*.78+Math.sin(tt*5+p.ph)*.3:-.12);dm3.scale.set(1,1,1);dm3.updateMatrix();poA.setMatrixAt(2*k+(sd>0?0:1),dm3.matrix);}});
  poA.count=2*PO.length;poA.instanceMatrix.needsUpdate=true;
  NPC.draw();
  ;
}
export { LM, V, VG, rebuildV, trafficReset, trafficStep, trafficView };
