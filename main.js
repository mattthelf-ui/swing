(function(){
const S=window.SwingSim,cv=document.getElementById('c'),cx=cv.getContext('2d');
const VW=960,VH=540;let scale=1,ox=0,oy=0;
function resize(){const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;scale=Math.min(cv.width/VW,cv.height/VH);ox=(cv.width-VW*scale)/2;oy=(cv.height-VH*scale)/2;}
addEventListener('resize',resize);resize();
const C={sky:'#8fd3ff',sky2:'#c8ecff',ground:'#3ec46d',dirt:'#8a5a3c',spike:'#ff4d6d',plat:'#ffb703',hook:'#264653',rope:'#264653',player:'#ff6b35',hi:'#ffd60a',flag:'#e63946',text:'#1d3557'};
let screen='title',li=0,s=null,attempts=1,camX=0,parts=[],trail=[],best={},sel=0,deathT=0,bot=null,botI=0;
const keys={},inp={grab:false,dir:0};let touchGrab=false,touchDir=0;
let ac=null;function blip(f,d,type){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=type||'square';o.frequency.value=f;g.gain.value=.06;g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}}
function start(i){bot=null;li=i;s=S.create(i);screen='play';camX=0;parts=[];trail=[];}
function restart(){attempts++;start(li);}
function burst(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=60+Math.random()*260;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,l:.6,col});}}
function menuAct(){if(screen==='title'){start(sel);attempts=1;}else if(screen==='done'){if(sel===0&&li+1<S.LEVELS.length){attempts=1;start(li+1);}else if(sel===1){attempts=1;start(li);}else{screen='title';sel=0;}}}
addEventListener('keydown',e=>{const k=e.code;if(keys[k])return;keys[k]=true;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k))e.preventDefault();
 if(screen!=='play'){const n=screen==='title'?S.LEVELS.length:3;
  if(k==='ArrowLeft'||k==='KeyA'||k==='ArrowUp'||k==='KeyW')sel=(sel+n-1)%n;
  if(k==='ArrowRight'||k==='KeyD'||k==='ArrowDown'||k==='KeyS')sel=(sel+1)%n;
  if(k==='Enter'||k==='Space')menuAct();if(k==='Escape')screen='title';return;}
 if(k==='KeyR'){restart();}if(k==='Escape'){screen='title';sel=li;}});
addEventListener('keyup',e=>{keys[e.code]=false;});
function tpos(t){const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;return {x:((t.clientX-r.left)*d-ox)/scale,y:((t.clientY-r.top)*d-oy)/scale};}
let menuBoxes=[];
function onDown(pt,id){if(screen!=='play'){for(const b of menuBoxes)if(pt.x>b.x&&pt.x<b.x+b.w&&pt.y>b.y&&pt.y<b.y+b.h){sel=b.i;menuAct();}return;}
 if(pt.x>VW-70&&pt.y<60){restart();return;}touchGrab=true;}
cv.addEventListener('pointerdown',e=>{e.preventDefault();onDown(tpos(e));ptrs[e.pointerId]=tpos(e);updDir();});
cv.addEventListener('pointermove',e=>{if(ptrs[e.pointerId]){ptrs[e.pointerId]=tpos(e);updDir();}});
const ptrs={};function up(e){delete ptrs[e.pointerId];if(!Object.keys(ptrs).length)touchGrab=false;updDir();}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function updDir(){touchDir=0;for(const k in ptrs){const p=ptrs[k];if(p.y>VH*0.55)touchDir=p.x<VW/2?-1:1;}}
// test hooks
const q=new URLSearchParams(location.search);
window.__swing={start,get state(){return s},get screen(){return screen},playBot(i,seq,A,CH){attempts=1;start(i);bot={seq,A,CH};botI=0;},setScreen(x){screen=x}};
let acc=0,last=performance.now();
function tick(now){let dt=Math.min(.05,(now-last)/1000);last=now;if(screen==='play'){acc+=dt;
 while(acc>=S.DT){acc-=S.DT;
  if(bot){const a=bot.A[bot.seq[Math.floor(botI/bot.CH)]]||{grab:false,dir:0};botI++;inp.grab=a.grab;inp.dir=a.dir;}
  else{inp.grab=!!(keys.Space||keys.ArrowUp||keys.KeyW||touchGrab);inp.dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0)||touchDir;}
  if(s.dead){deathT-=S.DT;if(deathT<=0&&!bot)restart();else if(deathT<=0){bot=null;}continue;}
  if(s.done)break;
  S.step(s,inp);
  for(const e of s.ev){if(e==='grab'){blip(660,.08);burst(s.p.x,s.p.y,C.hi,6);}if(e==='release'){blip(440,.1,'triangle');}if(e==='land')blip(220,.06);
   if(e==='die'){blip(110,.3,'sawtooth');burst(s.p.x,s.p.y,C.player,30);deathT=.45;}
   if(e==='done'){blip(880,.15);setTimeout(()=>blip(1320,.25),120);burst(s.p.x,s.p.y,C.hi,50);const t=s.t;if(!best[li]||t<best[li])best[li]=t;screen='done';sel=0;doneT=t;}}
  if(s.p.mode!=='ground')trail.push({x:s.p.x,y:s.p.y,l:.35});
 }}
 for(const p of parts){p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}parts=parts.filter(p=>p.l>0);
 for(const t of trail)t.l-=dt;trail=trail.filter(t=>t.l>0);
 draw();requestAnimationFrame(tick);}
