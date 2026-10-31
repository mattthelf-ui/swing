(function(){
const S=window.SwingSim,cv=document.getElementById('c'),cx=cv.getContext('2d');
const VW=960,VH=540;let scale=1,ox=0,oy=0;
function resize(){const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;scale=Math.min(cv.width/VW,cv.height/VH);ox=(cv.width-VW*scale)/2;oy=(cv.height-VH*scale)/2;}
addEventListener('resize',resize);resize();
const C0={sky:'#8fd3ff',sky2:'#c8ecff',ground:'#3ec46d',dirt:'#8a5a3c',spike:'#ff4d6d',plat:'#ffb703',hook:'#264653',rope:'#264653',player:'#ff6b35',hi:'#ffd60a',flag:'#e63946',text:'#1d3557'};
const CN={sky:'#1A1046',sky2:'#2a1d5e',ground:'#3ec46d',dirt:'#8a5a3c',spike:'#ff4d6d',plat:'#ffb703',hook:'#264653',rope:'#264653',player:'#FF7A1A',hi:'#2FE0FF',flag:'#e63946',text:'#e8f1ff',btn:'#1E2740'};
let C=C0;
let screen='title',li=0,s=null,attempts=1,camX=0,parts=[],trail=[],best=(()=>{try{return JSON.parse(localStorage.getItem('swing.best')||'{}')}catch(e){return {}}})(),sel=0,deathT=0,bot=null,botI=0;
const keys={};const inPump=p=>p.y>VH*0.6&&(p.x<VW*0.25||p.x>VW*0.75);
const inp={grab:false,dir:0};let tapQ=false,touchDir=0,touchGrab=0;
let ac=null;function blip(f,d,type){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=type||'square';o.frequency.value=f;g.gain.value=.06;g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d);}catch(e){}}
function start(i){for(const k in evT)delete evT[k];prevMode='ground';bot=null;tapQ=false;li=i;s=S.create(i);screen='play';camX=0;parts=[];trail=[];}
function restart(){attempts++;start(li);}
function burst(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=60+Math.random()*260;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,l:.6,col});}}
function menuAct(){if(screen==='title'){attempts=1;start(sel);}else if(screen==='done'){if(sel===0&&li+1<S.LEVELS.length){attempts=1;start(li+1);}else if(sel===1){attempts=1;start(li);}else{screen='title';sel=Math.min(li+1,S.LEVELS.length-1);}}}
addEventListener('keydown',e=>{const k=e.code;if(keys[k])return;keys[k]=true;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k))e.preventDefault();
 if(screen!=='play'){const n=screen==='title'?S.LEVELS.length:3;
  if(k==='ArrowLeft'||k==='KeyA')sel=(sel+n-1)%n;if(k==='ArrowRight'||k==='KeyD')sel=(sel+1)%n;
  const st=screen==='title'?4:1;if(k==='ArrowUp'||k==='KeyW')sel=(sel+n-st)%n;if(k==='ArrowDown'||k==='KeyS')sel=(sel+st)%n;
  if(k==='Enter'||k==='Space')menuAct();if(k==='Escape')screen='title';return;}
 if(k==='KeyR'){restart();}if((k==='Space'||k==='ArrowUp'||k==='KeyW')&&!e.repeat)tapQ=true;if(k==='Escape'){screen='title';sel=li;}});
addEventListener('keyup',e=>{keys[e.code]=false;});
function tpos(t){const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;return {x:((t.clientX-r.left)*d-ox)/scale,y:((t.clientY-r.top)*d-oy)/scale};}
let menuBoxes=[];
function onDown(pt){if(screen!=='play'){let hit=null;const P=18;for(const b of menuBoxes)if(pt.x>b.x-P&&pt.x<b.x+b.w+P&&pt.y>b.y-P&&pt.y<b.y+b.h+P){hit=b;break;}
  if(hit){if(hit.i!=='start')sel=hit.i;}else if(screen!=='title')return;
  if(screen==='title'){attempts=1;start(sel);}else menuAct();return;}
 if(pt.x>VW-70&&pt.y<60){restart();return;}if(!inPump(pt))tapQ=true;}
