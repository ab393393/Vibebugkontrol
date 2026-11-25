import test from 'node:test';
import assert from 'node:assert/strict';
import { initPrivacyControls } from '../public/privacy-controls.mjs';

// Isolated DOM doubles: these tests never launch a browser or load a remote script.
class Element {
  constructor(tag){this.tag=tag;this.parts=new Map();this.listeners={};this.open=false;}
  setAttribute(){}
  querySelector(selector){if(!this.parts.has(selector))this.parts.set(selector,new Element('button'));return this.parts.get(selector);}
  addEventListener(name,handler){this.listeners[name]=handler;}
}
function fixture(id='G-ABC1234567',gtmId='') {
  const saved=new Map();const appended=[];const head=[];
  const document={cookie:'',querySelector:selector=>{const value=selector.includes('shield-gtm-id')?gtmId:id;return value?{content:value}:null;},querySelectorAll:()=>[],createElement:tag=>new Element(tag),body:{append:(...elements)=>appended.push(...elements)},head:{append:element=>head.push(element)}};
  const originals=new Map();
  const values={document,window:{},navigator:{globalPrivacyControl:false},location:{origin:'https://shield.test',pathname:'/contact',hostname:'shield.test',reload:()=>saved.set('reloaded',true)},localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)}};
  for(const [key,value] of Object.entries(values)){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});}
  return {head,appended,saved,window:values.window,restore(){for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}};
}
test('analytics loads only after opt-in, contains no form data, and can be declined and allowed again',()=>{
  const state=fixture();try {
    initPrivacyControls();assert.equal(state.head.length,0);
    const [banner]=state.appended;assert.equal(banner.hidden,false);
    banner.querySelector('[data-allow]').listeners.click();assert.equal(state.head.length,1);
    assert.equal(state.head[0].src,'https://www.googletagmanager.com/gtag/js?id=G-ABC1234567');
    const before=state.window.dataLayer.length;state.window.shieldTrack('visitor@example.test');assert.equal(state.window.dataLayer.length,before);
    state.window.shieldTrack('generate_lead');assert.equal(state.window.dataLayer.length,before+1);
    assert.ok(!JSON.stringify(state.window.dataLayer).includes('visitor@example.test'));
    banner.querySelector('[data-decline]').listeners.click();assert.equal(state.window['ga-disable-G-ABC1234567'],true);
    banner.querySelector('[data-allow]').listeners.click();assert.equal(state.window['ga-disable-G-ABC1234567'],false);assert.equal(state.head.length,1);
  } finally {state.restore();}
});
test('unconfigured analytics never loads a Google script',()=>{
  const state=fixture('');try {initPrivacyControls();assert.equal(state.head.length,0);assert.equal(state.appended[0].hidden,true);assert.equal(state.appended[1].querySelector('[data-allow]').disabled,true);}finally{state.restore();}
});
test('Tag Manager stays blocked until consent and withdrawal unloads its runtime',()=>{
  const state=fixture('','GTM-FIXTURE1');try {
    initPrivacyControls();assert.equal(state.head.length,0);
    const [banner]=state.appended;banner.querySelector('[data-allow]').listeners.click();
    assert.equal(state.head.length,1);assert.equal(state.head[0].src,'https://www.googletagmanager.com/gtm.js?id=GTM-FIXTURE1');
    const defaults=Array.from(state.window.dataLayer[0]);assert.deepEqual(defaults.slice(0,2),['consent','default']);assert.equal(defaults[2].analytics_storage,'denied');
    const count=state.window.dataLayer.length;state.window.shieldTrack('private@example.test');assert.equal(state.window.dataLayer.length,count);
    state.window.shieldTrack('generate_lead');assert.equal(state.window.dataLayer.at(-1).event,'generate_lead');
    banner.querySelector('[data-decline]').listeners.click();assert.equal(state.saved.get('reloaded'),true);
    const after=state.window.dataLayer.length;state.window.shieldTrack('generate_lead');assert.equal(state.window.dataLayer.length,after);
  }finally{state.restore();}
});
