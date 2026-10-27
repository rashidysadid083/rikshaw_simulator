// রাস্তার ঘটনা (ইভেন্ট ম্যানেজার)
import { loadEventSeed } from './save.js';
import { $, HQ, T, bn, scene } from './core.js';
import { BS, HB, W, WM, area, hash, mainRow, mkRng } from './world.js';
import { MB, S } from './vehicles.js';
import { trip } from './passengers.js';
import { toast } from './ui.js';
import { LM, V, VG } from './traffic.js';

/* ---------- রাস্তার ঘটনা: ইভেন্ট ম্যানেজার (সিড-ঠিক-করা; প্লেয়ারের ২০০–৫০০ মি-এর মধ্যে একসাথে সর্বোচ্চ ২টা; সব কার্টুন-স্টাইলে নিরীহ) ---------- */
const EV=(()=>{
const EVL=[],MAXE=2,RMIN=200,RMAX=500,RDEL=580,EP=240;
let SEED=loadEventSeed();
let clk=0,rt=0,hT=0,ver=0,EC=new Map(),hudTxt='';const GONE=[],REJ=new Map();   // মেয়াদ-শেষ ঘটনার জায়গা: একই জায়গায় আবার না আসার জন্য
const KD={
 accident:{ic:'🚗',n:'ছোট দুর্ঘটনা',al:'দুই গাড়ি ঠেকে আছে, ভিড়',cost:90,w:1,life:65},
 blockade:{ic:'🚧',n:'অবরোধ',al:'রাস্তা বন্ধ',cost:Infinity,cl:1,w:.9},
 march:{ic:'📣',n:'শান্তিপূর্ণ মিছিল',al:'মিছিল যাচ্ছে',cost:160,w:1},
 baraat:{ic:'🎺',n:'বর্ষাত্রী ও ব্যান্ড',al:'বিয়ের বর্ষাত্রী, ব্যান্ড বাজছে',cost:130,w:.8},
 repair:{ic:'🛠️',n:'রাস্তা মেরামত',al:'রাস্তার এক পাশ বন্ধ',cost:110,w:1},
 flood:{ic:'🌊',n:'জলাবদ্ধতা',al:'রাস্তায় পানি, আস্তে চালাও',cost:420,w:.9},
 cattle:{ic:'🐄',n:'গরু-ছাগল পার হচ্ছে',al:'গরু-ছাগল রাস্তা পার হচ্ছে',cost:45,w:1},
 cricket:{ic:'🏏',n:'বাচ্চাদের ক্রিকেট',al:'গলিতে বাচ্চারা খেলছে',cost:50,w:1}};
const KN=Object.keys(KD),KW=KN.reduce((a,k)=>a+KD[k].w,0);
const pickK=r=>{r*=KW;for(const k of KN){r-=KD[k].w;if(r<0)return k;}return KN[0];},pk=(r,a)=>a[(r()*a.length)|0];
/* ---- জিওমেট্রি-সহায়ক ---- */
const M4=new T.Matrix4(),Q4=new T.Quaternion(),EU=new T.Euler(),P3=new T.Vector3(),S3=new T.Vector3();
const BXG=new T.BoxGeometry(1,1,1),CYG=new T.CylinderGeometry(1,1,1,10),CNG=new T.ConeGeometry(1,1,1,8),SPG=new T.SphereGeometry(1,8,6),TRG=new T.TorusGeometry(1,.42,6,10),CIG=new T.CircleGeometry(1,22),PLP=new T.PlaneGeometry(1,1),PLG=new T.BoxGeometry(.05,1.4,.05);
[PLP,PLG,CIG].forEach(g=>g.userData.keep=1);
const gp=(G,c,x,y,z,rx,ry,rz,sx,sy,sz)=>{EU.set(rx||0,ry||0,rz||0);Q4.setFromEuler(EU);M4.compose(P3.set(x,y,z),Q4,S3.set(sx,sy,sz));const g=G.index?G.toNonIndexed():G.clone();g.applyMatrix4(M4);return{g,c};};
const bx=(c,x,y,z,w,h,d,ry,rx,rz)=>gp(BXG,c,x,y,z,rx,ry,rz,w,h,d),cy=(c,x,y,z,r,h,rx,ry,rz)=>gp(CYG,c,x,y,z,rx,ry,rz,r,h,r),cn=(c,x,y,z,r,h,rx,ry,rz)=>gp(CNG,c,x,y,z,rx,ry,rz,r,h,r),
 sp=(c,x,y,z,a,b,d)=>gp(SPG,c,x,y,z,0,0,0,a,b||a,d||a),tr=(c,x,y,z,r)=>gp(TRG,c,x,y,z,1.5708,0,0,r,r,r);
const mesh=ps=>{const m=new T.Mesh(MB.merge(ps),MB.mat);m.castShadow=!!HQ;return m;};
const TM=new Map(),matT=h=>{let m=TM.get(h);if(!m){m=WM.clone();m.color.setHex(h);TM.set(h,m);}return m;},PLM=new T.MeshStandardMaterial({color:0x8a6a44,roughness:.9});
const FNT='"Hind Siliguri","Noto Sans Bengali",sans-serif',TXM=new Map();
function txm(t,bg,fg,w,h,fs){const key=t+bg+fg;let m=TXM.get(key);if(m)return m;w=w||256;h=h||128;fs=fs||36;
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(5,5,w-10,h-10);
 g.fillStyle=fg;g.font='bold '+fs+'px '+FNT;g.textAlign='center';g.textBaseline='middle';
 const ln=[];let cur='';for(const x of t.split(' ')){const q=cur?cur+' '+x:x;if(g.measureText(q).width>w-24&&cur){ln.push(cur);cur=x;}else cur=q;}ln.push(cur);
 ln.forEach((s,i)=>g.fillText(s,w/2,h/2+(i-(ln.length-1)/2)*fs*1.15));
 m=new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),side:T.DoubleSide});TXM.set(key,m);return m;}
