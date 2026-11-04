/* Race-day rules: bounded deterministic effects, saved partnerships and recorded highlights. */
(function(root){
'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV,S=typeof module!=='undefined'?require('./season-engine.js'):root.CVSeason,R=typeof module!=='undefined'?require('./racecraft-engine.js'):root.CVRacecraft;
const conditions={clear:{name:'Sunlit trail',icon:'☀',note:'Original course. Dry ground and calm air.'},rain:{name:'Rain · creek loop',icon:'☂',note:'Extra mud in the middle half. Strength protects speed; wet ground adds a small energy cost.'},wind:{name:'Wind · ridge loop',icon:'≋',note:'An extra climb and exposed headwind from 35–75%. Draft to shelter; recover on the descent.'}};
const roles={speed:'Finisher',endurance:'Pacer',strength:'Climber'};
function data(raw={}){const bonds={};for(const [id,n] of Object.entries(raw?.bonds||{})){if((/^rookie-[0-3]$/.test(id)||S.recruits.some(r=>r.id===id))&&Number.isFinite(n))bonds[id]=Math.floor(E.clamp(n,0,10));}return{condition:conditions[raw?.condition]?raw.condition:'clear',partner:typeof raw?.partner==='string'&&(S.recruits.some(r=>r.id===raw.partner)||/^rookie-[0-3]$/.test(raw.partner))?raw.partner:null,bonds};}
const prior=E.sanitize;E.sanitize=function(raw){const s=prior(raw);s.raceday=data(raw?.raceday);if(!s.season.roster.some(r=>r.id===s.raceday.partner))s.raceday.partner=null;return s;};
function ensure(s){return s.raceday??=data();}
function specialty(stats){return Object.keys(roles).reduce((a,b)=>stats[b]>stats[a]?b:a,'endurance');}
function calendarCondition(index,tier){return ['clear','rain','wind'][(index+tier)%3];}
function course(index,condition){const parts=S.courses[index].segments.slice();if(condition==='rain'){parts[3]='mud';parts[5]='mud';}if(condition==='wind'){parts[3]='hill';parts[5]='down';}return parts;}
function init(a,s,condition=ensure(s).condition){a.condition=conditions[condition]?condition:'clear';a.courseSegments=course(a.index,a.condition);a.reel=[];a.reelNext=0;a.bondSeconds=0;a.dayRecorded=false;const d=ensure(s);a.partnerId=a.mode==='team'?s.season.roster.findIndex(r=>r.id===d.partner)+1:0;if(a.partnerId<=0)a.partnerId=null;a.bond=d.bonds[d.partner]||0;a.partnerKey=d.partner;a.runners.forEach(r=>{r.specialty=specialty(r.stats);r.intent=null;r.intentAt=0;r.attackReady=3;r.dayKick=false;r.dayAttacks=0;});}
function terrain(a,progress){return (a.courseSegments||S.courses[a.index].segments)[Math.min(7,Math.floor(E.clamp(progress,0,.9999)*8))];}
function decision(a,r,progress){if(a.practice||!a.condition)return null;const kind=terrain(a,progress);let pace=null;if(r.rival){if(r.energy<30)pace=0;else if(progress<.8&&terrain(a,Math.min(.99,progress+.07))==='hill'&&kind!=='hill'&&r.energy<65)pace=0;
 const reason=r.rival==='casey'&&kind==='hill'?'HILL ATTACK':r.rival==='sam'&&progress>.86?'FINISHING KICK':r.rival==='alex'&&progress>.65?'BUILDING SPEED':r.rival==='reed'&&progress<.23?'EARLY ATTACK':r.rival==='morgan'&&progress>.75?'LATE SURGE':null;
 if(r.intent&&a.t>=r.intentAt){if(r.energy>=36&&r.surgeUntil<=a.t){r.energy-=8;r.surgeUntil=a.t+(r.intent==='FINISHING KICK'?4:2.8);r.surgeReady=a.t+16;r.attackReady=a.t+18;r.dayAttacks++;if(r.intent==='FINISHING KICK')r.dayKick=true;}else r.attackReady=a.t+5;r.intent=null;}
 if(!r.intent&&reason&&r.energy>=44&&a.t>=Math.max(r.attackReady,r.surgeReady)&&!(reason==='FINISHING KICK'&&r.dayKick)){r.intent=reason;r.intentAt=a.t+1.5;}
 if(r.intent)pace=1;
 }return pace;}
function effect(a,r,dt,pace,kind,energy){if(a.practice||!a.condition)return 1;let multiplier=1;const progress=r.distance/E.meets[a.index].distance;
 if(a.condition==='rain'&&kind!=='track'){multiplier*=.97+r.stats.strength*.0002;r.energy=E.clamp(r.energy-.10*dt,0,100);}
 if(a.condition==='wind'&&progress>.35&&progress<.75){multiplier*=r.drafting?.99:.94;r.energy=E.clamp(r.energy-(r.drafting?.02:.14)*dt,0,100);}
 if(r.team===0&&!r.player){if(r.specialty==='strength'&&kind==='hill'||r.specialty==='speed'&&progress>.8)multiplier*=1.02;if(r.specialty==='endurance'&&r.energy<energy)r.energy=energy-(energy-r.energy)*.95;}
 const partner=a.runners.find(o=>o.id===a.partnerId),captain=a.runners[0];r.partnerNear=!!partner&&(r.player||r===partner)&&Math.abs(partner.distance-captain.distance)<45&&r.finish===null&&partner.finish===null&&captain.finish===null;
 if(r.partnerNear&&r.energy<energy){r.energy=energy-(energy-r.energy)*(1-(.04+a.bond*.006));if(r.player)a.bondSeconds+=dt;}return multiplier;}
function capture(a){if(a.practice||!a.condition||a.t<a.reelNext)return;const p=a.runners[0];if(p.finish!==null&&a.t>p.finish+1)return;a.reelNext=a.t+.1;a.reel.push({t:a.t,runners:a.runners.map(r=>({id:r.id,d:r.distance,l:r.lane,e:r.energy,finish:r.finish}))});if(a.reel.length>110)a.reel.shift();}
function record(s,a){if(a.practice||a.dayRecorded||!a.condition||a.runners.some(r=>r.finish===null))return false;a.dayRecorded=true;if(a.mode!=='team'||!a.partnerKey||a.bondSeconds<3)return false;const d=ensure(s);d.bonds[a.partnerKey]=Math.min(10,(d.bonds[a.partnerKey]||0)+1);return true;}
function frame(a,t){if(!a.reel?.length)return null;let i=a.reel.findIndex(f=>f.t>=t);if(i<0)i=a.reel.length-1;const b=a.reel[i],p=a.reel[Math.max(0,i-1)],ratio=b.t===p.t?0:E.clamp((t-p.t)/(b.t-p.t),0,1);return b.runners.map((r,j)=>({...r,d:p.runners[j].d+(r.d-p.runners[j].d)*ratio,l:p.runners[j].l+(r.l-p.runners[j].l)*ratio}));}
// One actionable cue at a time; nearby attacks matter more than distant runners.
function cue(a){const p=a.runners[0],progress=p.distance/E.meets[a.index].distance;
 if(a.done||p.finish!==null)return {kind:'finish',title:'FINISH RECORDED',help:a.done?'Your results and replay are ready.':'Watching the rest of the field.'};
 if(a.paused)return {kind:'pause',title:'PAUSED',help:'Resume when you are ready.'};
 if(a.countdown>0)return {kind:'start',title:'ON YOUR MARKS',help:'Start steady. Let the pack spread before passing.'};
 if(p.energy<25)return {kind:'energy',title:'LOW ENERGY · '+Math.round(p.energy)+'%',help:'Ease off now. Fatigue begins below 18%.'};
 const fork=a.forks.find(f=>progress<f.start&&(f.start-progress)*E.meets[a.index].distance<=180);
 if(fork)return {kind:'fork',title:'FORK IN '+Math.ceil((fork.start-progress)*E.meets[a.index].distance)+' m',help:'Choose mud or firm below before the turn.'};
 if(p.blocked){const lane=[0,1,2].find(l=>l!==p.lane&&R.clearLane(a,p,l));return {kind:'boxed',title:'BOXED IN',help:lane===undefined?'Hold or ease until a gap opens. Save your surge.':'Lane '+(lane+1)+' has space. Move before you surge.'};}
 if(progress>=.8&&!a.kickUsed&&a.kick<=0&&p.energy>=20&&p.surgeUntil<=a.t)return {kind:'kick',title:'FINISHING KICK READY',help:'Tap Kick or press K · one use this race.'};
 const rival=a.runners.filter(r=>r.intent&&r.finish===null&&Math.abs(r.distance-p.distance)<120).sort((x,y)=>Math.abs(x.distance-p.distance)-Math.abs(y.distance-p.distance))[0];
 if(rival)return {kind:'rival',title:rival.name+' · '+rival.intent,help:'Attack in '+Math.max(0,rival.intentAt-a.t).toFixed(1)+'s. Protect your energy or cover it.'};
 if(p.drafting)return {kind:'draft',title:'DRAFTING · '+p.draftName,help:'32% less energy drain. Push or surge to leave the pocket.'};
 if(p.partnerNear)return {kind:'partner',title:'PARTNER NEAR',help:'You are both saving energy within 45 metres.'};
 return {kind:'pace',title:'ENERGY '+Math.round(p.energy)+'% · '+['EASE','HOLD','PUSH'][a.pace],help:'Read the gaps. Save a burst for a clear lane.'};
}
function insight(a){const places=a.telemetry.places,notes=[];for(let i=1;i<places.length;i++){const change=places[i-1]-places[i];if(change)notes.push({change,text:`${change>0?'Gained':'Lost'} ${Math.abs(change)} place${Math.abs(change)===1?'':'s'} in quarter ${i+1}${a.telemetry.energy[i]<18?' while low on energy':''}.`});}notes.sort((x,y)=>Math.abs(y.change)-Math.abs(x.change));return notes.length?notes.slice(0,2).map(n=>n.text):['Your position held steady between the recorded quarter splits.'];}
R.day={decision,effect,capture};
const api={course,conditions,roles,data,ensure,specialty,calendarCondition,init,terrain,decision,effect,capture,record,frame,cue,insight};if(typeof module!=='undefined')module.exports=api;else root.CVRaceday=api;
})(typeof window!=='undefined'?window:globalThis);
