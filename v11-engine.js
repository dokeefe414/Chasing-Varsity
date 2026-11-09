/* Chasing Varsity v1.1: additive presentation decisions and bounded training assists. */
(function(root){'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV;
const V=typeof module!=='undefined'?require('./varsity-engine.js'):root.CVVarsity;
const R=typeof module!=='undefined'?require('./racecraft-engine.js'):root.CVRacecraft;
const STYLES=['classic','stripe','chevron'];
function ensure(s){
 const old=s.v11&&typeof s.v11==='object'?s.v11:{};
 const jersey=STYLES.includes(old.jersey)?old.jersey:'classic';
 return s.v11={jersey};
}
function sanitize(raw){return {jersey:STYLES.includes(raw?.jersey)?raw.jersey:'classic'};}
function switchJersey(s,style){if(!STYLES.includes(style))return false;ensure(s).jersey=style;return true;}
function lineup(s){const active=V.selected(s),ids=new Set(active.map(r=>r.id)),roster=s.season.roster;return [{id:'captain',name:s.name,stats:s.stats,active:true,captain:true},...roster.map(r=>({...r,active:ids.has(r.id),captain:false}))];}
function assist(a,base){
 if(!a||a.drill||a.trainingMode==='challenge'||a.type!=='training')return base;
 const misses=Math.max(0,Math.min(7,a.v11MissStreak||0));
 if(misses<3)return base;
 const easing=Math.min(4,misses-2);
 return {...base,width:Math.min(.35,base.width+easing*.012),gap:base.gap+easing*.035};
}
function workoutProgress(a){
 if(!a||a.type!=='training')return null;
 let count=0,goal=0,label='',unit='',quality=0,tip='';
 if(a.drill==='ladder'){count=a.drillHits||0;goal=12;label='Beats on target';unit='hits';quality=count/18;tip='Watch the approaching beat; hit as it reaches the gold zone.';}
 else if(a.drill==='checkpoints'){count=a.drillHits||0;goal=4;label='Checkpoints banked';unit='banks';quality=count/6;tip='Hold to raise effort. Release to settle in the green window.';}
 else if(a.drill==='trail'){count=Math.floor(a.drillDistance||0);goal=1000;label='Trail distance';unit='m';quality=a.drillQuality||0;tip='Jump ahead of obstacles. Clean landings keep your speed.';}
 else if(a.index===0){count=Math.round(100*(a.score||0)/Math.max(1,a.possible||0));goal=70;label='Accuracy this session';unit='%';quality=count/100;tip='Aim near the center of gold for a perfect stride.';}
 else if(a.index===1){count=Math.round(100*(a.cleanTime||0)/20);goal=70;label='Time in rhythm';unit='%';quality=count/100;tip='Make small holds and releases to follow the green zone.';}
 else {count=Math.round(100*(a.score||0)/Math.max(1,a.attempts||0));goal=70;label='Clean obstacle rate';unit='%';quality=count/100;tip='Jump before the log reaches your runner.';}
 return {count,goal,label,unit,quality:Math.max(0,Math.min(1,quality)),progress:Math.max(0,Math.min(100,100*count/goal)),remaining:Math.max(0,20-(a.t||0)),tip};
}
function raceOpportunity(a){
 if(!a||a.type!=='race'||!a.runners?.length)return null;
 const p=a.runners[0],raceLength=E.meets[a.index].distance,progress=p.distance/raceLength;
 if(a.done||p.finish!==null)return {tone:'finish',title:'Finish recorded',detail:'Your result is ready below.'};
 if(a.paused||a.countdown>0)return {tone:'calm',title:'Prepare your move',detail:'Keep an eye on lane openings when the pack starts.'};
 const others=a.runners.filter(r=>r!==p&&r.finish===null);
 const nearbyAttack=others.filter(r=>r.intent&&Math.abs(r.distance-p.distance)<=120)
   .sort((x,y)=>Math.abs(x.distance-p.distance)-Math.abs(y.distance-p.distance))[0];
 if(nearbyAttack)return {tone:'danger',title:nearbyAttack.name+' is attacking!',detail:'Cover the move or save energy for the finish. '+Math.max(0,nearbyAttack.intentAt-a.t).toFixed(1)+'s until the surge.'};
 const ahead=others.filter(r=>r.distance>p.distance&&r.distance-p.distance<=65)
   .sort((x,y)=>x.distance-y.distance)[0];
 const open=[0,1,2].filter(l=>l!==p.lane&&R.clearLane(a,p,l)&&a.t>=p.laneReady&&p.energy>=1.2*Math.abs(l-p.lane));
 if(progress>=.90){
   const nearest=others.sort((x,y)=>Math.abs(x.distance-p.distance)-Math.abs(y.distance-p.distance))[0];
   const gap=nearest?Math.abs(nearest.distance-p.distance):null;
   return {tone:'final',title:gap!==null&&gap<30?'Photo finish territory!':'The final stretch',detail:gap!==null&&gap<30?'A rival is '+Math.round(gap)+'m away. Make your final move now.':'Commit to your finishing kick if you have energy.'};
 }
 if(ahead&&ahead.lane===p.lane){
   return open.length?{tone:'opportunity',title:'Passing gap: lane '+(open[0]+1),detail:ahead.name+' is '+Math.round(ahead.distance-p.distance)+'m ahead. Change lanes, then surge past.'}:
   {tone:'danger',title:'Boxed behind '+ahead.name,detail:'Only '+Math.round(ahead.distance-p.distance)+'m ahead. Hold pace until a lane opens.'};
 }
 if(ahead&&open.length)return {tone:'opportunity',title:'Room to overtake',detail:ahead.name+' is '+Math.round(ahead.distance-p.distance)+'m ahead. Lane '+(open[0]+1)+' is clear.'};
 return {tone:'calm',title:'Run your race',detail:p.drafting?'You are drafting. Save energy before your next move.':'Watch the runner ahead and build energy for a clean pass.'};
}
function closeFinish(a){
 if(!a?.runners||a.type!=='race')return null;
 const p=a.runners[0];if(!Number.isFinite(p.finish))return null;
 const rivals=a.runners.filter(r=>r!==p&&(a.mode!=='team'||r.team!==p.team)&&Number.isFinite(r.finish))
   .sort((x,y)=>Math.abs(x.finish-p.finish)-Math.abs(y.finish-p.finish));
 if(!rivals.length)return null;
 const r=rivals[0],margin=Math.abs(r.finish-p.finish);
 if(margin>1.5)return null;
 return {name:r.name,margin,beat:p.finish<r.finish,photo:margin<=.65};
}
function debrief(before,after,quality){
 const keys=['speed','endurance','strength'],changes=keys.map(k=>({key:k,amount:Math.round((after[k]||0)-(before[k]||0))}));
 const gained=changes.filter(x=>x.amount>0);
 const cue=quality>=.8?'Great consistency. Try Challenge training or race with your new fitness.':quality>=.55?'Solid work. Repeat this drill for a better combo and more improvement.':'Focus on accuracy over speed. Slower, clean actions build more quality.';
 return {gained,tip:cue};
}
const beforeSanitize=E.sanitize;
E.sanitize=function(raw){const s=beforeSanitize(raw);s.v11=sanitize(raw?.v11);return s;};
const api={STYLES,ensure,sanitize,switchJersey,lineup,assist,workoutProgress,raceOpportunity,closeFinish,debrief};
if(typeof module!=='undefined')module.exports=api;else root.CVEleven=api;
})(typeof window!=='undefined'?window:globalThis);
