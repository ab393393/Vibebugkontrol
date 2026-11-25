import test from 'node:test';
import assert from 'node:assert/strict';

test('pointer motion respects reduced-motion and keyboard actions stay immediate',async()=>{
  const handlers={};let reduce=false;
  const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
  const previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  Object.defineProperty(globalThis,'document',{configurable:true,value:{documentElement:{dataset:{}},addEventListener:(event,handler)=>{handlers[event]=handler;}}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{matchMedia:()=>({matches:reduce})}});
  try {
    const {motionAllowed}=await import('../public/dialogs.mjs');
    const {initMotionInput}=await import('../public/motion.mjs');
    initMotionInput();
    assert.equal(motionAllowed(),true);
    handlers.keydown();assert.equal(motionAllowed(),false);
    handlers.pointerdown();assert.equal(motionAllowed(),true);
    reduce=true;assert.equal(motionAllowed(),false);
  } finally {
    if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else delete globalThis.document;
    if(previousWindow)Object.defineProperty(globalThis,'window',previousWindow);else delete globalThis.window;
  }
});

test('rapidly reversing a panel keeps the current presentation and ignores stale completion',async()=>{
  const previous=Object.fromEntries(['document','window','getComputedStyle'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  Object.defineProperty(globalThis,'document',{configurable:true,value:{documentElement:{dataset:{inputModality:'pointer'}}}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{matchMedia:()=>({matches:false})}});
  Object.defineProperty(globalThis,'getComputedStyle',{configurable:true,value:()=>({opacity:'.42',transform:'matrix(0.98, 0, 0, 0.98, 0, -2)'})});
  const animations=[];
  const element={dataset:{},hidden:true,inert:true,classList:{contains:()=>false},animate(frames){
    let resolve,reject;
    const animation={frames,finished:new Promise((yes,no)=>{resolve=yes;reject=no;}),finish(){resolve();},cancel(){reject(new Error('cancelled'));}};
    animations.push(animation);return animation;
  }};
  try {
    const {revealPanel}=await import('../public/motion.mjs');
    revealPanel(element,true);
    assert.equal(element.hidden,false);assert.equal(element.inert,false);
    revealPanel(element,false);
    assert.equal(element.inert,true);
    assert.equal(animations[1].frames[0].opacity,'.42');
    animations[1].finish();
    // A reopen arrives before the closing animation's completion callback.
    revealPanel(element,true);
    await Promise.resolve();await Promise.resolve();
    assert.equal(element.hidden,false);assert.equal(element.inert,false);
    animations.at(-1).finish();await Promise.resolve();
    revealPanel(element,false);
    animations.at(-1).finish();await Promise.resolve();
    assert.equal(element.hidden,true);assert.equal(element.inert,true);
  } finally {
    for(const [key,descriptor] of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});

test('keyboard and reduced-motion panel changes are immediate and remain operable',async()=>{
  const previous=Object.fromEntries(['document','window'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const dataset={inputModality:'keyboard'};let reduced=false;
  Object.defineProperty(globalThis,'document',{configurable:true,value:{documentElement:{dataset}}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{matchMedia:()=>({matches:reduced})}});
  const element={dataset:{},hidden:true,inert:true,animate(){assert.fail('An immediate interaction must not start an animation');}};
  try {
    const {revealPanel}=await import('../public/motion.mjs');
    revealPanel(element,true);assert.equal(element.hidden,false);assert.equal(element.inert,false);
    revealPanel(element,false);assert.equal(element.hidden,true);assert.equal(element.inert,true);
    dataset.inputModality='pointer';reduced=true;
    revealPanel(element,true);assert.equal(element.hidden,false);assert.equal(element.inert,false);
    revealPanel(element,false);assert.equal(element.hidden,true);assert.equal(element.inert,true);
  } finally {
    for(const [key,descriptor] of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});
