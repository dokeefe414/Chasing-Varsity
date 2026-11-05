/* Spatial racing and telemetry. Snapshot-based updates keep field order from deciding outcomes. */
(function(root){
'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CV;
const S=typeof module!=='undefined'?require('./season-engine.js'):root.CVSeason;
const plans=['patient','pack','attack'];
const forks=[.25,.625];
function data(raw={}){const best={};for(const [key,value] of Object.entries(raw?.lastSplits||{})){if(/^[0-5]-(solo|team)(-(rain|wind))?$/.test(key)&&Array.isArray(value)&&value.length===4&&value.every((n,i)=>Number.isFinite(n)&&n>0&&(!i||n>value[i-1])))best[key]=value.slice();}return{plan:plans.includes(raw?.plan)?raw.plan:'patient',lastSplits:best};}
const priorSanitize=E.sanitize;E.sanitize=function(raw){const s=priorSanitize(raw);s.racecraft=data(raw?.racecraft);return s;};
function ensure(s){return s.racecraft??=data();}
function init(a,s){a.plan=ensure(s).plan;a.forks= forks.map(start=>({start,end:start+.125,choice:'firm',locked:false}));a.telemetry={draft:0,blocked:0,lowEnergy:0,earlyPush:0,surges:0,moves:0,splits:[],places:[],energy:[]};a.previousSplits=ensure(s).lastSplits[a.index+'-'+a.mode]||null;a.runners.forEach(r=>Object.assign(r,{lane:r.player?1:r.id%3,laneReady:0,surgeUntil:0,surgeReady:0,reactAt:null,reacted:-1,splits:[],drafting:false,blocked:false,route:'firm'}));a.surgeSerial=0;}
function active(a){return a&&!a.done&&!a.paused&&a.countdown<=0&&a.runners[0].finish===null;}
function clearLane(a,r,lane){if(!Number.isInteger(lane)||lane<0||lane>2)return false;const direction=Math.sign(lane-r.lane);const crossed=direction?Array.from({length:Math.abs(lane-r.lane)},(_,i)=>r.lane+(i+1)*direction):[lane];return !a.runners.some(o=>o!==r&&o.finish===null&&crossed.includes(o.lane)&&Math.abs(o.distance-r.distance)<4);}
function laneHint(a,lane){const p=a.runners[0];if(lane===p.lane)return 'Current lane';if(!active(a))return a.paused?'Paused':a.countdown>0?'Wait for start':'Race finished';if(a.t<p.laneReady)return 'Settling · '+Math.ceil(p.laneReady-a.t)+'s';const cost=1.2*Math.abs(lane-p.lane);if(p.energy<cost)return 'Need '+cost.toFixed(1)+' energy';if(!clearLane(a,p,lane))return Math.abs(lane-p.lane)>1?'Crossing lane occupied':'Runner too close';return 'Open · '+cost.toFixed(1)+' energy';}
function move(a,lane){if(!active(a)||!Number.isInteger(lane)||lane<0||lane>2)return false;const r=a.runners[0];if(lane===r.lane||a.t<r.laneReady||r.energy<1.2*Math.abs(lane-r.lane)||!clearLane(a,r,lane))return false;const cost=1.2*Math.abs(lane-r.lane);r.lane=lane;r.laneReady=a.t+1;r.energy-=cost;a.telemetry.moves++;return true;}
function surge(a){if(!active(a))return false;const r=a.runners[0];if(a.t<r.surgeReady||r.energy<28||a.kick>0)return false;r.energy-=8;r.surgeUntil=a.t+3;r.surgeReady=a.t+12;a.surgeSerial++;a.telemetry.surges++;return true;}
function choose(a,choice){if(!active(a)||!['firm','short'].includes(choice))return false;const p=a.runners[0].distance/E.meets[a.index].distance;const fork=a.forks.find(f=>p>=f.start-.18&&p<f.start&&!f.locked);if(!fork)return false;fork.choice=choice;return true;}
function teamPace(a,r,progress,snapshot){if(r.energy<25)return 0;if(a.plan==='attack')return r.energy>38?2:1;if(a.plan==='patient')return progress<.35?1:progress>.78&&r.energy>35?2:r.energy<40?0:1;
 const team=snapshot.filter(o=>o.team===0&&o.finish===null).sort((x,y)=>x.distance-y.distance),anchor=team[Math.floor(team.length/2)];if(progress>.8)return r.energy>32?2:1;if(anchor&&r.distance<anchor.distance-22&&r.energy>40)return 2;if(anchor&&r.distance>anchor.distance+22)return 0;return 1;
}
function route(a,r,progress){const f=a.forks.find(f=>progress>=f.start&&progress<f.end);if(!f)return{kind:a.courseSegments?a.courseSegments[Math.min(7,Math.floor(E.clamp(progress,0,.9999)*8))]:S.segment(a.index,progress),factor:1,name:'trail'};const choice=r.player?f.choice:r.stats.strength>=62&&r.energy>35?'short':'firm';return choice==='short'?{kind:'mud',factor:1.14,name:'short'}:{kind:'flat',factor:1,name:'firm'};}
function advance(a,dt){let remaining=dt;while(remaining>1e-8){const h=Math.min(.05,remaining);tick(a,h);remaining-=h;}}
function tick(a,dt){const distance=E.meets[a.index].distance,p=a.runners[0],beforeTime=a.t;a.t+=dt;a.kick=Math.max(0,a.kick-dt);
 for(const f of a.forks)if(p.distance/distance>=f.start)f.locked=true;
 // All decisions observe the same instant. IDs only break equal starting positions.
 const snapshot=a.runners.map(r=>({...r}));
 for(const r of a.runners){if(r.finish!==null||r.player)continue;const old=snapshot.find(o=>o.id===r.id),progress=r.distance/distance;const ahead=snapshot.filter(o=>o.id!==r.id&&o.finish===null&&o.lane===r.lane&&o.distance>r.distance).sort((x,y)=>x.distance-y.distance)[0];
 if(a.t>=r.laneReady&&r.distance>100&&ahead&&ahead.distance-r.distance<24&&(r.blocked||r.surgeUntil>a.t||r.stats.speed>ahead.stats.speed+3)){const lane=[0,1,2].filter(l=>l!==r.lane).find(l=>clearLane(a,r,l));if(lane!==undefined){const cost=1.2*Math.abs(lane-r.lane);r.lane=lane;r.energy=Math.max(0,r.energy-cost);}r.laneReady=a.t+1.5;}
 if(r.rival&&r.reacted!==a.surgeSerial&&a.surgeSerial>0&&p.surgeUntil>a.t&&Math.abs(old.distance-p.distance)<65&&r.energy>38){r.reacted=a.surgeSerial;r.reactAt=a.t+.55+(r.id%3)*.2;}
 if(r.reactAt!==null&&a.t>=r.reactAt){if(r.energy>30&&a.t>=r.surgeReady){r.energy-=8;r.surgeUntil=a.t+2.6;r.surgeReady=a.t+13;}r.reactAt=null;}
 r.nextPace=r.team===0&&a.mode==='team'?teamPace(a,r,progress,snapshot):S.aiPace(r,progress);const decision=api.day?.decision(a,r,progress);if(decision!==null&&decision!==undefined)r.nextPace=decision;
 }
 const proposals=new Map();
 for(const r of a.runners){if(r.finish!==null)continue;const start=r.distance,progress=start/distance,pace=r.player?a.pace:r.nextPace,terrain=route(a,r,progress);r.route=terrain.name;
 const leader=snapshot.filter(o=>o.id!==r.id&&o.finish===null&&o.lane===r.lane&&o.distance-start>=8&&o.distance-start<=40&&(terrain.name==='trail'||o.route===terrain.name)).sort((x,y)=>x.distance-y.distance)[0];
 r.drafting=!!leader&&pace!==2&&!(r.surgeUntil>a.t)&&!(r.player&&a.kick>0);r.draftName=r.drafting?leader.name:null;
 const energy=r.energy;S.step(r,dt,pace,terrain.kind,r.player&&a.kick>0);if(r.drafting&&r.energy<energy)r.energy=E.clamp(energy-(energy-r.energy)*.68,0,100);
 const dayFactor=api.day?.effect(a,r,dt,pace,terrain.kind,energy)??1;const factor=dayFactor*terrain.factor*(r.surgeUntil>a.t?1.12:1)*(r.circuitSpeed||1);r.distance=start+(r.distance-start)*factor;proposals.set(r.id,{start,end:r.distance});r.distance=start;
 }
 // Resolve front-to-back so a blocked runner cannot tunnel through a slower runner.
 const moving=a.runners.filter(r=>r.finish===null).sort((x,y)=>y.distance-x.distance||x.id-y.id);
 for(const r of moving){const proposal=proposals.get(r.id);let end=proposal.end;r.blocked=false;
 if(proposal.start>120){const ahead=moving.filter(o=>o!==r&&o.lane===r.lane&&proposals.get(o.id).start>proposal.start&&(!a.forks.some(f=>proposal.start/distance>=f.start&&proposal.start/distance<f.end)||o.route===r.route)).sort((x,y)=>proposals.get(x.id).start-proposals.get(y.id).start)[0];if(ahead&&end>ahead.distance-8){end=Math.max(proposal.start,ahead.distance-8);r.blocked=true;}}
 r.distance=end;
 for(let q=1;q<=4;q++){const marker=distance*q/4;if(proposal.start<marker&&end>=marker){r.splits[q-1]=beforeTime+dt*(marker-proposal.start)/(end-proposal.start);}}
 if(end>=distance){r.finish=beforeTime+dt*(distance-proposal.start)/(end-proposal.start);r.distance=distance;}
 }
 if(p.finish===null||proposals.has(p.id)){const t=a.telemetry;t.draft+=p.drafting?dt:0;t.blocked+=p.blocked?dt:0;t.lowEnergy+=p.energy<18?dt:0;t.earlyPush+=p.distance/distance<.25&&a.pace===2?dt:0;const order=S.raceOrder(a.runners);while(t.splits.length<p.splits.length){t.splits.push(p.splits[t.splits.length]);t.places.push(order.indexOf(p)+1);t.energy.push(Math.round(p.energy));}a.minimumEnergy=Math.min(a.minimumEnergy??100,p.energy);}
 api.day?.capture(a);
}
function report(a){const t=a.telemetry,notes=[];if(t.lowEnergy>2)notes.push(`You spent ${t.lowEnergy.toFixed(1)}s below 18% energy, where fatigue reduces speed. Ease off before the next climb.`);if(t.blocked>1)notes.push(`You spent ${t.blocked.toFixed(1)}s boxed in. Move to a clear lane before you surge.`);if(t.draft>1)notes.push(`You drafted for ${t.draft.toFixed(1)}s. That reduced energy drain by 32% while tucked in.`);if(t.earlyPush>4&&t.lowEnergy>2)notes.push('You pushed early and later ran low on energy. Try holding pace through the first quarter.');if(!a.kickUsed)notes.push('You finished without a kick. Save 20% energy and use K in the final 20%.');if(!notes.length)notes.push('You kept your energy under control. Try a well-timed surge or a different route to improve your splits.');return notes;}
function record(s,a){if(a.careerTier!==undefined||a.practice||a.variant&&a.variant!=='classic')return;if(a.telemetry.splits.length===4)ensure(s).lastSplits[a.index+'-'+a.mode+(a.condition&&a.condition!=='clear'?'-'+a.condition:'')]=a.telemetry.splits.slice();}
const api={plans,forks,data,ensure,init,active,clearLane,laneHint,move,surge,choose,route,teamPace,advance,report,record};if(typeof module!=='undefined')module.exports=api;else root.CVRacecraft=api;
})(typeof window!=='undefined'?window:globalThis);
