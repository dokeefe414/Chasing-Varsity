/* Chasing Varsity v1.1 - locker room, race readability, workout feel and layout. */
'use strict';
const P11=CVEleven;
function v11Color(){return /^#[0-9a-f]{6}$/i.test(state.color)?state.color:'#e97544';}
function v11Portrait(style,color,number){
 return `<span class="cv-figure ${style}" style="--jersey:${color}" aria-hidden="true"><span class="cv-hair"></span><span class="cv-head"></span><span class="cv-neck"></span><span class="cv-shirt"></span><span class="cv-bib">${number}</span><span class="cv-arm arm-left"></span><span class="cv-arm arm-right"></span></span>`;
}
function renderLockerRoom(){
 const team=$('team-content');if(!team)return;
 const data=P11.lineup(state),style=P11.ensure(state).jersey,active=data.filter(r=>r.active),bench=data.filter(r=>!r.active),color=v11Color(),scout=V.ensure(state).scout;
 const old=team.querySelector('.lineup-grid');if(old)old.hidden=true;
 const scene=document.createElement('section');scene.id='v11-locker';scene.className='v11-locker';
 const player=(r,i,starting)=>{
  const rating=V.fit(r.stats,scout),label=r.captain?'Captain':D.roles[D.specialty(r.stats)],title=`${r.name} · ${label} · course fit ${rating}`;
  return `<article class="v11-player ${r.captain?'captain':''} ${starting?'starting':'benched'}"><div class="v11-locker-portrait">${v11Portrait(style,color,r.captain?'C':i+1)}</div><b>${safe(r.name)}</b><small>${label} · FIT ${rating}</small>${r.captain?'<span class="v11-captain">YOUR RUNNER</span>':`<button type="button" class="outline" data-lineup="${safe(r.id)}" aria-label="${starting?'Bench':'Start'} ${safe(r.name)}" ${starting&&active.length===5||!starting&&active.length===7?'disabled':''}>${starting?'Move to bench':'Add to lineup'}</button>`}</article>`;
 };
 scene.innerHTML=`<div class="v11-locker-head"><div><p class="eyebrow">CAMP VARSITY · LOCKER ROOM</p><h2>Starting lineup</h2><p>The captain is always selected. Choose 4–6 teammates for your next team meet; the first five finishers score.</p></div><div class="v11-lineup-total"><strong>${active.length} / 7</strong><span>on the start line</span></div></div>
 <div class="v11-locker-room"><div class="v11-locker-ceiling">CAMP VARSITY <span>EVERY PLACE MATTERS</span></div><div class="v11-player-row">${active.map((r,i)=>player(r,i,true)).join('')}</div><div class="v11-floor"></div></div>
 <div class="v11-locker-tools"><div><b>Choose a jersey</b><p>Uniform pattern is cosmetic and saved with your team.</p></div><div class="v11-jerseys" role="group" aria-label="Jersey style">${P11.STYLES.map(s=>`<button type="button" data-jersey="${s}" aria-pressed="${s===style}" class="${s===style?'selected':''}"><span class="v11-swatch ${s}" style="--jersey:${color}"></span>${s==='classic'?'Classic':s==='stripe'?'Track stripe':'Varsity V'}</button>`).join('')}</div></div>
 <div class="v11-bench-head"><h3>Bench & substitutions</h3><span>${bench.length} runners available</span></div><div class="v11-bench-row">${bench.length?bench.map((r,i)=>player(r,i,false)).join(''):'<p>Everyone is in the starting group. Bench a teammate to make a substitution.</p>'}</div>
 <p class="v11-locker-note">Scout a course below or use <b>Recommend lineup</b> to pick teammates by course fit. Your chosen lineup is used in team races, without changing individual stats.</p>`;
 team.insertBefore(scene,team.firstChild);
}
const v11RenderBefore=render;
render=function(){v11RenderBefore();renderLockerRoom();};
function v11DockSound(inPlay){
 const sound=document.querySelector('.sound-toggle');
 if(!sound)return;
 sound.classList.toggle('v11-sound-inline',inPlay);
 if(inPlay){const top=$('play').querySelector('.play-top');if(top)top.append(sound);}
 else document.body.append(sound);
}
const v11ShowBefore=showTab;
showTab=function(name){v11DockSound(false);v11ShowBefore(name);window.scrollTo?.({top:0,behavior:'auto'});};
const v11OpenBefore=openActivity;
openActivity=function(...args){v11OpenBefore(...args);v11DockSound(true);};
const v11ProfileBefore=CVAdventure.profile;
CVAdventure.profile=function(a){return P11.assist(a,v11ProfileBefore(a));};
const v11TrainingStart=startTraining;
startTraining=function(i){const prev=activity;v11TrainingStart(i);if(activity&&activity!==prev&&activity.type==='training'){activity.v11BeforeStats={...state.stats};activity.v11MissStreak=0;activity.v11Flash={text:'READY TO TRAIN',good:true,until:0};}};
const v11MissBefore=miss;
miss=function(a){a.v11MissStreak=(a.v11MissStreak||0)+1;a.v11Flash={text:'MISS · RESET AND REFIND THE RHYTHM',good:false,until:a.t+1.05};v11MissBefore(a);};
const v11HitBefore=cleanHit;
cleanHit=function(a,perfect){a.v11MissStreak=0;a.v11Flash={text:perfect?'★ PERFECT TIMING':'✓ CLEAN HIT',good:true,until:a.t+.9};v11HitBefore(a,perfect);};
const v11ActBefore=act;
act=function(){const a=activity,before=a?.drillHits||0;v11ActBefore();if(a&&a===activity&&a.drill==='ladder'&&!a.done&&a.countdown<=0){const hit=a.drillHits>before;a.v11Flash={text:hit?'✓ BEAT HIT':'✕ TOO EARLY / TOO LATE',good:hit,until:a.t+.85};}};
const v11UpdateBefore=update;
update=function(dt){const a=activity,previousHits=a?.drillHits,previousAttempts=a?.drillAttempts;v11UpdateBefore(dt);if(a&&a===activity&&a.drill&&!a.done&&a.countdown<=0){
 if(a.drill==='checkpoints'&&a.drillAttempts>previousAttempts||a.drill==='trail'&&a.drillAttempts>previousAttempts){
  const good=a.drillHits>previousHits;
  a.v11Flash={text:good?'✓ TARGET SECURED':'✕ MISSED · TRY AGAIN',good,until:a.t+1.0};
 }
}};
function v11EnsureHud(){
 let el=document.getElementById('v11-performance');
 if(!el){el=document.createElement('section');el.id='v11-performance';el.className='v11-performance';el.setAttribute('aria-label','Live game feedback');$('play').insertBefore(el,$('game'));}
 return el;
}
function v11LiveFeedback(){
 const a=activity,box=v11EnsureHud();box.hidden=!a||a.done;if(box.hidden)return;
 if(a.v11NextPaint!=null&&a.t<a.v11NextPaint)return;a.v11NextPaint=a.t+.12;
 if(a.type==='race'){
  const cue=P11.raceOpportunity(a),p=a.runners[0],distance=E.meets[a.index].distance,progress=Math.min(100,Math.floor(100*p.distance/distance));
  box.className='v11-performance race v11-'+cue.tone+(progress>90?' v11-final':'');
  box.innerHTML=`<div class="v11-performance-heading"><b>${safe(cue.title)}</b><span>${progress}% of course</span></div><p>${safe(cue.detail)}</p><div class="v11-meter"><span style="width:${progress}%"></span></div>`;
 }else{
  const info=P11.workoutProgress(a);if(!info)return;
  const flash=a.v11Flash&&a.v11Flash.until>a.t?a.v11Flash:null;
  const adapt=!a.drill&&a.trainingMode!=='challenge'&&(a.v11MissStreak||0)>=3;
  box.className='v11-performance training'+(flash?(flash.good?' is-hit':' is-miss'):'');
  box.innerHTML=`<div class="v11-performance-heading"><b>${safe(info.label)}: ${info.count}${info.unit==='%'?'%':' / '+info.goal+' '+info.unit}</b><span>${info.remaining.toFixed(1)}s left</span></div><div class="v11-meter"><span style="width:${info.progress}%"></span></div><p>${flash?'<strong>'+safe(flash.text)+'</strong> · ':''}${safe(info.tip)}</p>${adapt?'<small>Coach assist: the standard timing window is a little wider after missed attempts. Challenge stays unchanged.</small>':''}`;
 }
}
const v11DrawBefore=draw;
draw=function(){v11DrawBefore();v11LiveFeedback();};
const v11TrainingFinishBefore=finishTraining;
finishTraining=function(a){
 if(a.done)return;
 const baseline=a.v11BeforeStats||{...state.stats};const quality=a.drillQuality??(a.index===0?a.score/Math.max(1,a.possible):a.index===1?a.cleanTime/20:a.score/Math.max(1,a.attempts));
 v11TrainingFinishBefore(a);
 if(!a.done)return;
 const summary=P11.debrief(baseline,state.stats,quality),info=P11.workoutProgress(a),detail=document.createElement('section');detail.className='v11-debrief';
 detail.innerHTML=`<h3>What improved</h3><div class="v11-improvements">${summary.gained.length?summary.gained.map(x=>`<span><b>+${x.amount}</b> ${safe(x.key)}</span>`).join(''):'<span>Your trained stats are at their cap. Focus on racecraft.</span>'}</div><p>${safe(summary.tip)}</p>${info?'<small>'+safe(info.label)+': '+info.count+(info.unit==='%'?'%':' / '+info.goal+' '+info.unit)+'</small>':''}`;
 $('result').insertBefore(detail,$('continue'));
};
/* Carry the selected jersey design into races, podiums and your avatar. */
const v11RunnerBefore=runner;
runner=function(c,x,y,color,phase,scale=1,appearance,motion){
 v11RunnerBefore(c,x,y,color,phase,scale,appearance,motion);
 const jersey=P11.ensure(state).jersey;
 if(jersey==='classic'||appearance||color!==state.color)return;
 c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#fff4bd';
 if(jersey==='stripe')c.fillRect(0,-55,5,18);
 else{c.font='900 15px Outfit, sans-serif';c.fillText('V',-6,-34);}
 c.restore();
};
const v11RaceFinishBefore=finishRace;
finishRace=function(a){
 if(a.done)return;v11RaceFinishBefore(a);if(!a.done||a.practice||a.scenario)return;
 const close=P11.closeFinish(a);if(!close)return;
 const panel=document.createElement('section');panel.className='v11-photo'+(close.photo?' photo-tight':'');
 panel.innerHTML=`<div class="v11-photo-tape">FINISH LINE <span>★ ★ ★</span> FINISH LINE</div><h3>${close.photo?'PHOTO FINISH!':'TO THE WIRE!'}</h3><p>${close.beat?'You edged':'You chased'} ${safe(close.name)} by just <b>${close.margin.toFixed(2)} seconds</b> in arcade time.</p><small>Replay your final seconds to see where the race was decided.</small>`;
 $('result').insertBefore(panel,$('result').firstChild);
};
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.jersey&&P11.switchJersey(state,b.dataset.jersey)){save();render();notice('Jersey style saved. Your lineup is unchanged.');}
});
render();save();
