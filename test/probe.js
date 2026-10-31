const pup=require('puppeteer-core'),sol=require('./solutions.json'),{A,CH}=require('./solve.js');const URL=process.argv[2]||'file:///workspace/swing/index.html';
(async()=>{const b=await pup.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();await p.setViewport({width:960,height:540,deviceScaleFactor:1,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push('PE '+e));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const W=ms=>new Promise(r=>setTimeout(r,ms));
// corrupt storage
await p.goto(URL);await p.evaluate(()=>localStorage.setItem('swing.best','null'));await p.reload();await W(600);console.log('corrupt-null storage screen:',await p.evaluate(()=>window.__swing.screen),'errs',errs.length);
await p.evaluate(()=>localStorage.setItem('swing.best','{bad'));await p.reload();await W(600);console.log('corrupt-json storage errs',errs.length,errs.join(' | '));
await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForFunction(()=>window.__swing.art().ok);
// combo HUD
await p.evaluate((seq,A,CH)=>window.__swing.playBot(4,seq,A,CH),sol[4],A,CH);await p.waitForFunction(()=>window.__swing.state.combo>1.3,{timeout:20000});await W(150);await p.screenshot({path:'/workspace/swing/shots/dbg-combo.png'});
await p.waitForFunction(()=>window.__swing.state.combo>=1.74,{timeout:20000}).catch(()=>{});await W(50);await p.screenshot({path:'/workspace/swing/shots/dbg-combo-cap.png'});
// grab frame
await p.evaluate(()=>window.__swing.start(0));await p.waitForFunction(()=>window.__swing.state.p.x>760);await p.keyboard.down('Space');await W(35);await p.screenshot({path:'/workspace/swing/shots/dbg-grab.png'});await p.keyboard.up('Space');
// resize mid-game + portrait
await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});await W(300);await p.screenshot({path:'/workspace/swing/shots/dbg-portrait.png'});
await p.setViewport({width:844,height:390,deviceScaleFactor:3,isMobile:true,hasTouch:true});await W(300);await p.screenshot({path:'/workspace/swing/shots/dbg-landscape.png'});
// restart spam, death during done, R on done
for(let i=0;i<20;i++){await p.keyboard.press('KeyR');}await W(100);console.log('after R spam attempts:',await p.evaluate(()=>window.__swing.state.t.toFixed(2)));
await p.evaluate(()=>{window.__swing.state.done=true;window.__swing.setScreen('done')});await W(100);await p.keyboard.press('KeyR');await p.keyboard.press('Escape');await W(100);console.log('done+R+Esc ->',await p.evaluate(()=>window.__swing.screen));
// finish last level -> Next
await p.evaluate(()=>{window.__swing.start(11);window.__swing.state.done=true;window.__swing.setScreen('done')});await W(100);await p.keyboard.press('Enter');await W(100);console.log('last level done + Enter(Next) ->',await p.evaluate(()=>window.__swing.screen));
// hidden tab
await p.evaluate(()=>window.__swing.start(0));await W(200);
console.log('AudioContext state:',await p.evaluate(()=>{try{return typeof AudioContext}catch(e){return 'x'}}));
console.log(errs.length?'ERRORS:\n'+errs.join('\n'):'no console errors');await b.close();})();
