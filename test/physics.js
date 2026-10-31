const S=require('../sim.js');const assert=require('assert');let n=0;const ok=(c,m)=>{assert(c,m);n++;console.log('PASS',m);};
// energy conservation: hang on hook, no pump
{const s=S.create(0);s.p.mode='air';s.p.x=830-120;s.p.y=270+60;s.p.vx=0;s.p.vy=0;S.attach(s,0);const p=s.p;
 const E=()=>{const v=p.len*p.w;return .5*v*v+S.G*(270-p.y+p.len);};const E0=E();let mx=0;
 for(let i=0;i<1200;i++){p.th+=0;const a=-(S.G/p.len)*Math.sin(p.th);p.w+=a*S.DT;p.th+=p.w*S.DT;p.y=270+p.len*Math.cos(p.th);mx=Math.max(mx,Math.abs(E()-E0)/E0);}
 ok(mx<0.03,`energy drift over 10s pendulum ${(mx*100).toFixed(2)}% < 3%`);}
// attach within radius, not beyond
{const s=S.create(0);s.p.mode='air';s.p.x=830-100;s.p.y=270+100;s.p.vx=300;s.p.vy=0;S.step(s,{grab:true,dir:0});ok(s.p.mode==='swing'&&s.p.hook===0,'grab attaches within radius');
 ok(Math.abs(s.p.len-Math.hypot(100,100))<6,'rope length = distance at grab');}
{const s=S.create(0);s.p.mode='air';s.p.x=830-300;s.p.y=270+200;s.p.vx=0;s.p.vy=0;S.step(s,{grab:true,dir:0});ok(s.p.mode!=='swing','no grab outside radius');}
// release tangential velocity
{const s=S.create(0);s.p.mode='air';s.p.x=830-100;s.p.y=370;s.p.vx=300;s.p.vy=0;S.step(s,{grab:true,dir:0});for(let i=0;i<20;i++)S.step(s,{grab:true,dir:0});
 const p=s.p,th=p.th,w=p.w,L=p.len;S.step(s,{grab:false,dir:0});const ex=L*w*Math.cos(th),ey=-L*w*Math.sin(th);
 ok(s.p.mode==='air'&&Math.abs(s.p.vx-ex)<1&&Math.abs(s.p.vy-(ey+S.G*S.DT))<1,`release launches tangentially v=(${s.p.vx.toFixed(0)},${s.p.vy.toFixed(0)})`);
 const r=[s.p.x-830,s.p.y-270];ok(Math.abs(r[0]*s.p.vx+r[1]*(s.p.vy-S.G*S.DT))/Math.hypot(...r)/Math.hypot(s.p.vx,s.p.vy)<0.05,'launch velocity perpendicular to rope');}
// pumping increases amplitude
{const run=d=>{const s=S.create(0);s.p.mode='air';s.p.x=830-60;s.p.y=270+150;s.p.vx=0;s.p.vy=0;S.attach(s,0);let m=0;for(let i=0;i<600;i++){S.step(s,{grab:true,dir:d*Math.sign(s.p.w||1)});m=Math.max(m,Math.abs(s.p.th));}return m;};
 const a=run(0),b=run(1);ok(b>a*1.3,`pumping raises swing amplitude ${a.toFixed(2)}→${b.toFixed(2)} rad`);}
// death in pit, restart
{const s=S.create(0);let i=0;while(!s.dead&&i<2000){S.step(s,{grab:false,dir:0});i++;}ok(s.dead,'running into first pit kills the player');const r=S.create(0);ok(!r.dead&&r.p.x===60&&r.t===0,'restart gives fresh state');}
// spike death
{const s=S.create(0);s.p.x=2200;s.p.y=420-14;S.step(s,{grab:false,dir:0});let i=0;while(!s.dead&&i<200){S.step(s,{grab:false,dir:0});i++;}ok(s.dead&&s.p.x<2260,'spikes kill');}
// solver: both levels completable
{const {solve,A,CH}=require('./solve.js');const sol={};for(let li=0;li<S.LEVELS.length;li++){const q=solve(li);ok(!!q,`level ${li+1} completable by search bot`);
 const s=S.create(li);let k=0;while(!s.done&&!s.dead&&k<q.length*CH+10){S.step(s,A[q[Math.floor(k/CH)]]||A[0]);k++;}ok(s.done,`level ${li+1} replay of solution reaches flag (${s.t.toFixed(1)}s)`);
 const hooksUsed=new Set();const s2=S.create(li);k=0;while(!s2.done&&!s2.dead){S.step(s2,A[q[Math.floor(k/CH)]]||A[0]);if(s2.p.mode==='swing')hooksUsed.add(s2.p.hook);k++;}console.log('   hooks used:',[...hooksUsed].join(','));sol[li]=q;}
 require('fs').writeFileSync(__dirname+'/solutions.json',JSON.stringify(sol));}
{const s=S.create(0);s.p.mode='air';s.p.x=830-260;s.p.y=360;s.p.vx=330;s.p.vy=0;S.step(s,{grab:true,dir:0});const f=s.p.mode;let k=0;while(s.p.mode!=='swing'&&k<60){S.step(s,{grab:true,dir:0});k++;}ok(f!=='swing'&&s.p.mode==='swing','early press held while falling catches point when it comes in reach');}
{const s=S.create(0);s.p.mode='air';s.p.x=830-260;s.p.y=360;s.p.vx=330;s.p.vy=0;S.step(s,{grab:true,dir:0});for(let i=0;i<60;i++)S.step(s,{grab:false,dir:0});ok(s.p.mode!=='swing','early press then let go does not grab');}
{const s=S.create(0);while(s.p.x<700)S.step(s,{grab:false,dir:0});S.step(s,{grab:true,dir:0});for(let i=0;i<30;i++)S.step(s,{grab:true,dir:0});ok(s.p.mode==='swing','press while running grabs; holding keeps swinging (ground clearance)');S.step(s,{grab:false,dir:0});ok(s.p.mode==='air','letting go launches');}
{const s=S.create(0);s.p.mode='air';s.p.x=300;s.p.y=300;s.p.vx=330;s.p.vy=0;S.step(s,{grab:false,dir:0});ok(s.p.mode==='air','letting go while not attached does nothing');}
console.log(n,'checks passed');
