/* Deterministic season rules. No DOM dependencies; also used by the regression suite. */
(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' ? require('./engine.js') : root.CV;
  const clamp = E.clamp;
  const courses = [
    {name:'Pine Hollow',theme:'meadow',level:12,segments:['flat','flat','hill','flat','flat','down','flat','track'],note:'Friendly grass trails. Save a little for the track finish.'},
    {name:'County Park',theme:'lake',level:22,segments:['flat','flat','mud','flat','hill','down','flat','track'],note:'The lakeside mud rewards strength. Build energy before it.'},
    {name:'Woodland',theme:'forest',level:34,segments:['flat','hill','mud','down','hill','flat','down','track'],note:'Roots, mud, and rolling climbs break up your rhythm.'},
    {name:'Ridgeline',theme:'mountain',level:47,segments:['flat','hill','hill','down','hill','hill','down','track'],note:'The steepest course. Train strength and recover on descents.'},
    {name:'State Finals',theme:'autumn',level:62,segments:['flat','mud','hill','flat','down','mud','flat','track'],note:'Autumn trails lead to a fast finish. Keep enough for your kick.'},
    {name:'Nationals',theme:'stadium',level:78,segments:['flat','hill','mud','down','hill','mud','flat','track'],note:'A complete cross-country test with a stadium finish.'}
  ];
  const recruits = [
    {id:'jules',name:'Jules',role:'Steady pacer',cost:90,stats:{speed:24,endurance:38,strength:25}},
    {id:'leo',name:'Leo',role:'Finishing specialist',cost:130,stats:{speed:43,endurance:25,strength:26}},
    {id:'maya',name:'Maya',role:'Hill specialist',cost:170,stats:{speed:34,endurance:38,strength:55}},
    {id:'river',name:'River',role:'Distance specialist',cost:230,stats:{speed:44,endurance:65,strength:42}},
    {id:'nico',name:'Nico',role:'All-round contender',cost:320,stats:{speed:65,endurance:61,strength:64}},
    {id:'avery',name:'Avery',role:'National prospect',cost:450,stats:{speed:78,endurance:78,strength:75}}
  ];
  const rookieTeam = () => ['Quinn','Drew','Sky','Jamie'].map((name,i)=>({id:'rookie-'+i,name,stats:{speed:10+i*2,endurance:15+i*2,strength:13+i*2}}));
  const number = (v,d,lo,hi) => Number.isFinite(v) ? clamp(v,lo,hi) : d;
  const stats = (s={}) => Object.fromEntries(['speed','endurance','strength'].map(k=>[k,number(s?.[k],12,1,100)]));
  function seasonData(raw={}) {
    if(!raw || typeof raw!=='object') raw={};
    const roster = Array.isArray(raw.roster) ? raw.roster.filter(r=>r && (String(r.id).startsWith('rookie-') || recruits.some(c=>c.id===r.id))).slice(0,6).map(r=>({id:String(r.id),name:String(r.name||'Teammate').slice(0,20),stats:stats(r.stats)})) : rookieTeam();
    const unique = roster.filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i);
    while(unique.length<4){const r=rookieTeam().find(r=>!unique.some(x=>x.id===r.id));unique.push(r);}
    const bestTraining={};for(const key of ['speed','endurance','strength']) bestTraining[key]=Math.round(number(raw.bestTraining?.[key],0,0,100));
    const teamBest={};for(let i=0;i<6;i++)if(Number.isInteger(raw.teamBest?.[i])&&raw.teamBest[i]>=1&&raw.teamBest[i]<=4)teamBest[i]=raw.teamBest[i];
    return {roster:unique,bestTraining,teamBest,teamRaces:Math.floor(number(raw.teamRaces,0,0,999999)),teamWins:Math.floor(number(raw.teamWins,0,0,999999)),hired:Array.isArray(raw.hired)?recruits.filter(r=>raw.hired.includes(r.id)||unique.some(x=>x.id===r.id)).map(r=>r.id):unique.filter(r=>!r.id.startsWith('rookie-')).map(r=>r.id)};
  }
  const originalSanitize=E.sanitize;
  E.sanitize=function(raw){const s=originalSanitize(raw);s.season=seasonData(raw?.season);return s;};
  function ensure(s){s.season??=seasonData();return s.season;}
  function average(s){return (s.speed+s.endurance+s.strength)/3;}
  function recruit(s,id){const data=ensure(s),c=recruits.find(r=>r.id===id);if(!c||data.hired.includes(id)||s.coins<c.cost)return false;
    s.coins-=c.cost;const runner={id:c.id,name:c.name,stats:{...c.stats}};
    if(data.roster.length<6)data.roster.push(runner);else{let weakest=0;data.roster.forEach((r,i)=>{if(average(r.stats)<average(data.roster[weakest].stats))weakest=i;});data.roster[weakest]=runner;}
    data.hired.push(id);return true;
  }
  function workout(s){const team=ensure(s);if(s.coins<60||team.roster.every(r=>Object.values(r.stats).every(v=>v>=100)))return false;s.coins-=60;team.roster.forEach(r=>Object.keys(r.stats).forEach(k=>r.stats[k]=Math.min(100,r.stats[k]+5)));return true;}
  function segment(index,progress){const c=courses[index];return c.segments[Math.min(7,Math.floor(clamp(progress,0,.9999)*8))];}
  function velocity(r,pace,kind,kicking=false){const effort=[.84,1,1.19][pace];const fatigue=r.energy<18?.60+.40*r.energy/18:1;const hill=kind==='hill'?(1-(.31-r.stats.strength*.0022)):kind==='down'?1.07:1;const mud=kind==='mud'?(.76+r.stats.strength*.0019):1;return (4.1+r.stats.speed*.030)*effort*fatigue*hill*mud*(kicking?1.27:1);}
  function step(r,dt,pace,kind,kicking=false){const v=velocity(r,pace,kind,kicking);const drain=([ -1.9,.62,2.7 ][pace])*(1.15-r.stats.endurance*.006)+(kind==='hill'?.35:0)+(kicking?2.2:0);r.energy=clamp(r.energy-drain*dt,0,100);r.distance+=v*dt*10;return v;}
  function aiPace(r,progress){if(r.energy<22)return 0;if(progress>.82&&r.energy>32)return 2;return 1;}
  function makeField(s,index,mode){const level=courses[index].level;const player={name:s.name,stats:{...s.stats},player:true,team:0,color:s.color};let field=[player];
    if(mode==='team'){
      field.push(...ensure(s).roster.map(r=>({...r,stats:{...r.stats},team:0,color:s.color})));
      for(let team=1;team<=3;team++)for(let j=0;j<7;j++){const n=clamp(level+(team-2)*4+(j-3)*2,1,100);field.push({name:['Pine','Lake','Ridge'][team-1]+' '+(j+1),team,color:['#4f9fe3','#b57be0','#e4b341'][team-1],stats:{speed:n,endurance:clamp(n+4,1,100),strength:clamp(n+(j%3)*3,1,100)}});}
    }else{
      field.push(...['Reed','Morgan','Casey','Alex','Sam'].map((name,j)=>({name,team:j+1,color:['#569ce1','#b77ce3','#debd49','#e88caa','#5cbd9a'][j],stats:{speed:clamp(level+(j-2)*3,1,100),endurance:clamp(level+j+3,1,100),strength:clamp(level+(j%3)*4,1,100)}})));
    }
    return field.map((r,i)=>({...r,id:i,energy:100,distance:0,finish:null}));
  }
  // Standard XC: five scorers, sixth/seventh displace. Equal scores use sixth finisher.
  function scoreTeams(finishers){const groups=new Map();finishers.forEach((r,i)=>{if(!groups.has(r.team))groups.set(r.team,[]);groups.get(r.team).push(i+1);});return [...groups].map(([team,places])=>({team,places,score:places.length>=5?places.slice(0,5).reduce((a,b)=>a+b,0):Infinity,sixth:places[5]??Infinity})).sort((a,b)=>a.score-b.score||a.sixth-b.sixth||a.places[0]-b.places[0]);}
  function trainingReward(s,key,quality){const q=clamp(quality,0,1),before=s.stats[key],gain=3+Math.floor(q*7);s.stats[key]=Math.min(100,before+gain);const coins=12+Math.round(q*23);s.coins+=coins;s.sessions++;const data=ensure(s),pb=Math.round(q*100)>data.bestTraining[key];data.bestTraining[key]=Math.max(data.bestTraining[key],Math.round(q*100));data.roster.forEach(r=>r.stats[key]=Math.min(100,r.stats[key]+gain*.65));return{gain:s.stats[key]-before,coins,pb};}
  // Keep real race positions; omit crowded/off-camera sprites instead of stacking them.
  function cameraLayout(runners, player, slope=0) {
    const rows=[[],[],[]], visible=[];
    const candidates=runners.filter(r=>!r.player).sort((a,b)=>Math.abs(a.distance-player.distance)-Math.abs(b.distance-player.distance)||a.id-b.id);
    let offscreen=0, crowded=0;
    for(const r of candidates){
      const x=300+(r.distance-player.distance)*(player.lane===undefined?3.4:5);
      if(x<55||x>1045){offscreen++;continue;}
      const lane=r.lane??r.id%3;
      if(player.lane===lane&&Math.abs(x-300)<115){crowded++;continue;}
      if(rows[lane].some(other=>Math.abs(other-x)<125)||visible.length>=9){crowded++;continue;}
      rows[lane].push(x);
      visible.push({runner:r,x,y:300+lane*(player.lane===undefined?80:100)+clamp((x-300)*slope,-22,22),lane,scale:.62});
    }
    return {visible:visible.sort((a,b)=>a.lane-b.lane||a.x-b.x),offscreen,crowded};
  }
  function raceOrder(runners){return [...runners].sort((a,b)=>{
    if(a.finish!==null&&b.finish!==null)return a.finish-b.finish||a.id-b.id;
    if(a.finish!==null)return -1;if(b.finish!==null)return 1;
    return b.distance-a.distance||a.id-b.id;
  });}
  const api={cameraLayout,raceOrder,courses,recruits,seasonData,ensure,average,recruit,workout,segment,velocity,step,aiPace,makeField,scoreTeams,trainingReward};
  if(typeof module!=='undefined')module.exports=api;else root.CVSeason=api;
})(typeof window!=='undefined'?window:globalThis);
