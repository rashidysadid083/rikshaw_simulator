// যানবাহন: রিকশা ও মডেল-বিল্ডার, চালানোর অবস্থা
import { HQ, NP, PD, T, lin, mute, scene } from './core.js';
import { CC, L, W, WM, gr, mk2 } from './world.js';

/* ---------- রিকশা ---------- */
/* ---------- মডেল-বিল্ডার (MB): গাড়ি · বাস · ট্রাক · বাইক · রিকশা · মানুষ — প্লেয়ার ও NPC একই ফাংশন; প্রতি ধরন = ১টা মার্জ-করা জিওমেট্রি ---------- */
const MB=(()=>{
 const E=new T.Euler(),Mx=new T.Matrix4(),Qt=new T.Quaternion(),P1=new T.Vector3(),S1=new T.Vector3(),OB=new T.Object3D(),W1=0xffffff,GL=0x1d2b3a;OB.rotation.order='YXZ';
 const pg=(g,c,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{E.set(rx,ry,rz);Qt.setFromEuler(E);Mx.compose(P1.set(x,y,z),Qt,S1.set(sx,sy,sz));g=g.index?g.toNonIndexed():g.clone();g.applyMatrix4(Mx);return{g,c};};
 const bx=(c,x,y,z,w,h,d,rx,ry,rz)=>pg(new T.BoxGeometry(w,h,d),c,x,y,z,rx,ry,rz),xf=(ps,m)=>ps.map(p=>{const g=p.g.clone();g.applyMatrix4(m);return{g,c:p.c};});
 const merge=(parts,raw)=>{let n=0;parts.forEach(p=>n+=p.g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3),U=new Float32Array(n*2).fill(.03);let o=0;
  for(const p of parts){const a=p.g.attributes,m=a.position.count;P.set(a.position.array,o*3);N.set(a.normal.array,o*3);CC.setHex(p.c);if(!raw)mute(CC);CC.convertSRGBToLinear();for(let i=0;i<m;i++){C[(o+i)*3]=CC.r;C[(o+i)*3+1]=CC.g;C[(o+i)*3+2]=CC.b;}o+=m;p.g.dispose();}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setAttribute('color',new T.BufferAttribute(C,3));g.setAttribute('uv',new T.BufferAttribute(U,2));return g;};
 /* সাইড-সিলুয়েট (z,y) → ExtrudeGeometry + bevel, x বরাবর w চওড়া */
 const ex=(c,pts,w,lo)=>{const sh=new T.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));const d=w-.12;return pg(new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.06,bevelSize:.07,bevelSegments:lo?1:2,curveSegments:4}),c,d/2,0,0,0,-Math.PI/2,0);};
 const wl=(P,x,z,r,w,lo)=>{const cz=Math.PI/2;P.push(pg(new T.CylinderGeometry(r,r,w,lo?8:14),0x171717,x,r,z,0,0,cz),pg(new T.CylinderGeometry(r*.6,r*.6,w+.03,lo?6:10),0x8d9296,x,r,z,0,0,cz));if(!lo)P.push(pg(new T.CylinderGeometry(r*.2,r*.2,w+.05,6),0x555a5e,x,r,z,0,0,cz));};
 const wsh=(a,b,wd)=>{const dz=b[0]-a[0],dy=b[1]-a[1];return bx(GL,0,(a[1]+b[1])/2,(a[0]+b[0])/2,wd,Math.hypot(dz,dy)*.94,.07,Math.atan2(dz,dy));};
 /* মানুষ: মাথা(গোলক)+ঘাড+হাত+ধড়+পা আলাদা; gm 0 শার্ট-প্যান্ট/স্কুল · 1 লুঙ্গি · 2 পাঞ্জাবি · 3 শাড়ি. K=null হলে সাদা (InstancedMesh রঙ দেবে) */
 const hg=(gm,K,lo)=>{const k=n=>K?K[n]:W1,sk=k('sk'),top=k('top'),kb=K?K.bot:0xb4b4b4,lg=k('leg'),hr=K?K.hair:0x1c1a18,a=lo?6:10,b=lo?4:7;
  const head=[pg(new T.SphereGeometry(.11,a,b),sk,0,1.63,0,0,0,0,1,1.12,1.05),pg(new T.CylinderGeometry(.045,.05,.1,6),sk,0,1.5,0),pg(new T.SphereGeometry(.118,a,b,0,6.2832,0,1.7),hr,0,1.65,-.015)];
  if(gm===3)head.push(bx(hr,0,1.45,-.09,.18,.42,.07));
  const body=[bx(top,0,1.17,0,.38,.55,.2),bx(top,0,.93,0,.34,.14,.19)];
  if(gm===1)body.push(pg(new T.CylinderGeometry(.21,.25,.66,a),kb,0,.6,0));
  if(gm===2)body.push(bx(top,0,.82,0,.4,.5,.24));
  if(gm===3)body.push(pg(new T.CylinderGeometry(.2,.3,.86,a),kb,0,.47,0),bx(kb,.14,1.2,0,.06,.6,.26,0,0,.12));
  return{head,body,arm:[pg(new T.CylinderGeometry(.045,.04,.55,6),sk,0,-.27,0),pg(new T.SphereGeometry(.05,6,4),sk,0,-.57,0)],leg:[pg(new T.CylinderGeometry(.075,.06,.86,6),lg,0,-.43,0),bx(0x222222,0,-.87,.05,.1,.07,.22)]};};
 const HMt=new T.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0});
 const human=o=>{const K={sk:o.sk,top:o.c1,bot:o.c2,leg:o.leg,hair:o.hair||0x1c1a18},G=hg(o.g,K,!HQ),g=new T.Group(),mk=(ps,p)=>{const m=new T.Mesh(merge(ps),HMt);m.castShadow=!!HQ;p.add(m);},
  j=(ps,x,y)=>{const p=new T.Group();p.position.set(x,y,0);g.add(p);mk(ps,p);return p;};
  mk(G.head,g);mk(G.body,g);g.userData={arms:[j(G.arm,-.23,1.4),j(G.arm,.23,1.4)],legs:[j(G.leg,-.1,.9),j(G.leg,.1,.9)]};return g;};
 const SKN=[0xc68642,0xd9a066,0x8d5524,0xe0ac69,0xb07a4a],TOP=[0xcfd8dc,0x8fa1ad,0x7e9a7e,0xb08968,0xa0a0a8,0xc9b8a0,0x9a6b6b],BOT=[0x37474f,0x3e4a5a,0x4a4036,0x5f6368,0x222c3a],SAR=[0xb04a4a,0x3f7a5a,0xc49a3a,0x4a5fa0,0x8a4a7a],pk=a=>a[(Math.random()*a.length)|0];
 const rnd=()=>{const r=Math.random(),sk=pk(SKN),o={sk,hair:0x1c1a18};
  if(r<.5){o.g=0;o.c1=pk(TOP);o.c2=o.leg=pk(BOT);if(Math.random()<.2){o.c1=0xe8e8e8;o.c2=o.leg=0x1f2a44;}}
  else if(r<.72){o.g=1;o.c1=pk(TOP);o.c2=pk([0x3f6f9b,0x5a7a4a,0x8a5a4a,0x555a8a]);o.leg=sk;}
  else if(r<.85){o.g=2;o.c1=pk([0xe8e4da,0xb9c4d0,0xc9b8a0]);o.c2=o.c1;o.leg=0xe8e4da;}
  else{o.g=3;o.c1=pk(SAR);o.c2=pk(SAR);o.leg=sk;}return o;};
 /* স্থির ভঙ্গির মানুষ (NPC বাইক/রিকশার আরোহী) */
 const sh=(K,lo,x,y,z,ry,ar,lg)=>{const G=hg(K.g,K,lo),R=new T.Matrix4().compose(P1.set(x,y,z),Qt.setFromEuler(E.set(0,ry,0)),S1.set(1,1,1)),out=[...xf(G.head,R),...xf(G.body,R)];
  for(const s of[-1,1])for(const[pp,jy,sw,jx]of[[G.arm,1.4,ar,.23],[G.leg,.9,lg,.1]]){const m=new T.Matrix4().compose(P1.set(s*jx,jy,0),Qt.setFromEuler(E.set(sw,0,0)),S1.set(1,1,1));m.premultiply(R);out.push(...xf(pp,m));}return out;};
 const RK=()=>({g:1,sk:0xb98458,c1:pk(TOP),c2:0x3f6f9b,leg:0xb98458,hair:0x1c1a18});
 /* গাড়ি: সেডান/SUV/ভ্যান */
 const CFG={sedan:{hl:2.1,wd:1.8,bd:[[-2.1,.4],[-2.1,.9],[-1.2,1],[1.3,1],[2.1,.85],[2.1,.4]],cb:[[-1.1,1],[-.75,1.5],[.65,1.5],[1.15,1]],gl:[[-.95,1.06],[-.7,1.44],[.55,1.44],[.95,1.06]],cw:1.55,ws:[[1.15,1],[.65,1.5]],wr:[[-1.1,1],[-.75,1.5]],my:1.05,mz:.62,wz:1.35,r:.35,ly:.72},
  suv:{hl:2,wd:1.9,bd:[[-2,.45],[-2,1.1],[1.4,1.15],[2,.95],[2,.45]],cb:[[-1.9,1.1],[-1.8,1.75],[.7,1.75],[1.25,1.1]],gl:[[-1.75,1.2],[-1.65,1.68],[.6,1.68],[1.05,1.2]],cw:1.75,ws:[[1.25,1.1],[.7,1.75]],wr:[[-1.9,1.1],[-1.8,1.75]],my:1.35,mz:.75,wz:1.3,r:.4,ly:.85},
  van:{hl:2.75,wd:2.1,bd:[[-2.75,.45],[-2.75,2.5],[.6,2.5],[1.5,1.75],[2.75,1.4],[2.75,.45]],cb:0,gl:[[1,1.85],[.85,2.3],[1.2,2.3],[1.7,1.85]],cw:2.1,ws:[[1.45,1.8],[.95,2.4]],wr:0,my:1.9,mz:1.2,wz:1.7,r:.42,ly:.8}};
 const car=(P,Lp,k,lo,bc,po,am)=>{const o=CFG[k],X=o.wd/2-.12;
  P.push(ex(bc,o.bd,o.wd,lo));if(o.cb)P.push(ex(bc,o.cb,o.cw,lo));P.push(ex(GL,o.gl,o.cw+.04,lo),wsh(o.ws[0],o.ws[1],o.cw-.1));if(o.wr)P.push(wsh(o.wr[0],o.wr[1],o.cw-.1));
  for(const s of[-1,1]){wl(P,s*X,o.wz,o.r,.24,lo);wl(P,s*X,-o.wz,o.r,.24,lo);
   Lp.push(bx(0xfff2c8,s*o.wd*.33,o.ly,o.hl+.04,.4,.16,.08),bx(0xc62828,s*o.wd*.33,o.ly,-o.hl-.04,.4,.14,.08));
   if(!lo)P.push(bx(0x222222,s*(o.wd/2+.09),o.my,o.mz,.1,.08,.16));
   if(po)P.push(bx(0x1a237e,s*(o.wd/2+.005),.72,0,.02,.18,o.hl*1.8));if(am)P.push(bx(0xe53935,s*(o.wd/2+.005),1.4,-.2,.02,.35,o.hl*1.6));}
  if(!lo)P.push(bx(0xf2f2ea,0,.55,o.hl+.075,.45,.13,.03),bx(0xf2f2ea,0,.55,-o.hl-.075,.45,.13,.03));
  if(po)Lp.push(bx(0xff1744,-.3,1.65,-.1,.5,.12,.3),bx(0x2979ff,.3,1.65,-.1,.5,.12,.3));if(am)Lp.push(bx(0xff1744,0,2.62,-.5,.8,.14,.35));};
 /* বাংলাদেশি বাস: সারি জানালা, সামনে গন্তব্য-ফলক (বাংলা) */
 const dsT=mk2(512,512,(g,w,h)=>{g.fillStyle='#111';g.fillRect(0,h-64,w,64);g.fillStyle='#ffb300';g.font='bold 40px Hind Siliguri, Noto Sans Bengali, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('গাবতলী ⇄ সদরঘাট',w/2,h-32);});
 const bus=(P,Lp,lo)=>{P.push(ex(0xf2f2f2,[[-5.5,.55],[-5.5,3.1],[5.1,3.1],[5.5,2.7],[5.5,.55]],2.5,lo),bx(0x37474f,0,.7,0,2.46,.3,10.9),bx(GL,0,2.1,5.56,2.15,.75,.05),bx(GL,0,2.2,-5.56,2.15,.75,.05));
  for(let i=0;i<7;i++)for(const s of[-1,1])P.push(bx(GL,s*1.27,2.15,-4.3+i*1.45,.05,.8,1.15));
  for(const s of[-1,1]){wl(P,s*1.25,3.6,.5,.3,lo);wl(P,s*1.25,-3.6,.5,.3,lo);Lp.push(bx(0xfff2c8,s*.85,.95,5.57,.4,.18,.08),bx(0xc62828,s*.85,.95,-5.57,.4,.18,.08));}
  const pl=new T.PlaneGeometry(1.8,.22),u=pl.attributes.uv;for(let i=0;i<u.count;i++)u.setY(i,u.getY(i)/8);pl.translate(0,2.6,5.6);return pl;};
 /* ট্রাক: আলাদা ক্যাব, কাঠের পাটা, রঙিন নকশা */
 const truck=(P,Lp,lo)=>{P.push(bx(0x2a2a2a,0,.75,-.4,2.2,.35,6.6),bx(0x7a5a3a,0,.98,-1.3,2.4,.12,4.8),ex(0xf2f2f2,[[1.25,.9],[1.25,2.55],[2.55,2.55],[2.95,2],[3.7,1.9],[3.7,.9]],2.4,lo),wsh([2.95,2],[2.55,2.55],2.2),bx(0x8a6a44,0,1.6,-3.7,2.4,1.2,.1),bx(0x8a6a44,0,1.9,1.15,2.4,1.6,.1),bx(0x2a2a2a,0,.7,3.75,2.4,.2,.15));
  for(const s of[-1,1]){P.push(bx(GL,s*1.21,2.2,1.9,.06,.6,.9),bx(0xf2f2f2,s*1.2,2.4,-1.3,.1,.4,4.8));
   for(let j=0;j<3;j++)P.push(bx(j%2?0x8a6a44:0x9a7a52,s*1.2,1.2+j*.4,-1.3,.1,.36,4.8));
   for(let n=0;n<6;n++)P.push(bx([0xf4d35e,0xe8e8e8,0xd8c27a][n%3],s*1.26,2.4,-3.4+n*.9,.06,.28,.5));
   wl(P,s*1.25,2.7,.5,.3,lo);wl(P,s*1.25,-1.4,.5,.3,lo);wl(P,s*1.25,-2.7,.5,.3,lo);Lp.push(bx(0xfff2c8,s*.8,1.15,3.77,.35,.2,.08),bx(0xc62828,s*.9,1,-3.78,.3,.2,.08));}};
 /* বাইক + আরোহী */
 const bike=(P,Lp,lo)=>{wl(P,0,.75,.33,.1,lo);wl(P,0,-.75,.33,.1,lo);P.push(ex(0xb23a3a,[[-.25,.78],[-.25,1],[.3,1.02],[.4,.85]],.3,lo),bx(0x2b2b2b,0,.5,0,.2,.35,.5),bx(0x1b1b1b,0,.95,-.3,.22,.1,.6),bx(0x888888,0,.8,.7,.05,.85,.05,.3),bx(0x333333,0,1.15,.6,.7,.04,.04));
  Lp.push(bx(0xfff2c8,0,1,.78,.18,.16,.12),bx(0xc62828,0,.9,-.72,.16,.1,.06));P.push(...sh({g:0,sk:0xb98458,top:0x6b7f94,bot:0x37474f,leg:0x37474f,hair:0x1c1a18},lo,0,.05,-.2,0,-.9,-.75));};
 /* সাইকেল-রিকশা + চালক */
 const rick=(P,Lp,lo)=>{wl(P,-.7,-.6,.42,.08,lo);wl(P,.7,-.6,.42,.08,lo);wl(P,0,1.15,.4,.08,lo);
  P.push(bx(0x1f8a4c,0,.55,-.2,1.5,.12,2.2),bx(0xc62828,0,.78,-.6,1.1,.22,.8),bx(0xc62828,0,1.05,-.98,1.1,.5,.12),bx(0xe53935,0,1.88,-.35,1.5,.06,1.7),bx(0xcccccc,0,.8,1.15,.06,.8,.06),bx(0xcccccc,0,1.2,1.15,.9,.05,.05),bx(0x222222,0,.9,.5,.3,.08,.3));
  for(const s of[-1,1])P.push(ex(0xe53935,[[-1,.8],[-1,1.5],[-.55,1.85],[.2,1.85],[.55,1.5],[.55,.8]],.2,lo).g?{g:ex(0xe53935,[[-1,.8],[-1,1.5],[-.55,1.85],[.2,1.85],[.55,1.5],[.55,.8]],.2,lo).g.clone().translate(s*.62,0,0),c:0xe53935}:0);
  Lp.push(bx(0xfff2c8,0,.95,1.2,.12,.1,.06));P.push(...sh(RK(),lo,0,.05,.5,0,-1.06,-.95));};
 const veh=(i,lo)=>{const P=[],Lp=[];let x=null;
  if(i===0)car(P,Lp,'sedan',lo,0xf2f2f2);else if(i===5)car(P,Lp,'suv',lo,0xf2f2f2);else if(i===6)car(P,Lp,'sedan',lo,0xf5f5f5,1);else if(i===7)car(P,Lp,'van',lo,0xf5f5f5,0,1);
  else if(i===3)x=bus(P,Lp,lo);else if(i===4)truck(P,Lp,lo);else if(i===1)bike(P,Lp,lo);else rick(P,Lp,lo);
  return{b:merge(P),l:merge(Lp,1),x};};
 /* পথচারী: ১০টা InstancedMesh (মাথা, ২ হাত, ২ পা, ৪ পোশাক-ধরন); হাঁটার সময় হাত-পা দোলে */
 let PM=null,PQ=-1;
 const pgeo=()=>{const G=hg(0,null,!HQ);return{head:merge(G.head),arm:merge(G.arm),leg:merge(G.leg),body:[0,1,2,3].map(g=>merge(hg(g,null,!HQ).body))};};
 const im=g=>{const m=new T.InstancedMesh(g,WM,NP);m.setColorAt(0,CC.setHex(0xffffff));m.instanceColor.array.fill(1);m.frustumCulled=false;m.count=0;scene.add(m);return m;};
 const drawPeds=()=>{
  if(!PM||PQ!==HQ){const g=pgeo();if(!PM)PM={h:im(g.head),a:[im(g.arm),im(g.arm)],l:[im(g.leg),im(g.leg)],b:g.body.map(im)};else{PM.h.geometry=g.head;PM.a.forEach(m=>m.geometry=g.arm);PM.l.forEach(m=>m.geometry=g.leg);PM.b.forEach((m,i)=>m.geometry=g.body[i]);}PQ=HQ;}
  const n=[0,0,0,0],c=new T.Color();
  PD.forEach((o,i)=>{
   if(o.gm===undefined){const r=rnd();o.gm=r.g;o.sk=r.sk;o.c1=r.c1;o.lg=r.leg;}
   const w=o.wait>0?0:1,sw=Math.sin(o.ph)*.7*w,yb=w*Math.abs(Math.sin(o.ph))*.03,px=o.x-W.ox,pz=o.z-W.oz,cs=Math.cos(o.yaw),sn=Math.sin(o.yaw);OB.scale.set(1,1,1);
   const put=(m,k,x,y,z,rx,h)=>{OB.position.set(x,y,z);OB.rotation.set(rx,o.yaw,0);OB.updateMatrix();m.setMatrixAt(k,OB.matrix);m.setColorAt(k,c.setHex(h));};
   put(PM.h,i,px,yb,pz,0,o.sk);const b=PM.b[o.gm];put(b,n[o.gm]++,px,yb,pz,0,o.c1);
   for(let s=0;s<2;s++){const d=s?1:-1;put(PM.a[s],i,px+d*.23*cs,1.4+yb,pz-d*.23*sn,-d*sw,o.sk);put(PM.l[s],i,px+d*.1*cs,.9+yb,pz-d*.1*sn,d*sw,o.lg);}});
  PM.h.count=PM.a[0].count=PM.a[1].count=PM.l[0].count=PM.l[1].count=PD.length;PM.b.forEach((m,i)=>m.count=n[i]);
  [PM.h,...PM.a,...PM.l,...PM.b].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;});};
 return{human,rnd,veh,drawPeds,ds:dsT,mat:HMt,hg,merge};
})();
const rick=new T.Group(),body=new T.Group(),fork=new T.Group(),wheels=[];
rick.add(body);body.add(fork);fork.position.set(0,0,1.15);scene.add(rick);
function wheel(parent,x,z,r){
  const g=new T.Group();
  g.add(new T.Mesh(new T.CylinderGeometry(r,r,.1,16).rotateZ(Math.PI/2),L(0x1a1a1a)),
        new T.Mesh(new T.CylinderGeometry(r*.7,r*.7,.12,12).rotateZ(Math.PI/2),L(0xffd23f)),
        new T.Mesh(new T.BoxGeometry(.14,r*1.7,.05),L(0xffffff)));
  for(let i=1;i<4;i++){const sp=new T.Mesh(new T.BoxGeometry(.02,r*1.7,.02),L(0xdddddd));sp.rotation.x=i*Math.PI/4;g.add(sp);}   // স্পোক
  g.position.set(x,r,z);g.userData.r=r;parent.add(g);wheels.push(g);
}
wheel(fork,0,0,.4);wheel(body,-.7,-.7,.42);wheel(body,.7,-.7,.42);
const part=(w,h,d,c,x,y,z,p=body)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),L(c));o.position.set(x,y,z);p.add(o);return o;};
part(1.5,.12,2.2,0x1f8a4c,0,.55,-.2);
part(1.1,.22,.8,0xc62828,0,.78,-.6);
part(1.1,.5,.12,0xc62828,0,1.05,-.98);
part(.06,.8,.06,0xcccccc,0,.8,0,fork);part(.9,.05,.05,0xcccccc,0,1.2,0,fork);
part(.3,.08,.3,0x222222,0,.9,.5);
const SK=0xc08a5a,limb=(a,b,w,c,p=body)=>{const d=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),m=new T.Mesh(new T.BoxGeometry(w,w,d.length()),L(c));m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),d.normalize());p.add(m);return m;};
   // শার্ট · লুঙ্গি
