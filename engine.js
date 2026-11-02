/* Pure game rules. Shared by the browser and Node's regression tests. */
(function(root){
'use strict';
const meets=[
{name:'Pine Hollow Fun Run',distance:1600,level:12,hills:.2,terrain:'Gentle trails',prize:60},
{name:'County Opener',distance:2400,level:25,hills:.35,terrain:'Rolling fields',prize:85},
{name:'Woodland Invitational',distance:3200,level:40,hills:.65,terrain:'Wooded climbs',prize:110},
{name:'District Championship',distance:4000,level:55,hills:.8,terrain:'Steep ridgelines',prize:140},
{name:'State Championship',distance:5000,level:72,hills:.5,terrain:'Fast fields & hills',prize:180},
{name:'Varsity Nationals',distance:5000,level:88,hills:.7,terrain:'Championship terrain',prize:250}];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fresh=()=>({version:1,name:'Rookie',coins:0,stats:{speed:12,endurance:12,strength:12},unlocked:0,best:{},races:0,sessions:0,color:'#e97544',owned:['#e97544']});
const palette=['#e97544','#5888b0','#8158a0','#c89b32'];
function sanitize(raw){const s=fresh();if(!raw||raw.version!==1)return s;const num=(v,d,a,b)=>typeof v==='number'&&Number.isFinite(v)?clamp(Math.floor(v),a,b):d;
s.name=typeof raw.name==='string'?raw.name.trim().slice(0,20)||'Rookie':'Rookie';s.coins=num(raw.coins,0,0,999999);for(const k of Object.keys(s.stats))s.stats[k]=num(raw.stats?.[k],12,1,100);s.unlocked=num(raw.unlocked,0,0,5);s.races=num(raw.races,0,0,999999);s.sessions=num(raw.sessions,0,0,999999);s.owned=palette.filter(c=>c==='#e97544'||(Array.isArray(raw.owned)&&raw.owned.includes(c)));s.color=s.owned.includes(raw.color)?raw.color:s.color;for(let i=0;i<6;i++)if(Number.isInteger(raw.best?.[i])&&raw.best[i]>=1&&raw.best[i]<=6)s.best[i]=raw.best[i];return s;}
function terrain(progress,meet){return Math.max(0,Math.sin(progress*Math.PI*6)) *meet.hills;}
function stepRunner(r,dt,pace,hill){const effort=[.83,1,1.19][pace];const fatigue=r.energy<18?.64+.36*r.energy/18:1;const velocity=(4.1+r.stats.speed*.024)*effort*fatigue*(1-hill*(.26-r.stats.strength*.0018));const drain=[-1.7,.62,2.65][pace]*(1.18-r.stats.endurance*.006)+hill*.25;r.energy=clamp(r.energy-drain*dt,0,100);r.distance+=velocity*dt*10;return velocity;}
function rewardTraining(s,stat,score){const gain=2+Math.floor(clamp(score,0,1)*4),before=s.stats[stat];s.stats[stat]=clamp(before+gain,1,100);const coins=8+Math.floor(clamp(score,0,1)*17);s.coins+=coins;s.sessions++;return{gain:s.stats[stat]-before,coins};}
function rewardRace(s,index,place){const m=meets[index],coins=Math.round(m.prize*[1,.7,.5,.3,.2,.15][place-1]);s.coins+=coins;s.races++;s.best[index]=Math.min(s.best[index]||7,place);if(place<=3)s.unlocked=Math.max(s.unlocked,Math.min(5,index+1));return coins;}
const api={meets,palette,clamp,fresh,sanitize,terrain,stepRunner,rewardTraining,rewardRace};if(typeof module!=='undefined')module.exports=api;else root.CV=api;
})(typeof window!=='undefined'?window:globalThis);
