const pup=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');const root=path.join(__dirname,'..'),sol=require('./solutions.json'),{A,CH}=require('./solve.js');
const BASE=process.argv[2];let srv;
(async()=>{let url=BASE;if(!url){srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0])==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200);r.end(d);});});await new Promise(r=>srv.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${srv.address().port}/`;}
const b=await pup.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:960,height:540});const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(url,{waitUntil:'load'});await p.evaluate(()=>{localStorage.setItem('swing.best',JSON.stringify({0:7.6,1:7.5,4:5.7}))});await p.reload({waitUntil:'load'});
await p.waitForFunction(()=>window.__swing.art().ok,{timeout:30000});await new Promise(r=>setTimeout(r,300));await p.screenshot({path:root+'/shots/lv-select.png'});
const S=require('../sim.js');
for(let li=0;li<S.LEVELS.length;li++){await p.evaluate((li,seq,A,CH)=>window.__swing.playBot(li,seq,A,CH),li,sol[li],A,CH);
 if({3:'easy',9:'normal',11:'hard'}[li]){await p.waitForFunction(()=>window.__swing.state.p.mode==='swing'&&window.__swing.state.t>2,{timeout:20000});await p.screenshot({path:root+`/shots/lv-${{3:'easy',9:'normal',11:'hard'}[li]}.png`});}
 await p.waitForFunction(()=>window.__swing.screen==='done',{timeout:30000}).then(()=>console.log('PASS browser bot',li+1,S.LEVELS[li].name),()=>console.log('FAIL browser bot',li+1));}
console.log(errs.length?'ERRORS '+errs.join('|'):'PASS no console errors');await b.close();srv&&srv.close();})();