const isG=pt=>screen==='play'&&!inPump(pt)&&!(pt.x>VW-70&&pt.y<60);
cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}const pt=tpos(e);pt.g=isG(pt);onDown(pt);ptrs[e.pointerId]=pt;updDir();});
cv.addEventListener('pointermove',e=>{if(ptrs[e.pointerId]){const pt=tpos(e);pt.g=ptrs[e.pointerId].g;ptrs[e.pointerId]=pt;updDir();}});
const ptrs={};
if(!window.PointerEvent){cv.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches){const pt=tpos(t);pt.g=isG(pt);onDown(pt);ptrs[t.identifier]=pt;}updDir();},{passive:false});
 const te=e=>{for(const t of e.changedTouches)delete ptrs[t.identifier];updDir();};cv.addEventListener('touchend',te);cv.addEventListener('touchcancel',te);
 cv.addEventListener('mousedown',e=>{onDown(tpos(e));});addEventListener('mouseup',()=>{});}function up(e){delete ptrs[e.pointerId];updDir();}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function updDir(){touchDir=0;touchGrab=0;for(const k in ptrs){const p=ptrs[k];if(inPump(p))touchDir=p.x<VW/2?-1:1;else if(p.g)touchGrab++;}}
// test hooks
const q=new URLSearchParams(location.search);
window.__swing={art:()=>({ok:ART.ok,loaded:ART.loaded,total:ART.total,failed:ART.failedList,res:ART.res}),boxes:()=>menuBoxes,start,get state(){return s},get screen(){return screen},playBot(i,seq,A,CH){attempts=1;start(i);bot={seq,A,CH};botI=0;},tap(){tapQ=true;},setScreen(x){screen=x}};
let acc=0,last=performance.now();
function tick(now){try{tickInner(now);}catch(e){console.error(e);requestAnimationFrame(tick);}}
function tickInner(now){let dt=Math.min(.05,(now-last)/1000);last=now;if(screen==='play'){acc+=dt;
 while(acc>=S.DT){acc-=S.DT;
  if(bot){const a=bot.A[bot.seq[Math.floor(botI/bot.CH)]]||{grab:false,dir:0};inp.grab=a.grab;botI++;inp.dir=a.dir;}
  else{inp.grab=!!(tapQ||keys.Space||keys.ArrowUp||keys.KeyW||touchGrab);tapQ=false;inp.dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0)||touchDir;}
  if(s.dead){deathT-=S.DT;if(deathT<=0&&!bot)restart();else if(deathT<=0){bot=null;}continue;}
  if(s.done)break;
  S.step(s,inp);
  for(const e of s.ev){evT[e]=s.t;if(e==='grab'){blip(660,.08);burst(s.p.x,s.p.y,C.hi,6);}if(e==='release'){blip(440,.1,'triangle');for(let i=0;i<14;i++)parts.push({x:s.p.x-10,y:s.p.y+(Math.random()-.5)*20,vx:-180-Math.random()*160,vy:(Math.random()-.5)*80,l:.38,col:'#ffffff'});}if(e==='land')blip(220,.06);
   if(e==='die'){blip(110,.3,'sawtooth');burst(s.p.x,s.p.y,C.player,30);deathT=.45;}
   if(e==='done'){blip(880,.15);setTimeout(()=>blip(1320,.25),120);burst(s.p.x,s.p.y,C.hi,50);const t=s.t;if(!best[li]||t<best[li]){best[li]=t;try{localStorage.setItem('swing.best',JSON.stringify(best))}catch(e){}}screen='done';sel=0;doneT=t;}}
  if(prevMode==='air'&&s.p.mode==='ground')evT.land=s.t;prevMode=s.p.mode;if(s.p.mode!=='ground'&&!ART.ok)trail.push({x:s.p.x,y:s.p.y,l:.35});
 }}
 for(const p of parts){p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}parts=parts.filter(p=>p.l>0);
 for(const t of trail)t.l-=dt;trail=trail.filter(t=>t.l>0);
 try{draw();}catch(e){console.error(e);}requestAnimationFrame(tick);}
let doneT=0;const evT={};let prevMode='ground';const ART=window.SwingArt;ART.load(scale);
function rr(x,y,w,h,r,col){cx.fillStyle=col;cx.beginPath();r=Math.max(0,Math.min(r,w/2,h/2));cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath();cx.fill();}
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
 cx.restore();drawHUD();}