let doneT=0;
function rr(x,y,w,h,r,col){cx.fillStyle=col;cx.beginPath();cx.roundRect(x,y,w,h,r);cx.fill();}
function txt(t,x,y,sz,col,al){cx.fillStyle=col||C.text;cx.font=`800 ${sz}px system-ui,sans-serif`;cx.textAlign=al||'center';cx.fillText(t,x,y);}
function drawWorld(){const L=S.LEVELS[li],p=s.p;const target=p.x-VW*0.35;camX+=(target-camX)*0.12;if(Math.abs(target-camX)>600)camX=target;
 cx.save();cx.translate(-camX,0);
 // hills parallax
 cx.fillStyle='#b5e48c';for(let i=-1;i<12;i++){const hx=Math.floor(camX*0.5/400)*400+i*400+camX*0.5;cx.beginPath();cx.arc(hx,VH+40,220,Math.PI,0);cx.fill();}
 for(const g of L.ground){rr(g[0],L.groundY,g[1]-g[0],VH-L.groundY+20,0,C.dirt);rr(g[0],L.groundY,g[1]-g[0],18,4,C.ground);}
 for(const sp of L.spikes){cx.fillStyle=C.spike;const n=Math.max(1,Math.round((sp[1]-sp[0])/26)),w=(sp[1]-sp[0])/n;for(let i=0;i<n;i++){cx.beginPath();cx.moveTo(sp[0]+i*w,L.groundY);cx.lineTo(sp[0]+i*w+w/2,L.groundY-28);cx.lineTo(sp[0]+(i+1)*w,L.groundY);cx.fill();}}
 for(const pl of L.plats){const x=S.platX(pl,s.t);rr(x,pl.y,pl.w,16,6,C.plat);}
 // finish flag
 cx.fillStyle=C.text;cx.fillRect(L.finish,L.groundY-140,6,140);cx.fillStyle=C.flag;cx.beginPath();cx.moveTo(L.finish+6,L.groundY-140);cx.lineTo(L.finish+66,L.groundY-118);cx.lineTo(L.finish+6,L.groundY-96);cx.fill();
 const ni=p.mode!=='swing'?S.nearest(s):-1;
 L.hooks.forEach((h,i)=>{const q=S.hookPos(h,s.t);
  if(i===ni){cx.strokeStyle=C.hi;cx.lineWidth=4;cx.setLineDash([8,8]);cx.beginPath();cx.arc(q.x,q.y,S.GRAB_R,0,6.28);cx.globalAlpha=.35;cx.stroke();cx.globalAlpha=1;cx.setLineDash([]);
   cx.fillStyle=C.hi;cx.beginPath();cx.arc(q.x,q.y,20+3*Math.sin(s.t*10),0,6.28);cx.fill();}
  cx.fillStyle=C.hook;
  if(h.k==='bar')rr(q.x-26,q.y-6,52,12,6,C.hook);
  else if(h.k==='vine'){cx.strokeStyle='#2d6a4f';cx.lineWidth=5;cx.beginPath();cx.moveTo(q.x,-20);cx.lineTo(q.x,q.y);cx.stroke();cx.fillStyle='#2d6a4f';cx.beginPath();cx.arc(q.x,q.y,10,0,6.28);cx.fill();}
  else{cx.beginPath();cx.arc(q.x,q.y,11,0,6.28);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(q.x,q.y,4,0,6.28);cx.fill();}});
 for(const t of trail){cx.globalAlpha=t.l*1.6;cx.fillStyle=C.player;cx.beginPath();cx.arc(t.x,t.y,S.R*t.l*2,0,6.28);cx.fill();}cx.globalAlpha=1;
 if(p.mode==='swing'){const q=S.hookPos(L.hooks[p.hook],s.t);cx.strokeStyle=C.rope;cx.lineWidth=4;cx.beginPath();cx.moveTo(q.x,q.y);cx.lineTo(p.x,p.y);cx.stroke();}
 if(!s.dead){cx.save();cx.translate(p.x,p.y);cx.rotate(p.mode==='swing'?-p.th:s.t*(p.mode==='air'?8:0));rr(-S.R,-S.R,S.R*2,S.R*2,6,C.player);cx.fillStyle='#fff';cx.fillRect(2,-7,6,6);cx.fillStyle=C.text;cx.fillRect(5,-5,3,3);cx.restore();}
 for(const pt of parts){cx.globalAlpha=Math.max(0,pt.l/.6);cx.fillStyle=pt.col;cx.fillRect(pt.x-4,pt.y-4,8,8);}cx.globalAlpha=1;
 cx.restore();
 // HUD
 const prog=Math.min(1,Math.max(0,p.x/L.finish));rr(VW/2-150,16,300,10,5,'rgba(29,53,87,.2)');rr(VW/2-150,16,300*prog,10,5,C.player);
 txt(`Attempt ${attempts}`,20,32,20,C.text,'left');txt(`${L.name}  ${s.t.toFixed(1)}s`,VW/2,50,16);
 rr(VW-62,12,46,40,10,'rgba(29,53,87,.15)');txt('↻',VW-39,42,26);
 if(li===0&&s.t<6&&attempts<3)txt('Hold SPACE / touch to grab • release to launch • ←/→ pump',VW/2,VH-24,18);}