function plac(t,bg,fg,w,h){const g=new T.Group(),m=new T.Mesh(PLP,txm(t,bg||'#fff6d6',fg||'#1d3b66'));m.scale.set(w||1.15,h||.58,1);m.position.y=1.95;g.add(m);const p=new T.Mesh(PLG,PLM);p.position.y=1.2;g.add(p);return g;}
const BBM=new Map();
function bub(t){let m=BBM.get(t);if(!m){const cv=document.createElement('canvas');cv.width=256;cv.height=128;const g=cv.getContext('2d');g.fillStyle='#fff';g.strokeStyle='#333';g.lineWidth=5;g.beginPath();g.moveTo(24,8);g.lineTo(232,8);g.quadraticCurveTo(250,8,250,26);g.lineTo(250,76);g.quadraticCurveTo(250,94,232,94);g.lineTo(150,94);g.lineTo(128,122);g.lineTo(118,94);g.lineTo(24,94);g.quadraticCurveTo(6,94,6,76);g.lineTo(6,26);g.quadraticCurveTo(6,8,24,8);g.fill();g.stroke();
 g.fillStyle='#222';g.font='bold 34px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText(t,128,50);m=new T.SpriteMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false});BBM.set(t,m);}
 const s=new T.Sprite(m);s.scale.set(2.4,1.2,1);return s;}
/* ---- মানুষ: প্রতিটা ভঙ্গি = ১টা মার্জ-করা মেশ; ২ ভঙ্গি অদলবদল করে হাঁটা/নাচ/তর্ক ---------- */
const TOPS=[0xcfd8dc,0x8fa1ad,0x7e9a7e,0xb08968,0xa0a0a8,0xc9b8a0,0x9a6b6b,0xe8c07d,0x6fa8dc],BOTS=[0x37474f,0x3e4a5a,0x4a4036,0x5f6368,0x222c3a],SKS=[0xc68642,0xd9a066,0x8d5524,0xe0ac69,0xb07a4a],SARS=[0xb04a4a,0x3f7a5a,0xc49a3a,0x4a5fa0,0x8a4a7a];
function look(r,o,hat){const sk=pk(r,SKS),q=r(),g=q<.5?0:q<.72?1:q<.85?2:3,K={sk,hair:0x1c1a18,top:pk(r,TOPS),bot:pk(r,BOTS),leg:0};
 if(g===1)K.bot=pk(r,[0x3f6f9b,0x5a7a4a,0x8a5a4a,0x555a8a]);if(g===2){K.top=pk(r,[0xe8e4da,0xb9c4d0,0xc9b8a0]);K.bot=K.top;}if(g===3){K.top=pk(r,SARS);K.bot=pk(r,SARS);}
 K.leg=g===0?K.bot:g===2?0xe8e4da:sk;if(o)Object.assign(K,o);const out={g,K};if(hat)out.hat=hat;return out;}
const AXY=[[-.23,1.4],[.23,1.4]],LXY=[[-.1,.9],[.1,.9]];
function pparts(G,L,pz){
 const s=pz.s||1,y0=pz.sit?-.5*s:0,out=[],B=new T.Matrix4().makeScale(s,s,s).setPosition(0,y0,0);
 const add=(ps,m)=>{for(const p of ps){const g=p.g.clone();g.applyMatrix4(m);out.push({g,c:p.c});}};
 add(G.head,B);add(G.body,B);
 const lim=(ps,a,ang)=>add(ps,B.clone().multiply(new T.Matrix4().makeTranslation(a[0],a[1],0)).multiply(new T.Matrix4().makeRotationX(ang)));
 lim(G.arm,AXY[0],pz.al||0);lim(G.arm,AXY[1],pz.ar||0);lim(G.leg,LXY[0],pz.ll||0);lim(G.leg,LXY[1],pz.lr||0);
 if(L.hat)out.push(gp(SPG,L.hat,0,1.73*s+y0,0,0,0,0,.14*s,.1*s,.14*s));
 if(pz.ex)for(const p of pz.ex){const g=p.g.clone();g.applyMatrix4(B);out.push({g,c:p.c});}
 return out;}
const PS={stand:[{al:.05,ar:-.05}],walk:[{al:.7,ar:-.7,ll:-.55,lr:.55},{al:-.7,ar:.7,ll:.55,lr:-.55}],arg:[{al:-2.7,ar:.15,ll:-.1,lr:.1},{al:.15,ar:-2.7,ll:.1,lr:-.1}],
 dance:[{al:-2.9,ar:-2.3,ll:-.3,lr:.3},{al:-2.3,ar:-2.9,ll:.3,lr:-.3}],sit:[{al:-.4,ar:-.4,ll:-1.5,lr:-1.5,sit:1}],sitUp:[{al:-.4,ar:-2.9,ll:-1.5,lr:-1.5,sit:1},{al:-.4,ar:-.4,ll:-1.5,lr:-1.5,sit:1}],
 play:[{al:-1.3,ar:-1.3,ll:-.4,lr:.4},{al:-1.3,ar:-1.3,ll:.4,lr:-.4}],catch:[{al:-1.2,ar:-1.2},{al:-2.6,ar:-2.6}],work:[{al:-1,ar:-1,ll:-.15,lr:.1},{al:-.4,ar:-.5,ll:.1,lr:-.15}]};
function person(L,pose,o){o=o||{};const G=MB.hg(L.g,L.K,!HQ),g=new T.Group(),ms=PS[pose].map((p,i)=>{const m=mesh(pparts(G,L,Object.assign({s:o.s,ex:o.ex},p)));m.visible=i===0;g.add(m);return m;});g.userData.ms=ms;return g;}
const tog=(g,k)=>{const ms=g.userData.ms;if(ms.length>1){ms[0].visible=!k;ms[1].visible=!!k;}};
/* ---- গরু ও ছাগল ---- */
function cowM(r){const c=pk(r,[0x8d5a36,0xe8e0d0,0x5d4a3a,0x2f2a26]);return mesh([bx(c,0,1.05,0,.85,.8,1.8),bx(c,0,1.3,1.1,.5,.5,.55),bx(0xd9b5a0,0,1.15,1.42,.4,.3,.15),bx(c,-.3,1.5,1,.25,.08,.15),bx(c,.3,1.5,1,.25,.08,.15),cn(0xf0e8d0,-.2,1.7,1.05,.05,.25,0,0,.4),cn(0xf0e8d0,.2,1.7,1.05,.05,.25,0,0,-.4),
 bx(c,-.28,.35,.65,.18,.7,.18),bx(c,.28,.35,.65,.18,.7,.18),bx(c,-.28,.35,-.65,.18,.7,.18),bx(c,.28,.35,-.65,.18,.7,.18),bx(c,0,1.0,-1,.07,.7,.07,0,.25),bx(0xf3efe6,.1,1.46,.1,.5,.02,.6),bx(0xf3efe6,-.2,1.2,-.5,.02,.3,.4)]);}
function goatM(r){const c=pk(r,[0xe8e0d0,0x6d5a48,0x2f2a26,0xb08968]);return mesh([bx(c,0,.62,0,.38,.38,.8),bx(c,0,.88,.5,.24,.26,.3),bx(0xf5f5f5,0,.7,.66,.05,.15,.05),cn(0xd7ccc8,-.07,1.08,.5,.03,.15,0,0,.3),cn(0xd7ccc8,.07,1.08,.5,.03,.15,0,0,-.3),
 bx(c,-.13,.22,.3,.08,.44,.08),bx(c,.13,.22,.3,.08,.44,.08),bx(c,-.13,.22,-.3,.08,.44,.08),bx(c,.13,.22,-.3,.08,.44,.08),bx(c,0,.72,-.46,.05,.18,.05,0,.5)]);}
/* ---- ঘটনার নির্মাতা: লোকাল ফ্রেম x=পাশ(l), z=রাস্তা বরাবর(u) ---- */
const wp=(e,u,l)=>e.ax?[e.L+l,e.a+u]:[e.a+u,e.L-l],lc=(e,x,z)=>e.ax?[x-e.L,z-e.a]:[e.L-z,x-e.a];
const put=(e,o,l,u,yaw,y)=>{o.position.set(l,y||0,u);o.rotation.y=yaw||0;e.g.add(o);return o;},face=(l,u,tl,tu)=>Math.atan2(tl-l,tu-u),car=(e,t,tint,l,u,yaw)=>{const m=new T.Group();[VG[t].b,VG[t].l].forEach(q=>q.userData.keep=1);m.add(new T.Mesh(VG[t].b,matT(tint)),new T.Mesh(VG[t].l,LM));return put(e,m,l,u,yaw,.1);};
const TXB=['রাস্তা মেরামত চাই','পরিষ্কার পানি চাই','বিদ্যুৎ চাই','ময়লা সরান','স্কুলে শিক্ষক চাই','আমাদের দাবি শুনুন'],TXM_=['শান্তি চাই','সবুজ শহর চাই','বই পড়ি','পরিবেশ বাঁচাও','ভালোবাসা ছড়াও'];
const flagM=(()=>{let m=null;return()=>{if(m)return m;const cv=document.createElement('canvas');cv.width=64;cv.height=40;const g=cv.getContext('2d');['#4dd0e1','#fff176','#f48fb1'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,i*14,64,14);});m=new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),side:T.DoubleSide});return m;};})();
const BLD={};
BLD.accident=(e,r)=>{const sd=r()<.5?-1:1;e.pp=[];
 car(e,0,pk(r,[0xe53935,0x1e88e5,0xfdd835,0x43a047]),sd*2.4,0,0);car(e,5,pk(r,[0x556b2f,0x8d6e63,0x37474f]),sd*.3,-.6,sd*.6);
 e.ob.push({u:1.2,l:sd*2.4,r:1.15},{u:-1.2,l:sd*2.4,r:1.15},{u:.4,l:sd*.97,r:1},{u:-.6,l:sd*.3,r:1.1},{u:-1.6,l:-sd*.37,r:1});
 const spots=[[sd*1.1,3.4,'arg'],[sd*2.9,3.4,'arg'],[sd*3.7,-2.7,'catch'],[sd*1.4,-3.8,'stand'],[sd*3.8,1.1,'catch']];
 spots.forEach((s,i)=>{const p=person(look(r),s[2]);const tl=i===0?sd*2.9:i===1?sd*1.1:sd*1.6,tu=i<2?3.4:0;put(e,p,s[0],s[1],face(s[0],s[1],tl,tu));e.pp.push(p);e.ob.push({u:s[1],l:s[0],r:.4});});
 e.b1=put(e,bub('আরে ভাই! দেখে চালান!'),sd*1.1,3.4,0,3.1);e.b2=put(e,bub('দোষ তো আপনার!'),sd*2.9,3.4,0,3.1);
 e.upd=()=>{const k=((clk*3)|0)%2,s=((clk*.7)|0)%2===0;e.pp.forEach((p,i)=>{tog(p,k^(i&1));if(i<2)p.position.y=Math.abs(Math.sin(clk*7+i*2))*.1;});e.b1.visible=s;e.b2.visible=!s;};};
