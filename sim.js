// Swing — pure simulation (shared by game + tests)
(function(root){
const G=1500, RUN=330, R=14, GRAB_R=200, PUMP=2.5, VMAX=900, DT=1/120, RELEASE_BOOST=80, BUF=0.15;
const LEVELS=[
 {name:"Warm-up", finish:3350,
  ground:[[0,700],[1050,1500],[1860,2650],[3050,3500]], groundY:420,
  spikes:[[2250,2330]], plats:[],
  hooks:[{x:830,y:270,k:'hook'},{x:1650,y:270,k:'bar'},{x:2290,y:270,k:'vine'},{x:2800,y:280,k:'hook'}]},
 {name:"Chain", finish:4300,
  ground:[[0,600],[3950,4500]], groundY:420,
  spikes:[[3950,4030]], plats:[{x:2550,y:400,w:180,dx:140,per:3}],
  hooks:[{x:720,y:260,k:'hook'},{x:1020,y:230,k:'bar'},{x:1330,y:270,k:'vine'},{x:1650,y:240,k:'hook',mx:0,my:40,per:2.4},
         {x:1980,y:240,k:'bar'},{x:2300,y:220,k:'vine'},{x:3000,y:240,k:'hook'},{x:3330,y:220,k:'bar'},{x:3680,y:250,k:'vine'}]}
];
function hookPos(h,t){const p=h.per||1,s=Math.sin(2*Math.PI*t/p);return {x:h.x+(h.mx||0)*s,y:h.y+(h.my||0)*s};}
function platX(p,t){return p.x+p.dx*Math.sin(2*Math.PI*t/p.per);}
function solids(L,t){const a=L.ground.map(g=>({x1:g[0],x2:g[1],y:L.groundY,plat:null}));
 for(const p of L.plats){const x=platX(p,t);a.push({x1:x,x2:x+p.w,y:p.y,plat:p,h:16});}return a;}
function create(li){const L=LEVELS[li];return {li,t:0,dead:false,done:false,buf:0,last:-1,
 p:{x:60,y:L.groundY-R,vx:RUN,vy:0,mode:'ground',hook:-1,len:0,th:0,w:0}};}
function nearest(s){const L=LEVELS[s.li],p=s.p;let best=-1,bd=GRAB_R;
 L.hooks.forEach((h,i)=>{if(i===s.last&&p.mode==='air')return;const q=hookPos(h,s.t),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd&&q.y<p.y){bd=d;best=i;}});return best;}
function attach(s,i){const p=s.p,q=hookPos(LEVELS[s.li].hooks[i],s.t),dx=p.x-q.x,dy=p.y-q.y;
 p.len=Math.hypot(dx,dy);p.th=Math.atan2(dx,dy);if(p.mode==='ground'){const mx=LEVELS[s.li].groundY-R-q.y-6;if(p.len>mx){p.len=Math.max(50,mx);p.x=q.x+p.len*Math.sin(p.th);p.y=q.y+p.len*Math.cos(p.th);}}const tx=Math.cos(p.th),ty=-Math.sin(p.th);
 p.w=(p.vx*tx+p.vy*ty)/p.len;p.mode='swing';p.hook=i;}
function release(s){const p=s.p;p.vx=p.len*p.w*Math.cos(p.th);p.vy=-p.len*p.w*Math.sin(p.th);p.vx+=RELEASE_BOOST;p.mode='air';s.last=p.hook;p.hook=-1;}
function step(s,inp){if(s.dead||s.done)return s;const L=LEVELS[s.li],p=s.p,ev=[];const t0=s.t;s.t+=DT;
 // hold to grab: while held and not attached, catch the first reachable point; letting go launches
 if(p.mode==='swing'&&!inp.grab){release(s);ev.push('release');}
 if(p.mode!=='swing'&&inp.grab){const i=nearest(s);if(i>=0){attach(s,i);ev.push('grab');}}
 const py=p.y;
 if(p.mode==='swing'){const q=hookPos(L.hooks[p.hook],s.t);let a=-(G/p.len)*Math.sin(p.th);
  if(inp.dir&&Math.sign(inp.dir)===Math.sign(p.w||inp.dir))a+=PUMP*inp.dir;
  p.w+=a*DT;const vm=VMAX/p.len;if(p.w>vm)p.w=vm;if(p.w<-vm)p.w=-vm;p.th+=p.w*DT;p.x=q.x+p.len*Math.sin(p.th);p.y=q.y+p.len*Math.cos(p.th);}
 else if(p.mode==='air'){p.vy+=G*DT;p.x+=p.vx*DT;p.y+=p.vy*DT;}
 else{p.x+=RUN*DT;p.vx=RUN;p.vy=0;}
 const S=solids(L,s.t),S0=solids(L,t0);let on=null;
 for(let k=0;k<S.length;k++){const b=S[k];if(p.x<b.x1-R*0.5||p.x>b.x2+R*0.5)continue;
  if(p.mode==='ground'&&Math.abs(p.y+R-b.y)<2){on=b;p.x+=b.x1-S0[k].x1;continue;}
  if(p.y+R>=b.y&&py+R<=b.y+6&&(p.mode==='air'?p.vy>=0:true)){on=b;if(p.mode==='swing'){p.hook=-1;ev.push('land');}p.mode='ground';p.y=b.y-R;continue;}
  if(p.y+R>b.y+6&&p.y-R<b.y+(b.h||2000)){s.dead=true;ev.push('die');}}
 if(p.mode==='ground'&&!on){p.mode='air';p.vx=RUN;p.vy=0;}
 for(const sp of L.spikes)if(p.x+R*0.7>sp[0]&&p.x-R*0.7<sp[1]&&p.y+R>L.groundY-26){s.dead=true;ev.push('die');}
 if(p.y>900){s.dead=true;ev.push('die');}
 if(!s.dead&&p.x>=L.finish){s.done=true;ev.push('done');}
 s.ev=ev;return s;}
const api={RELEASE_BOOST,BUF,G,RUN,R,GRAB_R,DT,LEVELS,create,step,nearest,hookPos,platX,solids,release,attach};
if(typeof module!=='undefined')module.exports=api;else root.SwingSim=api;
})(this);
