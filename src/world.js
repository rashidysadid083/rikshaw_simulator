// দুনিয়া: ম্যাপ, চাঙ্ক, এলাকা, স্ট্রিমিং
import { HQ, T, cam, clamp, lin, mute, scene } from './core.js';

/* ---------- দুনিয়া: অসীম লুপিং চাঙ্ক সিস্টেম (৫×৫ ব্লক, সিড থেকে টেমপ্লেট) ---------- */
const L=c=>new T.MeshStandardMaterial({color:lin(mute(new T.Color(c))),roughness:.92,metalness:0});
/*GEN-START (THREE/DOM ছাড়া খাঁটি লজিক — আলাদা টেস্ট করা যায়)*/
const BS=80,HB=40,FO=500,RC=0x56585c,GL=0x77716a,BZ=0x6e6a64,FP=0xb5b0a5,GR=0x7fa356,WS=[7,9,11.5];
const pal=[0xe8c07d,0xd96c6c,0x7fb7a4,0xe9e2c9,0x6fa8dc,0xc9a0dc,0xf2a65a,0x9ccc65],shopCols=[0xe53935,0x1e88e5,0xfdd835,0x43a047,0x8e24aa];
const hash=(a,b,c)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263)^Math.imul((c|0)+1,1274126177);h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0;};
const mkRng=s=>()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
const md=(a,n)=>((a%n)+n)%n,CYC7=[0,1,2,3,0,1,2];   // ৭-চক্র: প্রতিটা এলাকা পরের দুটোর থেকে আলাদা
const SH=(c,f)=>{const g=q=>Math.min(255,Math.round(((c>>q)&255)*f));return g(16)<<16|g(8)<<8|g(0);};
/* ৪ ধরনের এলাকা — সব সেটিং এখানে (bk = ১১-চক্রের ব্লক-নকশা) */
const TH=[
{n:'ছোট গ্রাম',hs:[3,4.5,5],hm:[[4,5],[5,6.5]],D:10,ws:[8,10],sk:.08,jit:.8,shop:.3,tr:5,hut:1,gl:0x9b8460,fp:0xa5a07a,sg:0x6d4c2f,
 pal:[0xd9b98a,0xc9a27a,0xe8d9b0,0x9c8a6a,0xb5654a],bk:['field','resi','pond','resi','field','mosque','resi','field','pond','resi','bazaar'],
 nm:[['বকুল','আম','কাশ','ধান','নয়ন','শ্যামল','চর','সোনা'],['পুর','গাঁও','ডাঙ্গা','খালী','তলা']]},
{n:'ঘন শহর',hs:[12,16,22],hm:[[9,12,16],[16,22,28]],D:12,ws:[7,9,11.5],sk:.02,jit:0,shop:.9,tr:1,gl:0x77716a,fp:0xb5b0a5,sg:0x1e4f8a,
 pal:[0xe8c07d,0xd96c6c,0x7fb7a4,0xe9e2c9,0x6fa8dc,0xc9a0dc,0xf2a65a,0x9ccc65],bk:['bazaar','resi','resi','bazaar','mosque','resi','bazaar','resi','pond','bazaar','resi'],
 nm:[['নবাব','মতি','শান্তি','নতুন','পুরান','রহমত','আলো','দিলখুশা'],[' বাজার',' মোড়',' গঞ্জ',' চত্বর',' টাওয়ার']]},
{n:'রাজকীয় পাড়া',hs:[8,11],hm:[[8,10],[11,14]],D:13,ws:[12,14],sk:.1,jit:0,shop:.15,tr:4,ev:1,pk:1,gl:0x8a8a95,fp:0xcfc9bd,sg:0x7b1e3a,
 pal:[0xf3efe2,0xe8dcc0,0xd9c9a0,0xc8d6e0,0xf0d9d9],bk:['palace','field','pond','palace','resi','mosque','palace','pond','field','resi','palace'],
 nm:[['গোলাপ','বাদশাহী','রাজ','মুক্তা','শাহী','বেগম','চাঁদনী','নীলকুঠি'],[' মহল',' বাগ',' নগর',' প্রাসাদ পাড়া']]},
{n:'অগোছালো বসতি',hs:[3,3.5,4],hm:[[3,4],[4,5]],D:8,ws:[5,6.5,8],sk:.15,jit:2.2,shop:.6,tr:2,gl:0x6a5f50,fp:0x8a7a66,sg:0x4e5a3a,
 pal:[0x8a8f94,0xa65f3a,0x7a6a5a,0x5f7f8a,0xb08d57,0xc0c4c8],bk:['resi','resi','bazaar','resi','resi','pond','resi','bazaar','resi','resi','field'],
 nm:[['খাল','বালু','টিন','কাঁঠাল','চর','ঝিল','মাটি','রেল'],['পাড়া বস্তি',' বস্তি',' কলোনি',' ঘাট']]}];
const HM=Object.assign({},TH[0],{sk:0,jit:0,tr:0,hut:0,shop:0});
/* এলাকা = x-অক্ষে ও z-অক্ষে ৮–১৫ চাঙ্কের (৬৪০–১২০০ মি) সিড-ঠিক-করা ফালি; সীমানা সবসময় চাঙ্কের কিনারায় */
const bcache=[new Map(),new Map()],blen=(a,i)=>8+hash(i,a,31)%8;
function bstart(a,i){const m=bcache[a];if(m.has(i))return m.get(i);
  const v=i===0?-4:i>0?bstart(a,i-1)+blen(a,i-1):bstart(a,i+1)-blen(a,i);m.set(i,v);return v;}