BLD.blockade=(e,r)=>{const P=[];e.pp=[];
 for(let l=-6.2;l<=6.3;l+=1.55){const h=2+((r()*2)|0);for(let q=0;q<h;q++)P.push(tr(q%2?0x2b2b2b:0x1e1e1e,l+(r()-.5)*.25,.16+q*.3,(r()-.5)*.3,.5));e.ob.push({u:0,l,r:1.1});}
 for(const y of[.95,1.4])P.push(cy(0xc9b36b,0,y,0,.06,13.2,0,0,1.5708));
 for(const l of[-6.6,6.6])P.push(cy(0xb9a35a,l,1.1,0,.07,2.2));for(const l of[-3.4,3.4])P.push(cy(0xb9a35a,l,1.8,0,.05,3.6));
 e.g.add(mesh(P));const bn_=new T.Mesh(PLP,txm('আমাদের দাবি শুনুন','#fff3c4','#7a1f1f',512,128,50));bn_.scale.set(6.6,1.5,1);bn_.position.set(0,2.5,0);e.g.add(bn_);
 for(let i=0;i<8;i++){const row=i%2?1:-1,l=-4.5+(i>>1)*3+(r()-.5)*.6,u=row*(1.7+r()*.5),p=person(look(r),r()<.4?'sitUp':'sit');put(e,p,l,u,row>0?Math.PI:0);e.pp.push(p);e.ob.push({u,l,r:.45});}
 for(let i=0;i<3;i++)put(e,plac(pk(r,TXB)),-4+i*4+(r()-.5),(i%2?3.8:-3.8),0);
 e.upd=()=>{e.pp.forEach((p,i)=>tog(p,(((clk*1.2)|0)+i)%2));};};
