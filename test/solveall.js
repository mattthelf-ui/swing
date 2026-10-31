const S=require('../sim.js'),{solve,CH}=require('./solve.js');const out={};
for(let i=0;i<S.LEVELS.length;i++){const t=Date.now(),q=solve(i);console.log(i+1,S.LEVELS[i].name,S.LEVELS[i].diff,q?'SOLVED '+(q.length*CH/120).toFixed(1)+'s':'UNSOLVED',((Date.now()-t)/1000).toFixed(0)+'s cpu');out[i]=q;}
require('fs').writeFileSync(__dirname+'/solutions.json',JSON.stringify(out));
