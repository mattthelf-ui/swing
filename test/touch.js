const pup=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
let URL=process.argv[2];let srv;
(async()=>{if(!URL){const root=path.join(__dirname,'..');srv=http.createServer((q,r)=>{const f=path.join(root,q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html':'text/javascript'});r.end(d);});});await new Promise(r=>srv.listen(0,'127.0.0.1',r));URL=`http://127.0.0.1:${srv.address().port}/`;}
const b=await pup.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});let fails=0;
const tap=async(p,mode,X,Y,w,h)=>{const s=Math.min(w/960,h/540),x=(w-960*s)/2+X*s,y=(h-540*s)/2+Y*s;
 if(mode==='click')await p.mouse.click(x,y);else{const c=await p.target().createCDPSession();await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}await new Promise(r=>setTimeout(r,250));};
for(const noRR of [false,true])for(const [w,h,d,mob] of [[960,540,1,false],[844,390,3,true],[390,844,3,true],[740,360,2,true]])for(const mode of ['click','touch']){
 const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 if(noRR)await p.evaluateOnNewDocument(()=>{delete CanvasRenderingContext2D.prototype.roundRect;});
 await p.setViewport({width:w,height:h,deviceScaleFactor:d,isMobile:mob,hasTouch:mob||mode==='touch'});
 await p.goto(URL+'?nc='+Date.now(),{waitUntil:'load',timeout:60000});await p.evaluate(()=>localStorage.clear());await new Promise(r=>setTimeout(r,400));
 await p.waitForFunction(()=>window.__swing.art().ok||window.__swing.art().failed.length,{timeout:30000}).catch(()=>{});const art=await p.evaluate(()=>window.__swing.art());if(!art.ok||art.failed.length)errs.push('art '+JSON.stringify(art.failed)+' res'+art.res);const r=[];const sc=()=>p.evaluate(()=>window.__swing.screen),W=ms=>new Promise(r=>setTimeout(r,ms));
 await tap(p,mode,480,270,w,h);r.push(await p.evaluate(()=>window.__swing.screen+':'+window.__swing.state.li));// title START
 await p.evaluate(()=>{window.__swing.state.done=true;window.__swing.setScreen('done')});await W(100);await tap(p,mode,510,315,w,h);r.push(await sc());// replay
 await p.evaluate(()=>window.__swing.setScreen('done'));await W(100);await tap(p,mode,710,315,w,h);r.push(await sc());// menu -> title
 await W(100);await tap(p,mode,480,410,w,h);r.push(await sc());// LEVELS opens grid (must not start)
 await W(100);await tap(p,mode,371,153,w,h);r.push(await p.evaluate(()=>window.__swing.screen+':'+window.__swing.state.li));// pick level 2
 await p.evaluate(()=>window.__swing.setScreen('levels'));await W(100);await tap(p,mode,90,46,w,h);r.push(await sc());// Back
 await W(100);await tap(p,mode,100,300,w,h);r.push(await sc());// tap anywhere on title
 const ok=r.join()===['play:0','play','title','levels','play:1','title','play'].join()&&!errs.length;if(!ok)fails++;
 console.log(ok?'PASS':'FAIL',`art@${art.res}x `+`${noRR?'no-roundRect ':''}${w}x${h}@${d} ${mode}:`,r.join(' '),errs.join('|'));await p.close();}
await b.close();srv&&srv.close();console.log(fails?fails+' FAILED':'ALL PASS');})();