const pingpong=(e,dt,A,sp,ps)=>{const T1=A/sp,cyc=2*(T1+ps),t=(clk+e.off)%cyc;let z,ty,mv=1;
 if(t<T1){z=-A/2+sp*t;ty=0;}else if(t<T1+ps){z=A/2;ty=Math.PI;mv=0;}else if(t<2*T1+ps){z=A/2-sp*(t-T1-ps);ty=Math.PI;}else{z=-A/2;ty=0;mv=0;}
 e.yw+=(ty-e.yw)*Math.min(1,3.5*dt);e.mv.position.z=z;e.mv.rotation.y=e.yw;e.mz=z;e.walk=mv;
 const c=Math.cos(e.yw),s=Math.sin(e.yw);for(const o of e.ob){o.l=o.bl*c+o.bu*s;o.u=z-o.bl*s+o.bu*c;}};
BLD.march=(e,r)=>{const mv=new T.Group();e.g.add(mv);e.mv=mv;e.pp=[];e.off=r()*40;e.yw=0;
 for(let i=0;i<10;i++){const l=i%2?1.3:-1.3,u=1.5-(i>>1)*1.9,p=person(look(r),'walk');p.position.set(l,0,u);mv.add(p);e.pp.push(p);e.ob.push({bl:l,bu:u,l,u,r:.55});
  if(i>=2&&i%2===0){const q=plac(pk(r,TXM_),'#e3f6ff','#0d47a1');q.position.set(.3,0,.35);p.add(q);}
  if(i===6||i===7){const f=new T.Group(),m=new T.Mesh(PLP,flagM());m.scale.set(.7,.45,1);m.position.set(.35,2.2,0);f.add(m,new T.Mesh(PLG,PLM));f.children[1].position.y=1.5;f.position.set(.1,0,.3);p.add(f);}}
 const b=new T.Mesh(PLP,txm('শান্তি চাই','#e3f6ff','#0d47a1',512,160,64));b.scale.set(2.7,.85,1);b.position.set(0,1.9,1.55);mv.add(b);
 e.upd=dt=>{pingpong(e,dt,26,.9,1.4);const k=((clk*3.2)|0)%2;e.pp.forEach((p,i)=>{tog(p,e.walk?k^(i&1):0);p.position.y=e.walk?Math.abs(Math.sin(clk*6.4+i))*.04:0;});};e.upd(.016);};
