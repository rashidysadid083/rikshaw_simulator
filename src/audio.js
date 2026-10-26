// হর্ন (Web Audio)
import { PG } from './economy.js';

/* হর্ন: Web Audio, চেপে ধরলে বাজে */
let ac,hn;
const ia=()=>{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();};
['pointerdown','keydown'].forEach(n=>addEventListener(n,ia));
function horn(on){
  if(on&&!hn&&ac){const g=ac.createGain();g.gain.value=.12+.06*PG.P.u.h;g.connect(ac.destination);
    hn={g,o:[330,415].map(f=>{const x=ac.createOscillator();x.type='square';x.frequency.value=f-22*PG.P.u.h;x.connect(g);x.start();return x;})};}
  else if(!on&&hn){hn.g.gain.setTargetAtTime(0,ac.currentTime,.03);hn.o.forEach(x=>x.stop(ac.currentTime+.2));hn=null;}
}
export { horn };
