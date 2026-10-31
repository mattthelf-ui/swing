const S=require('../sim.js');for(let li=0;li<S.LEVELS.length;li++){let w=0;const N=2000;for(let n=0;n<N;n++){const s=S.create(li);let g=false,k=0,seed=n*9301+li*7+1;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
while(!s.dead&&!s.done&&k<6000){if(k%8===0)g=r()<.6;S.step(s,{grab:g,dir:0});k++;}if(s.done)w++;}console.log(li+1,S.LEVELS[li].name,S.LEVELS[li].diff,'random wins',w+'/'+N);}