BLD.baraat=(e,r)=>{const mv=new T.Group();e.g.add(mv);e.mv=mv;e.pp=[];e.off=r()*40;e.yw=0;
 const rk=new T.Group();[VG[2].b,VG[2].l].forEach(q=>q.userData.keep=1);rk.add(new T.Mesh(VG[2].b,matT(0xffd23f)),new T.Mesh(VG[2].l,LM));
 const gr=[];for(let i=0;i<6;i++){gr.push(bx(i%2?0xff4081:0xff9800,-.66,1.2+i*.05,-.9+i*.34,.1,.1,.3),bx(i%2?0xff9800:0xff4081,.66,1.2+i*.05,-.9+i*.34,.1,.1,.3));}gr.push(bx(0xffeb3b,0,1.78,-.3,1.4,.04,.04));rk.add(mesh(gr));
 const gm=person(look(r,{top:0xf2e6c8,bot:0xf2e6c8,leg:0xf2e6c8},0xd4a017),'sit');rk.add(gm);gm.position.set(0,.3,-.45);
 rk.position.set(0,.1,6.6);mv.add(rk);e.ob.push({bl:0,bu:6.6,l:0,u:0,r:1.3});
 const ins=[[cy(0x8d3b1a,0,.95,.35,.22,.55,0,0,1.5708),bx(0xffc107,0,.95,.35,.5,.05,.05)],[cy(0xffd54f,.12,1.35,.3,.05,.7,-1.1),cn(0xffd54f,.12,1.62,.62,.12,.25,-1.1)],[cy(0xffd54f,-.28,1.2,.28,.12,.03,1.5708),cy(0xffd54f,.28,1.2,.28,.12,.03,1.5708)],[cy(0x6a1b9a,0,1,.34,.2,.5,0,0,1.5708)]];
 for(let i=0;i<4;i++){const l=i%2?.95:-.95,u=4.2-(i>>1)*1.6,p=person(look(r,{top:0xb71c1c,bot:0x222222,leg:0x222222},0xfbc02d),'play',{ex:ins[i]});p.position.set(l,0,u);mv.add(p);e.pp.push(p);e.ob.push({bl:l,bu:u,l,u,r:.5});}
 for(let i=0;i<6;i++){const l=(i%3-1)*1.5,u=-.6-Math.floor(i/3)*1.8,p=person(look(r),'dance',{s:i>3?.8:1});p.position.set(l,0,u);mv.add(p);e.pp.push(p);e.ob.push({bl:l,bu:u,l,u,r:.45});}
 e.upd=dt=>{pingpong(e,dt,24,.8,1.6);const k=((clk*3)|0)%2;e.pp.forEach((p,i)=>{tog(p,k^(i&1));p.position.y=Math.abs(Math.sin(clk*6+i))*.08;});};e.upd(.016);};
BLD.repair=(e,r)=>{const sd=r()<.5?-1:1,P=[];e.pp=[];
 P.push(bx(0x7b6a52,sd*2.3,.12,0,3.9,.08,5),bx(0x3a332c,sd*2.3,.16,0,3.4,.08,4.4),sp(0x8b7355,sd*3.4,.25,-3.4,1.1,.55,1),cn(0xd8c08a,sd*3.2,.7,4,1.1,1.4));
 for(let u=-7;u<=7.1;u+=2.3){P.push(cn(0xff6d00,sd*.1,.4,u,.26,.8),cy(0xffffff,sd*.1,.45,u,.2,.1));}
 for(const u of[-7.6,7.6])P.push(bx(0xffffff,sd*2.2,.75,u,3.6,.35,.08),bx(0xd32f2f,sd*1.2,.75,u,.6,.36,.09),bx(0xd32f2f,sd*3.2,.75,u,.6,.36,.09),bx(0x666666,sd*.6,.35,u,.08,.7,.08),bx(0x666666,sd*3.8,.35,u,.08,.7,.08));
 e.g.add(mesh(P));
 const ro=mesh([bx(0xf9a825,0,1.1,-.3,1.7,1,2),bx(0x37474f,0,2,-.6,1.5,.08,1.4),bx(0x37474f,-.7,1.55,-1.2,.07,.9,.07),bx(0x37474f,.7,1.55,-1.2,.07,.9,.07),bx(0x37474f,-.7,1.55,.1,.07,.9,.07),bx(0x37474f,.7,1.55,.1,.07,.9,.07),cy(0x9e9e9e,0,.65,1.15,.65,1.9,0,0,1.5708),cy(0x222222,-.9,.5,-1,.5,.4,0,0,1.5708),cy(0x222222,.9,.5,-1,.5,.4,0,0,1.5708)]);put(e,ro,sd*2.3,5.3,0);e.ro=ro;
 [[sd*2.2,-3.2],[sd*3.8,1.8]].forEach((s,i)=>{const p=person(look(r,{top:0xff7043},0xf9a825),'work',{ex:[cy(0x8d6e63,.05,.6,.45,.03,1.3,-.5)]});put(e,p,s[0],s[1],face(s[0],s[1],sd*2.3,0));e.pp.push(p);e.ob.push({u:s[1],l:s[0],r:.4});});
 put(e,plac('রাস্তা মেরামত চলছে','#ffd54f','#3e2723'),sd*4.9,-6.2,0);
 for(let u=-6.5;u<=6.6;u+=2.6)e.ob.push({u,l:sd*2.3,r:2});
 e.upd=()=>{e.ro.position.y=Math.sin(clk*34)*.012;e.pp.forEach((p,i)=>tog(p,(((clk*1.6)|0)+i)%2));};};
let WT=null;const waterM=()=>{if(WT)return WT;const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.fillStyle='#7c9a95';g.fillRect(0,0,128,128);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;for(let i=0;i<12;i++){g.beginPath();g.ellipse((i*37)%128,(i*53)%128,10+(i%4)*4,4+(i%3)*2,0,0,6.3);g.stroke();}
 const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);WT={t,m:new T.MeshStandardMaterial({map:t,transparent:true,opacity:.82,roughness:.2,metalness:.15,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})};return WT;};
