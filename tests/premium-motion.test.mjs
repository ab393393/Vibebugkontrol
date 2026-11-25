import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
const viteRequire=createRequire(require.resolve('vite'));
const {build}=viteRequire('esbuild');
let fixture;
const ticks=new Set();
class FakeLenis {
  constructor(options){this.options=options;this.destroyed=false;this.initialScroll=window.scrollY;fixture.instances.push(this);}
  on(){return ()=>{this.unsubscribed=true;};}
  raf(time){this.time=time;}
  destroy(){this.destroyed=true;}
}
const mocks={
  gsap:{registerPlugin(){},matchMedia:()=>({add(){},revert(){}}),ticker:{add:fn=>ticks.add(fn),remove:fn=>ticks.delete(fn)}},
  ScrollTrigger:{update(){},refresh(){}},CustomEase:{create(){}},Lenis:FakeLenis,
  motionValue(initial){
    const value={current:initial,listeners:[],jump(next){this.current=next;this.listeners.forEach(fn=>fn(next));},on(_,fn){this.listeners.push(fn);return ()=>{this.listeners=this.listeners.filter(item=>item!==fn);};},destroy(){this.destroyed=true;}};
    fixture.values.push(value);return value;
  },
  animate(value,target,options){fixture.animations.push({value,target,options});value.jump(target);}
};
globalThis.__vbkMotionMocks=mocks;
await mkdir(path.join(root,'.sites-runtime'),{recursive:true});
const output=path.join(root,'.sites-runtime/premium-motion-fixture.mjs');
await build({stdin:{contents:"export {mountVBKMotion} from '../public/vbk-motion.mjs'; export {canRenderShield} from '../components/shield-capability.ts';",resolveDir:import.meta.dirname},outfile:output,bundle:true,platform:'node',format:'esm',logLevel:'silent',plugins:[{
  name:'motion-lifecycle-fixtures',setup(builder){
    builder.onResolve({filter:/^(gsap(?:\/.*)?|lenis|motion)$/},args=>({path:args.path,namespace:'fixture'}));
    builder.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='lenis'?'export default globalThis.__vbkMotionMocks.Lenis;':args.path==='motion'?'export const animate=globalThis.__vbkMotionMocks.animate;export const motionValue=globalThis.__vbkMotionMocks.motionValue;':'export const gsap=globalThis.__vbkMotionMocks.gsap;export const ScrollTrigger=globalThis.__vbkMotionMocks.ScrollTrigger;export const CustomEase=globalThis.__vbkMotionMocks.CustomEase;',loader:'js'}));
  }
}]});
const {mountVBKMotion,canRenderShield}=await import(pathToFileURL(output));

