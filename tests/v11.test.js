const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../engine.js'),V=require('../varsity-engine.js'),P=require('../v11-engine.js');
const {game}=require('./game-harness.cjs');

test('jersey styles are validated and survive legacy/new save round trips',()=>{
 const fresh=E.fresh();assert.equal(P.ensure(fresh).jersey,'classic');
 assert.equal(P.switchJersey(fresh,'chevron'),true);
 assert.equal(E.sanitize(JSON.parse(JSON.stringify(fresh))).v11.jersey,'chevron');
 assert.equal(P.switchJersey(fresh,'javascript:alert(1)'),false);
 assert.equal(E.sanitize({...fresh,v11:{jersey:'invalid'}}).v11.jersey,'classic');
 assert.equal(E.sanitize(E.fresh()).v11.jersey,'classic');
});

test('locker-room lineup preserves captain and bench with no stat changes',()=>{
 const s=E.fresh(),stats={...s.stats};
 let group=P.lineup(s);
 assert.equal(group.filter(r=>r.captain).length,1);
 assert.equal(group.filter(r=>r.active).length,5);
 const first=group.find(r=>!r.captain);
 assert.equal(V.toggle(s,first.id),false,'cannot fall below minimum four teammates');
 assert.deepEqual(s.stats,stats);
 const recruit=V.selected(s).length;
 assert.equal(recruit,4);
});

test('standard timing assistance is earned after repeated misses and bounded',()=>{
 const base={duration:1.2,width:.25,gap:1.2,speed:300,zone:.5};
 const a={type:'training',index:0,trainingMode:'standard',v11MissStreak:2};
 assert.deepEqual(P.assist(a,base),base);
 a.v11MissStreak=6;
 const easier=P.assist(a,base);
 assert.ok(easier.width>base.width&&easier.width<=.35);
 assert.ok(easier.gap>base.gap&&easier.gap<=1.34);
 assert.deepEqual(P.assist({...a,trainingMode:'challenge'},base),base);
 assert.deepEqual(P.assist({...a,drill:'ladder'},base),base);
});

test('training progress covers regular sessions and all three alternate drills',()=>{
 const plain=P.workoutProgress({type:'training',index:1,cleanTime:10,t:14});
 assert.equal(plain.count,50);assert.equal(plain.goal,70);
 assert.ok(plain.progress>70&&plain.progress<72);
 for(const [drill,count,goal] of [['ladder',11,12],['checkpoints',3,4]]){
   const info=P.workoutProgress({type:'training',index:0,drill,drillHits:count,t:12});
   assert.equal(info.goal,goal);assert.equal(info.progress,100*count/goal);
 }
 const trail=P.workoutProgress({type:'training',index:2,drill:'trail',drillDistance:820,t:18});
 assert.equal(trail.progress,82);assert.equal(trail.unit,'m');
});

test('race hint identifies safe passing lanes and short rival-attack warnings',()=>{
 const a={type:'race',index:0,t:10,countdown:0,done:false,runners:[
 {id:0,player:true,distance:1000,energy:75,lane:1,laneReady:0,finish:null},
 {id:1,name:'Reed',distance:1015,energy:80,lane:1,finish:null},
 {id:2,name:'Morgan',distance:970,energy:80,lane:2,finish:null}
 ]};
 const move=P.raceOpportunity(a);
 assert.equal(move.tone,'opportunity');assert.match(move.title,/lane [13]/i);
 a.runners[1].intent='BREAKAWAY';a.runners[1].intentAt=11.5;
 const attack=P.raceOpportunity(a);
 assert.equal(attack.tone,'danger');assert.match(attack.title,/attacking/);
 a.runners[1].intent=null;a.runners[1].distance=999;
 a.runners[0].distance=E.meets[0].distance*.95;
 a.runners[1].distance=a.runners[0].distance+14;
 const finish=P.raceOpportunity(a);assert.equal(finish.tone,'final');
});

test('photo-finish margin only announced for genuinely close results',()=>{
 const a={type:'race',runners:[{finish:80,player:true},{finish:80.41,name:'Morgan'},{finish:82,name:'Reed'}]};
 const close=P.closeFinish(a);assert.equal(close.name,'Morgan');assert.equal(close.photo,true);assert.equal(close.beat,true);
 a.runners[1].finish=82;
 assert.equal(P.closeFinish(a),null);
});

test('v1.1 integrates into the real controller without changing base training rewards',()=>{
 const run=game();
 assert.equal(run('P11.ensure(state).jersey'),'classic');
 run("P11.switchJersey(state,'stripe');state=E.sanitize(state)");
 assert.equal(run('P11.ensure(state).jersey'),'stripe');
 run("startTraining(0);update(3);for(let i=0;i<1400&&!activity.done;i++){if(i%70===0)act();update(.02);draw();}");
 assert.equal(run('activity.done'),true);
 assert.equal(run('state.sessions'),1);
 assert.equal(run('state.v11.jersey'),'stripe');
 assert.ok(run('state.stats.speed')>=E.fresh().stats.speed);
});

test('v1.1 race controller retains a finished result and photo finish check is safe',()=>{
 const run=game();run('startRace(0);for(let i=0;i<4000&&!activity.done;i++)update(.05)');
 assert.equal(run('activity.done'),true);
 assert.ok(run('activity.finishMoment.place')>0);
 assert.doesNotThrow(()=>run('P11.closeFinish(activity)'));
});
