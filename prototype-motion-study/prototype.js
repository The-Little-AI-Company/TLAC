const variants=[{key:"3",name:"Night ledger"},{key:"1",name:"Signal workshop"}];
const frameCount=44,fps=11,fadeFrames=8,frameRoot="./assets/frames-web";
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
const label=document.querySelector("#variant-label");
const pauseButton=document.querySelector("#pause-button");
const loadStatus=document.querySelector("#load-status");
const sections=[...document.querySelectorAll("[data-variant]")];
const renderers=new Map();
let current=readVariant(),paused=reducedMotion.matches,loadedFrames=[];
const bayer=[[0,48,12,60,3,51,15,63],[32,16,44,28,35,19,47,31],[8,56,4,52,11,59,7,55],[40,24,36,20,43,27,39,23],[2,50,14,62,1,49,13,61],[34,18,46,30,33,17,45,29],[10,58,6,54,9,57,5,53],[42,26,38,22,41,25,37,21]];
const settings={
  "3":{pixel:8,levels:6,dot:.82,gap:.34,background:"#11182b",palette:[[91,124,255],[255,176,74],[237,112,88],[243,235,221]]},
  "1":{pixel:9,levels:5,dot:.78,gap:.38,background:"#081828",palette:[[29,78,216],[245,168,0],[105,199,189],[223,77,43]]}
};