function band(a,c){let i=Math.floor(c/11.5);while(c<bstart(a,i))i--;while(c>=bstart(a,i+1))i++;return i;}
function area(cx,cz){
  const bx=band(0,cx),bz=band(1,cz),t=CYC7[md(bx+2*bz,7)],h=hash(bx,bz,41),nm=TH[t].nm;
  return{bx,bz,t,name:nm[0][h%nm[0].length]+nm[1][(h>>>8)%nm[1].length],x0:bstart(0,bx),z0:bstart(1,bz)};
}
/* সীমানার সংযোগ-অংশ (৩০–৫০ মি): ০=তোরণ (নতুন এলাকার নাম), ১=ফাঁকা মাঠ, ২=সেতু। ax: ০=x-সীমানা, ১=z-সীমানা */
function conn(o,ax,LC,kind,nm,th){
  const lo=-36,hi=-36+LC,c0=(lo+hi)/2,ins=c=>c>lo&&c<hi,ok=new Set([RC,th.gl,BZ,0xffffff]);
  o.box=o.box.filter(b=>!ins(b[1+2*ax])||(b[0]===0&&b[5]<=.12&&ok.has(b[7])));
  o.wall=o.wall.filter(w=>!ins((w[2*ax]+w[2*ax+1])/2));o.inst=o.inst.filter(i=>!ins(i[1+ax]));
  const add=(y,h,la,cr,a,b,c)=>{const[x,z]=ax?[b,a]:[a,b],[sx,sz]=ax?[cr,la]:[la,cr];o.box.push([0,x,y,z,sx,h,sz,c,0]);},
  wl=(a,b,la,cr)=>o.wall.push(ax?[b-cr/2,b+cr/2,a-la/2,a+la/2]:[a-la/2,a+la/2,b-cr/2,b+cr/2]),
  rs=o.road.filter(r=>ax?r[3]>=60&&r[2]<r[3]:r[2]>=60&&r[3]<r[2]);
  if(kind===2){
    add(.03,.06,LC,88,c0,0,0x4a90b8);
    rs.forEach(r=>{const rc=ax?r[0]:r[1],rw=ax?r[2]:r[3];for(const q of[-1,1]){add(.55,1,LC,.25,c0,rc+q*rw/2,0xd7d2c0);wl(c0,rc+q*rw/2,LC,.4);}});
  }else{
    add(.045,.09,LC,88,c0,0,0x86b35c);
    if(kind===0)rs.forEach(r=>{const rc=ax?r[0]:r[1],rw=ax?r[2]:r[3];
      for(const q of[-1,1]){add(3.6,7.2,1.2,1.2,c0,rc+q*(rw/2+1.4),th.sg);wl(c0,rc+q*(rw/2+1.4),1.2,1.2);}
      add(7.8,1.4,1.2,rw+5.6,c0,rc,th.sg);o.sign.push([ax?rc:c0,ax?c0:rc,ax,nm,th.sg]);});
  }
}
const mainRow=cz=>((cz%4)+4)%4===3;
// অবস্থান (cx,cz) → টেমপ্লেট। একই জায়গায় সবসময় একই ফল।
function tileType(cx,cz){
  if(!cx&&!cz)return'home';
  if(mainRow(cz))return'main';
  return TH[area(cx,cz).t].bk[md(cx*3+cz*7,11)];   // ১১-চক্র
}
function gen(cx,cz){
  const ty=tileType(cx,cz),A=area(cx,cz),th=ty==='home'?HM:TH[A.t],GL=th.gl,FP=th.fp,bl=mkRng(hash(cx,cz,5)),hf=[.9,1,1.12][(bl()*3)|0],tn=.88+bl()*.24,rnd=mkRng(hash(cx,cz,1)),ri=(a,b)=>a+rnd()*(b-a),pick=a=>a[(rnd()*a.length)|0],
  H=a=>Math.max(3,Math.round(pick(a)*hf)),mw=Math.min(...th.ws),o={ty,box:[],wall:[],inst:[],road:[],slab:[],sign:[]};
  const B=(x,y,z,w,h,d,c,win)=>o.box.push([0,x,y+h/2,z,w,h,d,c,win|0]),
  W=(x,z,w,d)=>o.wall.push([x-w/2,x+w/2,z-d/2,z+d/2]),
  sb=(x,z,w,d,h,c,win)=>{B(x,0,z,w,h,d,c,win);W(x,z,w,d);},
  road=(x,z,w,d,c)=>{B(x,0,z,w,.1,d,c,2);o.road.push([x,z,w,d,c]);},
  slab=(x0,x1,z0,z1,c)=>{B((x0+x1)/2,0,(z0+z1)/2,x1-x0,.1,z1-z0,c,c===GR?0:3);o.slab.push([(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0]);},
  sc=()=>pick(shopCols),
  lamp=(x,z)=>{B(x,0,z,.16,5.2,.16,0x555555);B(x,5,z,.9,.2,.5,0xfff0b0);W(x,z,.4,.4);},
  tree=(x,z)=>{B(x,0,z,.4,2.4,.4,0x6b4a2f);o.box.push([1,x,3.4,z,1.5,1.4,1.5,0x3f8f3a,0]);W(x,z,.6,.6);},
  dome=(x,y,z,r,sy)=>o.box.push([2,x,y,z,r,sy,r,0x2e8b57,0]);
  // বিল্ডিং: একই মাপ = একই InstancedMesh (key = প্রস্থ|গভীরতা|উচ্চতা); k=1 ছাদের ডিটেইল, k=2 দোকানসহ
  function bld(x,z,sx,sz,h,fx,fz,k,col){
    if(rnd()<th.sk)return;
    {const j=th.jit,t=ri(-j,j),d=ri(0,j);if(fz)x+=t;else z+=t;x-=fx*d;z-=fz*d;}
    k=k>1?(rnd()<th.shop?2:1):(rnd()<th.shop*.4?2:1);
    const w=fz?sx:sz,D=fz?sz:sx;
    o.inst.push([w+'|'+D+'|'+h,x,z,fz?(fz>0?0:Math.PI):(fx>0?Math.PI/2:-Math.PI/2),SH(col||pick(th.pal),tn)]);
    if(k){
      W(x,z,sx,sz);
      if(rnd()<.5)B(x+ri(-sx/4,sx/4),h+.3,z+ri(-sz/4,sz/4),1.6,1.4,1.6,0x78909c);
      if(rnd()<.4)B(x-sx/3,h+.3,z,1.8,2.2,2,0xb9a58a);
    }
    if(k>1){
      const X=fz?0:fx,Z=fz||0,px=x+X*(sx/2+.1),pz=z+Z*(sz/2+.1);
      B(px,2.6,pz,fz?sx*.8:.2,.9,fz?.2:sz*.8,sc());
      B(px+X*.6,2.3,pz+Z*.6,fz?sx*.85:1.4,.1,fz?1.4:sz*.85,sc());
      B(px,0,pz,fz?sx*.7:.14,2.2,fz?.14:sz*.7,0x6d6d6d);
    }
  }
  const run=(a,b,f)=>{for(let t=a;b-t>=mw;){let w=pick(th.ws);if(w>b-t)w=mw;f(t+w/2,w);t+=w+.3;}};
  function ring(x0,x1,z0,z1,s,D,hs,k,gap){
    const h=()=>H(hs),zs=z0+(s.includes('S')?D+.3:0),ze=z1-(s.includes('N')?D+.3:0);
    if(s.includes('S')){const f=(c,w)=>bld(c,z0+D/2,w,D,h(),0,-1,k);if(gap){run(x0,gap[0],f);run(gap[1],x1,f);}else run(x0,x1,f);}
    if(s.includes('N'))run(x0,x1,(c,w)=>bld(c,z1-D/2,w,D,h(),0,1,k));
    if(s.includes('W'))run(zs,ze,(c,w)=>bld(x0+D/2,c,D,w,h(),-1,0,k));
    if(s.includes('E'))run(zs,ze,(c,w)=>bld(x1-D/2,c,D,w,h(),1,0,k));
  }
  const stall=(x,z)=>{sb(x,z,1.8,2.2,1,pick(pal));B(x,1,z,1.2,.5,1.4,pick([0xe53935,0xfdd835,0xff9800,0x7cb342]));
    B(x,2.3,z,2.4,.12,2.8,sc());B(x-1,0,z+1.1,.1,2.3,.1,0x666666);B(x+1,0,z+1.1,.1,2.3,.1,0x666666);};
  // ---- সব টাইলে একই: দক্ষিণ ও পশ্চিম সীমানার রাস্তা (পরের টাইলের সাথে হুবহু জোড়া লাগে) ----
  road(-HB,-HB,8,8,RC);road(0,-HB,72,8,RC);road(-HB,0,8,72,RC);
  for(let t=-30;t<=30;t+=10){B(t,.1,-HB,3.5,.02,.25,0xffffff);B(-HB,.1,t,.25,.02,3.5,0xffffff);}
  for(const[ax,az]of[[1,0],[-1,0],[0,1],[0,-1]])for(let q=-3.1;q<4;q+=1.5)
    ax?B(-HB+ax*5.4,.1,-HB+q,2.4,.02,.7,0xffffff):B(-HB+q,.1,-HB+az*5.4,.7,.02,2.4,0xffffff);
  for(const s of[-1,1])for(const t of[-20,20]){lamp(t,-HB+s*4.8);lamp(-HB+s*4.8,t);}
  for(const s of[-1,1])for(const t of[-12,12]){tree(t,-HB+s*4.8);tree(-HB+s*4.8,t);}
  for(let i=0;i<th.tr;i++){const t=th.ev?-33+(i+.5)*66/th.tr:ri(-33,33);tree(t,-35.2);tree(-35.2,t);}   // গাছের ঘনত্ব
  // ---- টেমপ্লেট ----
  if(ty==='home'){            // বাড়ির উঠান + গলি = মূল ল্যান্ডমার্ক
    slab(-36,-3.5,-36,36,FP);slab(3.5,36,-36,36,FP);slab(-3.5,3.5,-10,36,FP);road(0,-23,7,26,GL);
    B(0,0,0,20,.11,20,0xcdb48c);bld(-7,-2,6,10,5,1,0,1,0x2a9d8f);
    [[0,10.25,20.5,.5],[10.25,0,.5,20],[-10.25,0,.5,20],[-6.5,-10.25,7,.5],[6.5,-10.25,7,.5]].forEach(([x,z,w,d])=>sb(x,z,w,d,1.2,0xb9a58a));
    tree(7.5,7.5);tree(-7,8);tree(8.5,-8);tree(-16,16);tree(16,-16);
    B(0,0,9,.25,15,.25,0x8d6e63);B(1.5,13.4,9,3,1.6,.1,0xe53935);W(0,9,.4,.4);   // দূর থেকে চেনার পতাকা
    for(const sd of[-1,1])run(-35,-11,(c,w)=>bld(sd*6.5,c,6,w,pick([6,9,12]),-sd,0,1));
    ring(-34.2,34.2,-34.2,34.2,'SNWE',12,[6,9],1,[-10.5,10.5]);
  }else if(ty==='resi'){      // আবাসিক গলি (পূর্ব-পশ্চিম)
    road(0,0,72,5,GL);slab(-36,36,2.5,36,FP);slab(-36,36,-36,-2.5,FP);
    ring(-34.2,34.2,4.3,34.2,'SNWE',th.D,th.hs,1);ring(-34.2,34.2,-34.2,-4.3,'SNWE',th.D,th.hs,1);
  }else if(ty==='bazaar'){    // বাজার (উত্তর-দক্ষিণ লেন, স্টল, পতাকা)
    road(0,0,9,72,BZ);slab(-36,-4.5,-36,36,FP);slab(4.5,36,-36,36,FP);
    ring(-34.2,-6.3,-34.2,34.2,'SNWE',th.D,th.hm[1],2);ring(6.3,34.2,-34.2,34.2,'SNWE',th.D,th.hm[1],2);
    for(let z=30;z>-30;z-=ri(7,10))for(const s of[-1,1])if(rnd()<.85)stall(s*3.3,z);
    for(let z=26;z>-30;z-=12)B(0,5.6,z,9,.06,.5,sc());
  }else if(ty==='main'){      // মেইন রোড: চওড়া রাস্তা + দুই পাশে দোকান
    road(0,0,72,14,RC);for(let t=-30;t<=30;t+=10)B(t,.1,0,3.5,.02,.25,0xffffff);
    slab(-36,36,7,36,FP);slab(-36,36,-36,-7,FP);
    for(const s of[-1,1]){
      run(-34.2,34.2,(c,w)=>bld(c,s*(8.8+th.D/2),w,th.D,H(th.hm[0]),0,-s,2));
      run(-34.2,34.2,(c,w)=>bld(c,s*(9.1+th.D*1.5),w,th.D,H(th.hm[1]),0,s,1));
      for(const t of[-24,24])lamp(t,s*7.8);
    }
  }else if(ty==='mosque'){    // মসজিদ ও খোলা মাঠ
    slab(-36,36,-36,36,GR);sb(0,10,18,12,6.5,0xf3efe2,1);B(0,6.5,10,18.6,.3,12.6,0xd7d2c0);dome(0,6.8,10,5,5);
    for(const d of[-8,8]){B(d,0,4,1.4,13,1.4,0xf3efe2);dome(d,13,4,1.2,1.6);W(d,4,1.4,1.4);}
    for(let x=-30;x<30;x+=12){tree(x,32);tree(x+6,-32);}
  }else if(ty==='field'){      // খোলা মাঠ / উদ্যান
    slab(-36,36,-36,36,GR);for(let i=0;i<th.tr+5;i++)tree(ri(-31,31),ri(-31,31));
    if(th.hut)for(let i=0;i<3;i++)bld(ri(-24,24),ri(-24,24),6,6,3,0,1,1,0xc9a27a);
    if(th.pk){B(0,0,0,12,.14,12,0x9ec5e0);for(let a=-24;a<=24;a+=16)for(let b=-24;b<=24;b+=16)if(a||b)tree(a,b);}
  }else if(ty==='palace'){    // রাজকীয় প্রাসাদ-চত্বর
    slab(-36,36,-36,36,GR);const ph=H(th.hs);sb(0,8,26,16,ph,0xf3efe2,1);dome(0,ph+.3,8,6,4);
    for(const q of[-1,1])sb(q*30,0,1,56,1.6,0xe8dcc0);sb(-19,-28,26,1,1.6,0xe8dcc0);sb(19,-28,26,1,1.6,0xe8dcc0);
    for(let t=-24;t<=24;t+=12)tree(t,-18);
  }else{                      // পুকুর
    slab(-36,36,-36,36,GR);B(0,0,0,44,.12,30,0x8d7b5a);B(0,.1,0,40,.06,26,0x4a90b8);W(0,0,44,30);
    for(let i=0;i<8;i++){const a=i*.785+ri(0,.4);tree(Math.cos(a)*30,Math.sin(a)*24);}
  }
  if(cx===A.x0){const h=hash(A.bx,A.bz,61);conn(o,0,30+(h>>>4)%21,h%3,A.name,th);}
  if(cz===A.z0){const h=hash(A.bx,A.bz,62);conn(o,1,30+(h>>>4)%21,h%3,A.name,th);}
  return o;
}
/* ---------- NPC-র সাজসজ্জা: বারান্দা, জানালা, দড়িতে কাপড়, চা-দোকান, বাস স্টপ + অ্যাঙ্কর (আলাদা rng, মূল নকশা বদলায় না) ---------- */
function npcDeco(o,cx,cz){
  const ty=o.ty,r=mkRng(hash(cx,cz,113)),an=o.an={bal:[],win:[],ver:[],door:[],stall:[],tea:[],bus:null,perch:[[-20,5.2,-35.2],[20,5.2,-35.2],[-35.2,5.2,20],[-35.2,5.2,-20]]},
  bx=(x,y,z,w,h,d,c)=>o.box.push([0,x,y+h/2,z,w,h,d,c,0]),PC=[0xe53935,0x1e88e5,0xfdd835,0x43a047,0xec407a,0xff9800,0xf5f5f5,0x8e24aa],pc=()=>PC[(r()*8)|0];
  for(const[k,x,z,rt]of o.inst){
    const[w,D,h]=k.split('|').map(Number),nx=Math.sin(rt),nz=Math.cos(rt),px=x+nx*D/2,pz=z+nz*D/2;
    if(an.perch.length<9&&r()<.25)an.perch.push([x,h+.3,z]);
    let ok=0;
    if(ty==='resi')ok=Math.abs(nz)>.9&&nz*pz<0&&Math.abs(pz)<9;
    else if(ty==='main')ok=Math.abs(nz)>.9&&nz*pz<0&&Math.abs(pz)<12;
    else if(ty==='bazaar')ok=Math.abs(nx)>.9&&nx*px<0&&Math.abs(px)<10;
    if(!ok)continue;
    const zx=Math.abs(nz)>.5,tx=zx?1:0,tz=zx?0:1,ob=(u,y,v,len,hh,dep,c)=>zx?bx(u,y,v,len,hh,dep,c):bx(u,y,v,dep,hh,len,c),q=r();
    if(h>=6.5){
      if(q<.4){   // বারান্দা: স্ল্যাব + রেলিং + ঝুলন্ত কাপড়
        const bw=Math.min(w*.6,4);
        ob(px+nx*.5,4.4,pz+nz*.5,bw,.12,1,0xb9b3a6);ob(px+nx*.98,4.52,pz+nz*.98,bw,.9,.06,pc());
        if(r()<.6)for(let i=0;i<3;i++){const t=(i-1)*bw*.3;ob(px+nx*1.03+tx*t,4.6,pz+nz*1.03+tz*t,.5,.7,.03,pc());}
        an.bal.push({x:px+nx*.5,z:pz+nz*.5,y:4.52,nx,nz,tx,tz,w:bw});
      }else if(q<.75&&h>=7){   // জানালা: খোলা ফ্রেম + সিল; মানুষ কোমর থেকে ওপরে
        ob(px+nx*.02,4.6,pz+nz*.02,1,1.3,.04,0x1d2227);ob(px+nx*.2,4.7,pz+nz*.2,1.2,.1,.4,0x8d8d8d);
        an.win.push({x:px+nx*.22,z:pz+nz*.22,y:3.85,nx,nz,tx,tz,w:0});
      }
    }else{
      if(q<.3){   // টিনের বারান্দা + বেঞ্চ
        const bw=Math.min(w*.7,4.5);
        ob(px+nx*.65,2.45,pz+nz*.65,bw+.4,.08,1.3,0x6b6b6b);
        for(const t of[-1,1])ob(px+nx*1.2+tx*t*bw/2,0,pz+nz*1.2+tz*t*bw/2,.08,2.45,.08,0x6d4c2f);
        ob(px+nx*.35,0,pz+nz*.35,bw*.6,.45,.4,0x8d6e63);
        an.ver.push({x:px+nx*.4,z:pz+nz*.4,y:0,nx,nz,tx,tz,w:bw});
      }else if(q<.6){   // দড়িতে কাপড়
        const bw=w*.9;
        for(const t of[-1,1])ob(px+nx*.9+tx*t*bw/2,0,pz+nz*.9+tz*t*bw/2,.07,2.9,.07,0x6d4c2f);
        ob(px+nx*.9,2.85,pz+nz*.9,bw,.03,.03,0xdddddd);
        for(let i=0;i<4;i++){const t=(i-1.5)*bw*.22;ob(px+nx*.9+tx*t,2.1,pz+nz*.9+tz*t,.55,.75,.03,pc());}
      }
      if(r()<.5){const t=(r()-.5)*w*.5;ob(px+nx*.5+tx*t,0,pz+nz*.5+tz*t,.45,.45,.45,0x8d6e63);an.door.push({x:px+nx*.5+tx*t,z:pz+nz*.5+tz*t,y:0,nx,nz,tx,tz,w:0});}
    }
  }
  if(ty==='bazaar'){
    for(const[a,b,c,d]of o.wall)if(Math.abs(b-a-1.8)<.01&&Math.abs(d-c-2.2)<.01)an.stall.push({x:(a+b)/2,z:(c+d)/2});
    const s=r()<.5?1:-1;let zz=null;
    for(let i=0;i<8&&zz===null;i++){const t=-26+r()*52;if(an.stall.every(q=>q.x*s<0||Math.abs(q.z-t)>4.8))zz=t;}
    if(zz!==null){   // চা-দোকান: খোলা সামনে, কাউন্টার, তিনটা মোড়া
      bx(s*6.1,0,zz,.15,2.4,2.2,0xa98a5a);bx(s*5.1,0,zz-1.05,2.2,2.4,.12,0xa98a5a);bx(s*5.1,0,zz+1.05,2.2,2.4,.12,0xa98a5a);bx(s*5,2.4,zz,3,.12,2.7,0x607d8b);
      bx(s*3.9,0,zz,.5,.9,1.9,0x6d4c2f);bx(s*3.9,.9,zz,.3,.3,.3,0xb0b0b0);bx(s*3.9,.9,zz+.6,.2,.3,.2,0xe53935);
      for(const dz of[-1.2,0,1.2])bx(s*2.9,0,zz+dz,.4,.45,.4,0x8d6e63);
      o.wall.push([s>0?3.65:-6.2,s>0?6.2:-3.65,zz-1.1,zz+1.1]);an.tea.push({s,z:zz});
    }
  }
  if(ty==='main'&&r()<.55){   // বাস স্টপ: ছাউনি, বেঞ্চ, সাইন
    const s=r()<.5?-1:1,u=Math.round(-15+r()*30),zz=s*7.9;
    bx(u,2.5,zz,4,.1,1.5,0x1e88e5);bx(u,.3,s*8.55,4,2.2,.08,0x90a4ae);
    for(const t of[-1.9,1.9])bx(u+t,0,s*7.3,.08,2.5,.08,0x555555);
    bx(u,0,s*8.2,2.6,.45,.45,0x8d6e63);bx(u+2.6,0,s*7.3,.08,3.2,.08,0x555555);bx(u+2.6,3.1,s*7.3,.7,.5,.08,0x1565c0);bx(u+2.6,3.3,s*7.3,.5,.08,.09,0xffffff);
    an.bus={x:u,z:zz,s};
  }
}
// জানালা (r=2): কোন কোন চাঙ্ক লোড/বাদ হবে
function plan(have,pcx,pcz,r=2){
  const need=new Set(),add=[];
  for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const cx=pcx+dx,cz=pcz+dz,k=cx+','+cz;need.add(k);if(!have.has(k))add.push([cx,cz,dx*dx+dz*dz]);}
  add.sort((a,b)=>a[2]-b[2]);
  return{drop:[...have].filter(k=>!need.has(k)),add};
}
const needShift=(x,z,ox,oz)=>Math.abs(x-ox)>FO||Math.abs(z-oz)>FO;   // floating origin
function place(x,z){
  const cx=Math.round(x/BS),cz=Math.round(z/BS),lx=x-cx*BS,lz=z-cz*BS,ty=tileType(cx,cz);
  if(ty==='home'&&Math.abs(lx)<11&&Math.abs(lz)<11)return'🏠 উঠান';
  if(ty==='home'&&Math.abs(lx)<3.6&&lz<-10&&lz>-36)return'গলি';
  if(Math.abs(lx)>36&&Math.abs(lz)>36)return'🔀 মোড়';
  if(Math.abs(lx)>36||Math.abs(lz)>36)return'🛣️ রাস্তা';
  if(ty==='main'&&Math.abs(lz)<7)return'🛣️ মেইন রোড';
  if(ty==='bazaar')return Math.abs(lx)<6?'🛍️ বাজার':'🛍️ বাজারের দোকান';
  if(ty==='resi')return Math.abs(lz)<4?'গলি':'পাড়া';
  if(ty==='mosque')return'🕌 মসজিদের মাঠ';
  if(ty==='pond')return'🏞️ পুকুরপাড়';
  return'পাড়া';
}
const where=(x,z)=>area(Math.round(x/BS),Math.round(z/BS)).name+' · '+place(x,z);
/*GEN-END*/

