// শিফট, লক্ষ্য, গ্যারেজ, আয়-ব্যয়
import { loadProgress, saveProgress } from './save.js';
import { $, bn, lin } from './core.js';
import { art, body, cv, hg, hood, inp } from './vehicles.js';
import { beacon, killPax, money, saveMoney, seat, setMoney, setSeat, setTrip, trip } from './passengers.js';
import { btns, showMoney, toast } from './ui.js';

/* ---------- ইনপুট ও মেনু ---------- */
/* ---------- শিফট, লক্ষ্য, গ্যারেজ, যাত্রীর ধরন, ঘটনা (সব localStorage-এ সেভ) ---------- */
const PG=(()=>{
 const KEY='rickshaw_prog',pm=document.createElement('div'),st=document.createElement('style');
 st.textContent='#pgm{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,8,5,.8);color:#fff;z-index:5;padding:12px}#pgm.show{display:flex}#pgm .c{background:#2a241c;border-radius:18px;padding:16px 18px;max-width:390px;width:100%;max-height:88vh;overflow:auto;font-size:15px;line-height:1.6}#pgm h3{margin:0 0 8px;font-size:22px}#pgm p{margin:6px 0}#pgm .r{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:3px 0}#pgm .n{font-weight:700;border-top:1px solid #fff4;margin-top:6px;padding-top:6px;font-size:18px}#pgm button{font:inherit;font-size:14px;border:0;border-radius:10px;padding:7px 12px;margin:4px 4px 0 0;background:#ffc83c;color:#1c1712;cursor:pointer}#pgm button[disabled]{opacity:.4}#pgm button.a{background:#fff3;color:#fff}';
 document.head.appendChild(st);pm.id='pgm';document.body.appendChild(pm);
 const PTY=[{ic:'👔',n:'অফিসযাত্রী',rush:1,l1:'ভাই, জলদি চলেন, অফিসে দেরি হয়ে যাচ্ছে!',l2:'ঠিক সময়ে পৌঁছে গেলাম, ধন্যবাদ ভাই!',look:{g:0,c1:0xcfd8dc,c2:0x37474f,leg:0x37474f}},
  {ic:'🎒',n:'স্কুলছাত্র',l1:'মামা, ঘণ্টা পড়ার আগে স্কুলে পৌঁছে দিবেন?',l2:'থ্যাংক ইউ মামা, কাল আবার দেখা হবে!',look:{g:0,c1:0xe8e8e8,c2:0x1f2a44,leg:0x1f2a44}},
  {ic:'🛍️',n:'বাজার-ফেরত আপা',l1:'বাবা, বাজারের থলে ভারী, আস্তে চালিও।',l2:'বেঁচে থাকো বাবা, আল্লাহ ভালো করুক।',look:{g:3,c1:0xb04a4a,c2:0xb04a4a}}];
 const HC=[0xe53935,0x1e88e5,0x2e7d32,0xf9a825,0x8e24aa],HN=['লাল','নীল','সবুজ','হলুদ','বেগুনি'],PN=['ডোরা','ফুল','ঢেউ'],UP={t:[300,700,1400],s:[250,600,1200],h:[150,350,700]},OWN=6000,JAMA=200,FOOD=60,LEN=600;
 let P={day:1,u:{t:0,s:0,h:0},cols:[0],col:0,pats:[0],pat:0,own:0,sh:null},modal=false,sv=0,lh='';
 {const r=loadProgress();if(r&&r.u)P=Object.assign(P,r);}
 const rd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),save=()=>saveProgress(P),
  goal=()=>{const d=P.day;if(Math.random()<.5){const v=Math.min(8,rd(3,4)+Math.floor(d/3));return{k:'pax',v,b:100+v*15};}const v=Math.round((350+d*30+rd(0,150))/50)*50;return{k:'earn',v,b:Math.round(v*.2/10)*10};},
  fresh=()=>({t:0,fare:0,tip:0,bonus:0,n:0,cost:0,ok:0,fin:0,g:goal()});
 if(!P.sh)P.sh=fresh();
 const prog=()=>P.sh.g.k==='pax'?P.sh.n:P.sh.fare+P.sh.tip,gt=g=>g.k==='pax'?bn(g.v)+' জন যাত্রী':'৳'+bn(g.v)+' আয়',
  fmt=s=>{s=Math.max(0,Math.ceil(s));return bn(Math.floor(s/60))+':'+(s%60<10?'০':'')+bn(s%60);},
  stop=()=>{inp.g=inp.b=inp.l=inp.r=inp.h=0;btns.forEach(b=>b.classList.remove('on'));},
  row=(a,b)=>'<div class=\'r\'><span>'+a+'</span><span>'+b+'</span></div>';
 function hud(){const s=P.sh,g=s.g,p=Math.min(prog(),g.v),h='দিন '+bn(P.day)+' · ⏱ '+fmt(LEN-s.t)+' · 🎯 '+(g.k==='pax'?bn(p)+'/'+bn(g.v)+' জন':'৳'+bn(p)+'/'+bn(g.v))+(s.ok?' ✅':'')+(trip&&trip.rush&&trip.left>0?' · ⏳ '+bn(Math.ceil(trip.left))+' সে':'');
  if(h!==lh){lh=h;$('shift').textContent=h;$('gl').textContent='দিন '+bn(P.day)+' · আজকের লক্ষ্য: '+gt(g)+' (বোনাস ৳'+bn(g.b)+') · খরচ: জমা ৳'+bn(P.own?0:JAMA)+' + খাবার ৳'+bn(FOOD);}}
 function paint(){hood.material.color.copy(lin(HC[P.col]));const pal=[['#e53935','#1e88e5','#43a047','#8e24aa','#fb8c00'],['#ec407a','#ffee58','#ffffff','#26c6da','#ff7043'],['#ffffff','#0d47a1','#ffffff','#0d47a1','#ffffff']][P.pat],sc=[[0xffd23f,0x43a047,0xffd23f],[0xffffff,0xec407a,0xffffff],[0x0d47a1,0xffffff,0x0d47a1]][P.pat];
  hg.children.slice(1).forEach((m,i)=>m.material.color.copy(lin(sc[i])));
  const g=cv.getContext('2d');g.fillStyle=P.pat===2?'#e0f2f1':'#ffd23f';g.fillRect(0,0,128,64);g.strokeStyle=pal[0];g.lineWidth=4;g.strokeRect(2,2,124,60);pal.forEach((col,j)=>{g.fillStyle=col;for(let i=0;i<4;i++){g.beginPath();g.arc(16+i*32,32,15-j*3,0,7);g.fill();}});art.material.map.needsUpdate=true;}
 function sum(){const s=P.sh,inc=s.fare+s.tip+s.bonus,net=inc-s.cost;pm.className='show';
  pm.innerHTML='<div class=\'c\'><h3>📋 দিন '+bn(P.day)+' শেষ</h3>'+row('ভাড়া ('+bn(s.n)+' জন)','৳'+bn(s.fare))+row('বখশিশ ও ঘটনা','৳'+bn(s.tip))+row('🎯 '+gt(s.g),s.ok?'✅ +৳'+bn(s.bonus):'❌ হয়নি')+row('মোট আয়','৳'+bn(inc))+row('রিকশার জমা',P.own?'নিজের রিকশা — ০':'−৳'+bn(JAMA))+row('খাবার','−৳'+bn(FOOD))
   +'<div class=\'r n\'><span>নেট লাভ</span><span>'+(net<0?'−':'')+'৳'+bn(Math.abs(net))+'</span></div><p>💰 জমানো টাকা: ৳'+bn(money)+'</p><button data-a=\'gar\'>🔧 গ্যারেজ</button><button data-a=\'next\'>☀️ পরের দিন</button></div>';}
 function gar(){const U=P.u,b=(a,pr,t)=>'<button data-a=\''+a+'\''+(money<pr?' disabled':'')+'>'+t+' ৳'+bn(pr)+'</button>',
   lv=(k,t,d)=>'<div class=\'r\'><span>'+t+' '+bn(U[k])+'/৩<br><small>'+d+'</small></span>'+(U[k]<3?b('u'+k,UP[k][U[k]],'কিনুন'):'<span>✅ সর্বোচ্চ</span>')+'</div>',
   sw=(a,i,own,sel,pr,txt,c)=>'<button data-a=\''+a+i+'\' style=\''+(c?'background:#'+c.toString(16).padStart(6,'0')+';color:#fff':'')+'\''+(!own&&money<pr?' disabled':'')+'>'+txt+(own?(sel?' ✔':''):' ৳'+bn(pr))+'</button>';
  pm.className='show';
  pm.innerHTML='<div class=\'c\'><h3>🔧 গ্যারেজ</h3><p>💰 জমানো: ৳'+bn(money)+'</p>'+lv('t','🛞 ভালো টায়ার','গতি +'+bn(7*U.t)+'%')+lv('s','💺 আরামদায়ক সিট','বখশিশ +'+bn(50*U.s)+'%')+lv('h','📯 জোরালো হর্ন','আরও জোরালো ও গম্ভীর')
   +'<p>🎨 হুডের রঙ</p>'+HC.map((c,i)=>sw('c',i,P.cols.includes(i),P.col===i,120,HN[i],c)).join('')+'<p>🌸 হুডের নকশা</p>'+PN.map((n,i)=>sw('p',i,P.pats.includes(i),P.pat===i,150,n)).join('')
   +'<p>🛺 শেষ লক্ষ্য</p>'+(P.own?'<p>নিজের রিকশা আছে 🎉 আর জমা দিতে হয় না</p>':b('own',OWN,'নিজের রিকশা কিনুন'))+'<div><button class=\'a\' data-a=\'back\'>← ফিরে যাও</button></div></div>';}
 function end(){modal=true;stop();if(trip){body.remove(seat);killPax(seat);setSeat(null);setTrip(null);beacon.visible=false;$('trip').classList.remove('show');}
  const s=P.sh;s.cost=P.own?FOOD:JAMA+FOOD;if(s.ok)s.bonus=s.g.b;s.fin=1;setMoney(Math.max(0,money+s.bonus-s.cost));saveMoney();showMoney();save();sum();}
 function ev(){if(modal)return;modal=true;stop();const it=['ব্যাগ','ছাতা','মোবাইল ফোন','টিফিন বাক্স'][rd(0,3)];
  pm.className='show';pm.innerHTML='<div class=\'c\'><h3>🎒 সিটে কিছু পড়ে আছে!</h3><p>যাত্রী সিটে একটা '+it+' ফেলে গেছে। ফেরত দেবে?</p><button data-a=\'ret\'>হ্যাঁ, ফেরত দিই</button><button class=\'a\' data-a=\'no\'>থাক</button></div>';}
 function act(a){const U=P.u;
  if(a==='gar')return gar();if(a==='back'){if(P.sh.fin)return sum();pm.className='';modal=false;return;}
  if(a==='next'){P.day++;P.sh=fresh();modal=false;pm.className='';lh='';hud();save();toast('☀️ দিন '+bn(P.day)+' শুরু! 🎯 '+gt(P.sh.g));return;}
  if(a==='ret'||a==='no'){pm.className='';modal=false;if(a==='ret'){const b=rd(80,150);P.sh.tip+=b;setMoney(money+b);saveMoney();showMoney();save();toast('🙏 সততার জন্য ৳'+bn(b)+' বখশিশ পেলে!');}return;}
  const buy=pr=>{if(money<pr)return 0;setMoney(money-pr);return 1;};
  if(a[0]==='u'){const k=a[1];if(U[k]<3&&buy(UP[k][U[k]]))U[k]++;}
  else if(a[0]==='c'){const i=+a.slice(1);if(P.cols.includes(i)||buy(120)){if(!P.cols.includes(i))P.cols.push(i);P.col=i;paint();}}
  else if(a[0]==='p'){const i=+a.slice(1);if(P.pats.includes(i)||buy(150)){if(!P.pats.includes(i))P.pats.push(i);P.pat=i;paint();}}
  else if(a==='own'&&!P.own&&buy(OWN)){P.own=1;toast('🎉 নিজের রিকশা কিনে ফেললে! আর জমা দিতে হবে না');}
  saveMoney();showMoney();save();gar();}
 pm.onclick=e=>{const b=e.target.closest('button');if(b&&!b.disabled)act(b.dataset.a);};
 $('gb').onclick=()=>{modal=true;stop();gar();};
 addEventListener('pagehide',save);
 paint();if(P.sh.fin){modal=true;sum();}hud();
 return{P,PTY,modal:()=>modal,vmax:()=>9.5*(1+.07*P.u.t),
  board(t){t.rush=!!t.ty.rush;t.left=t.rush?Math.round(t.d/5.5+30):0;toast(t.ty.ic+' "'+t.ty.l1+'"'+(t.rush?' ⏳ সময়মতো পৌঁছালে বেশি বখশিশ':''));},
  arrive(t){const y=t.ty,m=1+.5*P.u.s,s=P.sh;let tip=0,line=y.l2,ex='';
   if(t.rush){if(t.left>0)tip=Math.round(40*m/5)*5;else line='দেরি হয়ে গেল... যাক, নামিয়ে দিন।';}else if(Math.random()<.4)tip=Math.round(rd(5,20)*m/5)*5;
   if(Math.random()<.12){const b=rd(30,80);tip+=b;ex=' 😊 খুশি হয়ে ৳'+bn(b)+' বখশিশ!';}
   s.fare+=t.fare;s.tip+=tip;s.n++;setMoney(money+t.fare+tip);saveMoney();showMoney();save();
   toast(y.ic+' "'+line+'" +৳'+bn(t.fare+tip)+ex);if(Math.random()<.12)setTimeout(ev,1800);},
  step(dt){if(modal)return;const s=P.sh;s.t+=dt;if(trip&&trip.rush&&trip.left>0)trip.left=Math.max(0,trip.left-dt);
   if((sv+=dt)>5){sv=0;save();}if(!s.ok&&prog()>=s.g.v){s.ok=1;toast('🎯 লক্ষ্য পূরণ! শিফট শেষে বোনাস ৳'+bn(s.g.b));}
   if(s.t>=LEN)end();hud();}};
})();
export { PG };
