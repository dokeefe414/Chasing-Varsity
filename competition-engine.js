/* Persistent race stories and transparent squad decisions. No DOM or rewards. */
(function(root){
'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV;
const S=typeof module!=='undefined'?require('./season-engine.js'):root.CVSeason;
const J=typeof module!=='undefined'?require('./journey-engine.js'):root.CVJourney;
const C=typeof module!=='undefined'?require('./career-engine.js'):root.CVCareer;
const D=typeof module!=='undefined'?require('./raceday-engine.js'):root.CVRaceday;
const num=(v,d,lo,hi)=>Number.isFinite(v)?E.clamp(v,lo,hi):d;
function data(raw={}){const rivals={},starts={};for(const r of J.rivals){const x=raw?.rivals?.[r.id];if(x)rivals[r.id]={streak:Math.trunc(num(x.streak,0,-9999,9999)),gap:num(x.gap,0,-300,300),course:Math.trunc(num(x.course,0,0,5)),races:Math.trunc(num(x.races,0,0,999999))};}for(let t=0;t<3;t++){const x=raw?.starts?.[t];if(x&&Number.isFinite(x.captain)&&Number.isFinite(x.squad))starts[t]={captain:num(x.captain,12,1,100),squad:num(x.squad,12,1,100),sessions:Math.trunc(num(x.sessions,0,0,999999))};}return{rivals,starts};}
const prior=E.sanitize;E.sanitize=function(raw){const s=prior(raw);s.competition=data(raw?.competition);return s;};
function ensure(s){return s.competition??=data();}
function baseline(s,tier){const d=ensure(s);if(!d.starts[tier])d.starts[tier]={captain:S.average(s.stats),squad:s.season.roster.reduce((n,r)=>n+S.average(r.stats),0)/s.season.roster.length,sessions:s.sessions};return d.starts[tier];}
function record(s,a){if(a.practice||a.scenario||a.competitionRecorded||a.runners.some(r=>r.finish===null))return[];a.competitionRecorded=true;const d=ensure(s),p=a.runners[0],events=[];for(const r of a.runners.filter(r=>r.rival)){const old=d.rivals[r.rival],gap=r.finish-p.finish,won=gap>0,tied=Math.abs(gap)<1e-8;const streak=tied?0:won?Math.max(0,old?.streak||0)+1:Math.min(0,old?.streak||0)-1;d.rivals[r.rival]={streak,gap,course:a.index,races:Math.min(999999,(old?.races||0)+1)};events.push({id:r.rival,name:r.name,gap,streak,title:tied?'Dead heat':won&&old?.streak<0?'Rematch won':!won&&old?.streak>0?'Rival strikes back':won?'You won the duel':'Rival takes this round'});}return events;}
// Every plan uses the same movement, drafting and fatigue rules; no hidden speed bonus.
function assignment(a,r,progress,snapshot){if(r.energy<25)return{pace:0,label:'Recovering'};if(progress>.8)return{pace:r.energy>32?2:1,label:'Race the finish'};if(a.plan==='attack')return{pace:r.energy>48&&progress<.4?2:r.energy<40?0:1,label:r.energy>48&&progress<.4?'Opening attack':r.energy<40?'Rebuilding energy':'Holding the gain'};if(a.plan==='pack'){const team=snapshot.filter(o=>o.team===0&&o.finish===null).sort((x,y)=>x.distance-y.distance),anchor=team[Math.floor(team.length/2)];if(anchor&&r.distance<anchor.distance-18&&r.energy>42)return{pace:2,label:'Closing the pack'};if(anchor&&r.distance>anchor.distance+18)return{pace:0,label:'Waiting for pack'};return{pace:1,label:'Holding formation'};}return{pace:r.energy<38?0:progress>.55&&r.energy>45?2:1,label:r.energy<38?'Saving for finish':progress>.55&&r.energy>45?'Second-half build':'Patient opening'};}
// Racecraft dispatches via R.day, which initially references D.decision.
const R=typeof module!=='undefined'?require('./racecraft-engine.js'):root.CVRacecraft;
const originalDecision=R.day.decision;
R.day.decision=function(a,r,progress){if(!a.practice&&!a.scenario&&a.mode==='team'&&r.team===0&&!r.player){const choice=assignment(a,r,progress,a.runners);r.assignment=choice.label;return choice.pace;}return originalDecision(a,r,progress);};
function stakes(s){const c=C.ensure(s),rows=C.standings(c),played=c.seasons[c.tier].slice(0,5).filter(Boolean).length,rank=rows.findIndex(r=>r.team===0)+1,ours=rows.find(r=>r.team===0);return{played,rank,qualified:C.qualified(c),margin:ours.points-rows.filter(r=>r.team!==0)[1].points,finished:!!c.seasons[c.tier][5],next:c.seasons[c.tier].slice(0,5).findIndex(r=>!r)};}
function recap(s,tier){const b=ensure(s).starts[tier];if(!b)return null;const squad=s.season.roster.reduce((n,r)=>n+S.average(r.stats),0)/s.season.roster.length;return{captain:S.average(s.stats)-b.captain,squad:squad-b.squad,sessions:Math.max(0,s.sessions-b.sessions)};}
const api={data,ensure,baseline,record,assignment,stakes,recap};if(typeof module!=='undefined')module.exports=api;else root.CVCompetition=api;
})(typeof window!=='undefined'?window:globalThis);