function environment({desktop=true,reduced=false,hidden=false}={}){
  const previous=Object.fromEntries(['window','document','getComputedStyle','MutationObserver'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const doc=new EventTarget(),win=new EventTarget(),gallery=new EventTarget();
  const pill={style:{}},page={dataset:{},querySelectorAll:selector=>selector==='[data-diagonal-gallery]'?[gallery]:[]};
  gallery.dataset={};gallery.querySelector=()=>pill;
  const media={desktop:Object.assign(new EventTarget(),{matches:desktop}),reduced:Object.assign(new EventTarget(),{matches:reduced})};
  const context={instances:[],values:[],animations:[],modal:false,observers:[],doc,win,page,gallery,pill,media};
  doc.hidden=hidden;doc.documentElement={dataset:{inputModality:'pointer'}};doc.body={style:{position:''}};
  doc.querySelector=selector=>selector==='[data-vbk-motion]'?page:selector==='.site-header'?{getBoundingClientRect:()=>({height:100})}:selector==='dialog[open]'&&context.modal?{}:null;
  doc.querySelectorAll=selector=>selector==='dialog'?[{}]:[];
  win.matchMedia=query=>query.replaceAll(' ','').includes('prefers-reduced-motion')?media.reduced:media.desktop;
  win.scrollY=1240;
  class Observer{constructor(callback){this.callback=callback;context.observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
  for(const [key,value] of Object.entries({window:win,document:doc,getComputedStyle:()=>({transform:'none'}),MutationObserver:Observer}))Object.defineProperty(globalThis,key,{configurable:true,value});
  fixture=context;
  context.restore=()=>{for(const [key,descriptor] of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}ticks.clear();};
  return context;
}

test('desktop smooth scroll pauses for the modal, releases for keyboard, resumes and cleans its clock',()=>{
  const ctx=environment();let cleanup;
  try{
    cleanup=mountVBKMotion(ctx.doc);
    assert.equal(mountVBKMotion(ctx.doc),cleanup,'Only one engine can own a document');
    assert.equal(ctx.instances.length,1);assert.equal(ticks.size,1);
    const first=ctx.instances[0];
    assert.equal(first.options.prevent({closest:()=>({})}),true,'Nested dialog scroll stays native');
    assert.equal(first.options.virtualScroll({event:{ctrlKey:true}}),false,'Pinch/zoom is not smoothed');
    ctx.modal=true;ctx.doc.body.style.position='fixed';ctx.win.scrollY=0;ctx.observers[0].callback();assert.equal(first.destroyed,true);assert.equal(ticks.size,0);
    ctx.modal=false;ctx.observers[0].callback();assert.equal(ctx.instances.length,1,'A closing fixed-body dialog must not restart Lenis early');
    ctx.doc.body.style.position='';ctx.win.scrollY=1240;ctx.observers[0].callback();assert.equal(ctx.instances.length,2);assert.equal(ticks.size,1);
    assert.equal(ctx.instances[1].initialScroll,1240,'Resume from the restored native position');
    ctx.doc.documentElement.dataset.inputModality='keyboard';ctx.doc.dispatchEvent(new Event('keydown'));
    assert.equal(ctx.instances[1].destroyed,true);assert.equal(first.unsubscribed,true);assert.equal(ticks.size,0);
    assert.equal(ctx.page.dataset.lenisActive,undefined,'Keyboard scroll must not inherit a stopped scroll lock');
    ctx.doc.documentElement.dataset.inputModality='pointer';ctx.doc.dispatchEvent(new Event('pointerdown'));
    assert.equal(ctx.instances.length,3);assert.equal(ticks.size,1);
    ctx.media.reduced.matches=true;ctx.media.reduced.dispatchEvent(new Event('change'));
    assert.equal(ctx.instances[2].destroyed,true);assert.equal(ticks.size,0);
    cleanup();assert.ok(ctx.observers.every(observer=>observer.disconnected));
    assert.equal(ctx.page.dataset.vbkEngines,undefined);
    ctx.doc.dispatchEvent(new Event('pointerdown'));assert.equal(ctx.instances.length,3);
  }finally{cleanup?.();ctx.restore();}
});

test('touch and reduced-motion contexts keep native scroll without starting a clock',()=>{
  for(const options of [{desktop:false},{reduced:true},{hidden:true}]){
    const ctx=environment(options);let cleanup;
    try{cleanup=mountVBKMotion(ctx.doc);assert.equal(ctx.instances.length,0);assert.equal(ticks.size,0);}
    finally{cleanup?.();ctx.restore();}
  }
});

test('gallery spring feedback stays semantic, and keyboard/resizing settles it immediately',()=>{
  const ctx=environment({desktop:false});let cleanup;
  try{
    cleanup=mountVBKMotion(ctx.doc);
    const select=new CustomEvent('vbk:gallery-indicator',{cancelable:true,detail:{left:68,immediate:false}});
    assert.equal(ctx.gallery.dispatchEvent(select),false);
    assert.equal(ctx.animations.length,1);assert.equal(ctx.animations[0].options.type,'spring');
    assert.equal(ctx.pill.style.transform,'translateX(68px)');
    ctx.gallery.dispatchEvent(new CustomEvent('vbk:gallery-indicator',{cancelable:true,detail:{left:108,immediate:true}}));
    assert.equal(ctx.animations.length,1);assert.equal(ctx.pill.style.transform,'translateX(108px)');
    ctx.doc.documentElement.dataset.inputModality='keyboard';
    ctx.gallery.dispatchEvent(new CustomEvent('vbk:gallery-indicator',{cancelable:true,detail:{left:0,immediate:false}}));
    assert.equal(ctx.animations.length,1);assert.equal(ctx.pill.style.transform,'translateX(0px)');
    cleanup();assert.equal(ctx.values[0].destroyed,true);assert.equal(ctx.gallery.dataset.springIndicator,undefined);
  }finally{cleanup?.();ctx.restore();}
});

test('the 3D capability probe retains a static fallback when WebGL is absent or rejected',()=>{
  assert.equal(canRenderShield({createElement:()=>({getContext:()=>null})}),false);
  assert.equal(canRenderShield({createElement:()=>({getContext:()=>{throw new Error('GPU unavailable');}})}),false);
});

test('the 3D capability probe releases its test context before the actual scene loads',()=>{
  let released=0;
  assert.equal(canRenderShield({createElement:()=>({getContext:(type,options)=>{assert.equal(type,'webgl2');assert.equal(options.failIfMajorPerformanceCaveat,true);return {getExtension:()=>({loseContext(){released++;}})};}})}),true);
  assert.equal(released,1);
});
