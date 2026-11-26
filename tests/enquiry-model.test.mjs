import test from 'node:test';
import assert from 'node:assert/strict';
import { enquiryPayload, enquirySummary } from '../public/enquiry-model.mjs';
import { validateEnquiry, handleEnquiry } from '../lib/enquiries.mjs';

test('drawer and full-page data produce the same valid enquiry, including multiple concerns',()=>{
  const common={phone:'+91 99999 99999',premises_type:'Food / hospitality',care_preference:'Discuss ongoing care',preferred_time:'Evening'};
  const drawer=new URLSearchParams({...common,customer:'Visitor',property:'Business',size:'Commercial premises',notes:'Kitchen and store'});
  const page=new URLSearchParams({...common,name:'Visitor',property_type:'Business',approximate_size:'Commercial premises',message:'Kitchen and store'});
  for(const form of [drawer,page]){form.append('pest','Cockroaches');form.append('pest','Rodents');}
  const payload=enquiryPayload(drawer);
  assert.deepEqual(payload,enquiryPayload(page));
  assert.deepEqual(validateEnquiry(payload).errors,{});
  assert.equal(payload.pest_concern,'Cockroaches, Rodents');
  assert.equal(payload.pincode,'');assert.equal(payload.preferred_date,'');
  assert.match(enquirySummary(payload),/Care preference: Discuss ongoing care/);
});

test('a native form POST preserves every selected concern without contacting a delivery provider',async()=>{
  const form=new URLSearchParams({name:'Visitor',phone:'9999999999',property_type:'Home'});
  form.append('pest','Cockroaches');form.append('pest','Bed bugs');
  const response=await handleEnquiry(new Request('https://fixture.test/api/enquiries',{
    method:'POST',headers:{Origin:'https://fixture.test','Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:form
  }),{origin:'https://fixture.test',recipient:'owner@example.test',cc:[],formsubmitBrowser:true},
  {fetchImpl:async()=>{throw new Error('No live delivery in this test');},rateLimiter:()=>true});
  assert.equal(response.status,202);
  const body=await response.json();assert.equal(body.delivery.fields.pest_concern,'Cockroaches, Bed bugs');
  assert.equal(body.delivery.fields._cc,undefined);
});