BLD.flood=(e,r)=>{const w=waterM();e.pp=[];e.sz=[7,9.5];
 const a=new T.Mesh(CIG,w.m);a.rotation.x=-Math.PI/2;a.scale.set(8.2,10.5,1);a.position.set(0,.13,0);const b=new T.Mesh(CIG,w.m);b.rotation.x=-Math.PI/2;b.scale.set(6,13,1);b.position.set(1.4,.135,.8);e.g.add(a,b);
 put(e,plac('সাবধান! রাস্তায় পানি','#fff3c4','#b71c1c'),-4.9,-9.5,0);put(e,plac('সাবধান! রাস্তায় পানি','#fff3c4','#b71c1c'),4.9,9.5,Math.PI);
 e.bt=[0,1].map(i=>{const m=mesh([bx(0xffffff,0,.06,0,.5,.08,.22),cn(0xfff3e0,0,.3,0,.17,.4)]);e.g.add(m);return m;});
 for(let i=0;i<2;i++){const u=pk(r,UM),p=person(look(r),'walk',{ex:[cy(0x6d4c41,0,1.5,0,.02,1.3),cn(u,0,2.2,0,.75,.4)]});p.userData.o=r()*20;e.g.add(p);e.pp.push(p);}
 e.upd=()=>{e.bt.forEach((m,i)=>{m.position.set(Math.sin(clk*.4+i*3)*3.5,.17+Math.sin(clk*2+i)*.03,Math.sin(clk*.3+i*2)*5);m.rotation.y=clk*.5+i;});
  e.pp.forEach((p,i)=>{const t=(clk*.6+p.userData.o)%24,u=t<12?-6+t:6-(t-12);p.position.set(i?1.8:-1.8,0,u);p.rotation.y=t<12?0:Math.PI;tog(p,((clk*2)|0)%2);});w.t.offset.set(clk*.02,clk*.015);};};
const UM=[0xe53935,0x1e88e5,0xfdd835,0x8e24aa,0x43a047];
BLD.cattle=(e,r)=>{const cow=r()<.45,n=cow?2+((r()*2)|0):4+((r()*2)|0);e.an=[];e.pp=[];
 for(let i=0;i<n;i++){const g=new T.Group();g.add((cow?cowM:goatM)(r));e.g.add(g);const o={u:0,l:0,r:cow?1.3:.65};e.ob.push(o);e.an.push({g,u:(i-(n-1)/2)*(cow?3.4:2.1)+(r()-.5)*.6,off:i*2.4+r()*2,o});}
 const hp=person(look(r),'walk',{ex:[cy(0x8d6e63,.28,.85,.3,.025,1.5,-.4)]});e.g.add(hp);e.hp=hp;e.hob={u:0,l:0,r:.4};e.ob.push(e.hob);
 e.upd=()=>{let ld=0,dir=1,mvg=0;e.an.forEach((a,i)=>{const t=(clk+a.off)%26;let l,d=1,m=1;if(t<11)l=-7+14*(t/11);else if(t<13){l=7;m=0;}else if(t<24){l=7-14*((t-13)/11);d=-1;}else{l=-7;d=-1;m=0;}
  a.g.position.set(l,m?Math.abs(Math.sin(clk*5+i))*.04:0,a.u);a.g.rotation.y=d>0?1.5708:-1.5708;a.o.l=l;a.o.u=a.u;if(i===0){ld=l;dir=d;mvg=m;}});
  e.hp.position.set(ld-dir*4,0,0);e.hp.rotation.y=dir>0?1.5708:-1.5708;tog(e.hp,mvg?((clk*2.6)|0)%2:0);e.hob.l=ld-dir*4;e.hob.u=0;};e.upd();};
BLD.cricket=(e,r)=>{const P=[];e.pp=[];
 for(const u of[-4.6,4.6]){for(let q=-1;q<=1;q++)P.push(cy(0xe8d9a8,q*.09,.36,u,.022,.72));P.push(bx(0xb99a5b,0,.74,u,.3,.025,.025),bx(0x9e3b2b,.45,.1,u+(u>0?.3:-.3),.3,.2,.2),bx(0x9e3b2b,.45,.3,u+(u>0?.3:-.3),.28,.2,.2));e.ob.push({u,l:0,r:.35});}
 P.push(bx(0xc9b98f,0,.115,0,1.2,.03,10.4));e.g.add(mesh(P));
 const kd=(l,u,yaw,pose)=>{const p=person(look(r),pose,{s:.8});put(e,p,l,u,yaw);e.pp.push(p);e.ob.push({u,l,r:.5});return p;};
 e.bw=kd(0,-3.2,0,'play');e.bt=kd(0,3.9,Math.PI,'stand');e.fa=kd(-2.8,1.5,face(-2.8,1.5,0,3.6),'catch');kd(2.9,-.5,face(2.9,-.5,0,3.6),'catch');kd(-2.6,-2,face(-2.6,-2,0,3.6),'catch');
 const bat=new T.Group();bat.add(mesh([bx(0xd7b377,0,-.35,0,.09,.7,.16)]));bat.position.set(.25,1,.28);e.bt.add(bat);e.bat=bat;
 const ball=mesh([sp(0xc62828,0,0,0,.08)]);e.g.add(ball);e.ball=ball;e.bA=put(e,bub('ছক্কা!'),0,3.9,0,2.5);e.bB=put(e,bub('ধরো ধরো!'),-2.8,1.5,0,2.5);e.ball=ball;
 e.upd=()=>{const cyc=(clk/7)|0,t=clk%7,B=e.ball;let x=0,y=1,z=-3.1;
  if(t<1.3){const q=t/1.3;z=-3+6.5*q;y=1.15*(1-q)+Math.abs(Math.sin(q*Math.PI*1.7))*.45+.1;}
  else if(t<3.1){const q=(t-1.3)/1.8;x=-2.8*q;z=3.5-2*q;y=.8+Math.sin(q*Math.PI)*2.4;}
  else if(t<4.4){const q=(t-3.1)/1.3;x=-2.8+2.8*q;z=1.5-4.6*q;y=1+Math.sin(q*Math.PI)*1.1;}
  else{x=.15;z=-3.1;y=1;}
  B.position.set(x,y,z);e.bat.rotation.x=t<1.25?-.5:t<1.5?-.5-(t-1.25)/.25*1.9:t<3.5?-2.4+(t-1.5)/2*1.3:-1.1+Math.min(1,(t-3.5)/1.5)*.6;
  e.fa.position.y=t>2.6&&t<3.1?Math.abs(Math.sin((t-2.6)*6))*.3:0;e.bA.visible=t>1.5&&t<3&&cyc%2===0;e.bB.visible=t>1.5&&t<3&&cyc%2===1;
  e.pp.forEach((p,i)=>tog(p,t>2.4&&t<3.1?1:((clk*2)|0)%2^(i&1)));};e.upd();};
