/* Season standings, replay ghosts and portable saves; no browser dependencies. */
(function(root){
'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV;
const S=typeof module!=='undefined'?require('./season-engine.js'):root.CVSeason;
const tiers=[{name:'Varsity season',boost:0,levels:[12,22,34,47,62,78],color:'#edb34c'},{name:'Elite circuit',boost:5,levels:[82,84,86,88,90,93],color:'#71dce7'},{name:'Legends tour',boost:10,levels:[92,93,94,96,97,98],color:'#cc8ef0'}];
const points=[10,7,4,2];
const validOrder=a=>Array.isArray(a)&&a.length===4&&new Set(a).size===4&&a.every(n=>Number.isInteger(n)&&n>=0&&n<4);
function fresh(){return{tier:0,seasons:[[],[],[]],medals:[],ribbon:null,ghostEnabled:true,ghosts:{},practiceDone:false};}
function sanitize(raw){const c=fresh();if(!raw||typeof raw!=='object')return c;
 c.seasons=c.seasons.map((_,tier)=>Array.from({length:6},(_,i)=>{const r=raw.seasons?.[tier]?.[i];if(!r||!validOrder(r.order)||!Array.isArray(r.scores)||r.scores.length!==4||!r.scores.every(n=>Number.isFinite(n)&&n>=15&&n<=140))return null;return{order:r.order.slice(),scores:r.scores.map(Math.round),rivals:Array.isArray(r.rivals)?r.rivals.filter(v=>v&&['reed','morgan','casey','alex','sam'].includes(v.id)&&Number.isInteger(v.place)&&v.place>=1&&v.place<=28).slice(0,5).map(v=>({id:v.id,place:v.place})):[]};}));
 // Medals must be backed by a stored national victory, not merely an imported flag.
 c.medals=[0,1,2].filter(t=>c.seasons[t][5]?.order[0]===0);
 c.tier=Number.isInteger(raw.tier)&&raw.tier>=0&&raw.tier<=2&&(raw.tier===0||c.medals.includes(raw.tier-1))?raw.tier:0;
 c.ribbon=c.medals.includes(raw.ribbon)?raw.ribbon:null;c.ghostEnabled=raw.ghostEnabled!==false;c.practiceDone=raw.practiceDone===true;
 for(const [key,g] of Object.entries(raw.ghosts||{}).slice(0,90)){if(!/^[0-5]-(solo|team)-[0-3](-(rain|wind))?$/.test(key)||!g||!Number.isFinite(g.time)||g.time<=0||g.time>300||!Array.isArray(g.samples)||g.samples.length<2||g.samples.length>602)continue;const distance=E.meets[+key[0]].distance;let time=-1,d=-1;const good=g.samples.every(v=>{if(!Array.isArray(v)||v.length!==3||!v.every(Number.isFinite)||v[0]<=time||v[0]<0||v[0]>g.time+.001||v[1]<d||v[1]<0||v[1]>distance||v[2]<0||v[2]>2)return false;time=v[0];d=v[1];return true;});if(good&&Math.abs(time-g.time)<.01&&d===distance)c.ghosts[key]={time:g.time,samples:g.samples.map(v=>v.slice())};}
 return c;
}
function ensure(s){return s.career??=fresh();}
const prior=E.sanitize;E.sanitize=function(raw){const s=prior(raw);s.career=sanitize(raw?.career);return s;};
function standings(c,tier=c.tier){const totals=[0,1,2,3].map(team=>({team,points:0,score:0,last:4}));c.seasons[tier].slice(0,5).forEach(r=>{if(!r)return;r.order.forEach((team,place)=>{totals[team].points+=points[place];totals[team].score+=r.scores[team];totals[team].last=place;});});return totals.sort((a,b)=>b.points-a.points||a.score-b.score||a.last-b.last||a.team-b.team);}
function qualified(c){return c.seasons[c.tier].slice(0,5).filter(Boolean).length===5&&standings(c).findIndex(t=>t.team===0)<2;}
function canEnter(c,index){if(!Number.isInteger(index)||index<0||index>5)return false;if(index===5)return qualified(c);return index===0||!!c.seasons[c.tier][index-1];}
function record(s,a){if(a.careerTier===undefined||a.practice)return null;const c=ensure(s),tier=a.careerTier;if(tier!==c.tier||!canEnter(c,a.index))return null;const ordered=S.raceOrder(a.runners);if(ordered.some(r=>r.finish===null))return null;const teams=S.scoreTeams(ordered),order=teams.map(t=>t.team),scores=[0,1,2,3].map(id=>teams.find(t=>t.team===id).score),old=c.seasons[tier][a.index],rank=order.indexOf(0),better=!old||rank<old.order.indexOf(0)||rank===old.order.indexOf(0)&&scores[0]<old.scores[0];
 if(better)c.seasons[tier][a.index]={order,scores,rivals:ordered.flatMap((r,i)=>r.rival?[{id:r.rival,place:i+1}]:[])};
 const won=a.index===5&&rank===0,first=won&&!c.medals.includes(tier);if(first){c.medals.push(tier);c.ribbon=tier;}
 return{better,rank:rank+1,qualified:qualified(c),first,won};
}
function opponentBoost(tier,index){return tiers[tier].levels[index]-S.courses[index].level;}
function selectTier(s,tier){const c=ensure(s);if(!Number.isInteger(tier)||tier<0||tier>2||tier>0&&!c.medals.includes(tier-1))return false;c.tier=tier;return true;}
function ghostKey(a){return a.index+'-'+a.mode+'-'+(a.careerTier===undefined?0:a.careerTier+1)+(a.condition&&a.condition!=='clear'?'-'+a.condition:'');}
function beginGhost(s,a){a.ghostKey=ghostKey(a);a.ghost=ensure(s).ghosts[a.ghostKey]||null;a.ghostSamples=[[0,0,a.runners[0].lane]];a.nextGhostSample=.5;}
function sample(a){if(a.practice)return;const p=a.runners[0];if(p.finish!==null){const last=a.ghostSamples.at(-1);if(last[0]<p.finish)a.ghostSamples.push([p.finish,p.distance,p.visualLane??p.lane]);return;}if(a.t>=a.nextGhostSample&&a.ghostSamples.length<600){a.ghostSamples.push([a.t,p.distance,p.visualLane??p.lane]);a.nextGhostSample=a.t+.5;}}
function saveGhost(s,a){if(a.practice||!a.ghostSamples||a.runners[0].finish===null)return false;sample(a);const c=ensure(s),time=a.runners[0].finish,old=c.ghosts[a.ghostKey];if(!old||time<old.time){c.ghosts[a.ghostKey]={time,samples:a.ghostSamples.map(v=>v.slice())};return true;}return false;}
function ghostAt(g,time){if(!g||time<0)return null;const samples=g.samples;if(time>=g.time)return{distance:samples.at(-1)[1],lane:samples.at(-1)[2],finished:true};let lo=0,hi=samples.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(samples[mid][0]<=time)lo=mid;else hi=mid;}const a=samples[lo],b=samples[hi],t=E.clamp((time-a[0])/(b[0]-a[0]),0,1);return{distance:a[1]+(b[1]-a[1])*t,lane:a[2]+(b[2]-a[2])*t,finished:false};}
function exportSave(s){return JSON.stringify({format:'chasing-varsity-save',version:1,savedAt:new Date().toISOString(),state:s},null,2);}
function importSave(text){if(typeof text!=='string'||text.length>8000000)throw Error('Choose a Chasing Varsity save smaller than 8 MB.');let envelope;try{envelope=JSON.parse(text);}catch{throw Error('This file is not valid JSON.');}const raw=envelope?.state;if(envelope?.format!=='chasing-varsity-save'||envelope.version!==1||!raw||raw.version!==1||typeof raw.name!=='string'||!raw.stats||!['speed','endurance','strength'].every(k=>Number.isFinite(raw.stats[k])))throw Error('This is not a supported Chasing Varsity save.');return E.sanitize(raw);}
const api={tiers,opponentBoost,points,fresh,sanitize,ensure,standings,qualified,canEnter,record,selectTier,ghostKey,beginGhost,sample,saveGhost,ghostAt,exportSave,importSave};if(typeof module!=='undefined')module.exports=api;else root.CVCareer=api;
})(typeof window!=='undefined'?window:globalThis);
