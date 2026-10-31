const pup=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),sol=require('./solutions.json'),{A,CH}=require('./solve.js');const BASE=process.argv[2];
const srv=http.createServer((q,r)=>{const f=path.join(root,q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html':'text/javascript'});r.end(d);});}).listen(0,'127.0.0.1');
(async()=>{const b=await pup.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:960,height:540});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
await p.goto(BASE||('http://127.0.0.1:'+srv.address().port+'/'));await new Promise(r=>setTimeout(r,500));await p.screenshot({path:root+'/shots/title.png'});
for(const li of [0,1]){await p.evaluate((li,seq,A,CH)=>window.__swing.playBot(li,seq,A,CH),li,sol[li],A,CH);
 await new Promise(r=>setTimeout(r,2600));await p.screenshot({path:root+`/shots/level${li+1}-swing.png`});
 await p.waitForFunction(()=>window.__swing.screen==='done',{timeout:20000});await new Promise(r=>setTimeout(r,400));
 await p.screenshot({path:root+`/shots/level${li+1}-complete.png`});console.log('PASS level',li+1,'bot completed in browser');}
// death + restart via real keys
await p.evaluate(()=>window.__swing.start(0));await new Promise(r=>setTimeout(r,4000));
const st=await p.evaluate(()=>({x:window.__swing.state.p.x,t:window.__swing.state.t}));console.log(st.x<700&&st.t<2?'PASS died in pit and auto-restarted':'FAIL restart',JSON.stringify(st));
await p.waitForFunction(()=>window.__swing.state.p.x>690,{timeout:5000});await p.keyboard.press('Space');const m=await p.waitForFunction(()=>window.__swing.state.p.mode==='swing',{timeout:4000}).then(()=>'swing',()=>'no swing');await new Promise(r=>setTimeout(r,300));console.log('mode after Space tap:',m);await p.screenshot({path:root+'/shots/level1-grab.png'});await new Promise(r=>setTimeout(r,600));console.log('still swinging after key up (no hold needed):',await p.evaluate(()=>window.__swing.state.p.mode));
await p.keyboard.press('Space');await new Promise(r=>setTimeout(r,30));console.log('after 2nd tap:',await p.evaluate(()=>window.__swing.state.p.mode));
// touch: tap center grabs, corner does not toggle
const c=await p.target().createCDPSession();const T=async(x,y)=>{await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
await p.evaluate(()=>window.__swing.start(0));await p.waitForFunction(()=>window.__swing.state.p.x>690,{timeout:5000});
await T(900,500);await new Promise(r=>setTimeout(r,250));console.log('corner tap mode (expect not swing):',await p.evaluate(()=>window.__swing.state.p.mode+' '+(window.__swing.state.dead?'dead':'')));
await p.evaluate(()=>window.__swing.start(0));await p.waitForFunction(()=>window.__swing.state.p.x>690,{timeout:5000});
await T(480,200);await new Promise(r=>setTimeout(r,40));console.log('touch tap 1:',await p.evaluate(()=>window.__swing.state.p.mode));await new Promise(r=>setTimeout(r,300));
await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:900,y:500}]});await new Promise(r=>setTimeout(r,300));console.log('corner pump while swinging keeps swing:',await p.evaluate(()=>window.__swing.state.p.mode));await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await T(480,200);await new Promise(r=>setTimeout(r,40));console.log('touch tap 2:',await p.evaluate(()=>window.__swing.state.p.mode));
console.log(errs.length?'CONSOLE ERRORS: '+errs.join('|'):'PASS no console errors');await b.close();srv.close();})();