function drawHUD(){const L=S.LEVELS[li],p=s.p;
 const prog=Math.min(1,Math.max(0,p.x/L.finish));rr(VW/2-150,16,300,10,5,ART.ok?'rgba(232,241,255,.2)':'rgba(29,53,87,.2)');rr(VW/2-150,16,300*prog,10,5,C.player);
 txt(`Attempt ${attempts}`,20,32,20,C.text,'left');txt(`${L.name}  ${s.t.toFixed(1)}s`,VW/2,50,16);
 rr(VW-62,12,46,40,10,ART.ok?'rgba(232,241,255,.15)':'rgba(29,53,87,.15)');txt('↻',VW-39,42,26);
 if(li===0&&s.t<6&&attempts<3)txt('Press to grab • let go to launch • ←/→ or bottom corners pump',VW/2,VH-24,18);}

// ---------- Chain Bot art rendering ----------
const IM=n=>ART.img[n];
function dimg(n,x,y,w,h){const im=IM(n);cx.drawImage(im,x,y,w,h);}
function drawBG(cam){dimg('sky',0,0,VW,VH);
 for(const [n,f] of [['skyline_far',0.12],['skyline_near',0.3]]){const off=-((cam*f)%VW+VW)%VW;dimg(n,off,0,VW,VH);dimg(n,off+VW,0,VW,VH);}}
const BOT=0.62;
function drawBot(frame,x,y,rot,sc,swing){sc=sc||BOT;cx.save();cx.translate(x,y);cx.rotate(rot||0);
 if(swing)cx.drawImage(IM(frame),-64*sc,-70*sc,128*sc,128*sc);else cx.drawImage(IM(frame),-64*sc,-116*sc,128*sc,128*sc);cx.restore();}
function handWorld(frame,p){const h=ART.hands[frame]||[64,76],a=-p.th,lx=(h[0]-64)*BOT,ly=(h[1]-70)*BOT;
 return {x:p.x+lx*Math.cos(a)-ly*Math.sin(a),y:p.y+lx*Math.sin(a)+ly*Math.cos(a)};}
function chain(x1,y1,x2,y2,glow){const d=Math.hypot(x2-x1,y2-y1),a=Math.atan2(y2-y1,x2-x1),im=IM(glow?'chain_link_glow':'chain_link');
 cx.save();cx.translate(x1,y1);cx.rotate(a);for(let t=0;t<d;t+=12)cx.drawImage(im,t,-8,Math.min(12,d-t),16);cx.restore();}