/* ---------- THREE স্তর: জানালা-টেক্সচার, মার্জ করা জিওমেট্রি, InstancedMesh, স্ট্রিমিং ---------- */
const rn=mkRng(77),mk2=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;};
const speck=(g,w,h,n,a)=>{for(let i=0;i<n;i++){const v=rn()<.5?0:255;g.fillStyle='rgba('+v+','+v+','+v+','+a*rn()+')';g.fillRect(rn()*w,rn()*h,1+rn()*2,1+rn()*2);}};
const wt=mk2(128,128,(g,w,h)=>{   // দেয়াল: পলেস্তারা + ময়লা + ইট + জানালার গ্রিল
 g.fillStyle='#e6e2da';g.fillRect(0,0,w,h);speck(g,w,h,900,.18);
 const brick=(x,y,bw,bh)=>{g.fillStyle='rgba(168,92,70,.85)';g.fillRect(x,y,bw,bh);g.strokeStyle='rgba(60,40,30,.5)';g.lineWidth=1;for(let r=0;r<bh/6;r++){g.beginPath();g.moveTo(x,y+r*6);g.lineTo(x+bw,y+r*6);g.stroke();for(let c=(r%2)*8;c<bw;c+=16){g.beginPath();g.moveTo(x+c,y+r*6);g.lineTo(x+c,y+r*6+6);g.stroke();}}};
 brick(12,100,116,28);brick(60+rn()*40,8+rn()*14,20,14);
 for(let i=0;i<7;i++){const x=rn()*w,l=20+rn()*60,q=g.createLinearGradient(0,0,0,l);q.addColorStop(0,'rgba(60,50,40,.3)');q.addColorStop(1,'rgba(60,50,40,0)');g.fillStyle=q;g.fillRect(x,0,3+rn()*5,l);}
 const gm=g.createLinearGradient(0,h,0,h-45);gm.addColorStop(0,'rgba(40,35,25,.38)');gm.addColorStop(1,'rgba(40,35,25,0)');g.fillStyle=gm;g.fillRect(0,h-45,w,45);
 g.fillStyle='#4b5a66';g.fillRect(36,32,56,60);g.fillStyle='#8fa0ab';g.fillRect(40,36,20,24);
 g.fillStyle='#2b2b2b';for(let x=40;x<92;x+=8)g.fillRect(x,32,2,60);for(let y=44;y<92;y+=16)g.fillRect(36,y,56,2);
 g.strokeStyle='#cfc9bb';g.lineWidth=3;g.strokeRect(35,31,58,62);g.fillStyle='#b9b2a3';g.fillRect(32,93,64,4);
 g.fillStyle='#e6e2da';g.fillRect(0,h-10,10,10);});
