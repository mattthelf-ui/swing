const S=require('../sim.js');const clone=o=>structuredClone(o);
const A=[{tap:false,dir:0},{tap:true,dir:0},{tap:false,dir:1},{tap:false,dir:-1}],CH=8;
const act=(a,k)=>({tap:a.tap&&k===0,dir:a.dir});
function solve(li){let beam=[{s:S.create(li),seq:[]}];
 for(let d=0;d<400;d++){const nx=[];
  for(const b of beam)for(let a=0;a<4;a++){const s=clone(b.s);for(let k=0;k<CH;k++)S.step(s,act(A[a],k));
   if(s.dead)continue;const seq=b.seq.concat(a);if(s.done)return seq;nx.push({s,seq,sc:s.p.x+Math.random()*30});}
  if(!nx.length){console.log("stuck depth",d,"bestx",Math.round(Math.max(...beam.map(b=>b.s.p.x))));return null;}nx.sort((a,b)=>b.sc-a.sc);beam=[];const seen=new Set();
  for(const n of nx){const key=[n.s.p.mode,n.s.p.hook,Math.round(n.s.p.x/12),Math.round(n.s.p.y/12),Math.round(n.s.p.w*4),n.s.buf>0,Math.round(n.s.p.vy/60)].join();if(seen.has(key))continue;seen.add(key);beam.push(n);if(beam.length>=500)break;}}
console.log("depth out bestx",Math.round(Math.max(...beam.map(b=>b.s.p.x)))); return null;}
module.exports={solve,A,CH,act};
if(require.main===module){const out={};for(let i=0;i<S.LEVELS.length;i++){const q=solve(i);console.log('level',i+1,q?'SOLVED in '+(q.length*CH/120).toFixed(1)+'s':'UNSOLVED');out[i]=q;}
require('fs').writeFileSync(__dirname+'/solutions.json',JSON.stringify(out));}