function drawWorldArt(){const L=S.LEVELS[li],p=s.p,T=s.t;const target=p.x-VW*0.35;camX+=(target-camX)*0.12;if(Math.abs(target-camX)>600)camX=target;
 cx.save();cx.translate(-camX,0);const x0=camX-64,x1=camX+VW+64;
 // ground girders + scaffold legs + props
 for(const g of L.ground){if(g[1]<x0||g[0]>x1)continue;const gy=L.groundY;
  for(let x=g[0];x<g[1];x+=32){const n=x===g[0]?'girder_top_left':(x+32>=g[1]?'girder_top_right':'girder_top_mid');const w=Math.min(32,g[1]-x);
   if(n==='girder_top_right'&&w<32){dimg('girder_top_right',g[1]-32,gy,32,32);}else dimg(n,x,gy,32,32);}
  for(let x=g[0];x<g[1];x+=32)dimg('girder_fill',x,gy+32,Math.min(32,g[1]-x),32);for(let x=g[0]+24;x<g[1]-40;x+=128)for(let y=gy+64;y<VH;y+=32)dimg('scaffold',x,y,32,32);
  for(let x=g[0]+90;x<g[1]-120;x+=260){const sp=L.spikes.some(k=>x+60>k[0]-60&&x<k[1]+60);if(sp)continue;
   if(((x/260)|0)%2)dimg('crate',x,gy-48*0.7,48*0.7,48*0.7);else dimg('scrap_pile',x,gy-48*0.8,64*0.8,48*0.8);}}
 // spikes (pivot bottom-centre, base plate on girder top)
 for(const sp of L.spikes){const gy=L.groundY;const W=sp[1]-sp[0],cw=Math.min(32,W/2);dimg('spike_cap_left',sp[0],gy-24,cw,32);
  for(let x=sp[0]+cw;x<sp[1]-cw;x+=32)dimg('spike_strip',x,gy-24,Math.min(32,sp[1]-cw-x),32);dimg('spike_cap_right',sp[1]-cw,gy-24,cw,32);}
 // moving platforms: 2 blink sprites per 180px platform, collision top y=2
 const pf='platform_0'+(Math.floor(T*6)%4);
 for(const pl of L.plats){const x=S.platX(pl,T),sw=pl.w/90;for(let i=0;i<2;i++)dimg(pf,x+i*pl.w/2-3*sw,pl.y-2*sw,96*sw,24*sw);}
 // finish gate (trigger posts x12-52 at finish)
 {const sc=1.4,gx=L.finish-12*sc;dimg('gate_0'+(Math.floor(T*8)%8),gx,L.groundY-100*sc,64*sc,102*sc);}
 // anchors
 const ni=p.mode!=='swing'?S.nearest(s):-1,AS=0.62;
 L.hooks.forEach((h,i)=>{const q=S.hookPos(h,T),act=i===ni||(p.mode==='swing'&&p.hook===i),fr='_active_0'+(Math.floor(T*10)%3);
  if(i===ni){cx.strokeStyle='rgba(47,224,255,.35)';cx.lineWidth=3;cx.setLineDash([8,8]);cx.beginPath();cx.arc(q.x,q.y,S.GRAB_R,0,6.28);cx.stroke();cx.setLineDash([]);}
  if(h.k==='bar'){const n='pad_anchor'+(act?fr:'_idle');dimg('overhead_beam',q.x-48*AS*1.2,q.y-(53-14)*AS-18*AS*1.2-40,96*AS*1.2,18*AS*1.2);
   cx.fillStyle='#3a4466';cx.fillRect(q.x-2,q.y-(53-14)*AS-40,4,40);dimg(n,q.x-48*AS,q.y-53*AS,96*AS,96*AS);}
  else{const n='ring_magnet'+(act?fr:'_idle'),top=q.y-54*AS;dimg('crane_arm',q.x-108*AS,top-30*AS,124*AS,36*AS);dimg(n,q.x-48*AS,q.y-58*AS,96*AS,96*AS);}
  if(p.mode==='swing'&&p.hook===i)dimg('latch_glow_0'+(Math.floor(T*12)%3),q.x-24,q.y-24,48,48);});
 // player
 const sinceGrab=T-(evT.grab??-9),sinceRel=T-(evT.release??-9),sinceLand=T-(evT.land??-9);
 if(s.dead){const el=0.45-Math.max(0,deathT),k=Math.floor((el-0.12)/0.33*6);dimg(el<0.12?'hit_0'+(el<0.06?0:1):'destroyed_0'+Math.max(0,Math.min(5,k)),p.x-64*BOT,p.y+S.R-116*BOT,128*BOT,128*BOT);}
 else if(p.mode==='swing'){const FC=0.1;const fr=sinceGrab<FC?'fire_chain_0'+Math.min(3,Math.floor(sinceGrab/FC*4)):sinceGrab<FC+0.08?'latch_0'+(sinceGrab<FC+0.04?0:1):'swing_0'+Math.max(0,Math.min(6,Math.round((p.th+1.2)/2.4*6)));
  const q=S.hookPos(L.hooks[p.hook],T),hw=handWorld(fr,p);
  if(sinceGrab<FC){const f=Math.max(0.15,sinceGrab/FC),tx=hw.x+(q.x-hw.x)*f,ty=hw.y+(q.y-hw.y)*f;chain(hw.x,hw.y,tx,ty,false);cx.save();cx.translate(tx,ty);cx.rotate(Math.atan2(q.y-hw.y,q.x-hw.x));cx.drawImage(IM('magnet_head'),-12,-12,24,24);cx.restore();}
  else{chain(hw.x,hw.y,q.x,q.y,true);cx.save();cx.translate(q.x,q.y);cx.rotate(Math.atan2(q.y-hw.y,q.x-hw.x));cx.drawImage(IM('magnet_head_active'),-12,-12,24,24);cx.restore();}
  drawBot(fr,p.x,p.y,-p.th,BOT,true);}
 else if(p.mode==='air'){const fr=sinceRel<0.28?'release_0'+Math.min(3,Math.floor(sinceRel/0.07)):'fall_0'+(Math.floor(T*8)%2);drawBot(fr,p.x,p.y+S.R,0);}
 else{const fr=sinceLand<0.12?'land_0'+(sinceLand<0.06?0:1):'run_0'+(Math.floor(T*14)%6);drawBot(fr,p.x,p.y+S.R,0);}
 for(const pt of parts){cx.globalAlpha=Math.max(0,pt.l/.6);cx.fillStyle=pt.col;cx.fillRect(pt.x-3,pt.y-3,6,6);}cx.globalAlpha=1;
 cx.restore();drawHUD();}