/* ---- ম্যানেজার ---- */
function cand(i,j,ep){
 const r=mkRng(hash(i*31+7,j*17+3,SEED+ep*977));if(r()>.065)return null;
 const ax=r()<.5?0:1,k=pickK(r()),t0=r(),pr=r(),A=area(i,j);
 if((ax===0&&A.x0===i)||(ax===1&&A.z0===j))return null;   // এলাকার তোরণ/সেতু-অংশ এড়াও
 const t=ax===1&&mainRow(j)?(t0<.5?25+t0*8:51+(t0-.5)*8):24+t0*32,nx=i*BS-HB,nz=j*BS-HB,L=ax?nx:nz,a=(ax?nz:nx)+t,x=ax?L:a,z=ax?a:L;
 if(Math.hypot(x,z)<140)return null;
 return{id:i+','+j+','+ax+','+ep,i,j,ax,k,L,a,x,z,pr};}
function add(c){const d=KD[c.k],e=Object.assign({d,cl:!!d.cl,cost:d.cost,ob:[],g:new T.Group(),dd:999,wn:0,life:d.life||0,born:clk},c);
 BLD[c.k](e,mkRng(hash(c.i,c.j,SEED^c.ax)));updOb(e);
 if(vehIn(e)){e.g.traverse(o=>{if(o.geometry&&!o.isSprite&&!o.geometry.userData.keep)o.geometry.dispose();});REJ.set(c.id,clk+6);return 0;}   // গাড়ি আছে → অন্য জায়গা বেছে নেবে
 e.g.rotation.y=e.ax?0:Math.PI/2;e.g.visible=false;scene.add(e.g);EVL.push(e);rebuild();return 1;}
function vehIn(e){   // জন্মানোর জায়গায় (বাধা-বৃত্ত বা পানির এলাকায়) কোনো গাড়ি আছে কি?
 for(const v of V){if(Math.abs(v.x-e.x)>70||Math.abs(v.z-e.z)>70)continue;
  for(const o of e.ob){const dx=o.x-v.x,dz=o.z-v.z,lz=dx*v.hx+dz*v.hz,lx=-dx*v.hz+dz*v.hx,cz=Math.max(-v.len/2,Math.min(v.len/2,lz)),cx=Math.max(-v.wid/2,Math.min(v.wid/2,lx));if(Math.hypot(lz-cz,lx-cx)<o.r+.6)return 1;}
  if(e.sz){const q=lc(e,v.x,v.z);if(Math.abs(q[0])<e.sz[0]+v.len/2&&Math.abs(q[1])<e.sz[1]+v.len/2)return 1;}}
 return 0;}
function drop(q){const e=EVL[q];scene.remove(e.g);e.g.traverse(o=>{if(o.geometry&&!o.isSprite&&!o.geometry.userData.keep)o.geometry.dispose();});EVL.splice(q,1);rebuild();}
function rebuild(){ver++;EC=new Map();for(const e of EVL){const k=e.ax+'|'+e.i+'|'+e.j;EC.set(k,(EC.get(k)||0)+e.cost);}}
function updOb(e){for(const o of e.ob){const p=wp(e,o.u,o.l);o.x=p[0];o.z=p[1];}}
function refresh(){
 const ep=(clk/EP)|0;
 for(let q=EVL.length-1;q>=0;q--){const e=EVL[q];e.dd=Math.hypot(e.x-S.x,e.z-S.z);if(e.dd>RDEL){drop(q);continue;}if(e.life&&clk-e.born>=e.life){GONE.push({x:e.x,z:e.z});if(GONE.length>6)GONE.shift();drop(q);}}
 if(EVL.length>=MAXE)return;
 const pi=Math.round((S.x+HB)/BS),pj=Math.round((S.z+HB)/BS);const cs=[];
 for(let j=pj-7;j<=pj+7;j++)for(let i=pi-7;i<=pi+7;i++){const c=cand(i,j,ep);if(!c)continue;const d=Math.hypot(c.x-S.x,c.z-S.z);if(d<RMIN||d>RMAX)continue;
  if(EVL.some(e=>e.id===c.id||Math.hypot(e.x-c.x,e.z-c.z)<110)||GONE.some(g=>Math.hypot(g.x-c.x,g.z-c.z)<110))continue;if(REJ.get(c.id)>clk)continue;cs.push(c);}
 cs.sort((a,b)=>a.pr-b.pr);for(let q=0;q<3&&q<cs.length;q++)if(add(cs[q]))break;}
