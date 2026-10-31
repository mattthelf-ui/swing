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
const M=()=>p.evaluate(()=>window.__swing.state.p.mode),W=ms=>new Promise(r=>setTimeout(r,ms));
await p.evaluate(()=>window.__swing.start(0));await p.waitForFunction(()=>window.__swing.state.p.x>690,{timeout:5000});
await p.keyboard.down('Space');await W(40);console.log('Space down ->',await M());await W(500);console.log('Space still held ->',await M());
await p.keyboard.up('Space');await W(30);console.log('Space up ->',await M());
// hold while falling catches
await p.evaluate(()=>window.__swing.start(0));await p.waitForFunction(()=>window.__swing.state.p.x>560,{timeout:5000});
await p.keyboard.down('Space');await W(20);const early=await M();await p.waitForFunction(()=>window.__swing.state.p.mode==='swing',{timeout:2000}).catch(()=>{});console.log('early press held: before',early,'-> later',await M());await p.keyboard.up('Space');
const c=await p.target().createCDPSession();const TS=(x,y)=>c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]}),TE=()=>c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await p.evaluate(()=>window.__swing.start(0));await p.waitForFunction(()=>window.__swing.state.p.x>690,{timeout:5000});
await TS(900,500);await W(250);console.log('corner hold (expect not swing):',await M());await TE();
await p.evaluate(()=>window.__swing.start(0));await p.waitForFunction(()=>window.__swing.state.p.x>690,{timeout:5000});
await TS(480,200);await W(40);console.log('touch down ->',await M());await W(400);console.log('touch held ->',await M());await TE();await W(30);console.log('touch up ->',await M());
console.log(errs.length?'CONSOLE ERRORS: '+errs.join('|'):'PASS no console errors');await b.close();srv.close();})();
