'use strict';
const S=CVSeason;
S.ensure(state);
let meetMode='solo';
const safe=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const teamNames=['Camp Varsity','Pine Harriers','Lake Striders','Ridge Runners'];
const escapeTime=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}.${Math.floor(t*10)%10}`;
const terrainNames={flat:'GRASS TRAIL',hill:'UPHILL',down:'DOWNHILL',mud:'MUD',track:'FINISHING TRACK'};
const oldSeasonRender=render;
render=function(){
  S.ensure(state);oldSeasonRender();
  $('rank').textContent=state.best[5]===1?'National champion':['New recruit','Club runner','JV contender','Varsity hopeful','State contender','National contender'][state.unlocked];
  const title=$('screen-meets').querySelector('.section-title');
  title.innerHTML='<div><p class="eyebrow">EVERY COURSE TELLS A STORY</p><h2>Race day</h2></div><div class="mode-switch"><button data-mode="solo" class="'+(meetMode==='solo'?'selected':'')+'">Individual</button><button data-mode="team" class="'+(meetMode==='team'?'selected':'')+'">Team meet</button></div>';
  $('meet-list').innerHTML=E.meets.map((m,i)=>{const c=S.courses[i],best=meetMode==='team'?state.season.teamBest[i]:state.best[i],rating=Math.round(meetMode==='team'?([state.stats,...state.season.roster.map(r=>r.stats)].reduce((n,s)=>n+S.average(s),0)/(state.season.roster.length+1)):S.average(state.stats));return `<article class="meet course-${c.theme}"><div class="course-picture"><span>${['🌼','💧','🌲','⛰','🍂','🏟'][i]}</span><b>0${i+1}</b></div><h3>${m.name}</h3><p>${(m.distance/1000).toFixed(1)} km · Field rating ${c.level}<br>Your ${meetMode==='team'?'team':'runner'}: ${rating} · ${rating<c.level-8?'Train a little more':rating>c.level+8?'Ready to contend':'A competitive challenge'}</p><div class="course-strip">${c.segments.map(k=>`<i title="${terrainNames[k]}" class="terrain-${k}">${{hill:'↗',down:'↘',mud:'≈',flat:'―',track:'⚑'}[k]}</i>`).join('')}</div><p>${c.note}<br><b>${best?'Best: '+ordinal(best)+(meetMode==='team'?' team':' place'):'No result yet'}</b></p><button class="primary" data-race="${i}" ${i>state.unlocked?'disabled':''}>${i>state.unlocked?'🔒 Qualify at previous meet':meetMode==='team'?'Race with your team →':'Take the start line →'}</button></article>`;}).join('');
  const data=state.season,teamAverage=Math.round([state.stats,...data.roster.map(r=>r.stats)].reduce((n,s)=>n+S.average(s),0)/(data.roster.length+1));
  const weakest=[...data.roster].sort((a,b)=>S.average(a.stats)-S.average(b.stats))[0];
  $('team-content').innerHTML=`<div class="section-title"><div><p class="eyebrow">ONE JERSEY. ONE TEAM.</p><h2>Camp Varsity</h2></div><div class="team-summary">${data.roster.length+1} / 7 runners · Rating ${teamAverage}<br>${data.teamWins} wins in ${data.teamRaces} team meets</div></div><div class="team-banner"><div><h3>Every place matters.</h3><p>The first five finishers score. Lowest total wins. Your sixth and seventh runners push opponents back; your sixth runner also breaks tied scores. Win a team meet or finish top three individually to unlock the next course.</p></div><button class="primary" data-team-workout ${state.coins<60||data.roster.every(r=>Object.values(r.stats).every(v=>v>=100))?'disabled':''}>Team workout · 60 ◈<small>+5 to every teammate stat</small></button></div><div class="roster-grid">${[{name:state.name,stats:state.stats,player:true},...data.roster].map(r=>`<article class="roster-card"><span class="jersey" style="background:${state.color}">7</span><h3>${safe(r.name)}</h3><small>${r.player?'YOU · TEAM CAPTAIN':'CAMP VARSITY'}</small><p>⚡ ${Math.round(r.stats.speed)} &nbsp; ☀ ${Math.round(r.stats.endurance)} &nbsp; ▲ ${Math.round(r.stats.strength)}</p></article>`).join('')}</div><div class="section-title"><h2>Recruiting trail</h2><p>Your training also develops teammates. Recruits bring a head start.</p></div><div class="recruit-grid">${S.recruits.map(r=>`<article class="recruit-card"><h3>${r.name}</h3><span>${r.role}</span><p>⚡ Speed ${r.stats.speed}<br>☀ Endurance ${r.stats.endurance}<br>▲ Strength ${r.stats.strength}</p><button class="primary" data-recruit="${r.id}" ${data.hired.includes(r.id)||state.coins<r.cost?'disabled':''}>${data.hired.includes(r.id)?'Already recruited':`${data.roster.length>=6?'Replace '+safe(weakest.name):'Recruit'} · ${r.cost} ◈`}</button></article>`).join('')}</div>`;
  $('record').textContent+=` · ${data.teamWins} team wins`;
  document.querySelectorAll('[data-train]').forEach(b=>{if(!b.classList.contains('training-card'))return;const k=training[+b.dataset.train].key;const score=data.bestTraining[k];const badge=document.createElement('span');badge.className='personal-best';badge.textContent='SESSION BEST '+score+'%';b.append(badge);});
};
const oldStartTraining=startTraining;
startTraining=function(i){if(activity)return;oldStartTraining(i);Object.assign(activity,{countdown:3,combo:0,maxCombo:0,possible:0,feedback:'GET READY',feedbackUntil:2,beat:0,beatT:0,hit:false,cleanTime:0,streak:0,zone:.5,particles:[],obstacles:[],nextRoot:1.3});$('activity-help').textContent=[ 'Tap or press Space in the moving gold zone. Center hits earn PERFECT and build a combo. The beat gets faster.', 'Hold Space or the button to raise effort. Release to lower it. Follow the moving gold zone for rhythm combos.', 'Tap or press Space to jump over roots and rocks. Obstacles get faster. Clean jumps build your combo.' ][i];};
startRace=function(index){if(activity||index>state.unlocked)return;const m=E.meets[index];activity={type:'race',index,mode:meetMode,t:0,countdown:3,pace:1,paused:false,done:false,runners:S.makeField(state,index,meetMode),kick:0,kickUsed:false,feedback:'GET READY',feedbackUntil:0,lastPlace:null,particles:[]};CVRacecraft.init(activity,state);openActivity((meetMode==='team'?'TEAM MEET':'INDIVIDUAL RACE')+' · '+(m.distance/1000).toFixed(1)+' KM',m.name);$('race-controls').hidden=false;$('training-controls').hidden=true;$('activity-help').textContent='1 / 2 / 3 effort · ↑ / ↓ change lane · S surge · K finishing kick · P pause. Draft 8–40 m behind a runner to save energy. Switch lanes to pass.';if(!$('kick-button')){const b=document.createElement('button');b.id='kick-button';b.textContent='K · Finishing kick';b.onclick=kick;$('race-controls').append(b);}setPace(1);$('kick-button').disabled=true;};
function feedback(a,text,positive=true){a.feedback=text;a.feedbackUntil=a.t+1; a.feedbackGood=positive;if(positive)chirp(text==='PERFECT!'?820:630);}
function cleanHit(a,perfect=false){a.combo++;a.maxCombo=Math.max(a.maxCombo,a.combo);feedback(a,perfect?'PERFECT!':a.combo>=3?a.combo+'× COMBO!':'NICE!',true);}
function miss(a){a.combo=0;feedback(a,'KEEP GOING!',false);}
function kick(){const a=activity;if(!a||a.type!=='race'||a.done||a.paused||a.countdown>0)return;const p=a.runners[0];if(a.t<p.surgeUntil||a.kickUsed||p.distance/E.meets[a.index].distance<.8||p.energy<20)return;a.kickUsed=true;a.kick=5;a.kickAt=p.distance/E.meets[a.index].distance;feedback(a,'LET’S GO! FINAL KICK!');}
act=function(){const a=activity;if(!a||a.paused||a.done||a.countdown>0||a.type!=='training')return;a.held=true;if(a.index===0){if(a.hit)return;a.hit=true;const duration=Math.max(.76,1.35-a.t*.024),pos=a.beatT/duration,zone=.5+Math.sin(a.beat*1.7)*.13,width=Math.max(.18,.30-a.t*.004);a.attempts++;if(Math.abs(pos-zone)<width/2){const perfect=Math.abs(pos-zone)<width*.19;a.score+=perfect?1:.75;cleanHit(a,perfect);}else miss(a);}if(a.index===2&&a.jump===0)a.jump=.85;};
const phaseColor={flat:'#88c862',hill:'#aa9661',down:'#74b8a0',mud:'#986645',track:'#df7753'};
function finishTraining(a){const quality=a.index===0?a.score/Math.max(1,a.possible):a.index===1?a.cleanTime/20:a.score/Math.max(1,a.attempts);const r=S.trainingReward(state,training[a.index].key,quality);finish(r.pb?'NEW PERSONAL BEST!':'SESSION COMPLETE!',`${Math.round(E.clamp(quality,0,1)*100)}% quality · Best combo ${a.maxCombo}×<br>+${r.gain} ${training[a.index].key} · +${r.coins} coins<br>Your teammates improved too. ${state.stats[training[a.index].key]===100?'This stat is maxed out!':''}`);}
function finishRace(a){const ordered=[...a.runners].sort((x,y)=>x.finish-y.finish||x.id-y.id),place=ordered.findIndex(r=>r.player)+1,old=state.unlocked;let coins=0,title='',teamResults=null;
  if(a.mode==='solo'){coins=E.rewardRace(state,a.index,place);title=ordinal(place)+' PLACE!';}
  else{const data=state.season;data.teamRaces++;state.races++;teamResults=S.scoreTeams(ordered);const rank=teamResults.findIndex(t=>t.team===0)+1;data.teamBest[a.index]=Math.min(data.teamBest[a.index]||5,rank);if(rank===1){data.teamWins++;state.unlocked=Math.max(state.unlocked,Math.min(5,a.index+1));}coins=Math.round(E.meets[a.index].prize*[1.3,.85,.6,.4][rank-1]);state.coins+=coins;title=ordinal(rank)+' TEAM!';}
  let body=`+${coins} coins · You placed ${ordinal(place)} of ${ordered.length}<br>${state.unlocked>old?'🔓 NEXT COURSE UNLOCKED!':a.index===5&&((teamResults&&teamResults[0].team===0)||place===1)?'🏆 NATIONAL CHAMPION! You earned your varsity letter.':'Every race teaches you something. Keep chasing.'}`;
  finish(title,body);
  const result=$('result');result.classList.add('race-result');
  if(teamResults){const summary=document.createElement('div');summary.className='team-results';summary.innerHTML='<h3>Team scores · lowest wins</h3>'+teamResults.map((t,i)=>`<div class="score-row ${t.team===0?'your-team':''}"><b>${i+1}. ${teamNames[t.team]}</b><span>${t.score} points</span><small>Scorers: ${t.places.slice(0,5).join(' + ')}${t.places.length>5?' · sixth: '+t.places[5]:''}</small></div>`).join('');result.insertBefore(summary,$('continue'));}
  const list=document.createElement('details');list.open=a.mode==='solo';list.className='finish-list';list.innerHTML=`<summary>Full results · ${ordered.length} finishers (arcade time)</summary><table><thead><tr><th>Place</th><th>Runner</th><th>Time</th></tr></thead><tbody>${ordered.map((r,i)=>`<tr class="${r.player?'your-team':''}"><td>${i+1}</td><td>${safe(r.name)}${r.player?' ★':''}${a.mode==='team'?'<small>'+teamNames[r.team]+'</small>':''}</td><td>${escapeTime(r.finish)}</td></tr>`).join('')}</tbody></table>`;result.insertBefore(list,$('continue'));
}
update=function(dt){const a=activity;if(!a||a.paused||a.done)return;
  if(a.countdown>0){a.countdown=Math.max(0,a.countdown-dt);if(a.countdown===0){feedback(a,'GO!');a.held=false;}return;}
  if(a.type==='race'){
    const p=a.runners[0],m=E.meets[a.index];a.minimumEnergy=Math.min(a.minimumEnergy??100,p.energy);const stepDt=dt*(p.finish!==null?6:1);
    CVRacecraft.advance(a,stepDt);
    a.minimumEnergy=Math.min(a.minimumEnergy??100,p.energy);const place=1+a.runners.filter(r=>!r.player&&(r.distance>p.distance||(r.finish!==null&&(p.finish===null||r.finish<p.finish)))).length;
    if(a.lastPlace!==null&&place<a.lastPlace&&p.finish===null)feedback(a,'MOVED UP TO '+ordinal(place).toUpperCase()+'!');a.lastPlace=place;
    const kb=$('kick-button');if(kb){kb.disabled=a.t<p.surgeUntil||a.kickUsed||p.distance/m.distance<.8||p.energy<20||p.finish!==null;kb.textContent=a.kick>0?'KICK! '+a.kick.toFixed(1)+'s':a.kickUsed?'Kick used':p.distance/m.distance<.8?'Kick unlocks at 80%':'K · Finishing kick';}
    if(a.runners.every(r=>r.finish!==null))finishRace(a);
  }else{
    a.t+=dt;
    if(a.index===0){const duration=Math.max(.76,1.35-a.t*.024);a.beatT+=dt;if(a.beatT>=duration){a.possible++;if(!a.hit)miss(a);a.beat++;a.beatT=0;a.hit=false;}}
    if(a.index===1){a.effort=E.clamp(a.effort+(a.held?.65:-.42)*dt,0,1);a.zone=.5+Math.sin(a.t*.6)*.19;const width=.29-a.t*.003;const inZone=Math.abs(a.effort-a.zone)<width/2;if(inZone){a.cleanTime+=dt;a.streak+=dt;const combo=Math.floor(a.streak);if(combo>a.combo){a.combo=combo;a.maxCombo=Math.max(a.maxCombo,a.combo);if(combo>0&&combo%3===0)feedback(a,combo+'s IN RHYTHM!');}}else{a.streak=0;a.combo=0;}}
    if(a.index===2){a.jump=Math.max(0,a.jump-dt);if(a.t>=a.nextRoot){a.obstacles.push({x:1120,checked:false,tall:a.attempts%3===2});a.nextRoot+=Math.max(1.1,1.8-a.t*.027);}for(const o of a.obstacles){o.x-=(320+a.t*7)*dt;if(o.x<=245&&!o.checked){o.checked=true;a.attempts++;if(Math.sin(a.jump/.85*Math.PI)*85>(o.tall?40:25)){a.score++;cleanHit(a,a.jump>.30&&a.jump<.55);}else miss(a);}}a.obstacles=a.obstacles.filter(o=>o.x>-40);}
    if(a.t>=20){if(a.index===0&&a.hit)a.possible++;finishTraining(a);}
  }
};
function textCanvas(c,text,x,y,size=18,color='#294e65',align='left'){c.font=`600 ${size}px Fredoka, sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(text,x,y);c.textAlign='left';}
function panel(c,x,y,w,h,color='#fff4ce'){c.fillStyle=color;c.strokeStyle='#345e77';c.lineWidth=3;c.beginPath();c.roundRect(x,y,w,h,12);c.fill();c.stroke();}
function courseScene(c,a,progress){const theme=S.courses[a.index].theme,scroll=a.runners[0].distance*2;landscape(c,1100,440,scroll);const kind=CVRacecraft.route(a,a.runners[0],progress).kind;
  if(theme==='lake'){oval(c,800,240,290,44,'#49b9d4','#328aa7');for(let i=0;i<6;i++){c.fillStyle='#aff2ed';c.fillRect(600+i*76,234+i%2*12,40,3);}}
  if(theme==='forest')for(let i=0;i<11;i++)roundTree(c,((i*125-scroll*.5)%1300+1300)%1300-100,292,.9+i%3*.13);
  if(theme==='mountain'){c.fillStyle='#99a6bc';for(let i=0;i<4;i++){const x=i*340-100;c.beginPath();c.moveTo(x,260);c.lineTo(x+180,65+i%2*40);c.lineTo(x+370,260);c.fill();c.fillStyle='#e4efee';c.beginPath();c.moveTo(x+138,112+i%2*40);c.lineTo(x+180,65+i%2*40);c.lineTo(x+223,112+i%2*40);c.fill();c.fillStyle='#99a6bc';}}
  if(theme==='autumn')for(let i=0;i<9;i++){const x=((i*153-scroll*.6)%1300+1300)%1300-100;c.fillStyle='#945e3e';c.fillRect(x,215,9,75);oval(c,x,213,35,44,['#efa447','#dd704b','#e0bf4d'][i%3],'#b2703c');}
  if(kind==='track'||theme==='stadium'){c.fillStyle='#6c99b0';c.fillRect(0,185,1100,85);for(let j=0;j<4;j++){c.fillStyle=j%2?'#abd2d8':'#81b1c3';c.fillRect(0,190+j*18,1100,12);for(let i=0;i<35;i++)oval(c,i*33,190+j*18,4,4,['#fff0ae','#e9a096','#627a9e'][i%3]);}}
  const road=yAt=>{c.beginPath();c.moveTo(0,440);for(let x=0;x<=1100;x+=20)c.lineTo(x,yAt(x));c.lineTo(1100,440);c.closePath();};
  const slope=kind==='hill'?-0.09:kind==='down'?.07:0;
  c.fillStyle=kind==='track'?'#db805a':kind==='mud'?'#997047':'#dca363';road(x=>310+(x-240)*slope);c.fill();c.strokeStyle=kind==='track'?'#fff2d4':'#f1c88d';c.lineWidth=4;for(let lane=0;lane<4;lane++){c.beginPath();c.moveTo(0,320+lane*30-240*slope);c.lineTo(1100,320+lane*30+860*slope);c.stroke();}
  if(kind==='mud')for(let i=0;i<10;i++)oval(c,((i*149-scroll)%1200+1200)%1200,340+i%3*26,40,7,'#69563d');
  if(kind==='hill'||kind==='down'){c.fillStyle='#865c3e';c.fillRect(950,220,8,100);panel(c,910,211,100,42,'#ffe7a1');textCanvas(c,kind==='hill'?'CLIMB ↗':'DOWN ↘',960,238,15,'#6a502c','center');}
  return slope;
}
draw=function(){const a=activity;if(!a)return;const canvas=$('game');const height=a.type==='race'?600:440;if(canvas.height!==height)canvas.height=height;const c=canvas.getContext('2d');c.clearRect(0,0,1100,height);
  if(a.type==='race'){
    const p=a.runners[0],m=E.meets[a.index],progress=p.distance/m.distance;
    c.save();c.scale(1,600/440);const slope=courseScene(c,a,progress);c.restore();
    // Physical lanes match tactical controls; the captain remains gold-marked.
    const kindNow=CVRacecraft.route(a,p,progress).kind;
    c.fillStyle=kindNow==='mud'?'#997047':kindNow==='track'?'#d47c57':'#dca363';
    c.fillRect(0,252,1100,348);c.strokeStyle=kindNow==='track'?'#fff2d4':'#efc891';c.lineWidth=3;
    for(let row=0;row<3;row++){c.beginPath();c.moveTo(0,310+row*100+E.clamp(-300*slope,-22,22));c.lineTo(1100,310+row*100+E.clamp(800*slope,-22,22));c.stroke();}
    if(kindNow==='mud')for(let i=0;i<14;i++)oval(c,((i*151-p.distance*2)%1150+1150)%1150,280+(i%4)*80,28,7,'#73533a');
    const ordered=S.raceOrder(a.runners),layout=S.cameraLayout(a.runners,p,slope);
    for(const item of layout.visible){const {runner:r,x,y,scale}=item;runner(c,x,y,r.color,a.t*11+r.id,scale,r.appearance);const rank=ordered.indexOf(r)+1;panel(c,x-52,y-91,104,20,r.team===0&&a.mode==='team'?'#e5f7c8':'#fff4dd');textCanvas(c,rank+'. '+r.name.slice(0,12),x,y-77,11,'#294e65','center');}
    const playerY=300+(p.lane??1)*100;oval(c,300,playerY+6,38,9,'#ffe475','#96742d');runner(c,300,playerY,state.color,a.t*11,.78);
    panel(c,256,playerY-113,88,25,'#fff2a3');textCanvas(c,'★ YOU',300,playerY-95,15,'#674f22','center');textCanvas(c,p.blocked?'BOXED IN · CHANGE LANE':p.drafting?'DRAFTING · ENERGY SAVED':p.surgeUntil>a.t?'SURGING!':'LANE '+(p.lane+1),550,578,18,'#644a27','center');
    textCanvas(c,'NEARBY RUNNERS',30,205,12,'#335b69');textCanvas(c,(layout.crowded+layout.offscreen)+' others tracked in pack map',30,223,12,'#335b69');
    updateRaceBoard(a,ordered);
    panel(c,25,16,1050,48);S.courses[a.index].segments.forEach((k,i)=>{c.fillStyle=phaseColor[k];c.fillRect(38+i*128.5,29,128,20);});oval(c,38+1028*progress,39,9,9,'#fff9c7','#234c69');textCanvas(c,'START',35,82,12);textCanvas(c,'FINISH',1060,82,12,'#294e65','right');a.forks.forEach(f=>{textCanvas(c,'⑂',38+1028*f.start,58,22,'#674f22','center');});
    panel(c,28,99,180,28);c.fillStyle=p.energy<20?'#ed7756':'#8acb59';c.beginPath();c.roundRect(33,104,Math.max(1,170*p.energy/100),18,8);c.fill();textCanvas(c,'ENERGY '+Math.round(p.energy)+'%',35,149,13);
    const kind=CVRacecraft.route(a,a.runners[0],progress).kind;panel(c,875,99,196,34);textCanvas(c,terrainNames[kind],973,121,16,'#345c70','center');
    if(progress>.78){const x=300+(m.distance-p.distance)*3.4;if(x<1100){c.fillStyle='#fff3d2';c.fillRect(x,260,7,325);c.fillRect(x+120,260,7,325);for(let i=0;i<8;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#fff3d2':'#29495c';c.fillRect(x+i*16,260+j*15,16,15);}}textCanvas(c,a.kick>0?'FINAL KICK!':'FINAL STRETCH!',550,108,25,'#9b4f25','center');}
    if(a.kick>0){c.strokeStyle='#fff2ac';c.lineWidth=4;for(let i=0;i<5;i++){c.beginPath();c.moveTo(220-i*8,490+i*13);c.lineTo(260-i*3,490+i*13);c.stroke();}}
    const place=1+a.runners.filter(r=>!r.player&&(r.distance>p.distance||(r.finish!==null&&(p.finish===null||r.finish<p.finish)))).length;
    $('hud-left').textContent=`${ordinal(place)} / ${a.runners.length} · ${Math.floor(p.distance)} / ${m.distance} m`;$('hud-right').textContent=p.finish!==null?'You finished! Watching the field…':`${escapeTime(a.t)} · ${['Easy','Steady','Push'][a.pace]}`;
  }else{
    landscape(c,1100,440,a.t*95);if(a.index===1){oval(c,870,261,210,35,'#55c9da');textCanvas(c,'FOLLOW THE RHYTHM',620,105,22,'#2a626f','center');}if(a.index===2){c.fillStyle='#8dbb65';c.beginPath();c.moveTo(450,300);c.lineTo(780,150);c.lineTo(1100,300);c.fill();textCanvas(c,'CLEAR THE TRAIL',640,115,23,'#2c644b','center');}
    runner(c,230,370-Math.sin(a.jump/.85*Math.PI)*85,state.color,a.t*12,1.2);
    if(a.index<2){const duration=Math.max(.76,1.35-a.t*.024),pos=a.index===0?a.beatT/duration:a.effort,zone=a.index===0?.5+Math.sin(a.beat*1.7)*.13:a.zone,width=a.index===0?Math.max(.18,.30-a.t*.004):.29-a.t*.003;panel(c,360,140,620,52);c.fillStyle='#f4c257';c.fillRect(370+600*(zone-width/2),145,600*width,42);c.fillStyle='#fff1af';c.fillRect(370+600*(zone-width*.19),145,600*width*.38,42);c.fillStyle=a.hit&&a.index===0?'#8aa7a1':'#25516b';c.fillRect(370+600*E.clamp(pos,0,1)-5,133,10,66);if(a.index===0)textCanvas(c,'HIT THE CENTER FOR PERFECT',670,116,20,'#2c6277','center');}
    else for(const o of a.obstacles){if(o.tall){oval(c,o.x+12,351,20,22,'#88969c','#596a75');oval(c,o.x+8,340,7,5,'#b9c7c7');}else{c.fillStyle='#795032';c.fillRect(o.x,350,32,20);c.strokeStyle='#b2804e';c.lineWidth=4;c.beginPath();c.moveTo(o.x-5,366);c.lineTo(o.x+18,345);c.lineTo(o.x+34,366);c.stroke();}}
    panel(c,30,24,215,55);textCanvas(c,'BEST '+state.season.bestTraining[training[a.index].key]+'%',48,49,14);textCanvas(c,'COMBO '+a.combo+'×',48,68,15);$('hud-left').textContent=Math.max(0,Math.ceil(20-a.t))+' seconds remaining';$('hud-right').textContent=a.index===1?'In rhythm: '+a.cleanTime.toFixed(1)+'s':'Clean hits: '+a.score.toFixed(a.index===0?1:0);
  }
  if(a.feedbackUntil>a.t&&a.countdown<=0){panel(c,330,157,440,43,'#2c5973');textCanvas(c,a.feedback,550,186,24,a.feedbackGood?'#fff4a7':'#fff7ed','center');c.strokeStyle='#5d783c';}
  if(a.countdown>0||a.paused){c.fillStyle='#153c6480';c.fillRect(0,0,1100,height);textCanvas(c,a.paused?'TAKE A BREATH':String(Math.ceil(a.countdown)),550,230,a.paused?38:92,'#fff3bd','center');textCanvas(c,a.paused?'Press P or Resume to continue':'ON YOUR MARKS…',550,280,19,'#fff','center');}
};
// A new activity clears the previous results layout without disturbing the saved season.
const oldOpen=openActivity;openActivity=function(label,title){oldOpen(label,title);$('result').classList.remove('race-result');};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.mode){meetMode=b.dataset.mode;render();}if(b.dataset.recruit){const r=S.recruits.find(r=>r.id===b.dataset.recruit);if(state.season.roster.length>=6){const weakest=[...state.season.roster].sort((a,b)=>S.average(a.stats)-S.average(b.stats))[0];if(!confirm(`Recruit ${r.name} for ${r.cost} coins and replace ${weakest.name}?`))return;}if(S.recruit(state,b.dataset.recruit)){save();render();notice(r.name+' joined Camp Varsity!');}}if(b.hasAttribute('data-team-workout')&&S.workout(state)){save();render();notice('Team workout complete! +5 to every teammate stat.');}});
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='k'&&!e.repeat&&!/INPUT|TEXTAREA/.test(e.target.tagName))kick();});
// Save migration preserves version-1 stats, coins and unlocks, adding a starter scoring team.
save();render();

