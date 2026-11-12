// Compare equal teams and captain controls; every row runs to a real finish.
const {race}=require('./balance-report.cjs'),E=require('../engine'),S=require('../season-engine');
for(let index=0;index<6;index++)for(const plan of ['patient','pack','attack']){
 const s=E.sanitize(E.fresh()),level=Math.min(100,S.courses[index].level+8);
 s.stats={speed:level,endurance:level,strength:level};s.season.roster.forEach((r,i)=>r.stats={speed:level+i*2,endurance:Math.min(100,level+10),strength:level});
 const result=race(s,index,0,plan),squad=result.a.runners.filter(r=>r.team===0&&!r.player);
 if(result.a.runners.some(r=>r.finish===null))throw Error('Unfinished '+plan);
 console.log(JSON.stringify({course:index,plan,teamPlace:result.rank,teamScore:S.scoreTeams(S.raceOrder(result.a.runners)).find(r=>r.team===0).score,squadFinish:+(squad.reduce((n,r)=>n+r.finish,0)/squad.length).toFixed(2),squadEnergy:+(squad.reduce((n,r)=>n+r.energy,0)/squad.length).toFixed(1)}));
}
