// localStorage — সেভ/লোড

const K_MONEY='rickshaw_money',K_PROG='rickshaw_prog',K_GQ='rickshaw_gq',K_SEED='rickshaw_evseed';
export function loadQuality(){let q=0;try{q=localStorage.getItem(K_GQ)==='hi'?1:0;}catch(_){}return q;}
export function saveQuality(hq){try{localStorage.setItem(K_GQ,hq?'hi':'lo');}catch(_){}}
export function loadMoney(){let m=0;try{m=Math.max(0,parseInt(localStorage.getItem(K_MONEY),10)||0);}catch(_){}return m;}
export function saveMoneyValue(m){try{localStorage.setItem(K_MONEY,String(m));}catch(_){}}
export function loadEventSeed(){let s=0;try{s=+localStorage.getItem(K_SEED)||0;}catch(_){}
  if(!s){s=1+((Math.random()*1e9)|0);try{localStorage.setItem(K_SEED,String(s));}catch(_){}}return s;}
export function loadProgress(){try{return JSON.parse(localStorage.getItem(K_PROG));}catch(_){return null;}}
export function saveProgress(p){try{localStorage.setItem(K_PROG,JSON.stringify(p));}catch(_){}}
