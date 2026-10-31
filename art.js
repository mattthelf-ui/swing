// Chain Bot art layer (Vex sprites). Falls back to shapes in main.js if any image fails.
(function(){
const HANDS={"idle_00": [65.0, 75.8], "idle_01": [64.4, 75.9], "idle_02": [64.4, 75.9], "idle_03": [65.0, 75.8], "run_00": [62.9, 72.7], "run_01": [72.4, 74.1], "run_02": [81.8, 71.4], "run_03": [81.8, 72.4], "run_04": [72.4, 75.1], "run_05": [62.9, 72.7], "jump_00": [61.4, 81.5], "jump_01": [81.7, 56.4], "jump_02": [84.0, 42.3], "fire_chain_00": [40.3, 56.9], "fire_chain_01": [83.3, 41.7], "fire_chain_02": [84.2, 41.7], "fire_chain_03": [84.2, 41.7], "latch_00": [66.9, 25.2], "latch_01": [62.6, 24.8], "swing_00": [83.2, 32.3], "swing_01": [76.9, 29.7], "swing_02": [70.5, 27.9], "swing_03": [64.0, 27.0], "swing_04": [57.4, 26.9], "swing_05": [50.8, 27.7], "swing_06": [44.2, 29.3], "release_00": [81.7, 32.2], "release_01": [87.2, 41.6], "release_02": [86.8, 53.8], "release_03": [80.0, 65.2], "fall_00": [82.1, 37.4], "fall_01": [82.9, 39.6], "land_00": [78.1, 77.4], "land_01": [70.3, 76.9], "hit_00": [41.3, 71.6], "hit_01": [53.3, 74.9], "destroyed_00": [44.1, 64.3], "destroyed_01": [44.2, 68.7], "destroyed_02": [44.6, 73.4], "destroyed_03": [45.5, 78.5], "destroyed_04": [50.5, 98.9], "destroyed_05": [53.3, 98.9]};
const LIST={'chain-bot':[],'anchors':[],'chain-pieces':['chain_link','chain_link_glow','magnet_head','magnet_head_active','latch_glow_00','latch_glow_01','latch_glow_02'],
 'scrapyard-level':['crane_arm','crate','girder_fill','girder_top_left','girder_top_mid','girder_top_right','overhead_beam','scaffold','scrap_pile'],
 'scrapyard-bg':['sky','skyline_far','skyline_near'],'hazards':['spike_cap_left','spike_cap_right','spike_strip'],
 'moving-platform':['platform_00','platform_01','platform_02','platform_03'],'finish-gate':[0,1,2,3,4,5,6,7].map(i=>'gate_0'+i)};
const anim={idle:4,run:6,fire_chain:4,latch:2,swing:7,release:4,fall:2,land:2,hit:2,destroyed:6};
for(const a in anim)for(let i=0;i<anim[a];i++)LIST['chain-bot'].push(a+'_0'+i);
for(const k of ['ring_magnet','pad_anchor']){LIST.anchors.push(k+'_idle');for(let i=0;i<3;i++)LIST.anchors.push(k+'_active_0'+i);}
const A={ok:false,failed:0,loaded:0,total:0,img:{},hands:HANDS,anim,failedList:[]};
A.load=function(scaleHint){const k=scaleHint>=2.2?3:scaleHint>=1.3?2:1,suf=k===1?'':'@'+k+'x';A.res=k;
 for(const d in LIST)for(const n of LIST[d]){A.total++;const im=new Image();im.onload=()=>{A.loaded++;if(A.loaded===A.total&&!A.failed)A.ok=true;};
  im.onerror=()=>{A.failed++;A.failedList.push(d+'/'+n);};im.src=`art/${d}/${n}${suf}.png?v=2b9b3e8`;A.img[n]=im;}};
window.SwingArt=A;})();
