// Deterministic input simulation through the real controllers, not human playtesting.
const {game}=require('../tests/game-harness.cjs'),assert=require('node:assert/strict');
const run=game();
run(`var simulatedSeconds=0;var openingLog=[];function stepOpening(dt){update(dt);simulatedSeconds+=dt;}function workoutOpening(id,hard=false){activity=null;startMastery(id,hard);if(!activity)throw new Error('Workout locked: '+id);for(let i=0;i<2600&&!activity.done;i++){const a=activity,p=A.profile(a);if(a.countdown<=0){if(a.drill==='ladder'){if(a.drillTargets.some(b=>!b.checked&&Math.abs(b.at-a.t)<.006))act();}else if(a.drill==='checkpoints'){a.held=a.effort<(hard?[.75,.27,.72,.24,.78,.35]:V.targets)[Math.min(5,Math.floor((a.t+.01)/3))];}else if(a.drill==='trail'){if(a.jump===0&&a.obstacles.some(o=>!o.checked&&(o.at-a.drillDistance)/(hard?66:60)<.43))act();}else{if(a.index===0&&!a.hit&&a.beatT/p.duration>=p.zone)act();if(a.index===1)a.held=a.effort<p.zone;if(a.index===2&&a.jump===0&&a.obstacles.some(o=>!o.checked&&(o.x-245)/p.speed<.43))act();}}stepOpening(.01);}if(!activity.done)throw new Error('Unfinished workout');openingLog.push({workout:id,hard,quality:L.ensure(state).best[id],medal:L.medals[L.medal(state,id)],coins:state.coins});}`);
for(const id of ['speed','endurance','strength'])run(`workoutOpening('${id}')`);
assert.equal(run('L.count(state,1)'),3);
assert.equal(run('L.upgrades(state)[0].done'),true);
run("L.ensure(state).equipped='bronze';S.recruit(state,'jules')");
assert.equal(run("state.season.hired.includes('jules')"),true);
// Original lineup stays selected, making homegrown a real optional objective.
for(let i=0;i<5;i++)run(`activity=null;meetMode='team';L.ensure(state).objective='homegrown';startRace(0);for(let step=0;step<6000&&!activity.done;step++){const a=activity,p=a.runners[0],progress=p.distance/E.meets[0].distance;if(a.countdown<=0){setPace(p.energy<28?0:progress>.75&&p.energy>45?2:p.energy>50?1:a.pace);if(p.blocked)for(let lane=0;lane<3;lane++)if(R.move(a,lane))break;if(progress>.9)kick();}stepOpening(.05);}if(!activity.done)throw new Error('Unfinished race');openingLog.push({race:state.races,place:activity.finishMoment.place,coins:state.coins});`);
assert.equal(run('L.upgrades(state)[1].done'),true);
assert.equal(run("L.mateProgress(state,'rookie-0').claimed"),true);
for(const id of ['ladder','checkpoints','trail']){run(`workoutOpening('${id}');workoutOpening('${id}',true)`);assert.equal(run(`L.medal(state,'${id}')`),3);}
assert.equal(run('L.upgrades(state).every(u=>u.done)'),true);
run("L.ensure(state).equipped='gold';state=C.importSave(C.exportSave(state))");
assert.equal(run('L.ensure(state).equipped'),'gold');
console.log(JSON.stringify(run('({simulatedSeconds:Math.round(simulatedSeconds),workouts:state.sessions,races:state.races,stats:state.stats,coins:state.coins,camp:L.upgrades(state),medals:L.games.map(id=>({id,medal:L.medals[L.medal(state,id)]})),objectives:state.campLife.completed,teammateGoals:Object.entries(state.campLife.mates).filter(([id,m])=>m.claimed).map(([id])=>id),actions:openingLog})'),null,2));
if(process.env.CV_QA_SAVE)require('node:fs').writeFileSync(process.env.CV_QA_SAVE,run('C.exportSave(state)'));