const at=mk2(256,256,(g,w,h)=>{   // পিচ: দানা, তেলের দাগ, ফাটল, তালি
 g.fillStyle='#b9b9b9';g.fillRect(0,0,w,h);speck(g,w,h,5000,.22);
 for(let i=0;i<5;i++){g.fillStyle='rgba(20,20,20,'+(.06+rn()*.08)+')';g.beginPath();g.ellipse(rn()*w,rn()*h,10+rn()*30,6+rn()*14,rn()*3,0,7);g.fill();}
 g.fillStyle='rgba(30,30,30,.16)';for(let i=0;i<3;i++)g.fillRect(rn()*w,rn()*h,30+rn()*40,20+rn()*30);
 g.strokeStyle='rgba(15,15,15,.55)';g.lineWidth=1;for(let i=0;i<5;i++){let x=rn()*w,y=rn()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<8;k++){x+=(rn()-.5)*26;y+=(rn()-.3)*22;g.lineTo(x,y);}g.stroke();}});
const ft=mk2(128,128,(g,w,h)=>{g.fillStyle='#c8c4bb';g.fillRect(0,0,w,h);speck(g,w,h,1800,.2);g.strokeStyle='rgba(60,55,50,.4)';g.lineWidth=2;g.strokeRect(0,0,w/2,h/2);g.strokeRect(w/2,h/2,w/2,h/2);g.strokeRect(w/2,0,w/2,h/2);g.strokeRect(0,h/2,w/2,h/2);});
const WORDS=['রহমান স্টোর','মায়ের দোয়া হোটেল','ফার্মেসি','মোবাইল ঘর','তাজা ফল ও সবজি','কাপড়ের দোকান','চা-নাস্তা','স্টুডিও ও ফটোকপি'];
const sgT=mk2(512,512,(g,w)=>WORDS.forEach((t,i)=>{const y=(7-i)*64;g.fillStyle=['#1e5a3c','#8a2d2d','#1d4f7a','#c9a227','#5a3a7a','#2c2c2c','#a85a1c','#2f6f6f'][i];g.fillRect(0,y,w,64);g.strokeStyle='#f3e9c8';g.lineWidth=3;g.strokeRect(4,y+4,w-8,56);g.fillStyle='#f8f1d8';g.font='bold 34px "Hind Siliguri","Noto Sans Bengali",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,y+34);}));
const SM_=(m,r)=>new T.MeshStandardMaterial({vertexColors:true,map:m,roughness:r,metalness:0}),WM=SM_(wt,.95),MATS=[SM_(wt,.95),SM_(at,.85),SM_(ft,.9),SM_(sgT,.75)];
const tp=g=>{g=g.toNonIndexed();const a=g.attributes;return[a.position.array,a.normal.array,a.uv.array];};
const TP=[tp(new T.BoxGeometry(1,1,1)),tp(new T.SphereGeometry(1,8,5)),tp(new T.SphereGeometry(1,12,6,0,6.2832,0,1.5708))],CC=new T.Color();
function geo(list){
  const gk=b=>b[8]===2?1:b[8]===3?2:b[8]>=4?3:0;list=[0,1,2,3].flatMap(k=>list.filter(b=>gk(b)===k));const cn=[0,0,0,0];list.forEach(b=>cn[gk(b)]+=TP[b[0]][0].length/3);
  const nv=list.reduce((a,b)=>a+TP[b[0]][0].length/3,0),P=new Float32Array(nv*3),N=new Float32Array(nv*3),C=new Float32Array(nv*3),U=new Float32Array(nv*2);
  let v=0;
  for(const[sh,x,y,z,sx,sy,sz,c,win]of list){
    const[p,n,u]=TP[sh];CC.setHex(c);mute(CC).convertSRGBToLinear();
    for(let i=0;i<p.length;i+=3,v++){
      P.set([p[i]*sx+x,p[i+1]*sy+y,p[i+2]*sz+z],v*3);N.set([n[i],n[i+1],n[i+2]],v*3);C.set([CC.r,CC.g,CC.b],v*3);
      const q=i/3*2;
      if(win===1&&Math.abs(n[i+1])<.5)U.set([u[q]*(Math.abs(n[i])>.5?sz:sx)/3.4,u[q+1]*sy/3.2],v*2);else if(win===2||win===3)U.set(Math.abs(n[i+1])>.5?[(p[i]*sx+x)/8,(p[i+2]*sz+z)/8]:[.03,.03],v*2);else if(win>=4)U.set([u[q],(win-4+u[q+1])/8],v*2);else U.set([.03,.03],v*2);
    }
  }
  const g=new T.BufferGeometry(),f=a=>new T.BufferAttribute(a,3);
  g.setAttribute('position',f(P));g.setAttribute('normal',f(N));g.setAttribute('color',f(C));g.setAttribute('uv',new T.BufferAttribute(U,2));
  {let o=0;cn.forEach((k,i)=>{if(k){g.addGroup(o,k,i);o+=k;}});}
  return g;
}
/* বিল্ডিং ডিটেইল (হাই): টিনের চালা, শাটার, বাংলা সাইনবোর্ড, বারান্দা, ছাদের ট্যাংক, বিদ্যুতের খুঁটি-তার। আলাদা rng, তাই ম্যাপের নকশা বদলায় না; কলিশন নেই */
function detail(o,cx,cz){
  const D=[],r=mkRng(hash(cx,cz,9)),A=(x,z,rt,lx,y,lz,sx,sy,sz,c,w)=>{const s=Math.sin(rt),k=Math.cos(rt),q=Math.abs(s)>.5;D.push([0,x+lx*k+lz*s,y,z-lx*s+lz*k,q?sz:sx,sy,q?sx:sz,c,w|0]);};
  for(const[key,x,z,rt]of o.inst){
    const[w,dp,h]=key.split('|').map(Number),f=dp/2+.05,a=(lx,y,lz,sx,sy,sz,c,q)=>A(x,z,rt,lx,y,lz,sx,sy,sz,c,q);
    if(h<=6&&r()<.5)a(0,h+.42,0,w+.9,.08,dp+.9,[0x8d6e63,0x6f7b82,0xa1887f][(r()*3)|0]);
    if(r()<.35)a(0,1.1,f,w*.55,2.2,.08,0x7d868c);
    if(h>=5&&h<=14&&r()<.45)a(0,3.3,f+.05,w*.7,.55,.1,0xffffff,4+((r()*8)|0));
    if(h>=6&&r()<.5){const y=3.4+((r()*2)|0)*3;if(y<h-1){a(0,y,f+.55,w*.6,.15,1.1,0xb4aea2);a(0,y+.5,f+1.1,w*.6,.9,.06,0x4d4d4d);a(-w*.3,y+.5,f+.55,.06,.9,1.1,0x4d4d4d);a(w*.3,y+.5,f+.55,.06,.9,1.1,0x4d4d4d);}}
    if(h>=6&&r()<.4)a((r()-.5)*w*.4,h+.9,(r()-.5)*dp*.4,1.3,1.2,1.3,0x37474f);
  }
  for(const t of[-28,2,30])D.push([0,t,4,-35.2,.22,8,.22,0x6d5a48,0],[0,t,7.7,-35.2,.2,.2,1.6,0x4a4a4a,0],[0,-35.2,4,t,.22,8,.22,0x6d5a48,0],[0,-35.2,7.7,t,1.6,.2,.2,0x4a4a4a,0]);
  for(const y of[7.5,7.9])D.push([0,0,y,-35.2,80,.04,.04,0x111111,0],[0,-35.2,y,0,.04,.04,80,0x111111,0]);
  return D;
}
const gr=new T.Mesh(new T.PlaneGeometry(1200,1200).rotateX(-Math.PI/2),L(0x8d9a6b));scene.add(gr);
function mkSign(s,m){
  const[x,z,ax,nm,col]=s,cv=document.createElement('canvas');cv.width=512;cv.height=96;const g=cv.getContext('2d');
  g.fillStyle='#'+col.toString(16).padStart(6,'0');g.fillRect(0,0,512,96);g.strokeStyle='#ffd23f';g.lineWidth=6;g.strokeRect(5,5,502,86);
  g.fillStyle='#fff';g.font='bold 44px "Hind Siliguri","Noto Sans Bengali",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(nm,256,50);
  const tex=new T.CanvasTexture(cv),mat=new T.MeshBasicMaterial({map:tex}),
  ms=[0,1].map(i=>{const q=new T.Mesh(new T.PlaneGeometry(9,1.7),mat);q.position.set(x,7.8,z);q.rotation.y=(ax?0:Math.PI/2)+i*Math.PI;q.translateZ(.7);m.add(q);return q;});
  return{tex,mat,ms};
}
const CAP=300,IM=new Map(),dm=new T.Object3D(),W={
  ox:0,oz:0,ch:new Map(),pool:[],dirty:0,busy:0,px:null,pz:null,
  inst(key){
    let m=IM.get(key);
    if(!m){const[w,D,h]=key.split('|').map(Number);
      m=new T.InstancedMesh(geo([[0,0,h/2,0,w,h,D,0xffffff,1],[0,0,h+.15,0,w+.6,.3,D+.6,0x66625c,0]]),WM,CAP);
      m.setColorAt(0,CC.setHex(0xffffff));m.frustumCulled=false;m.count=0;m.castShadow=m.receiveShadow=!!HQ;scene.add(m);IM.set(key,m);}
    return m;
  },
  load(cx,cz){          // নতুন চাঙ্ক (পুরোনো Mesh পুল থেকে নিয়ে রিসাইকল)
    const o=gen(cx,cz);npcDeco(o,cx,cz);const g=geo(HQ?o.box.concat(detail(o,cx,cz)):o.box);let m=this.pool.pop();
    if(m){m.geometry=g;m.visible=true;}else{m=new T.Mesh(g,MATS);m.castShadow=m.receiveShadow=!!HQ;scene.add(m);}
    m.position.set(cx*BS-this.ox,0,cz*BS-this.oz);
    m.userData.sg=o.sign.map(s=>mkSign(s,m));this.ch.set(cx+','+cz,{cx,cz,o,m});this.dirty=1;
  },
  unload(k){const r=this.ch.get(k);(r.m.userData.sg||[]).forEach(q=>{q.ms.forEach(p=>{r.m.remove(p);p.geometry.dispose();});q.tex.dispose();q.mat.dispose();});r.m.userData.sg=[];r.m.visible=false;r.m.geometry.dispose();this.pool.push(r.m);this.ch.delete(k);this.dirty=1;},
  rebuild(){            // সব লোড করা চাঙ্কের একই-মাপের বিল্ডিং এক ব্যাচে
    const g={};IM.forEach(m=>m.count=0);
    for(const r of this.ch.values())for(const[k,x,z,rt,c]of r.o.inst)(g[k]=g[k]||[]).push([r.cx*BS-this.ox+x,r.cz*BS-this.oz+z,rt,c]);
    for(const k in g){
      const m=this.inst(k),a=g[k],n=Math.min(a.length,CAP);
      for(let i=0;i<n;i++){const[x,z,rt,c]=a[i];dm.position.set(x,0,z);dm.rotation.y=rt;dm.updateMatrix();m.setMatrixAt(i,dm.matrix);m.setColorAt(i,CC.setHex(c));}
      m.count=n;m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;
    }
    this.dirty=0;
  },
  update(x,z,all){
    const pcx=Math.round(x/BS),pcz=Math.round(z/BS);
    if(all||pcx!==this.px||pcz!==this.pz||this.busy){
      this.px=pcx;this.pz=pcz;const p=plan(new Set(this.ch.keys()),pcx,pcz);
      p.drop.forEach(k=>this.unload(k));
      for(const[cx,cz]of p.add){this.load(cx,cz);if(!all)break;}   // ফ্রেমে ১টা, যাতে হোঁচট না খায়
      this.busy=!all&&p.add.length>1;
    }
    if(needShift(x,z,this.ox,this.oz)){   // floating origin: জগৎ সরিয়ে প্লেয়ারকে আবার (০,০)-এর কাছে আনা
      const nx=pcx*BS,nz=pcz*BS,dx=nx-this.ox,dz=nz-this.oz;this.ox=nx;this.oz=nz;
      this.ch.forEach(r=>{r.m.position.x-=dx;r.m.position.z-=dz;});cam.position.x-=dx;cam.position.z-=dz;this.dirty=1;
    }
    if(this.dirty)this.rebuild();
  },
  collide(s,R){
    for(const r of this.ch.values()){
      const bx=r.cx*BS,bz=r.cz*BS;
      if(Math.abs(s.x-bx)>HB+7+R||Math.abs(s.z-bz)>HB+7+R)continue;
      for(const[x0,x1,z0,z1]of r.o.wall){
        const lx=s.x-bx,lz=s.z-bz;
        if(lx<x0-R||lx>x1+R||lz<z0-R||lz>z1+R)continue;
        const dx=lx-clamp(lx,x0,x1),dz=lz-clamp(lz,z0,z1),d2=dx*dx+dz*dz;
        if(d2<R*R&&d2>1e-6){const d=Math.sqrt(d2);s.x+=dx/d*(R-d);s.z+=dz/d*(R-d);s.v*=.92;}
      }
    }
  }
};
// ট্রাফিক AI / যাত্রীর জন্য: রাস্তার জাল নিয়মিত — নোড (i,j) = টাইলের SW কোণ; প্রতিটা নোড ৪ প্রতিবেশীর সাথে যুক্ত
window.NAV={BS,HB,tileType,gen,node:(i,j)=>[i*BS-HB,j*BS-HB],adj:(i,j)=>[[i+1,j],[i-1,j],[i,j+1],[i,j-1]].map(([a,b])=>[a,b,BS])};
export { BS, CC, HB, L, RC, TH, W, WM, area, band, bstart, geo, gr, hash, mainRow, mk2, mkRng, tileType, where };