function normalizeVariant(key){
  const legacy={A:"1",B:"1",C:"3",a:"1",b:"1",c:"3"};
  const normalized=legacy[key]||key;
  return variants.some(function(item){return item.key===normalized})?normalized:"3";
}
function readVariant(){
  return normalizeVariant(new URLSearchParams(location.search).get("variant"));
}
function setVariant(key,update){
  if(update===undefined)update=true;
  key=normalizeVariant(key);
  current=key;
  sections.forEach(function(section){
    const active=section.dataset.variant===key;
    section.classList.toggle("is-active",active);
    section.classList.toggle("is-ready",active);
    section.setAttribute("aria-hidden",String(!active));
  });
  const active=variants.find(function(item){return item.key===key});
  label.value=active.key+" — "+active.name;
  label.textContent=label.value;
  document.documentElement.style.colorScheme=key==="3"?"dark":"light";
  if(update){
    const url=new URL(location.href);
    url.searchParams.set("variant",key);
    url.hash="";
    history.replaceState({},"",url);
    scrollTo({top:0,behavior:reducedMotion.matches?"auto":"smooth"});
  }
  requestAnimationFrame(function(){
    const renderer=getRenderer(key);
    renderers.forEach(function(candidate,candidateKey){candidate.setActive(candidateKey===key)});
    renderer.resize();
    refreshVisible();
  });
}
function cycle(direction){
  const index=variants.findIndex(function(item){return item.key===current});
  setVariant(variants[(index+direction+variants.length)%variants.length].key);
}
function prepareLivingType(){
  document.querySelectorAll("[data-split]").forEach(function(element){
    const words=element.textContent.trim().split(/\s+/);
    element.textContent="";
    words.forEach(function(word,index){
      const shell=document.createElement("span");
      const inner=document.createElement("span");
      shell.className="word";
      inner.textContent=word;
      inner.style.setProperty("--i",String(index));
      shell.appendChild(inner);
      element.appendChild(shell);
      if(index<words.length-1)element.appendChild(document.createTextNode(" "));
    });
  });
}
function setupReveals(){
  if(reducedMotion.matches){
    document.querySelectorAll("[data-reveal],.living-subtitle").forEach(function(item){item.classList.add("is-visible")});
    return;
  }
  const observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){if(entry.isIntersecting)entry.target.classList.add("is-visible")});
  },{threshold:.16,rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll("[data-reveal],.living-subtitle").forEach(function(item){observer.observe(item)});
}
function refreshVisible(){
  const active=sections.find(function(section){return section.dataset.variant===current});
  if(!active)return;
  active.querySelectorAll("[data-reveal]").forEach(function(item){
    const rect=item.getBoundingClientRect();
    if(rect.top<innerHeight*.94&&rect.bottom>0)item.classList.add("is-visible");
  });
}
function updateScrollType(){
  if(reducedMotion.matches)return;
  const active=sections.find(function(section){return section.dataset.variant===current});
  if(!active)return;
  active.querySelectorAll("[data-scroll-shift]").forEach(function(stage){
    const rect=stage.getBoundingClientRect();
    const progress=clamp((innerHeight-rect.top)/(innerHeight+rect.height),0,1);
    const magnitude=(progress-.5)*260;
    stage.querySelectorAll(".shift-left").forEach(function(line){line.style.setProperty("--shift",String(-magnitude))});
    stage.querySelectorAll(".shift-right").forEach(function(line){line.style.setProperty("--shift",String(magnitude))});
  });
}
function getRenderer(key){
  if(renderers.has(key))return renderers.get(key);
  key=normalizeVariant(key);
  const section=sections.find(function(item){return item.dataset.variant===key});
  if(!section)return{resize:function(){},setFrames:function(){},setPaused:function(){}};
  const canvas=section.querySelector("[data-motion-canvas]");
  if(!canvas)return{resize:function(){},setFrames:function(){},setPaused:function(){}};
  const renderer=new DitherRenderer(canvas,settings[key]);
  renderer.setFrames(loadedFrames);
  renderer.setPaused(paused);
  renderers.set(key,renderer);
  return renderer;
}
function updatePause(){
  pauseButton.setAttribute("aria-pressed",String(paused));
  pauseButton.textContent=paused?"Play motion":"Pause motion";
  renderers.forEach(function(renderer){renderer.setPaused(paused)});
}
async function loadFrames(){
  const frames=[];
  let done=0;
  await Promise.all(Array.from({length:frameCount},function(_,index){
    const image=new Image();
    image.decoding="async";
    image.src=frameRoot+"/frame-"+String(index+1).padStart(3,"0")+".jpg";
    return image.decode().then(function(){frames[index]=image;done+=1;loadStatus.textContent="Loading Fal frames "+done+"/"+frameCount});
  }));
  loadedFrames=frames;
  renderers.forEach(function(renderer){renderer.setFrames(frames)});
  loadStatus.textContent=paused?"Fal frames ready / paused":"Fal frames ready / 11 fps";
}
class DitherRenderer{
  constructor(canvas,options){
    this.canvas=canvas;
    this.ctx=canvas.getContext("2d",{alpha:false});
    this.buffer=document.createElement("canvas");
    this.bctx=this.buffer.getContext("2d",{willReadFrequently:true});
    this.options=options;
    this.frames=[];
    this.frame=0;
    this.last=0;
    this.paused=paused;
    this.active=true;
    this.pointer={x:-10000,y:-10000};
    this.levels={low:0,high:255};
    new ResizeObserver(()=>this.resize()).observe(canvas);
    canvas.addEventListener("pointermove",event=>this.track(event));
    canvas.addEventListener("pointerleave",()=>this.pointer={x:-10000,y:-10000});
    this.tick=this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }
  setFrames(frames){this.frames=frames;if(frames.length){this.pinLevels();if(this.active)this.draw()}}
  setPaused(value){this.paused=value;if(value&&this.active)this.draw()}
  setActive(value){this.active=value;if(value){this.last=0;this.resize()}}
  resize(){
    const rect=this.canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const density=Math.min(devicePixelRatio||1,1.5);
    const width=Math.round(rect.width*density);
    const height=Math.round(rect.height*density);
    if(width===this.canvas.width&&height===this.canvas.height)return;
    this.canvas.width=width;
    this.canvas.height=height;
    this.draw();
  }
  track(event){
    const rect=this.canvas.getBoundingClientRect();
    this.pointer.x=(event.clientX-rect.left)/rect.width*this.canvas.width;
    this.pointer.y=(event.clientY-rect.top)/rect.height*this.canvas.height;
  }
  pinLevels(){
    const sample=this.frames.filter(function(_,index){return index%7===0});
    const hist=new Uint32Array(256);
    this.buffer.width=96;this.buffer.height=54;
    sample.forEach(frame=>{
      this.bctx.drawImage(frame,0,0,96,54);
      const pixels=this.bctx.getImageData(0,0,96,54).data;
      for(let index=0;index<pixels.length;index+=4){
        const luma=Math.round(.2126*pixels[index]+.7152*pixels[index+1]+.0722*pixels[index+2]);
        hist[luma]+=1;
      }
    });
    const total=sample.length*96*54;
    this.levels.low=percentile(hist,total,.02);
    this.levels.high=percentile(hist,total,.98);
  }
  tick(time){
    if(this.active&&!this.paused&&this.frames.length&&time-this.last>=1000/fps){
      this.frame=(this.frame+1)%this.frames.length;
      this.last=time;
      this.draw();
    }
    requestAnimationFrame(this.tick);
  }
  draw(){
    if(!this.frames.length||!this.canvas.width||!this.canvas.height)return;
    const pixel=this.options.pixel;
    const columns=Math.max(1,Math.ceil(this.canvas.width/pixel));
    const rows=Math.max(1,Math.ceil(this.canvas.height/pixel));
    this.buffer.width=columns;this.buffer.height=rows;
    this.bctx.clearRect(0,0,columns,rows);
    drawCover(this.bctx,this.frames[this.frame],columns,rows);
    const fadeStart=this.frames.length-fadeFrames;
    if(this.frame>=fadeStart){
      const head=this.frames[this.frame-fadeStart];
      const alpha=(this.frame-fadeStart+1)/(fadeFrames+1);
      this.bctx.globalAlpha=alpha;drawCover(this.bctx,head,columns,rows);this.bctx.globalAlpha=1;
    }
    const pixels=this.bctx.getImageData(0,0,columns,rows).data;
    this.ctx.fillStyle=this.options.background;
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    for(let row=0;row<rows;row+=1){
      for(let column=0;column<columns;column+=1)this.drawCell(pixels,columns,column,row);
    }
  }
  drawCell(pixels,columns,column,row){
    const options=this.options;
    const x=column*options.pixel+options.pixel/2;
    const y=row*options.pixel+options.pixel/2;
    const displacement=this.displace(x,y);
    const sampleColumn=clamp(Math.round(column+displacement.x/options.pixel),0,columns-1);
    const sampleRow=clamp(Math.round(row+displacement.y/options.pixel),0,this.buffer.height-1);
    const index=(sampleRow*columns+sampleColumn)*4;
    const red=pixels[index],green=pixels[index+1],blue=pixels[index+2];
    const luma=.2126*red+.7152*green+.0722*blue;
    const normal=clamp((luma-this.levels.low)/Math.max(1,this.levels.high-this.levels.low),0,1);
    const tone=1-normal;
    const threshold=(bayer[row%8][column%8]+.5)/64-.5;
    const quant=clamp(Math.round((tone+threshold/options.levels)*(options.levels-1))/(options.levels-1),0,1);
    if(quant<.04)return;
    const radius=Math.max(.45,options.pixel*(1-options.gap)*options.dot*Math.sqrt(quant)*.5);
    this.ctx.fillStyle=paletteColor(options.palette,red,green,blue,quant);
    this.ctx.beginPath();this.ctx.arc(x,y,radius,0,Math.PI*2);this.ctx.fill();
  }
  displace(x,y){
    const dx=x-this.pointer.x,dy=y-this.pointer.y,distance=Math.hypot(dx,dy);
    const radius=Math.max(this.canvas.width,this.canvas.height)*.48;
    if(distance>=radius)return{x:0,y:0};
    const falloff=(1-distance/radius)**2;
    return{x:dx/Math.max(distance,1)*falloff*18,y:-falloff*10};
  }
}
function percentile(hist,total,fraction){let running=0;const target=total*fraction;for(let i=0;i<hist.length;i+=1){running+=hist[i];if(running>=target)return i}return 255}
function drawCover(ctx,image,width,height){
  const sourceRatio=image.naturalWidth/image.naturalHeight,targetRatio=width/height;
  let sw=image.naturalWidth,sh=image.naturalHeight,sx=0,sy=0;
  if(sourceRatio>targetRatio){sw=image.naturalHeight*targetRatio;sx=(image.naturalWidth-sw)/2}else{sh=image.naturalWidth/targetRatio;sy=(image.naturalHeight-sh)/2}
  ctx.drawImage(image,sx,sy,sw,sh,0,0,width,height);
}
function paletteColor(palette,red,green,blue,tone){
  let slot=0;
  if(red>green*1.13)slot=2;else if(green>red*1.08)slot=1;else if(blue>red*1.08)slot=0;else slot=3;
  const color=palette[slot];
  const lift=.72+tone*.28;
  return "rgb("+Math.round(color[0]*lift)+" "+Math.round(color[1]*lift)+" "+Math.round(color[2]*lift)+")";
}
function clamp(value,min,max){return Math.min(max,Math.max(min,value))}

document.querySelectorAll("[data-direction]").forEach(function(button){button.addEventListener("click",function(){cycle(Number(button.dataset.direction))})});
pauseButton.addEventListener("click",function(){paused=!paused;updatePause();loadStatus.textContent=paused?"Fal frames ready / paused":"Fal frames ready / 11 fps"});
addEventListener("keydown",function(event){
  if(event.target.matches("input,textarea,[contenteditable='true']"))return;
  if(event.key==="ArrowLeft")cycle(-1);
  if(event.key==="ArrowRight")cycle(1);
});
addEventListener("popstate",function(){setVariant(readVariant(),false)});
addEventListener("scroll",function(){requestAnimationFrame(updateScrollType)},{passive:true});
reducedMotion.addEventListener("change",function(event){paused=event.matches;updatePause();if(event.matches)refreshVisible()});
prepareLivingType();
setupReveals();
setVariant(current,false);
updatePause();
updateScrollType();
loadFrames().catch(function(error){console.error(error);loadStatus.textContent="Frame load failed"});
