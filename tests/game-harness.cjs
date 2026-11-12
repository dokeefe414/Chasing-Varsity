// Execute the actual UI controllers against a minimal DOM, with deterministic time.
// Complements browser inspection; no browser APIs are emulated for visual assertions.
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function game(){
 const noop=()=>{},nodes=new Map();
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});
 function element(id=''){return {id,hidden:false,disabled:false,textContent:'',innerHTML:'',value:'',style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},addEventListener:noop,setAttribute:noop,append:noop,appendChild:noop,insertBefore:noop,remove:noop,showModal(){this.open=true;},close(){this.open=false;},getContext:()=>ctx,querySelector:()=>element(),querySelectorAll:()=>[]};}
 const byId=id=>{if(!nodes.has(id))nodes.set(id,element(id));return nodes.get(id);};
 const env={console,Math,JSON,Number,String,Object,Array,Map,Infinity,Set,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,confirm:()=>true,document:{getElementById:byId,querySelector:()=>element(),querySelectorAll:()=>[],createElement:()=>element(),addEventListener:noop,body:element()},addEventListener:noop,matchMedia:()=>({matches:false})};env.window=env;vm.createContext(env);
 for(const file of ['engine.js','season-engine.js','journey-engine.js','racecraft-engine.js','career-engine.js','raceday-engine.js','adventure-engine.js','varsity-engine.js','polish-engine.js','competition-engine.js','game.js','cartoon.js','season.js','journey.js','racecraft.js','career.js','raceday.js','adventure.js','varsity.js','polish.js','competition.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),env,{filename:file});
 return code=>vm.runInContext(code,env);
}

module.exports={game};
