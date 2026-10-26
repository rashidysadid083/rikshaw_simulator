// যাত্রী, ভাড়া ও রুট-নেভিগেশন
import { loadMoney, saveMoneyValue } from './save.js';
import { $, T, bn, scene } from './core.js';
import { BS, HB, L, W, area, hash } from './world.js';
import { MB, S, body, inp, part } from './vehicles.js';
import { btns, closeBig, showMoney, toast } from './ui.js';
import { EV } from './events.js';
import { PG } from './economy.js';

/* ---------- যাত্রী ও ভাড়া ---------- */
const MKEY='rickshaw_money',PXMAX=3,FARE=d=>Math.round((20+d*.07)/5)*5;   // ভাড়া = ২০ + প্রতি মিটারে ৭ পয়সা, ৫ টাকার গুণিতকে
let route=null,money=0,ask=null,trip=null,seat=null,spawnT=0,tt=0,lastTd='';
function setMoney(v){money=v;}
function setSeat(v){seat=v;}
function setTrip(v){trip=v;}
money=loadMoney();
const PX=[],shirt=[0xd32f2f,0x1976d2,0x388e3c,0xf57c00,0x7b1fa2,0x00838f,0xfbc02d];
const gArrow=new T.Group();
{const sh=new T.Shape();[[0,2.4],[1.5,.6],[.55,.6],[.55,-1.8],[-.55,-1.8],[-.55,.6],[-1.5,.6]].forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();
 const mk=(c,sc,y,ro)=>{const m=new T.Mesh(new T.ShapeGeometry(sh).rotateX(Math.PI/2),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.92,side:T.DoubleSide,fog:false,depthWrite:false}));m.scale.set(sc,1,sc);m.position.y=y;m.renderOrder=ro;gArrow.add(m);};
 mk(0x5d4300,1.22,-.03,1);mk(0xffd23f,1,0,2);}
