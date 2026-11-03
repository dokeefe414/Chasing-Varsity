/* Journey progression is data-driven and independent of browser rendering. */
(function(root){
'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV;
const S=typeof module!=='undefined'?require('./season-engine.js'):root.CVSeason;
const rivals=[
 {id:'reed',name:'Reed Sparks',title:'The early flyer',color:'#ec725a',hair:'#a9472d',accessory:'band',bias:[9,-4,-5],tactic:'flyer',quote:'Catch me before the first turn.',tip:'Reed spends early. Stay patient and reel him in late.'},
 {id:'morgan',name:'Morgan Vale',title:'The metronome',color:'#559bdb',hair:'#343754',accessory:'cap',bias:[-4,10,-6],tactic:'steady',quote:'The last mile starts with the first.',tip:'Morgan wastes little energy. A controlled late surge is your chance.'},
 {id:'casey',name:'Casey Stone',title:'The hill hunter',color:'#9b75d4',hair:'#5e3829',accessory:'mohawk',bias:[-5,-4,9],tactic:'hill',quote:'That hill? That’s my finish line.',tip:'Casey attacks climbs. Strength training reduces the gap.'},
 {id:'alex',name:'Alex North',title:'The patient threat',color:'#4eb995',hair:'#332d2b',accessory:'band',bias:[1,4,-5],tactic:'negative',quote:'See you in the second half.',tip:'Alex builds speed late. Avoid spending all your energy too soon.'},
 {id:'sam',name:'Sam Dash',title:'The final spark',color:'#d9a43b',hair:'#8c5b32',accessory:'cap',bias:[7,1,-8],tactic:'closer',quote:'Leave the finish to me.',tip:'Sam saves for a strong finish. Keep your kick ready.'}
];
const chapters=[
 {title:'A place on the line',story:'You arrive at Pine Hollow with fresh shoes and something to prove.',rival:'reed',challenge:'Finish with at least 25% energy',goal:'energy'},
 {title:'Find your rhythm',story:'The lakeside field is deeper. Morgan knows every bend.',rival:'morgan',challenge:'Never drop below 18% energy',goal:'control'},
 {title:'Earn the climb',story:'Casey waits beyond the roots. This time the hills decide.',rival:'casey',challenge:'Finish with at least 30% energy',goal:'reserve'},
 {title:'No easy way up',story:'Districts turns teammates into a team. Every place matters.',rival:'alex',challenge:'Use your kick after 90% distance',goal:'latekick'},
 {title:'Make your name',story:'Autumn leaves, a packed field, and Sam at your shoulder.',rival:'sam',challenge:'Finish top three individually',goal:'topthree'},
 {title:'The letter is earned',story:'One final course. All your rivals. Everything you trained for.',rival:'reed',challenge:'Win individually or as a team',goal:'win'}
];
const gear=[
 {id:'classic-shoes',slot:'shoes',name:'Camp trainers',color:'#fff8d4',icon:'👟',achievement:null},
 {id:'trail-shoes',slot:'shoes',name:'Trailblazers',color:'#5de3bc',icon:'👟',achievement:'first_steps'},
 {id:'gold-shoes',slot:'shoes',name:'Golden spikes',color:'#ffcf43',icon:'👟',achievement:'first_gold'},
 {id:'classic-hair',slot:'hair',name:'Camp cut',color:'#654233',icon:'✂',achievement:null},
 {id:'headband',slot:'hair',name:'Focus band',color:'#ef7269',icon:'🎽',achievement:'rhythm'},
 {id:'mohawk',slot:'hair',name:'Trail crest',color:'#654233',icon:'⚡',achievement:'hill_hero'},
 {id:'classic-kit',slot:'kit',name:'Team original',color:null,icon:'🎽',achievement:null},
 {id:'lightning-kit',slot:'kit',name:'Lightning singlet',color:'#8355cb',icon:'⚡',achievement:'rival_sweep'},
 {id:'varsity-kit',slot:'kit',name:'Varsity gold',color:'#e5b73b',icon:'V',achievement:'champion'}
];
const awards=[
 {id:'first_steps',name:'First steps',icon:'👟',description:'Complete one training session.',coins:15},
 {id:'first_gold',name:'First gold',icon:'🥇',description:'Win an individual meet.',coins:35},
 {id:'rhythm',name:'In the zone',icon:'🎯',description:'Reach 95% quality in any training game.',coins:50},
 {id:'hill_hero',name:'Mountain legs',icon:'⛰',description:'Reach 50 strength and beat Casey on Woodland.',coins:60},
 {id:'rival_sweep',name:'A name to remember',icon:'⚡',description:'Beat all five named rivals at least once.',coins:100},
 {id:'team_builder',name:'Better together',icon:'🤝',description:'Recruit two teammates.',coins:40},
 {id:'consistent',name:'Show up again',icon:'📅',description:'Complete ten training sessions.',coins:40},
 {id:'champion',name:'The varsity letter',icon:'V',description:'Win nationals individually or as a team.',coins:150},
 {id:'trail_master',name:'Every mile mastered',icon:'🌟',description:'Earn all 18 chapter stars.',coins:200}
];
const num=(v,d,lo,hi)=>Number.isFinite(v)?E.clamp(v,lo,hi):d;
function fresh(){return{version:1,stars:[0,0,0,0,0,0],earned:[],beaten:[],duels:{},outfit:{shoes:'classic-shoes',hair:'classic-hair',kit:'classic-kit'},tutorial:'welcome',history:[],championships:0};}
function sanitize(raw,legacy){const j=fresh();if(!raw||typeof raw!=='object'){if((legacy?.races||0)+(legacy?.sessions||0)>0)j.tutorial='skipped';return j;}
 j.stars=j.stars.map((_,i)=>Math.floor(num(raw.stars?.[i],0,0,7)));j.earned=awards.filter(a=>Array.isArray(raw.earned)&&raw.earned.includes(a.id)).map(a=>a.id);j.beaten=rivals.filter(r=>Array.isArray(raw.beaten)&&raw.beaten.includes(r.id)).map(r=>r.id);
 for(const r of rivals){const d=raw.duels?.[r.id];if(d&&typeof d==='object')j.duels[r.id]={wins:Math.floor(num(d.wins,0,0,999999)),losses:Math.floor(num(d.losses,0,0,999999))};}
 for(const slot of ['shoes','hair','kit']){const g=gear.find(g=>g.id===raw.outfit?.[slot]&&g.slot===slot);if(g&&(!g.achievement||j.earned.includes(g.achievement)))j.outfit[slot]=g.id;}
 if(['welcome','train','race','done','skipped'].includes(raw.tutorial))j.tutorial=raw.tutorial;
 j.championships=Math.floor(num(raw.championships,0,0,999999));
 j.history=(Array.isArray(raw.history)?raw.history:[]).filter(h=>h&&Number.isInteger(h.course)&&h.course>=0&&h.course<6).slice(-30).map(h=>({course:h.course,mode:h.mode==='team'?'team':'solo',place:Math.floor(num(h.place,6,1,28)),teamPlace:h.mode==='team'?Math.floor(num(h.teamPlace,4,1,4)):null,time:num(h.time,0,0,10000),energy:num(h.energy,0,0,100)}));return j;
}
function ensure(s){if(!s.journey)s.journey=sanitize(null,s);return s.journey;}
const priorSanitize=E.sanitize;E.sanitize=function(raw){const s=priorSanitize(raw);s.journey=sanitize(raw?.journey,s);return s;};
function evaluate(s){const j=ensure(s),d=S.ensure(s),conditions={first_steps:s.sessions>=1,first_gold:Object.values(s.best).includes(1),rhythm:Object.values(d.bestTraining).some(n=>n>=95),hill_hero:s.stats.strength>=50&&Boolean(j.stars[2]&2),rival_sweep:j.beaten.length===5,team_builder:d.hired.length>=2,consistent:s.sessions>=10,champion:s.best[5]===1||d.teamBest[5]===1,trail_master:j.stars.every(n=>n===7)};const added=[];for(const a of awards){if(conditions[a.id]&&!j.earned.includes(a.id)){j.earned.push(a.id);s.coins+=a.coins;added.push(a);}}return added;}
function equip(s,id){const j=ensure(s),g=gear.find(g=>g.id===id);if(!g||(g.achievement&&!j.earned.includes(g.achievement)))return false;j.outfit[g.slot]=g.id;return true;}
function recordRace(s,a){const j=ensure(s),ordered=S.raceOrder(a.runners),p=ordered.find(r=>r.player);if(!p||ordered.some(r=>r.finish===null))throw Error('Record only completed fields');const place=ordered.indexOf(p)+1,teamPlace=a.mode==='team'?S.scoreTeams(ordered).findIndex(t=>t.team===0)+1:null;
 const focus=chapters[a.index].rival,opponent=a.runners.find(r=>r.rival===focus);let mask=0;if(a.mode==='team'?teamPlace<=2:place<=3)mask|=1;if(opponent&&p.finish<opponent.finish)mask|=2;
 const win=a.mode==='team'?teamPlace===1:place===1,goal=chapters[a.index].goal;const challenge=goal==='energy'?p.energy>=25:goal==='control'?(a.minimumEnergy??100)>=18:goal==='reserve'?p.energy>=30:goal==='latekick'?(a.kickAt??0)>=.9:goal==='topthree'?place<=3:win;if(challenge)mask|=4;
 const old=j.stars[a.index],freshBits=mask&~old;j.stars[a.index]|=mask;const newStars=[1,2,4].filter(b=>freshBits&b).length;s.coins+=newStars*30;
 for(const r of a.runners.filter(r=>r.rival)){const duel=j.duels[r.rival]??={wins:0,losses:0};if(p.finish<r.finish){duel.wins++;if(!j.beaten.includes(r.rival))j.beaten.push(r.rival);}else duel.losses++;}
 j.history.push({course:a.index,mode:a.mode,place,teamPlace,time:p.finish,energy:Math.round(p.energy)});j.history=j.history.slice(-30);const champion=a.index===5&&win;if(champion)j.championships++;if(j.tutorial==='race')j.tutorial='done';return{place,teamPlace,newStars,champion,focusWon:!!(mask&2),awards:evaluate(s)};
}
const oldField=S.makeField;S.makeField=function(s,index,mode){const field=oldField(s,index,mode);const selected=mode==='solo'?rivals:[rivals.find(r=>r.id===chapters[index].rival),...rivals.filter(r=>r.id!==chapters[index].rival).slice(0,2)];selected.forEach((r,i)=>{const target=mode==='solo'?field[i+1]:field.find(x=>x.team===i+1);const level=S.courses[index].level;Object.assign(target,{name:r.name,rival:r.id,color:r.color,appearance:{hair:r.accessory,hairColor:r.hair,shoes:r.color},courseIndex:index,stats:{speed:E.clamp(level+r.bias[0],1,100),endurance:E.clamp(level+r.bias[1],1,100),strength:E.clamp(level+r.bias[2],1,100)}});});return field;};
const oldPace=S.aiPace;S.aiPace=function(r,progress){if(!r.rival)return oldPace(r,progress);if(r.energy<24)return 0;const tactic=rivals.find(v=>v.id===r.rival).tactic;if(tactic==='flyer'&&progress<.25&&r.energy>55)return 2;if(tactic==='hill'&&S.segment(r.courseIndex,progress)==='hill'&&r.energy>40)return 2;if(tactic==='negative'&&progress>.65&&r.energy>35)return 2;if(tactic==='closer')return progress>.86&&r.energy>30?2:1;return progress>.82&&r.energy>32?2:1;};
function stars(s){return ensure(s).stars.reduce((sum,mask)=>sum+[1,2,4].filter(b=>mask&b).length,0);}
const api={rivals,chapters,gear,awards,fresh,sanitize,ensure,evaluate,equip,recordRace,stars};if(typeof module!=='undefined')module.exports=api;else root.CVJourney=api;
})(typeof window!=='undefined'?window:globalThis);