function hud(){
 const el=$('evw'),L=EVL.filter(e=>e.dd<RMAX+60).sort((a,b)=>a.dd-b.dd);
 if(!L.length){if(hudTxt){hudTxt='';el.className='hud';}return;}
 const f=Math.sin(S.h),g=Math.cos(S.h),ln=e=>{const dx=e.x-S.x,dz=e.z-S.z,a=Math.atan2(-dx*g+dz*f,dx*f+dz*g),w=Math.abs(a)<.9?'সামনে':Math.abs(a)>2.25?'পিছনে':a>0?'ডানে':'বাঁয়ে';return(e.cl?'⛔ ':'⚠️ ')+e.d.ic+' '+e.d.n+' · '+w+' '+bn(Math.round(e.dd))+' মি';};
 let h=ln(L[0]);if(L[1])h+='<small>'+ln(L[1])+'</small>';
 if(trip&&trip.rer)h+='<small>🔄 অবরোধ এড়িয়ে নতুন রুট'+(trip.extra>40?' · 💰 ঘুরপথের বখশিশ জমছে':'')+'</small>';
 const cls='hud show'+(L[0].dd<110?' near':'');if(h!==hudTxt){hudTxt=h;el.innerHTML=h;}if(el.className!==cls)el.className=cls;}
const ec=(ax,i,j)=>EC.get(ax+'|'+i+'|'+j)||0;
function seg(p,q){let c=0;const i0=Math.round((p[0]+HB)/BS),j0=Math.round((p[1]+HB)/BS),i1=Math.round((q[0]+HB)/BS),j1=Math.round((q[1]+HB)/BS);
 if(j0===j1)for(let i=Math.min(i0,i1);i<Math.max(i0,i1);i++)c+=ec(0,i,j0);else if(i0===i1)for(let j=Math.min(j0,j1);j<Math.max(j0,j1);j++)c+=ec(1,i0,j);return c;}
function leg(px,pz,nx,nz){let p=0;for(const e of EVL){
 if(e.ax){if(Math.abs(px-e.L)>13||Math.abs(nx-e.L)>2)continue;if((e.a-pz)*(e.a-nz)<0)p+=e.cost;}
 else{if(Math.abs(pz-e.L)>13||Math.abs(nz-e.L)>2)continue;if((e.a-px)*(e.a-nx)<0)p+=e.cost;}}return p;}
return{list:EVL,n:()=>EVL.length,ver:()=>ver,ec,seg,leg,
 reset(){while(EVL.length)drop(0);GONE.length=0;REJ.clear();clk=0;rt=0;hT=0;hudTxt='';const el=$('evw');if(el)el.className='hud';refresh();refresh();},
 step(dt){clk+=dt;if((rt-=dt)<=0){rt=1;refresh();}
  for(const e of EVL){e.dd=Math.hypot(e.x-S.x,e.z-S.z);if(e.dd<200){if(e.upd&&e.dd<180)e.upd(dt);updOb(e);}
   if(!e.wn&&e.dd<300){e.wn=1;toast((e.cl?'⛔ ':'⚠️ ')+e.d.ic+' সামনে '+e.d.n+' — '+e.d.al);}}
  if((hT-=dt)<=0){hT=.3;hud();}},
 view(){for(const e of EVL){const v=e.dd<230;e.g.visible=v;if(v)e.g.position.set(e.x-W.ox,0,e.z-W.oz);}},
 gap(v,dt){let m=1e9;for(const e of EVL){if(Math.abs(e.x-v.x)>45||Math.abs(e.z-v.z)>45)continue;
  for(const o of e.ob){const dx=o.x-v.x,dz=o.z-v.z,fw=dx*v.hx+dz*v.hz;if(fw<=0||fw>25||Math.abs(-dx*v.hz+dz*v.hx)>v.wid/2+o.r+.5)continue;const q=fw-v.len/2-o.r-1.2;if(q<m)m=q;}}
  if(m<3&&v.v<.4){v.eb=(v.eb||0)+dt;if(v.eb>7&&Math.hypot(v.x-S.x,v.z-S.z)>45)v.dead=1;}else if(v.eb)v.eb=Math.max(0,v.eb-dt);return m;},
 collide(s,R){for(const e of EVL){if(e.dd>70)continue;for(const o of e.ob){const dx=s.x-o.x,dz=s.z-o.z,rr=R+o.r,d2=dx*dx+dz*dz;if(d2<rr*rr&&d2>1e-6){const d=Math.sqrt(d2);s.x+=dx/d*(rr-d);s.z+=dz/d*(rr-d);s.v*=.92;}}}},
 hit(x,z,r){for(const e of EVL){if(Math.abs(e.x-x)>70||Math.abs(e.z-z)>70)continue;for(const o of e.ob){const dx=o.x-x,dz=o.z-z,rr=o.r+r;if(dx*dx+dz*dz<rr*rr)return 1;}if(e.sz){const q=lc(e,x,z);if(Math.abs(q[0])<e.sz[0]+r&&Math.abs(q[1])<e.sz[1]+r)return 1;}}return 0;},
 drag(x,z){for(const e of EVL){if(!e.sz||e.dd>40)continue;const q=lc(e,x,z);if(Math.abs(q[0])<e.sz[0]&&Math.abs(q[1])<e.sz[1]){if(!e.wd){e.wd=1;toast('🌊 রাস্তায় পানি! আস্তে চালাও');}return .95;}}return 0;},
 slow(x,z){for(const e of EVL){if(!e.sz||Math.abs(e.x-x)>25||Math.abs(e.z-z)>25)continue;const q=lc(e,x,z);if(Math.abs(q[0])<e.sz[0]&&Math.abs(q[1])<e.sz[1])return .35;}return 1;}};
})();
export { EV };