const drv=MB.human({g:1,sk:0xb98458,c1:0x8fa1ad,c2:0x3f6f9b,leg:0xb98458,hair:0x1a1816});drv.position.set(0,.05,.5);body.add(drv);drv.userData.arms.forEach((a,i)=>a.rotation.set(-1.06,0,i?.3:-.3));   // চালক: হাত হ্যান্ডেলে
   // হাত
const legs=drv.userData.legs;   // প্যাডেল-পা
part(.05,.45,.05,0x888888,-.8,.88,-.05);part(.05,.45,.05,0x888888,.8,.88,-.05);
const arc=(r,len,c)=>new T.Mesh(new T.CylinderGeometry(r,r,len,16,1,true,Math.PI/2,Math.PI).rotateX(Math.PI/2),new T.MeshStandardMaterial({color:lin(c),side:T.DoubleSide,roughness:.9}));
const hg=new T.Group();hg.position.set(0,1.1,-1.25);body.add(hg);
const hood=arc(.85,1.3,0xe53935);hood.position.z=.65;hg.add(hood);
[[-.45,0xffd23f],[0,0x43a047],[.45,0xffd23f]].forEach(([z,c])=>{const b=arc(.87,.14,c);b.position.z=.65+z;hg.add(b);});
const cv=document.createElement('canvas');cv.width=128;cv.height=64;
{const g=cv.getContext('2d');g.fillStyle='#ffd23f';g.fillRect(0,0,128,64);
 g.strokeStyle='#e53935';g.lineWidth=4;g.strokeRect(2,2,124,60);
 ['#e53935','#1e88e5','#43a047','#8e24aa','#fb8c00'].forEach((col,j)=>{g.fillStyle=col;for(let i=0;i<4;i++){g.beginPath();g.arc(16+i*32,32,15-j*3,0,7);g.fill();}});}
const art=new T.Mesh(new T.PlaneGeometry(1.3,.7),new T.MeshStandardMaterial({map:new T.CanvasTexture(cv)}));
art.position.set(0,1,-1.07);art.rotation.y=Math.PI;body.add(art);
rick.traverse(o=>{if(o.isMesh)o.castShadow=!!HQ;});gr.receiveShadow=!!HQ;
const blob=new T.Mesh(new T.CircleGeometry(1.3,16).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.25}));
blob.position.set(0,.04,-.2);rick.add(blob);

/* ---------- ড্রাইভিং ---------- */
const S={x:0,z:2,h:Math.PI,v:0,st:0},inp={g:0,b:0,l:0,r:0},R=.9;
export { MB, R, S, art, blob, body, cv, fork, hg, hood, inp, legs, part, rick, wheels };