function button(x,y,w,h,label,i,on){rr(x,y,w,h,14,on?C.player:'#fff');txt(label,x+w/2,y+h/2+8,22,on?'#fff':C.text);menuBoxes.push({x,y,w,h,i});}
function draw(){cx.setTransform(1,0,0,1,0,0);cx.fillStyle=C.sky;cx.fillRect(0,0,cv.width,cv.height);cx.setTransform(scale,0,0,scale,ox,oy);
 cx.save();cx.beginPath();cx.rect(0,0,VW,VH);cx.clip();const gr=cx.createLinearGradient(0,0,0,VH);gr.addColorStop(0,C.sky);gr.addColorStop(1,C.sky2);cx.fillStyle=gr;cx.fillRect(0,0,VW,VH);
 menuBoxes=[];
 if(screen==='title'){txt('SWING',VW/2,170,96,C.player);txt('grab • swing • release',VW/2,215,22);
  S.LEVELS.forEach((L,i)=>button(VW/2-230+i*240,270,220,90,`${i+1}. ${L.name}`,i,sel===i));
  S.LEVELS.forEach((L,i)=>{if(best[i])txt(`best ${best[i].toFixed(2)}s`,VW/2-120+i*240,385,16);});
  txt('Hold SPACE/↑/W or touch = grab   •   let go = launch   •   ←/→ or A/D (or bottom screen halves) = pump   •   R = restart',VW/2,470,15);}
 else{drawWorld();if(screen==='done'){cx.fillStyle='rgba(255,255,255,.75)';cx.fillRect(0,0,VW,VH);txt('Level complete!',VW/2,170,56,C.player);
  txt(`Time ${doneT.toFixed(2)}s   •   Attempts ${attempts}`,VW/2,225,24);
  const hasNext=li+1<S.LEVELS.length;button(VW/2-330,280,200,70,hasNext?'Next level':'—',0,sel===0);button(VW/2-100,280,200,70,'Replay',1,sel===1);button(VW/2+130,280,200,70,'Menu',2,sel===2);}}
 cx.restore();}
if(q.get('level')){start(+q.get('level')-1);}
requestAnimationFrame(tick);
})();
