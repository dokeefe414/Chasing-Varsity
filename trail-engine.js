/* Trail physics and rival decisions. Normalized course metres keep every branch
 * comparable for finish order, ghost samples and quarter splits. */
(function(root){'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV;
const S=typeof module!=='undefined'?require('./season-engine.js'):root.CVSeason;
const R=typeof module!=='undefined'?require('./racecraft-engine.js'):root.CVRacecraft;
const D=typeof module!=='undefined'?require('./raceday-engine.js'):root.CVRaceday;
const courseForks=[['mud','hill'],['mud','mud'],['hill','mud'],['hill','hill'],['mud','hill'],['hill','mud']];
const names=[['Creek bend','Lookout rise'],['Reed beds','Shore crossing'],['Pine ridge','Root hollow'],['First summit','Ridge return'],['Farm crossing','Orchard rise'],['Stadium ridge','Championship creek']];
const routes={mud:{label:'Creek cut',kind:'mud',ratio:.84,cost:.20},hill:{label:'Ridge cut',kind:'hill',ratio:.80,cost:.65},firm:{label:'Dry loop',kind:'flat',ratio:1,cost:0}};
const habits={
 reed:{tell:'EARLY ATTACK',note:'Presses the opening, then recovers. Save energy if covering would empty your tank.'},
 morgan:{tell:'MEASURED RESPONSE',note:'Covers nearby late moves with reserves; otherwise holds steady.'},
 casey:{tell:'HILL ATTACK',note:'Saves before climbs and attacks uphill. Look for a dry alternative.'},
 alex:{tell:'BUILDING SPEED',note:'Builds after halfway when another runner is within reach.'},
 sam:{tell:'FINISHING KICK',note:'Protects reserves for the final 16%. Force a long chase before the finish.'}
};
function enabled(a){return a.trailVersion===14&&!a.practice&&!a.scenario;}
function configure(a){a.trailVersion=14;a.forks.forEach((f,i)=>Object.assign(f,{kind:courseForks[a.index][i],label:names[a.index][i],number:i}));a.runners.forEach(r=>{r.forkChoices={};r.trailMoves=[];});a.routeLog=[];}
const initBefore=R.init;R.init=function(a,s){initBefore(a,s);configure(a);};
function spec(f,choice){return routes[choice==='short'?f.kind||'mud':'firm'];}
function estimate(a,r,f,choice,pace=1){
 const v=spec(f,choice),metres=(f.end-f.start)*E.meets[a.index].distance*v.ratio;
 const weather=a.condition==='rain'?.97+r.stats.strength*.0002:a.condition==='wind'?.94:1;
 const seconds=metres/(S.velocity(r,pace,v.kind)*10*weather);
 const drain=([-1.9,.62,2.7][pace])*(1.15-r.stats.endurance*.006)+(v.kind==='hill'?.35:0)+v.cost+(a.condition==='rain'?.1:a.condition==='wind'?.14:0);
 return{metres,seconds,energy:seconds*drain,remaining:E.clamp(r.energy-seconds*drain,0,100),...v};
}
function decideRoute(a,r,f){const cut=estimate(a,r,f,'short'),dry=estimate(a,r,f,'firm');return cut.remaining>=28&&cut.seconds<dry.seconds?'short':'firm';}
function prepare(a){if(!enabled(a))return;for(const r of a.runners){if(r.finish!==null)continue;for(const f of a.forks){if(r.distance/E.meets[a.index].distance<f.start||r.forkChoices[f.number])continue;const choice=r.player?f.choice:decideRoute(a,r,f);r.forkChoices[f.number]=choice;if(r.player)a.routeLog.push({number:f.number,label:f.label,choice,energy:r.energy,time:a.t});}}}
function route(a,r,progress){if(!enabled(a))return null;const f=a.forks.find(f=>progress>=f.start&&progress<f.end);if(!f)return null;const choice=r.player?f.choice:r.forkChoices[f.number]||decideRoute(a,r,f),v=spec(f,choice);return{kind:v.kind,factor:1/v.ratio,name:choice,energyCost:v.cost};}
function reason(a,r,progress){const h=habits[r.rival];if(!h)return null;const p=a.runners[0],kind=R.route(a,r,progress).kind;
 if(r.rival==='reed'&&progress<.24&&r.dayAttacks<1)return h.tell;
 if(r.rival==='casey'&&kind==='hill'&&r.dayAttacks<2)return h.tell;
 if(r.rival==='sam'&&progress>=.84&&!r.dayKick)return h.tell;
 if(r.rival==='morgan'&&progress>.55&&Math.abs(p.distance-r.distance)<100&&(p.surgeUntil>a.t||p.distance>r.distance+15)&&r.dayAttacks<2)return h.tell;
 if(r.rival==='alex'&&progress>.55&&progress<.88&&a.runners.some(o=>o!==r&&o.finish===null&&o.distance>r.distance&&o.distance-r.distance<110)&&r.dayAttacks<2)return h.tell;
 return null;
}
const decisionBefore=R.day.decision;
function decision(a,r,progress){if(!enabled(a)||!habits[r.rival])return decisionBefore(a,r,progress);
 const kind=R.route(a,r,progress).kind;
 // Revalidate after the warning; do not charge for a cancelled move.
 if(r.intent&&a.t>=r.intentAt){const valid=reason(a,r,progress)===r.intent;
  if(valid&&r.energy>=36&&a.t>=r.surgeReady&&r.surgeUntil<=a.t){r.energy-=8;r.surgeUntil=a.t+(r.rival==='sam'?4:2.8);r.surgeReady=a.t+16;r.attackReady=a.t+18;r.dayAttacks++;if(r.rival==='sam')r.dayKick=true;r.trailMoves.push({at:a.t,move:r.intent});}
  else r.attackReady=a.t+3;r.intent=null;
 }
 const next=reason(a,r,progress);
 if(!r.intent&&next&&r.energy>=44&&a.t>=Math.max(r.attackReady,r.surgeReady)&&r.surgeUntil<=a.t){r.intent=next;r.intentAt=a.t+1.8;}
 if(r.energy<30)return 0;if(r.intent)return 1;
 if(r.rival==='reed')return progress<.22&&r.energy>56?2:r.energy<48?0:1;
 if(r.rival==='morgan')return r.energy<40?0:progress>.88&&r.energy>45?2:1;
 if(r.rival==='casey')return kind==='hill'&&r.energy>45?2:progress<.8&&D.terrain(a,Math.min(.99,progress+.06))==='hill'&&kind!=='hill'&&r.energy<65?0:1;
 if(r.rival==='alex')return progress<.5?1:r.energy>48?2:r.energy<38?0:1;
 return progress<.84?(r.energy<60?0:1):r.energy>30?2:0;
}
R.day.decision=decision;R.course={prepare,route};
const cueBefore=D.cue;D.cue=function(a){const cue=cueBefore(a);if(!enabled(a)||cue.kind!=='fork')return cue;const f=a.forks.find(f=>a.runners[0].distance/E.meets[a.index].distance<f.start);return f?{...cue,help:f.label+': '+spec(f,'short').label+' or dry loop. Choose before the sign.'}:cue;};
function trainingData(s){return s.trailTraining??={best:{},attempts:{}};}
const sanitizeBefore=E.sanitize;E.sanitize=function(raw){const s=sanitizeBefore(raw),d=trainingData(s),saved=raw?.trailTraining;for(const id of ['speed','endurance','strength','ladder','checkpoints','trail'])for(const mode of ['standard','hard']){const k=id+'-'+mode;d.best[k]=Number.isFinite(saved?.best?.[k])?Math.round(E.clamp(saved.best[k],0,100)):0;d.attempts[k]=Number.isFinite(saved?.attempts?.[k])?Math.floor(E.clamp(saved.attempts[k],0,999999)):0;}return s;};
function trainingRecord(a,s,quality){if(a.trailTrainingRecorded)return a.trailTrainingRecorded;const id=a.drill||['speed','endurance','strength'][a.index],hard=a.drillLevel==='expert'||!a.drill&&a.trainingMode==='challenge',d=trainingData(s),key=id+'-'+(hard?'hard':'standard'),old=d.best[key]||0,first=!(d.attempts[key]>0),score=Math.round(E.clamp(quality,0,1)*100);d.best[key]=Math.max(old,score);d.attempts[key]=Math.min(999999,(d.attempts[key]||0)+1);return a.trailTrainingRecorded={id,hard,old,score,first,pb:!first&&score>old};}
const api={courseForks,names,routes,habits,enabled,configure,spec,estimate,decideRoute,prepare,route,reason,decision,trainingData,trainingRecord};if(typeof module!=='undefined')module.exports=api;else root.CVTrail=api;
})(typeof window!=='undefined'?window:globalThis);