gArrow.visible=false;scene.add(gArrow);
const pxMark=new T.OctahedronGeometry(.22),pxMat=new T.MeshBasicMaterial({color:0xffd23f});
const beacon=new T.Mesh(new T.CylinderGeometry(2.5,2.5,60,16,1,true),new T.MeshBasicMaterial({color:0x40c4ff,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false,fog:false}));
beacon.visible=false;scene.add(beacon);
const saveMoney=()=>saveMoneyValue(money);
function killPax(g){g.traverse(o=>{if(o.geometry&&o.geometry!==pxMark)o.geometry.dispose();if(o.material&&o.material!==pxMat&&o.material!==MB.mat)o.material.dispose();});}
function mkPax(sit,ty){const o=MB.rnd();if(ty){Object.assign(o,ty.look);if(o.g===3)o.leg=o.sk;}const hu=MB.human(o);if(sit){hu.position.set(0,.08,-.66);hu.userData.legs.forEach(l=>l.rotation.x=-1.5);hu.userData.arms.forEach(a=>a.rotation.x=-.3);}else{const mk=new T.Mesh(pxMark,pxMat);mk.position.y=2.1;hu.add(mk);hu.userData.mk=mk;}return hu;}
function mkPaxOld(sit){
  const g=new T.Group(),c=shirt[(Math.random()*shirt.length)|0],hd=new T.Mesh(new T.SphereGeometry(.17,10,8),L(0xc68642));
  if(sit){part(.36,.16,.5,0x37474f,0,.98,.3,g);part(.46,.6,.28,c,0,1.2,0,g);hd.position.set(0,1.67,0);g.position.set(0,0,-.66);}   // রিকশার পিছনের সিটে
  else{part(.34,.7,.24,0x37474f,0,.35,0,g);part(.46,.6,.28,c,0,1,0,g);hd.position.set(0,1.48,0);
    const mk=new T.Mesh(pxMark,pxMat);mk.position.y=2.1;g.add(mk);g.userData.mk=mk;}
  g.add(hd);return g;
}
function spawnPax(){   // রাস্তার ধারে (ফুটপাতের কিনারায়), প্লেয়ারের আশেপাশের লোড-করা চাঙ্কে
  const pcx=Math.round(S.x/BS),pcz=Math.round(S.z/BS);
  for(let n=0;n<14;n++){
    const cx=pcx+((Math.random()*3)|0)-1,cz=pcz+((Math.random()*3)|0)-1,k=cx+','+cz;
    if(!W.ch.has(k))continue;
    const ax=Math.random()<.5?0:1,t=-32+Math.random()*64,sd=Math.random()<.5?-1:1;
    if([-20,-12,12,20].some(v=>Math.abs(t-v)<2.2))continue;   // বাতি/গাছ এড়াও
    const A=area(cx,cz);   // এলাকার সীমানার তোরণ/সেতু/মাঠ-অংশ এড়াও
    if(ax===0&&cx===A.x0&&t<-36+30+(hash(A.bx,A.bz,61)>>>4)%21+2)continue;
    if(ax===1&&cz===A.z0&&t<-36+30+(hash(A.bx,A.bz,62)>>>4)%21+2)continue;
    const x=ax?cx*BS-HB+sd*5:cx*BS+t,z=ax?cz*BS+t:cz*BS-HB+sd*5,d=Math.hypot(x-S.x,z-S.z);
    if(d<40||d>150||PX.some(p=>Math.hypot(p.x-x,p.z-z)<20))continue;
    const ty=PG.PTY[(Math.random()*3)|0],g=mkPax(false,ty);scene.add(g);PX.push({x,z,k,g,no:false,ty});return;
  }
}
function pickDest(px,pz){   // গ্রিড নোড, ৩০০–১২০০ মি দূরে
  for(let i=0;i<60;i++){
    const a=Math.random()*6.2832,d=300+Math.random()*900,ni=Math.round((px+Math.cos(a)*d+HB)/BS),nj=Math.round((pz+Math.sin(a)*d+HB)/BS),
    x=ni*BS-HB,z=nj*BS-HB,dd=Math.hypot(x-px,z-pz);
    if(dd>=300&&dd<=1200)return{x,z,d:dd};
  }
  const ni=Math.round((px+HB)/BS)+5,nj=Math.round((pz+HB)/BS),x=ni*BS-HB,z=nj*BS-HB;return{x,z,d:Math.hypot(x-px,z-pz)};
}
function openAsk(p){
  ask=p;$('ask').querySelector('b').textContent=p.ty.ic+' '+p.ty.n+' — '+p.ty.l1;inp.g=inp.b=inp.l=inp.r=inp.h=0;btns.forEach(b=>b.classList.remove('on'));$('ask').classList.add('show');
}
function answer(y){
  const p=ask;ask=null;$('ask').classList.remove('show');if(!p)return;
  if(!y){p.no=true;return;}   // না বললে কোনো জরিমানা নেই
  const i=PX.indexOf(p);if(i>=0)PX.splice(i,1);scene.remove(p.g);killPax(p.g);
  const d=pickDest(p.x,p.z);trip={x:d.x,z:d.z,d:d.d,fare:FARE(d.d),i:Math.round((d.x+HB)/BS),j:Math.round((d.z+HB)/BS)};
  trip.ty=p.ty;seat=mkPax(true,p.ty);body.add(seat);lastTd='';$('trip').classList.add('show');
  PG.board(trip);
}
function arrive(){
  const ex=trip.extra||0;PG.arrive(trip);
  if(ex>40){const b=Math.round(Math.min(150,15+ex*.07)*(1+.5*PG.P.u.s)/5)*5;PG.P.sh.tip+=b;money+=b;saveMoney();showMoney();setTimeout(()=>toast('🔄 বন্ধ রাস্তা এড়িয়ে ঘুরে এনেছ — বাড়তি বখশিশ +৳'+bn(b)),1800);}
  body.remove(seat);killPax(seat);seat=null;trip=null;beacon.visible=false;$('trip').classList.remove('show');spawnT=3;
}
function paxStep(dt){
  tt+=dt;
  for(let i=PX.length-1;i>=0;i--){const p=PX[i];if(!W.ch.has(p.k)){scene.remove(p.g);killPax(p.g);PX.splice(i,1);}}   // দূরে গেলে মুছে যাবে
  if(!trip){spawnT-=dt;if(spawnT<=0&&PX.length<PXMAX){spawnPax();spawnT=1.2+Math.random()*2;}}
  if(!trip&&!ask)for(const p of PX)if(!p.no&&Math.hypot(p.x-S.x,p.z-S.z)<9){openAsk(p);break;}
  if(trip&&Math.hypot(trip.x-S.x,trip.z-S.z)<14)arrive();
}
function paxView(){
  for(const p of PX){p.g.position.set(p.x-W.ox,.1,p.z-W.oz);const m=p.g.userData.mk;m.position.y=2.1+Math.sin(tt*3)*.15;m.rotation.y=tt*2;}
  gArrow.visible=!!trip;
  if(trip){beacon.visible=true;beacon.position.set(trip.x-W.ox,30,trip.z-W.oz);
    gArrow.rotation.y=Math.atan2(trip.x-S.x,trip.z-S.z);   // রিকশার সামনে মাটির উপর ভাসমান তীর, গন্তব্যের দিকে
    gArrow.position.set(S.x-W.ox+Math.sin(S.h)*6.5,.9+Math.sin(tt*3)*.12,S.z-W.oz+Math.cos(S.h)*6.5);}
}
const sg=v=>v<0?-1:1;
function calcRoute0(){   // গ্রিড রাস্তায় ছোট রুট: বর্তমান রাস্তার দুই মাথার নোড থেকে সামনে-এগোনো/কম-মোড়ের পথ
  const di=trip.i,dj=trip.j,f=Math.sin(S.h),g=Math.cos(S.h),ni=Math.round((S.x+HB)/BS),nj=Math.round((S.z+HB)/BS),nx=ni*BS-HB,nz=nj*BS-HB,
  man=a=>Math.abs(a[0]-di)+Math.abs(a[1]-dj),wx=a=>a[0]*BS-HB,wz=a=>a[1]*BS-HB,dn=Math.hypot(S.x-nx,S.z-nz);
  let start,din,near=false,A,B,hor;
  if(dn<10&&(nx-S.x)*f+(nz-S.z)*g>-2){start=[ni,nj];near=true;din=Math.abs(f)>Math.abs(g)?[sg(f),0]:[0,sg(g)];}
  else{
    hor=dn<14?Math.abs(f)>Math.abs(g):Math.abs(S.z-nz)<=Math.abs(S.x-nx);let dir;
    if(hor){const i0=Math.floor((S.x+HB)/BS);A=[i0,nj];B=[i0+1,nj];dir=[1,0];}else{const j0=Math.floor((S.z+HB)/BS);A=[ni,j0];B=[ni,j0+1];dir=[0,1];}
    const ba=f*dir[0]+g*dir[1]>=0,ca=Math.hypot(S.x-wx(A),S.z-wz(A))+man(A)*BS-(ba?0:25),cb=Math.hypot(S.x-wx(B),S.z-wz(B))+man(B)*BS-(ba?25:0);
    start=ca<cb?A:B;din=hor?[sg(wx(start)-S.x),0]:[0,sg(wz(start)-S.z)];
  }
  const si=start[0],sj=start[1],sx=Math.sign(di-si),sz=Math.sign(dj-sj),nodes=[start];
  if(sx||sz){if(sx&&sz)nodes.push(din[0]===sx||din[1]!==sz?[di,sj]:[si,dj]);nodes.push([di,dj]);}
  return{pts:nodes.map(a=>[wx(a),wz(a)]),din,near,A,B,hor,start};
}
/* ---------- নেভিগেশন: অবরোধ/বন্ধ রাস্তা এড়িয়ে নতুন রুট (গ্রিড নোডে ডিজক্সট্রা) ---------- */
let rcKey='',rcVal=null,rcEx=0;
function detour(srcs,di,dj){
  let i0=di,i1=di,j0=dj,j1=dj;for(const s of srcs){i0=Math.min(i0,s[0]);i1=Math.max(i1,s[0]);j0=Math.min(j0,s[1]);j1=Math.max(j1,s[1]);}
  i0-=8;i1+=8;j0-=8;j1+=8;
  const Wd=i1-i0+1,N=Wd*(j1-j0+1),id=(i,j)=>(j-j0)*Wd+(i-i0),D=new Float32Array(N).fill(1e9),Pv=new Int32Array(N).fill(-1),dn=new Uint8Array(N);
  for(const s of srcs){const n=id(s[0],s[1]);D[n]=Math.min(D[n],s[2]);}
  for(;;){
    let b=-1,bd=1e9;for(let n=0;n<N;n++)if(!dn[n]&&D[n]<bd){bd=D[n];b=n;}
    if(b<0)break;dn[b]=1;const bi=b%Wd+i0,bj=((b/Wd)|0)+j0;if(bi===di&&bj===dj)break;
    for(const[ei,ej,ax,fi,fj]of[[bi+1,bj,0,bi,bj],[bi-1,bj,0,bi-1,bj],[bi,bj+1,1,bi,bj],[bi,bj-1,1,bi,bj-1]]){
      if(ei<i0||ei>i1||ej<j0||ej>j1)continue;const pn=EV.ec(ax,fi,fj);if(pn===Infinity)continue;
      const n2=id(ei,ej),nd=bd+BS+pn;if(nd<D[n2]&&!dn[n2]){D[n2]=nd;Pv[n2]=b;}
    }
  }
  const t=id(di,dj);if(!dn[t])return null;
  const ns=[];for(let n=t;n>=0;n=Pv[n])ns.push([n%Wd+i0,((n/Wd)|0)+j0]);ns.reverse();
  const out=[];ns.forEach((a,q)=>{const p=ns[q-1],nx=ns[q+1];if(q&&nx&&((p[0]===a[0]&&a[0]===nx[0])||(p[1]===a[1]&&a[1]===nx[1])))return;out.push([a[0]*BS-HB,a[1]*BS-HB]);});
  return out;
}
const plen=(pts,x,z)=>{let L=Math.hypot(x-pts[0][0],z-pts[0][1]);for(let q=0;q+1<pts.length;q++)L+=Math.hypot(pts[q+1][0]-pts[q][0],pts[q+1][1]-pts[q][1]);return L;};
function calcRoute(){
  const r0=calcRoute0();
  if(!EV.n()){trip.rer=0;return r0;}
  const wx=a=>a[0]*BS-HB,wz=a=>a[1]*BS-HB;
  let pen=EV.leg(S.x,S.z,r0.pts[0][0],r0.pts[0][1]);for(let q=0;q+1<r0.pts.length;q++)pen+=EV.seg(r0.pts[q],r0.pts[q+1]);
  if(!(pen>0)){trip.rer=0;return r0;}   // সোজা রুটে কোনো ঘটনা নেই
  const srcs=[];
  if(r0.near)srcs.push([r0.start[0],r0.start[1],Math.hypot(S.x-wx(r0.start),S.z-wz(r0.start))]);
  else for(const n of[r0.A,r0.B]){const p=EV.leg(S.x,S.z,wx(n),wz(n));if(p<1e8)srcs.push([n[0],n[1],Math.hypot(S.x-wx(n),S.z-wz(n))+p]);}
  const key=EV.ver()+'|'+trip.i+','+trip.j+'|'+srcs.map(s=>s[0]+','+s[1]).join(';')+'|'+((tt*2)|0);
  if(key!==rcKey){rcKey=key;rcVal=srcs.length?detour(srcs,trip.i,trip.j):null;rcEx=0;
    if(rcVal){let cp=0;for(let q=0;q+1<rcVal.length;q++)cp+=EV.seg(rcVal[q],rcVal[q+1]);if(cp>0)rcVal.nr=1;else rcEx=plen(rcVal,S.x,S.z)-plen(r0.pts,S.x,S.z);}}
  const v=rcVal;
  if(!v||v.nr){trip.rer=0;if(!v)r0.blk=1;return r0;}
  trip.rer=1;if(rcEx>0)trip.extra=Math.max(trip.extra||0,rcEx);
  const dx=v[0][0]-S.x,dz=v[0][1]-S.z;
  return{pts:v,din:r0.near?r0.din:(Math.abs(dx)>Math.abs(dz)?[sg(dx),0]:[0,sg(dz)]),near:r0.near,rer:1};
}
function tripHud(){   // HUD: বড় তীর (গন্তব্যের দিক, সামনে = উপর) + দূরত্ব + পরের মোড়ের নির্দেশ
  if(!trip){route=null;return;}
  route=calcRoute();
  const dx=trip.x-S.x,dz=trip.z-S.z,f=Math.sin(S.h),g=Math.cos(S.h),a=Math.atan2(-dx*g+dz*f,dx*f+dz*g);
  $('arr').style.transform='rotate('+a+'rad)';
  const s=bn(Math.round(Math.hypot(dx,dz)))+' মি · ভাড়া ৳'+bn(trip.fare);if(s!==lastTd){lastTd=s;$('td').textContent=s;}
  const r=route,p0=r.pts[0],dd=bn(Math.round(Math.hypot(p0[0]-S.x,p0[1]-S.z)))+' মি',din=r.din;let t;
  if(!r.near&&f*din[0]+g*din[1]<-.5)t='↩ ইউ-টার্ন করো';
  else if(r.pts.length===1)t='🏁 গন্তব্য · '+dd;
  else{
    const p1=r.pts[1],dout=Math.abs(p1[0]-p0[0])>1?[sg(p1[0]-p0[0]),0]:[0,sg(p1[1]-p0[1])],dt=din[0]*dout[0]+din[1]*dout[1],cr=dout[0]*(-din[1])+dout[1]*din[0];
    t='পরের মোড়ে '+(dt>.5?'⬆ সোজা':dt<-.5?'↩ ইউ-টার্ন':cr>0?'➡ ডানে':'⬅ বাঁয়ে')+' · '+dd;
  }
  if(r.rer)t='🔄 '+t;else if(r.blk)t='⛔ '+t;
  if(t!==$('tn').textContent)$('tn').textContent=t;
}
function paxReset(){
  ask=null;$('ask').classList.remove('show');
  PX.forEach(p=>{scene.remove(p.g);killPax(p.g);});PX.length=0;
  if(seat){body.remove(seat);killPax(seat);seat=null;}
  trip=null;route=null;closeBig();$('trip').classList.remove('show');beacon.visible=false;
  for(let i=0;i<PXMAX;i++)spawnPax();
  spawnT=1;showMoney();
}
$('askY').onclick=()=>answer(1);$('askN').onclick=()=>answer(0);
export { answer, ask, beacon, killPax, money, paxReset, paxStep, paxView, route, saveMoney, seat, setMoney, setSeat, setTrip, sg, trip, tripHud, tt };