function button(x,y,w,h,label,i,on,ring){if(ring)rr(x-5,y-5,w+10,h+10,18,C.player);rr(x,y,w,h,14,on?C.player:(C.btn||'#fff'));txt(label,x+w/2,y+h/2+8,22,on?'#fff':C.text);menuBoxes.push({x,y,w,h,i});}
function draw(){cx.setTransform(1,0,0,1,0,0);cx.fillStyle=C.sky;cx.fillRect(0,0,cv.width,cv.height);cx.setTransform(scale,0,0,scale,ox,oy);
 cx.save();cx.beginPath();cx.rect(0,0,VW,VH);cx.clip();const gr=cx.createLinearGradient(0,0,0,VH);gr.addColorStop(0,C.sky);gr.addColorStop(1,C.sky2);C=ART.ok?CN:C0;if(ART.ok)drawBG(screen==='title'?performance.now()/30:camX);else{cx.fillStyle=gr;cx.fillRect(0,0,VW,VH);}
 menuBoxes=[];
 if(screen==='title'){if(ART.ok)drawBot('idle_0'+(Math.floor(performance.now()/180)%4),VW/2+330,150,0,0.8,false);txt('SWING',VW/2-130,92,72,C.player);txt('grab • swing • release',VW/2-130,124,18);
  button(VW/2+20,40,250,80,`▶ START`,'start',true);txt(`${sel+1}. ${S.LEVELS[sel].name}`,VW/2+145,140,16,C.text);
  const DC={easy:'#3ec46d',normal:'#2FE0FF',hard:'#ff4d6d'},done=Object.keys(best).length;
  S.LEVELS.forEach((L,i)=>{const c=i%4,rw=(i/4)|0,x=VW/2-430+c*218,y=160+rw*92,w=206,h=80,on=sel===i;
   if(on)rr(x-4,y-4,w+8,h+8,16,C.player);rr(x,y,w,h,12,C.btn||'#fff');rr(x,y,8,h,4,DC[L.diff]||'#888');
   txt(`${i+1}. ${L.name}`,x+18,y+32,19,C.text,'left');txt(L.diff.toUpperCase(),x+18,y+60,13,DC[L.diff],'left');
   if(best[i]){txt('✓ '+best[i].toFixed(1)+'s',x+w-12,y+60,14,'#3ec46d','right');}menuBoxes.push({x,y,w,h,i});});
  txt(`${done}/${S.LEVELS.length} cleared`,VW/2-130,146,14,"#3ec46d");
  txt('Press SPACE/↑/W or screen to grab   •   let go to launch   •   ←/→, A/D or bottom corners = pump   •   R = restart',VW/2,522,14);}
 else{if(ART.ok)drawWorldArt();else drawWorld();if(screen==='done'){cx.fillStyle=ART.ok?'rgba(10,14,28,.72)':'rgba(255,255,255,.75)';cx.fillRect(0,0,VW,VH);txt('Level complete!',VW/2,170,56,C.player);if(ART.ok)drawBot('idle_0'+(Math.floor(performance.now()/180)%4),VW/2,470,0,0.9,false);
  txt(`Time ${doneT.toFixed(2)}s   •   Attempts ${attempts}`,VW/2,225,24);
  const hasNext=li+1<S.LEVELS.length;button(VW/2-330,280,200,70,hasNext?'Next level':'—',0,sel===0);button(VW/2-100,280,200,70,'Replay',1,sel===1);button(VW/2+130,280,200,70,'Menu',2,sel===2);}}
 cx.restore();}
sel=Math.max(0,S.LEVELS.findIndex((_,i)=>!best[i]));if(sel<0)sel=0;
if(q.get('level')){start(+q.get('level')-1);}
requestAnimationFrame(tick);
})();
