/* Adventure goals and training patterns. Pure rules shared by UI and tests. */
(function(root){
'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV;
const S=typeof module!=='undefined'?require('./season-engine.js'):root.CVSeason;
const keys=['speed','endurance','strength'];
const scenarios=[
 {id:'breakaway',name:'Catch the breakaway',index:0,mode:'solo',goal:'Beat the leader over the final 800 m.',tip:'Use the draft to close, find a clear lane, then time your surge and kick.',reward:'Creek crossing course variation'},
 {id:'climb',name:'Through the field',index:3,mode:'solo',goal:'Finish in the top three after starting last on the ridge.',tip:'Save energy on the climb. Pass before the final straight.',reward:'Sunset ridge course variation'},
 {id:'team',name:'Every place matters',index:0,mode:'team',goal:'Win the team score over the final 800 m.',tip:'Your team starts narrowly ahead. Pick a team plan and fight for places.',reward:'Trail captain teal singlet'}
];
function fresh(){return{trainingMode:'standard',mastery:{speed:0,endurance:0,strength:0},completed:[],variant:'classic',kit:false};}
function sanitize(raw){const d=fresh();if(!raw||typeof raw!=='object')return d;for(const k of keys)d.mastery[k]=Number.isFinite(raw.mastery?.[k])?Math.round(E.clamp(raw.mastery[k],0,100)):0;d.completed=scenarios.filter(s=>Array.isArray(raw.completed)&&raw.completed.includes(s.id)).map(s=>s.id);d.trainingMode=raw.trainingMode==='challenge'&&keys.some(k=>d.mastery[k]>=70)?'challenge':'standard';d.variant=['creek','sunset'].includes(raw.variant)&&d.completed.includes(raw.variant==='creek'?'breakaway':'climb')?raw.variant:'classic';d.kit=raw.kit===true&&d.completed.includes('team');return d;}
function ensure(s){if(!s.adventure){s.adventure=fresh();for(const k of keys)s.adventure.mastery[k]=S.ensure(s).bestTraining[k];}return s.adventure;}
const before=E.sanitize;E.sanitize=function(raw){const s=before(raw);if(raw?.adventure)s.adventure=sanitize(raw.adventure);else ensure(s);return s;};
function unlocked(s){return keys.some(k=>ensure(s).mastery[k]>=70);}
function profile(a){const hard=a.trainingMode==='challenge',phase=Math.floor(a.t/5)%4;const duration=Math.max(hard?.66:.78,(hard?1.08:1.32)-a.t*.018)+(a.beat%4===3?.14:0);const width=(hard?.21:.29)-Math.min(a.t,20)*.002;return{duration,width,zone:a.index===0?.5+Math.sin(a.beat*1.7)*.2:.5+Math.sin(a.t*(hard?.85:.6))*.20+Math.sin(a.t*1.5)*.035,speed:(hard?370:315)+a.t*6,gap:[1.65,1.25,1.8,1.4][phase]*(hard?.85:1),phase:['FIND YOUR RHYTHM','QUICK STEPS','STAY PRECISE','FINISH STRONG'][phase]};}
function trainingResult(s,a,quality){const d=ensure(s),key=keys[a.index],q=E.clamp(quality,0,1),old=d.mastery[key];d.mastery[key]=Math.max(old,Math.round(q*100));const comboBonus=Math.min(10,Math.floor(a.maxCombo/3)*2),hardBonus=a.trainingMode==='challenge'&&q>=.65?8:0;const bonus=comboBonus+hardBonus;s.coins+=bonus;return{bonus,unlocked:old<70&&d.mastery[key]>=70};}
function recordScenario(s,a){if(!a.scenario||a.scenarioRecorded||a.runners.some(r=>r.finish===null))return null;a.scenarioRecorded=true;const spec=scenarios.find(v=>v.id===a.scenario);if(!spec)return null;const ordered=S.raceOrder(a.runners),place=ordered.findIndex(r=>r.player)+1,teamPlace=a.mode==='team'?S.scoreTeams(ordered).findIndex(t=>t.team===0)+1:null,won=a.scenario==='team'?teamPlace===1:place<=(a.scenario==='climb'?3:1),d=ensure(s),first=won&&!d.completed.includes(a.scenario);if(first){d.completed.push(a.scenario);s.coins+=50;}return{won,first,place,teamPlace};}
function variation(s,index){const v=ensure(s).variant;return v==='creek'&&index===1?'creek':v==='sunset'&&index===3?'sunset':'classic';}
function applyVariation(a,s){a.variant=variation(s,a.index);if(a.variant==='classic')return;a.courseSegments=a.courseSegments.slice();if(a.variant==='creek'){a.courseSegments[1]='mud';a.courseSegments[4]='mud';}else{a.courseSegments[2]='down';a.courseSegments[5]='hill';}}
const api={keys,scenarios,fresh,sanitize,ensure,unlocked,profile,trainingResult,recordScenario,variation,applyVariation};if(typeof module!=='undefined')module.exports=api;else root.CVAdventure=api;
})(typeof window!=='undefined'?window:globalThis);
