const S=require('../sim.js');
function win(li,hi,quiet){const L=S.LEVELS[li],h=L.hooks[hi];const g=L.ground.filter(g=>g[1]<=h.x+50).pop();const nextG=L.ground.find(q=>q[0]>g[1]);let rows=[],tot=0,cnt=0;
for(let px=g[1]-200;px<=g[1]+100;px+=20){let okR=0,N=0;for(let r=0.1;r<=2.0;r+=0.025){N++;const s=S.create(li);s.p.x=Math.max(g[0]+20,g[1]-320,...L.spikes.filter(k=>k[1]<g[1]&&k[1]>g[0]).map(k=>k[1]+20));s.p.y=L.groundY-S.R;let st=0,pressed=false,hs=0,grabbed=false,ar=0;
 while(st<1500&&!s.dead&&!s.done){if(s.p.x>=px)pressed=true;const rel=grabbed&&hs>=r*120;if(rel)ar++;const gg=pressed&&(!grabbed||!rel||ar>18);S.step(s,{grab:gg,dir:0});if(s.p.mode==='swing'&&!(grabbed&&ar>0)){grabbed=true;hs++;}st++;
  if(grabbed&&s.p.mode!=='swing'&&!gg&&s.p.mode==='ground'&&nextG&&s.p.x>nextG[0])break;
  if(grabbed&&s.p.mode==='swing'&&s.p.hook>hi)break;}
 if(!s.dead&&grabbed)okR++;}
 const w=okR*0.025;tot+=w;cnt++;rows.push(`${px}:${w.toFixed(2)}s`);}
if(!quiet)console.log(L.name,'hook',hi+1,'edge',g[1],'| release-window by press x:',rows.join(' '));return tot/cnt;}
module.exports=win;if(require.main===module){const [li,hi]=process.argv.slice(2).map(Number);win(li,hi);}