$('notice').addEventListener('click',()=>notice(''));

// A compact, throttled pack overview replaces overlapping on-track labels.
function updateRaceBoard(a,ordered){
  let board=$('race-board');
  if(!board){board=document.createElement('div');board.id='race-board';$('play').insertBefore(board,$('activity-help'));}
  board.hidden=false;
  if(a.boardTime!=null&&Math.abs(a.t-a.boardTime)<.3&&a.boardDone===a.done)return;
  a.boardTime=a.t;a.boardDone=a.done;
  const p=a.runners[0],distance=E.meets[a.index].distance,place=ordered.indexOf(p),ahead=ordered[place-1];
  const start=Math.max(0,Math.min(place-2,ordered.length-5));
  const near=ordered.slice(start,start+5);
  let teamText='';if(a.mode==='team'){const scores=S.scoreTeams(ordered),rank=scores.findIndex(t=>t.team===0)+1,ours=scores.find(t=>t.team===0);teamText=`<span>Team: ${ordinal(rank)} · ${ours.score} pts <small>(live estimate)</small></span>`;}
  if(a.countdown>0)teamText='<span>Scores begin after the start</span>';
  const dots=a.runners.filter(r=>!r.player).map(r=>`<i class="pack-dot" style="left:${E.clamp(r.distance/distance*100,0,100)}%;top:${a.mode==='team'?6+r.team*7:10+(r.id%3)*7}px;background:${r.color}" title="${safe(r.name)}"></i>`).join('');
  board.innerHTML=`<div class="pack-summary"><b>${a.countdown>0?a.runners.length+' RUNNERS AT THE LINE':p.finish!==null?'FINISHED':ahead?Math.max(0,Math.round(ahead.distance-p.distance))+' m to '+safe(ahead.name):'YOU LEAD THE FIELD'}</b>${teamText}<span class="energy-tip ${p.energy<20?'energy-low':''}">${p.energy<20?'LOW ENERGY · Ease off to recover':p.distance/distance>=.8&&!a.kickUsed&&p.energy>=20?'KICK READY · Press K or tap Kick':'Pace: '+['Recovering','Steady','Pushing'][a.pace]}</span></div><div class="pack-track" aria-label="Full field progress"><span class="pack-start">START</span>${dots}<i class="pack-you" style="left:${E.clamp(p.distance/distance*100,0,100)}%" title="You">★</i><span class="pack-finish">FINISH</span></div><div class="nearby-list">${near.map((r,i)=>`<span class="${r.player?'nearby-you':''}"><b>${start+i+1}.</b> ${safe(r.player?'YOU':r.name)}${a.mode==='team'&&r.team===0&&!r.player?' <small>TEAM</small>':''}</span>`).join('')}</div>`;
}
const openPolishedActivity=openActivity;
openActivity=function(label,title){openPolishedActivity(label,title);const board=$('race-board');if(board)board.hidden=activity?.type!=='race';$('play').classList.toggle('race-view',activity?.type==='race');};
const finishPolishedActivity=finish;
finish=function(title,body){finishPolishedActivity(title,body);const a=activity;if(!a)return;const retry=document.createElement('button');retry.id='play-again';retry.className='outline';retry.textContent=a.type==='race'?'Race again ↻':'Train again ↻';retry.onclick=()=>{const type=a.type,index=a.index,mode=a.mode;activity=null;if(type==='race'){meetMode=mode;startRace(index);}else startTraining(index);};$('result').append(retry);};
const setPolishedPace=setPace;
setPace=function(p){setPolishedPace(p);document.querySelectorAll('[data-pace]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.pace===activity?.pace)));};
