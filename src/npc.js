// জীবন্ত NPC
import { HQ, PD, T, scene } from './core.js';
import { BS, CC, W, WM, area, geo } from './world.js';
import { MB, S } from './vehicles.js';
import { sg } from './passengers.js';
import { V } from './traffic.js';

/* পথচারী: বাজার ব্লকের কিনারার ফুটপাত ও মেইন রোডের পাশে হাঁটে, মাঝেমধ্যে রাস্তা পার হয় (গাড়ি কাছে থাকলে অপেক্ষা) */
/* ---------- জীবন্ত NPC: অবস্থা-যন্ত্র (হাঁটা/দাঁড়ানো/বসা/বিক্রি/কথা/দরদাম/পার হওয়া/খেলা), এলাকা অনুযায়ী স্পন, সর্বোচ্চ ৪০, দূরে অ্যানিমেশন কম, সব InstancedMesh; ধাক্কায় শাস্তি নেই ---------- */
const NPC=(()=>{
const MAXN=40,rd=Math.random,pk=a=>a[(rd()*a.length)|0],rr=(a,b)=>a+rd()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),OBJ=new T.Object3D(),PZ=new Float32Array(7),
GD=[0xb8c4cc,0xff9800,0xe53935,0xfdd835,0x4caf50,0x8bc34a,0xc62828],BRIGHT=[0xe53935,0x1e88e5,0xfdd835,0x43a047,0xff9800,0xec407a,0x8e24aa],TINT=[0xffffff,0xd8c6a8,0x8d6e63,0x4a4a4a,0xc9a27a];
OBJ.rotation.order='YXZ';
let cap=MAXN,spT=0,fr=0,clk=0,idc=0,lowT=0,hiT=0,NQ=-1,M=null;
const ANI=[],BALL=[],total=()=>PD.length+ANI.length,room=()=>cap-total();
const BB=(x,y,z,w,h,d,c)=>[0,x,y+h/2,z,w,h,d,c,0],SS=(x,y,z,a,b,c_,c)=>[1,x,y,z,a,b,c_,c,0];
const mk=(g,n)=>{const m=new T.InstancedMesh(g,WM,n);m.setColorAt(0,CC.setHex(0xffffff));m.instanceColor.array.fill(1);m.frustumCulled=false;m.count=0;scene.add(m);return m;};
function build(){
  const lo=!HQ,g0=MB.hg(0,null,lo),G={head:MB.merge(g0.head),arm:MB.merge(g0.arm),leg:MB.merge(g0.leg),body:[MB.merge(g0.body),...[1,2,3].map(g=>MB.merge(MB.hg(g,null,lo).body))]};
  if(!M){
    M={h:mk(G.head,MAXN),a:[mk(G.arm,MAXN),mk(G.arm,MAXN)],l:[mk(G.leg,MAXN),mk(G.leg,MAXN)],b:G.body.map(g=>mk(g,MAXN)),
    bk:mk(geo([BB(0,0,0,.55,.1,.55,0x8a6a3a),BB(0,.1,0,.6,.06,.6,0x6e5230)]),MAXN),   // মাথার ঝুড়ি
    gd:mk(geo([SS(-.12,.12,0,.14,.1,.14,0xffffff),SS(.12,.12,.05,.14,.1,.14,0xffffff),SS(0,.17,-.08,.14,.1,.14,0xffffff),SS(0,.2,.1,.13,.1,.13,0xffffff)]),MAXN),   // মাছ/ফল/তরকারি (রঙ instanceColor)
    ct:mk(geo([BB(0,.5,0,1.1,.12,1.9,0x8d6e63),BB(-.55,.62,0,.06,.3,1.9,0x7a5a3a),BB(.55,.62,0,.06,.3,1.9,0x7a5a3a),BB(0,.62,.95,1.1,.3,.06,0x7a5a3a),SS(-.6,.32,.2,.07,.32,.32,0x151515),SS(.6,.32,.2,.07,.32,.32,0x151515),BB(-.45,.75,-1.15,.05,.05,.7,0x5d4037),BB(.45,.75,-1.15,.05,.05,.7,0x5d4037)]),MAXN),   // ঠেলাগাড়ি
    go:mk(geo([BB(0,.5,0,.34,.38,.9,0xffffff),BB(-.1,0,.32,.07,.5,.07,0x777777),BB(.1,0,.32,.07,.5,.07,0x777777),BB(-.1,0,-.32,.07,.5,.07,0x777777),BB(.1,0,-.32,.07,.5,.07,0x777777),BB(0,.8,-.46,.05,.05,.2,0xffffff)]),40),
    gh:mk(geo([BB(0,-.1,.12,.16,.2,.3,0xffffff),BB(-.05,.1,.05,.03,.14,.03,0x444444),BB(.05,.1,.05,.03,.14,.03,0x444444)]),40),
    du:mk(geo([SS(0,.16,0,.14,.12,.22,0xffffff),SS(0,.32,.16,.07,.07,.07,0xffffff),BB(0,.3,.24,.05,.025,.07,0xff9800),BB(0,.2,-.2,.06,.04,.08,0xffffff)]),40),
    cb:mk(geo([SS(0,.12,0,.08,.08,.16,0x151515),SS(0,.2,.14,.06,.06,.06,0x151515),BB(0,.19,.2,.03,.02,.07,0x444444),BB(0,.1,-.2,.08,.02,.16,0x151515)]),40),
    cw:mk(geo([BB(.2,0,0,.4,.015,.2,0x151515)]),80),
    bl:mk(geo([SS(0,0,0,.12,.12,.12,0xffffff)]),8)};
  }else{M.h.geometry=G.head;M.a.forEach(m=>m.geometry=G.arm);M.l.forEach(m=>m.geometry=G.leg);M.b.forEach((m,i)=>m.geometry=G.body[i]);}
  NQ=HQ;
}
/* ---- তৈরি/সরানো ---- */
const carAt=(v,x,z,m)=>{const dx=x-v.x,dz=z-v.z;return Math.abs(dx*v.hx+dz*v.hz)<v.len/2+m&&Math.abs(-dx*v.hz+dz*v.hx)<v.wid/2+m;};   // গাড়ির বক্সের (m মার্জিনসহ) ভেতরে?
const okPos=(x,z)=>{const d=Math.hypot(x-S.x,z-S.z);return d>24&&d<115&&!PD.some(o=>Math.abs(o.x-x)<1.2&&Math.abs(o.z-z)<1.2)&&!V.some(v=>carAt(v,x,z,.9));};   // গাড়ি থাকলে অন্য জায়গা
function H(x,z,opt,r){
  const L=MB.rnd(),o=Object.assign({x,z,y:0,yaw:0,tyaw:0,ph:rr(0,6),sp:rr(.95,1.4),sc:1,gm:L.g,sk:L.sk,c1:L.c1,lg:L.leg,pz:0,mode:'stand',t:rr(3,10),ox:0,oz:0,wt:0,sx:0,mv:0,nl:0,prop:0,gd:0xffffff,a:null,ck:r.cx+','+r.cz,id:idc++,acc:0,lod:0,pt:null,ln:null,tk:0,ps:0},opt);
  o.yaw=o.tyaw;if(o.a)o.a.u=(o.a.u|0)+1;PD.push(o);return o;
}
function A_(k,x,z,opt,r){const a=Object.assign({k,x,z,y:0,yaw:0,tyaw:rr(0,6.28),ph:rr(0,6),sp:rr(.5,.8),mode:'graze',t:rr(1,5),ox:0,oz:0,wt:0,mv:0,tg:null,rc:null,tint:pk(TINT),a:null,ck:r.cx+','+r.cz,id:idc++,acc:0,lod:0},opt);a.yaw=a.tyaw;if(a.a)a.a.u=(a.a.u|0)+1;ANI.push(a);return a;}
function rel(o){if(o.a)o.a.u--;if(o.pt&&o.pt.pt===o)o.pt.pt=null;}
const remH=i=>{rel(PD[i]);PD.splice(i,1);},remA=i=>{rel(ANI[i]);ANI.splice(i,1);};
/* ---- হাঁটার লাইন: ax=1 → x=f স্থির, z বরাবর চলে; mc = রাস্তার মাঝ (পার হওয়ার জন্য) ---- */
function LN(r,lane){
  const bx=r.cx*BS,bz=r.cz*BS,sd=rd()<.5?-1:1,ty=r.o.ty;
  if(ty==='main')return{ax:0,f:bz+sd*7.9,lo:bx-33,hi:bx+33,mc:bz};
  if(ty==='resi')return{ax:0,f:bz+sd*3,lo:bx-33,hi:bx+33,mc:bz};
  if(ty==='bazaar'&&lane)return{ax:1,f:bx+rr(-2.2,2.2),lo:bz-33,hi:bz+33,mc:null};
  const ax=rd()<.5?1:0,mc=(ax?bx:bz)+sd*40;return{ax,f:mc-sd*4.8,lo:(ax?bz:bx)-30,hi:(ax?bz:bx)+30,mc};
}
function walker(r,L,opt,pp){
  const p=pp===undefined?rr(L.lo,L.hi):pp,x=L.ax?L.f:p,z=L.ax?p:L.f;if(!okPos(x,z))return null;
  const d=rd()<.5?1:-1,o=H(x,z,Object.assign({mode:'walk',ln:L,f:L.f,p,d,mv:1},opt),r);o.tyaw=o.yaw=Math.atan2(L.ax?0:o.d,L.ax?o.d:0);return o;
}
function toWalk(o){
  const L=o.ln;if(!L){o.mode='stand';o.mv=0;o.pz=0;o.t=rr(5,15);return;}
  o.f=L.ax?o.x:o.z;o.p=L.ax?o.z:o.x;o.d=rd()<.5?1:-1;o.mode='walk';o.mv=1;o.pz=o.prop==='bk'?5:o.prop==='ct'?6:o.kid?9:0;
  if(o.pt&&o.pt.pt===o)o.pt.pt=null;o.pt=null;
}
/* ---- ভূমিকা (role): প্রতিটা এলাকার ধরন অনুযায়ী ---- */
const ROLE={
  lane(r){return walker(r,LN(r,1),{sp:rr(.7,1.1)})?1:0;},
  walk(r){return walker(r,LN(r),{})?1:0;},
  cross(r){const o=walker(r,LN(r),{});if(!o)return 0;if(o.ln.mc!=null){o.mode='cross';o.tf=2*o.ln.mc-o.f;}return 1;},
  hawk(r){const lane=r.o.ty==='bazaar'&&rd()<.7;return walker(r,LN(r,lane),{prop:'bk',pz:5,sp:rr(.7,1),gd:pk(GD)})?1:0;},
  cart(r){return r.o.ty==='bazaar'&&walker(r,LN(r,1),{prop:'ct',pz:6,sp:rr(.55,.8),gd:pk(GD)})?1:0;},
  stud(r){
    const L=LN(r),n=Math.min(room(),2+((rd()*2)|0)),p=rr(L.lo+4,L.hi-4),d=rd()<.5?1:-1,sp=rr(1,1.3);let c=0;if(n<2)return 0;
    for(let i=0;i<n;i++){const g=rd()<.5,o=walker(r,L,Object.assign({sp,gm:g?1:0,c1:g?0xdfe8f5:0xf2f2f2,lg:g?0xc68642:0x1f2a44},{}),p-d*i*.9);if(o){o.d=d;o.tyaw=o.yaw=Math.atan2(L.ax?0:d,L.ax?d:0);c++;}}
    return c;
  },
  pair(r){
    if(room()<2)return 0;const L=LN(r),p=rr(L.lo+3,L.hi-3),xa=L.ax?L.f:p,za=L.ax?p:L.f,xb=L.ax?L.f:p+1.2,zb=L.ax?p+1.2:L.f;if(!okPos(xa,za))return 0;
    const t=rr(8,20),a=H(xa,za,{mode:'talk',pz:2,ln:L,t},r),b=H(xb,zb,{mode:'talk',pz:2,ln:L,t:t+rr(-2,2),ph:rr(0,6)},r);
    a.pt=b;b.pt=a;a.tyaw=a.yaw=Math.atan2(xb-xa,zb-za);b.tyaw=b.yaw=Math.atan2(xa-xb,za-zb);return 2;
  },
  haggle(r){   // দরদাম: দোকানি আর ক্রেতা মুখোমুখি, দুজনেই হাত নাড়ে
    const s=pk(r.o.an.stall.filter(q=>!q.u));if(!s||room()<2)return 0;
    const sg=s.x>0?1:-1,bx=r.cx*BS,bz=r.cz*BS,xs=bx+s.x+sg*1.7,xb=bx+s.x-sg*1.7,z=bz+s.z+rr(-.3,.3);if(!okPos(xs,z))return 0;
    const t=rr(8,22),se=H(xs,z,{mode:'haggle',pz:3,a:s,t,tyaw:Math.atan2(-sg,0)},r);
    if(rd()<.65&&okPos(xb,z)){const bu=H(xb,z,{mode:'haggle',pz:3,t,ln:{ax:1,f:xb,lo:bz-33,hi:bz+33,mc:null},tyaw:Math.atan2(sg,0)},r);se.pt=bu;bu.pt=se;return 2;}
    se.mode='sell';se.pz=4;return 1;
  },
  tea(r){   // চায়ের দোকানে আড্ডা
    const T_=r.o.an.tea[0];if(!T_||T_.u||room()<3)return 0;const bx=r.cx*BS,bz=r.cz*BS,s=T_.s;if(!okPos(bx+s*5,bz+T_.z))return 0;
    H(bx+s*5,bz+T_.z,{mode:'sell',pz:2,ps:2,a:T_,tyaw:Math.atan2(-s,0)},r);let c=1;
    for(let i=0;i<3&&room()>0;i++)if(rd()<.8){H(bx+s*2.9,bz+T_.z+(i-1)*1.2,{mode:'sit',pz:1,tk:1,a:T_,tyaw:Math.atan2(s,0)},r);c++;}
    return c;
  },
  bal(r){   // বারান্দা/জানালা/টিনের বারান্দা/দরজার ধাপে মানুষ
    const an=r.o.an,all=[['bal',an.bal],['win',an.win],['ver',an.ver],['door',an.door]].flatMap(([k,a])=>a.filter(q=>!q.u).map(q=>[k,q]));if(!all.length)return 0;
    const[k,q]=pk(all),bx=r.cx*BS,bz=r.cz*BS,t=k==='bal'||k==='ver'?rr(-q.w/3,q.w/3):0,x=bx+q.x+q.tx*t,z=bz+q.z+q.tz*t;if(!okPos(x,z))return 0;
    const yw=Math.atan2(q.nx,q.nz),sit=k==='ver'||k==='door';
    H(x,z,{a:q,y:q.y,tyaw:yw,byaw:yw,mode:sit?'sit':'lean',pz:sit?1:7,nl:k==='win'?1:0,tk:rd()<.4?1:0},r);return 1;
  },
  bus(r){   // বাসস্টপে অপেক্ষা: ছাত্র-ছাত্রী, যাত্রী
    const B=r.o.an.bus;if(!B||(B.u|0)>=5||room()<2)return 0;const bx=r.cx*BS,bz=r.cz*BS,n=Math.min(room(),3+((rd()*3)|0)),L={ax:0,f:bz+B.z,lo:bx-33,hi:bx+33,mc:bz};let c=0;
    for(let i=0;i<n;i++){
      const sit=i<2&&rd()<.6,x=bx+B.x+(sit?(i?.8:-.8):rr(-1.6,1.6)),z=bz+B.z+(sit?B.s*.25:-B.s*.3);if(!okPos(x,z))continue;
      const st=rd()<.45,g=rd()<.5,look=st?{gm:g?1:0,c1:g?0xdfe8f5:0xf2f2f2,lg:g?0xc68642:0x1f2a44}:{};
      H(x,z,Object.assign({mode:sit?'sit':'wait',pz:sit?1:8,a:B,ln:L,t:rr(25,80),tyaw:Math.atan2(0,-B.s)},look),r);c++;
    }
    return c;
  },
  kids(r){   // বাচ্চাদের খেলা (সাথে বল)
    const ty=r.o.ty,bx=r.cx*BS,bz=r.cz*BS;let rc;
    if(ty==='resi'){const c=bx+rr(-24,24);rc=[c-4,c+4,bz-1.8,bz+1.8];}else if(ty==='field')rc=[bx-20,bx+20,bz-20,bz+20];else if(ty==='mosque')rc=[bx-25,bx+25,bz-30,bz-8];else return 0;
    const n=Math.min(room(),2+((rd()*3)|0));if(n<2)return 0;const ks=[];
    for(let i=0;i<n;i++){const x=rr(rc[0],rc[1]),z=rr(rc[2],rc[3]);if(!okPos(x,z))continue;ks.push(H(x,z,{mode:'play',pz:9,rc,sc:rr(.6,.8),sp:rr(1.7,2.3),kid:1,c1:pk(BRIGHT)},r));}
    if(ks.length>1&&BALL.length<6)BALL.push({a:ks[0],b:ks[1],ph:rr(0,2),c:pk(BRIGHT)});return ks.length;
  },
  goat(r){
    const ty=r.o.ty,bx=r.cx*BS,bz=r.cz*BS;let rc;
    if(ty==='resi'){const c=bx+rr(-26,26),z0=bz+(rd()<.5?-1:1)*3;rc=[c-4,c+4,z0-.5,z0+.5];}else if(ty==='field')rc=[bx-18,bx+18,bz-18,bz+18];else if(ty==='mosque')rc=[bx-30,bx+30,bz-32,bz-10];else if(ty==='pond')rc=[bx-30,bx+30,bz+18,bz+32];else return 0;
    const n=Math.min(room(),1+(rd()<.5?1:0));let c=0;
    for(let i=0;i<n;i++){const x=rr(rc[0],rc[1]),z=rr(rc[2],rc[3]);if(okPos(x,z)){A_('goat',x,z,{rc},r);c++;}}return c;
  },
  duck(r){
    const ty=r.o.ty,bx=r.cx*BS,bz=r.cz*BS;let rc,y=0;
    if(ty==='pond'){rc=[bx-16,bx+16,bz-9,bz+9];y=.16;}else if(ty==='resi'){const c=bx+rr(-26,26),z0=bz+(rd()<.5?-1:1)*3;rc=[c-4,c+4,z0-.5,z0+.5];}else return 0;
    const n=Math.min(room(),3+((rd()*2)|0));let c=0;
    for(let i=0;i<n;i++){const x=rr(rc[0],rc[1]),z=rr(rc[2],rc[3]);if(okPos(x,z)){A_('duck',x,z,{rc,y,sp:rr(.5,.8)},r);c++;}}return c;
  },
  crow(r){
    const bx=r.cx*BS,bz=r.cz*BS,P=r.o.an.perch.filter(q=>!q.u);
    if(P.length&&rd()<.7){const q=pk(P),x=bx+q[0],z=bz+q[2];if(!okPos(x,z))return 0;A_('crow',x,z,{y:q[1],a:q,mode:'perch'},r);return 1;}
    const L=LN(r),p=rr(L.lo,L.hi),x=L.ax?L.f:p,z=L.ax?p:L.f;if(!okPos(x,z))return 0;A_('crow',x,z,{mode:'hop'},r);return 1;
  }
};
const RL={
  bazaar:[['lane',5],['walk',2],['hawk',3],['cart',1.4],['haggle',3],['tea',1.1],['pair',1.2],['crow',.35],['bal',1.5]],
  main:[['walk',4],['bus',2],['hawk',1.5],['stud',2],['cross',2.5],['pair',.7],['crow',.3],['bal',1.2]],
  resi:[['walk',2.5],['kids',2],['goat',1],['duck',.7],['bal',4],['pair',1.2],['crow',.6]],
  home:[['walk',1],['crow',.5]],field:[['goat',2],['kids',1.4],['crow',1],['walk',.8]],pond:[['duck',3],['crow',.5],['walk',.8],['goat',.6]],
  mosque:[['walk',1.2],['crow',1],['goat',.5],['kids',.8]],palace:[['walk',1],['crow',.5]]
},MOD=[{goat:3,duck:2.5,kids:1.5,bal:.5},{lane:1.6,walk:1.4,hawk:1.4,goat:.1,duck:.1,kids:.6},{walk:.7,kids:.3,goat:.2,hawk:.5,bal:1.2},{kids:2.2,goat:2,bal:1.2,duck:1.3}];
function spawnOne(){
  for(let n=0;n<8;n++){
    const rs=[];for(const r of W.ch.values())if(Math.hypot(r.cx*BS-S.x,r.cz*BS-S.z)<110)rs.push(r);if(!rs.length||room()<=0)return;
    const r=pk(rs),tb=RL[r.o.ty],md=MOD[area(r.cx,r.cz).t]||{};if(!tb)continue;
    const w=tb.map(([k,v])=>v*(md[k]!=null?md[k]:1)),tot=w.reduce((a,b)=>a+b,0);let q=rd()*tot,i=0;while(i<w.length-1&&q>=w[i]){q-=w[i];i++;}
    if(ROLE[tb[i][0]](r)>0)return;
  }
}
/* ---- আচরণ ---- */
function vehAhead(o){   // সামনে/পাশে গাড়ি এসে পড়লে মানুষ থামবে (গাড়ি আসছে মানে গতির সাথে বাড়তি দূরত্ব)
  for(const v of V){const dx=o.x-v.x,dz=o.z-v.z;if(Math.abs(dx)>14||Math.abs(dz)>14)continue;const lz=dx*v.hx+dz*v.hz,lx=-dx*v.hz+dz*v.hx;
    if(Math.abs(lx)<v.wid/2+.9&&lz>-v.len/2-.9&&lz<v.len/2+.9+Math.max(0,v.v)*.9)return 1;}
  return 0;
}
function nudge(o,dx,dz){   // ওভারল্যাপ ঠেলে সরানো: হাঁটার লাইনের স্থানাঙ্কও সরাও
  o.x+=dx;o.z+=dz;if(o.k)return;if(o.ln&&(o.mode==='walk'||o.mode==='cross'||o.mode==='pause')){if(o.ln.ax){o.f+=dx;o.p+=dz;}else{o.f+=dz;o.p+=dx;}}
}
const clearRoad=(x,z)=>!V.some(v=>v.v>.5&&Math.abs(v.x-x)<18&&Math.abs(v.z-z)<18);
function walk(o,dt){
  const L=o.ln;if(o.wt>0){o.mv=0;return;}o.mv=1;
  o.p+=o.d*o.sp*dt;if(o.p>L.hi){o.p=L.hi;o.d=-1;}else if(o.p<L.lo){o.p=L.lo;o.d=1;}o.ph+=dt*o.sp*5.5;
  o.x=L.ax?o.f:o.p;o.z=L.ax?o.p:o.f;o.tyaw=Math.atan2(L.ax?0:o.d,L.ax?o.d:0);
  if(rd()<dt/9){o.mode='pause';o.t=rr(1.5,5);o.mv=0;}
  else if(L.mc!=null&&rd()<dt/14&&clearRoad(o.x,o.z)){o.mode='cross';o.tf=2*L.mc-o.f;}
}
function cross(o,dt){
  const L=o.ln;if(o.wt>0){o.mv=0;return;}o.mv=1;const dir=sg(o.tf-o.f);o.f+=dir*o.sp*1.2*dt;o.ph+=dt*o.sp*6.5;
  o.x=L.ax?o.f:o.p;o.z=L.ax?o.p:o.f;o.tyaw=Math.atan2(L.ax?dir:0,L.ax?0:dir);if((o.tf-o.f)*dir<=0){o.f=o.tf;o.mode='walk';}
}
function play(o,dt){
  if(o.wt>0){o.mv=0;return;}const c=o.rc;
  if(!o.tg||o.t<=0){o.tg=[rr(c[0],c[1]),rr(c[2],c[3])];o.t=rr(1.5,4);if(rd()<.3){o.mv=0;o.wt=rr(.5,1.5);return;}}
  const dx=o.tg[0]-o.x,dz=o.tg[1]-o.z,d=Math.hypot(dx,dz);if(d<.3){o.t=0;o.mv=0;return;}
  o.mv=1;o.x+=dx/d*o.sp*dt;o.z+=dz/d*o.sp*dt;o.ph+=dt*o.sp*5;o.tyaw=Math.atan2(dx,dz);
}
function upd(o,dt){
  o.t-=dt;o.sx-=dt;if(o.wt>0)o.wt-=dt;const m=o.mode;
  if((m==='walk'||m==='cross'||m==='play')&&vehAhead(o))o.wt=Math.max(o.wt,.45);
  if(m==='walk')walk(o,dt);else if(m==='cross')cross(o,dt);else if(m==='play')play(o,dt);
  else{
    o.mv=0;
    if(m==='pause'){if(o.t<=0)o.mode='walk';}
    else if(m==='talk'){if(o.t<=0)toWalk(o);}
    else if(m==='haggle'){if(o.t<=0){if(o.a){o.mode='sell';o.pz=4;o.pt=null;}else toWalk(o);}}
    else if(m==='sell')o.pz=((clk*.3+o.ph)%3)<1.2?4:o.ps;
    else if(m==='wait'){if(o.t<=0&&o.ln)toWalk(o);}
    else if(m==='lean'||m==='sit'){if(o.t<=0){o.t=rr(3,8);if(o.byaw!==undefined&&(m==='lean'||o.tk))o.tyaw=o.byaw+rr(-.7,.7);}}
  }
}
function dodge(o,dt){   // পথচারী/প্রাণী সরে যায় বা থামে, প্লেয়ারের কোনো শাস্তি নেই
  if(o.y>.5||o.mode==='fly')return;
  const ex=o.x-S.x,ez=o.z-S.z,d=Math.hypot(ex,ez);let hit=0;
  if(d<8&&d>1e-3){
    const fx=Math.sin(S.h),fz=Math.cos(S.h),fw=ex*fx+ez*fz,lt=-ex*fz+ez*fx;
    if(fw>-1.8&&fw<2.6+Math.max(S.v,0)*1.1&&Math.abs(lt)<2){const s=lt>=0?1:-1;hit=1;o.ox+=-fz*s*2.6*dt;o.oz+=fx*s*2.6*dt;o.wt=Math.max(o.wt,.6);if(d<4)o.sx=.7;o.tyaw=Math.atan2(-ex,-ez);}
  }
  const m=Math.hypot(o.ox,o.oz);if(m>1.8){o.ox*=1.8/m;o.oz*=1.8/m;}
  if(!hit){const k=Math.max(0,1-1.2*dt);o.ox*=k;o.oz*=k;}
}
const turn=(o,dt)=>{let da=o.tyaw-o.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));o.yaw+=da*Math.min(1,9*dt);};
function updA(a,dt){
  a.t-=dt;if(a.wt>0)a.wt-=dt;
  if(a.k==='crow'){
    const d=Math.hypot(a.x-S.x,a.z-S.z);
    if(a.mode!=='fly'&&d<9){const g=Math.atan2(a.x-S.x,a.z-S.z)+rr(-.5,.5);a.mode='fly';a.t=3.5;a.fx=Math.sin(g);a.fz=Math.cos(g);a.tyaw=g;a.vy=2.6;a.mv=1;}
    if(a.mode==='fly'){a.x+=a.fx*7*dt;a.z+=a.fz*7*dt;a.y+=a.vy*dt;a.ph+=dt*22;if(a.t<=0)a.dead=1;}
    else{
      if(a.t<=0){a.t=rr(1.5,4);a.tyaw+=rr(-1.2,1.2);a.tg=a.mode==='hop'&&rd()<.6?[a.x+rr(-1.2,1.2),a.z+rr(-1.2,1.2)]:null;}
      a.mv=0;if(a.tg){const dx=a.tg[0]-a.x,dz=a.tg[1]-a.z,q=Math.hypot(dx,dz);if(q<.1)a.tg=null;else{a.mv=1;a.x+=dx/q*1.4*dt;a.z+=dz/q*1.4*dt;a.ph+=dt*14;}}
    }
    turn(a,dt);return;
  }
  if(a.mode==='graze'){a.mv=0;if(a.t<=0){a.mode='walk';a.tg=null;}}
  else{
    if(!a.tg)a.tg=[cl(a.x+rr(-3.5,3.5),a.rc[0],a.rc[1]),cl(a.z+rr(-3.5,3.5),a.rc[2],a.rc[3])];
    const dx=a.tg[0]-a.x,dz=a.tg[1]-a.z,d=Math.hypot(dx,dz);
    if(d<.25){a.tg=null;a.mv=0;if(a.k==='goat'||rd()<.5){a.mode='graze';a.t=rr(2,7);}}
    else if(a.wt<=0){a.mv=1;a.x+=dx/d*a.sp*dt;a.z+=dz/d*a.sp*dt;a.ph+=dt*a.sp*7;a.tyaw=Math.atan2(dx,dz);}else a.mv=0;
  }
  dodge(a,dt);turn(a,dt);
}
function step(dt){
  clk+=dt;fr++;
  for(let i=PD.length-1;i>=0;i--){const o=PD[i];if(Math.hypot(o.x-S.x,o.z-S.z)>125||!W.ch.has(o.ck))remH(i);}
  for(let i=ANI.length-1;i>=0;i--){const a=ANI[i];if(a.dead||Math.hypot(a.x-S.x,a.z-S.z)>125||!W.ch.has(a.ck))remA(i);}
  while(total()>cap){let w=-1,wd=-1,pa=0;PD.forEach((o,i)=>{const d=Math.hypot(o.x-S.x,o.z-S.z);if(d>wd){wd=d;w=i;pa=0;}});ANI.forEach((o,i)=>{const d=Math.hypot(o.x-S.x,o.z-S.z);if(d>wd){wd=d;w=i;pa=1;}});if(w<0)break;pa?remA(w):remH(w);}
  spT-=dt;if(spT<=0&&room()>0){spawnOne();spT=.12+rd()*.22;}
  for(const o of PD){
    const d=Math.hypot(o.x-S.x,o.z-S.z);o.lod=d<40?0:d<75?1:2;
    if((o.lod===1&&(fr+o.id)%2)||(o.lod===2&&(fr+o.id)%6)){o.acc+=dt;continue;}
    const q=dt+o.acc;o.acc=0;upd(o,q);dodge(o,q);turn(o,q);
  }
  for(const a of ANI){
    const d=Math.hypot(a.x-S.x,a.z-S.z);a.lod=d<40?0:d<75?1:2;
    if(a.k!=='crow'&&((a.lod===1&&(fr+a.id)%2)||(a.lod===2&&(fr+a.id)%6))){a.acc+=dt;continue;}
    const q=dt+a.acc;a.acc=0;updA(a,q);
  }
  for(let i=BALL.length-1;i>=0;i--)if(!PD.includes(BALL[i].a)||!PD.includes(BALL[i].b))BALL.splice(i,1);
}
/* ---- ভঙ্গি: PZ = [শরীর-নামা, বাঁ-হাত rx, rz, ডান-হাত rx, rz, বাঁ-পা, ডান-পা] ---- */
function posef(o){
  const t=clk,m=o.mv&&o.wt<=0&&o.lod<2?1:0,s=Math.sin(o.ph)*.7*m,a=PZ;a.fill(0);
  switch(o.sx>0&&!o.nl?10:o.pz){
    case 1:a[0]=-.45;a[5]=a[6]=-1.45;a[1]=a[3]=-.6;if(o.tk&&o.lod<2){a[1]=-.9+Math.sin(t*5+o.ph)*.35;a[3]=-.5+Math.sin(t*3+o.ph*2)*.2;}break;
    case 2:if(o.lod<2){a[1]=-.9+Math.sin(t*5+o.ph)*.35;a[2]=-.15;a[3]=-.3+Math.sin(t*3+o.ph*2)*.15;}break;
    case 3:if(o.lod<2){a[1]=-1.3+Math.sin(t*9+o.ph)*.6;a[3]=-1.3+Math.sin(t*9+o.ph+2)*.6;}else a[1]=a[3]=-1.3;a[2]=-.35;a[4]=.35;break;
    case 4:a[3]=-2.7+(o.lod<2?Math.sin(t*6+o.ph)*.3:0);a[4]=.4;break;
    case 5:a[1]=a[3]=-2.85;a[2]=-.3;a[4]=.3;a[5]=-s;a[6]=s;break;
    case 6:a[1]=a[3]=-.8;a[2]=-.1;a[4]=.1;a[5]=-s;a[6]=s;break;
    case 7:a[1]=a[3]=-1.1;a[2]=-.12;a[4]=.12;break;
    case 8:a[3]=((t*.35+o.ph)%6)<1?-1.8:.02;a[6]=.04*Math.sin(t+o.ph);break;
    case 9:{const k=m*1.6;a[1]=Math.sin(o.ph)*.7*k;a[3]=-a[1];a[5]=-a[1];a[6]=a[1];a[0]=m?Math.abs(Math.sin(o.ph))*.1:0;break;}
    case 10:a[1]=a[3]=-2.2;a[2]=-.8;a[4]=.8;a[5]=-s;a[6]=s;break;
    default:a[1]=s;a[3]=-s;a[5]=-s;a[6]=s;if(!m&&o.lod<2)a[1]=Math.sin(t*1.5+o.ph)*.03;
  }
}
function draw(){
  if(NQ!==HQ)build();
  const ox=W.ox,oz=W.oz,c=new T.Color(),n=[0,0,0,0];let nb=0,ng=0,nc=0;
  const put=(m,k,x,y,z,rx,ry,rz,s,hex)=>{OBJ.position.set(x,y,z);OBJ.rotation.set(rx,ry,rz);OBJ.scale.set(s,s,s);OBJ.updateMatrix();m.setMatrixAt(k,OBJ.matrix);if(hex>=0)m.setColorAt(k,c.setHex(hex));};
  PD.forEach((o,i)=>{
    posef(o);const s=o.sc,X=o.x+o.ox-ox,Z=o.z+o.oz-oz,Y=o.y,yw=o.yaw,cs=Math.cos(yw)*s,sn=Math.sin(yw)*s,dy=PZ[0]*s;
    put(M.h,i,X,Y+dy,Z,0,yw,0,s,o.sk);put(M.b[o.gm],n[o.gm]++,X,Y+dy,Z,0,yw,0,s,o.c1);
    for(let q=0;q<2;q++){const d=q?1:-1;
      put(M.a[q],i,X+d*.23*cs,Y+1.4*s+dy,Z-d*.23*sn,PZ[1+q*2],yw,PZ[2+q*2],s,o.sk);
      put(M.l[q],i,X+d*.1*cs,Y+.9*s+dy,Z-d*.1*sn,o.nl?0:PZ[5+q],yw,0,o.nl?.0001:s,o.lg);}
    if(o.prop==='bk'){put(M.bk,nb++,X,Y+dy+1.74*s,Z,0,yw,0,1,-1);put(M.gd,ng++,X,Y+dy+1.84*s,Z,0,yw,0,1,o.gd);}
    else if(o.prop==='ct'){const qx=X+Math.sin(yw)*2.1,qz=Z+Math.cos(yw)*2.1;put(M.ct,nc++,qx,Y,qz,0,yw,0,1,-1);put(M.gd,ng++,qx,Y+.75,qz,0,yw,0,2.2,o.gd);}
  });
  const N=PD.length;M.h.count=M.a[0].count=M.a[1].count=M.l[0].count=M.l[1].count=N;M.b.forEach((m,i)=>m.count=n[i]);M.bk.count=nb;M.ct.count=nc;M.gd.count=ng;
  let g=0,du=0,cr=0,w=0;
  ANI.forEach(a=>{
    const X=a.x+a.ox-ox,Z=a.z+a.oz-oz,yw=a.yaw,sw=Math.sin(a.ph);
    if(a.k==='goat'){const bob=a.mv?sw*.03:0,hp=a.mode==='graze'?.95:.12+sw*.08*a.mv;put(M.go,g,X,a.y+bob,Z,0,yw,a.mv?sw*.05:0,1,a.tint);put(M.gh,g,X+Math.sin(yw)*.42,a.y+.78+bob,Z+Math.cos(yw)*.42,hp,yw,0,1,a.tint);g++;}
    else if(a.k==='duck'){put(M.du,du++,X,a.y,Z,a.mode==='graze'?.5:0,yw,a.mv?sw*.15:0,1,a.tint);}
    else{const fly=a.mode==='fly',hop=a.mv&&!fly?Math.abs(sw)*.12:0,wr=fly?sw*.9:-1.35,cy=Math.cos(yw)*.08,sy=Math.sin(yw)*.08;
      put(M.cb,cr++,X,a.y+hop,Z,fly?-.2:0,yw,0,1,-1);put(M.cw,w++,X+cy,a.y+hop+.14,Z-sy,0,yw,wr,1,-1);put(M.cw,w++,X-cy,a.y+hop+.14,Z+sy,0,yw+Math.PI,wr,1,-1);}
  });
  M.go.count=M.gh.count=g;M.du.count=du;M.cb.count=cr;M.cw.count=w;
  BALL.forEach((b,i)=>{const k=(clk*.6+b.ph)%2,u=k<1?k:2-k;put(M.bl,i,b.a.x+(b.b.x-b.a.x)*u-ox,.12+Math.sin(u*Math.PI)*.9,b.a.z+(b.b.z-b.a.z)*u-oz,0,0,0,1,b.c);});M.bl.count=BALL.length;
  [M.h,...M.a,...M.l,...M.b,M.bk,M.ct,M.gd,M.go,M.gh,M.du,M.cb,M.cw,M.bl].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;});
}
function reset(){
  PD.length=0;ANI.length=0;BALL.length=0;spT=0;
  for(let i=0;i<90&&total()<cap;i++)spawnOne();
}
function perf(f,dt){   // FPS কমলে NPC কমাও; অনেকক্ষণ ভালো থাকলে ধীরে বাড়াও
  if(f>.034){lowT+=dt;hiT=0;if(lowT>1.5){lowT=0;cap=Math.max(10,cap-4);}}
  else if(f<.02){hiT+=dt;lowT=0;if(hiT>10){hiT=0;cap=Math.min(MAXN,cap+2);}}
  else{lowT=0;hiT=0;}
}
return{step,draw,reset,perf,ANI,nudge};
})();
export { NPC };
