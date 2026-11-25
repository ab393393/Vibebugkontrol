import test from 'node:test';
import assert from 'node:assert/strict';
import { initContactForm } from '../public/contact-form.mjs';

test('contact form stays on-page, blocks duplicate sends, preserves failed details and shows acknowledged success on retry',async()=>{
  const originals=Object.fromEntries(['document','window','fetch','FormData'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const handlers={};const attributes={};
  const values={name:'Synthetic visitor',phone:'9999999999',email:'visitor@example.test',property_type:'Home',area:'Fixture area',message:'Keep these details'};
  const label={textContent:'Send enquiry'};
  const button={disabled:false,querySelector:()=>label};
  const errorText={textContent:''};const emailLink={href:''};
  const error={hidden:true,querySelector:selector=>selector==='p'?errorText:emailLink,focus(){}};
  const success={hidden:true,textContent:'',focus(){}};const status={dataset:{},textContent:''};
  const form={values,elements:{name:{},phone:{}},querySelector:()=>button,addEventListener:(name,handler)=>{handlers[name]=handler;},setAttribute:(name,value)=>{attributes[name]=value;}};
  const nodes={'#contact-page-form':form,'#contact-error':error,'#contact-success':success,'#contact-status':status};
  let leads=0;let providerCalls=0;let release;let started;
  const providerGate=new Promise(resolve=>{release=resolve;});const providerStarted=new Promise(resolve=>{started=resolve;});
  const reference='SS-123456ABCDEF';
  const prepared={success:false,code:'PROVIDER_AJAX',reference,delivery:{url:'https://formsubmit.co/ajax/owner%40example.test',fields:{...values,enquiry_reference:reference}}};
  let fail=true;
  Object.defineProperty(globalThis,'document',{configurable:true,value:{querySelector:selector=>nodes[selector]||(selector.includes('shield-business-email')?{content:'owner@example.test'}:null)}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{shieldTrack:()=>{leads++;}}});
  Object.defineProperty(globalThis,'FormData',{configurable:true,value:class {constructor(node){this.values=node.values;}[Symbol.iterator](){return Object.entries(this.values)[Symbol.iterator]();}}});
  Object.defineProperty(globalThis,'fetch',{configurable:true,value:async(url,options)=>{
    if(url==='/api/enquiries')return Response.json(prepared,{status:202});
    providerCalls++;assert.equal(options.method,'POST');started();await providerGate;
    return Response.json(fail?{success:false,message:'Provider rejected the enquiry'}:{success:true,message:'Form submitted successfully'});
  }});
  try {
    initContactForm();const event={preventDefault(){}};
    const pending=handlers.submit(event);await providerStarted;
    assert.equal(button.disabled,true);assert.equal(attributes['aria-busy'],'true');assert.equal(status.dataset.state,'sending');
    await handlers.submit(event);assert.equal(providerCalls,1);
    release();await pending;
    assert.equal(error.hidden,false);assert.equal(success.hidden,true);assert.equal(status.dataset.state,'failed');assert.equal(button.disabled,false);assert.equal(leads,0);
    assert.deepEqual(form.values,values);assert.match(errorText.textContent,/did not accept/);assert.ok(emailLink.href.startsWith('mailto:owner@example.test'));
    fail=false;await handlers.submit(event);
    assert.equal(providerCalls,2);assert.equal(error.hidden,true);assert.equal(success.hidden,false);assert.equal(status.dataset.state,'accepted');assert.equal(leads,1);
    assert.ok(status.textContent.includes(reference));assert.match(success.textContent,/Enquiry sent/);assert.equal(button.disabled,false);assert.equal(label.textContent,'Send enquiry');
  } finally {
    release();
    for(const [key,descriptor] of Object.entries(originals))if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
  }
});
