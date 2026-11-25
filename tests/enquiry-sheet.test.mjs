import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { saveEnquiryToSheet } from '../lib/enquiry-sheet.mjs';
import { handleEnquiry } from '../lib/enquiries.mjs';

const reference='SS-123456ABCDEF';
const token='synthetic_fixture_token_1234567890';
const settings={sheetWebhookUrl:'https://script.google.com/macros/s/fixture/exec',sheetWebhookToken:token};
const data={name:'Synthetic visitor',phone:'+91 99999 99999',email:'visitor@example.test',property_type:'Home',message:'Fixture only',request_type:'Quote request',preferred_date:'2026-12-01'};

test('Sheets is opt-in and writes only to a configured Google deployment with explicit acknowledgement',async()=>{
  let calls=0;
  assert.deepEqual(await saveEnquiryToSheet(data,reference,{}, {fetchImpl:async()=>{calls++;}}),{state:'not_configured'});
  assert.equal(calls,0);
  const result=await saveEnquiryToSheet(data,reference,settings,{fetchImpl:async(url,options)=>{calls++;assert.equal(url,settings.sheetWebhookUrl);assert.deepEqual(JSON.parse(options.body),{token,reference,enquiry:data});return Response.json({success:true,reference});}});
  assert.deepEqual(result,{state:'saved'});assert.equal(calls,1);assert.ok(!JSON.stringify(result).includes(token));
});

test('invalid settings, missing acknowledgement, network failure and timeout cannot report a saved row',async()=>{
  for(const config of [{...settings,sheetWebhookUrl:'https://attacker.example/exec'},{...settings,sheetWebhookUrl:'https://script.google.com/macros/s/fixture/dev'},{...settings,sheetWebhookToken:'short'}]) {
    let calls=0;assert.equal((await saveEnquiryToSheet(data,reference,config,{fetchImpl:async()=>{calls++;}})).state,'failed');assert.equal(calls,0);
  }
  for(const fetchImpl of [async()=>Response.json({success:false}),async()=>Response.json({success:true,reference:'wrong'}),async()=>new Response('not JSON'),async()=>{throw new TypeError('offline');},async(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout')),{once:true}))])assert.equal((await saveEnquiryToSheet(data,reference,settings,{fetchImpl,timeoutMs:5})).state,'failed');
});

test('a Sheet failure preserves browser email delivery and does not expose the Google token',async()=>{
  const request=new Request('https://shield.test/api/enquiries',{method:'POST',headers:{Origin:'https://shield.test','Content-Type':'application/json'},body:JSON.stringify(data)});
  const response=await handleEnquiry(request,{origin:'https://shield.test',recipient:'owner@example.test',formsubmitBrowser:true,...settings},{fetchImpl:async()=>Response.json({success:false})});
  const result=await response.json();assert.equal(response.status,202);assert.equal(result.code,'PROVIDER_AJAX');assert.equal(result.sheet.state,'failed');
  assert.equal(result.delivery.url,'https://formsubmit.co/ajax/owner%40example.test');assert.ok(!JSON.stringify(result).includes(token));assert.ok(!JSON.stringify(result).includes('script.google.com'));
});

function scriptFixture(source) {
  const rows=[];let headers;let held=false;let touched=0;
  const sheet={getLastRow:()=>rows.length+1,getMaxRows:()=>1000,getRange(row,col,height=1,width=1){
    const range={getValues:()=>[headers],setNumberFormat:()=>range,setDataValidation:()=>range,setValues(values){if(row===1)headers=values[0];else rows.push(values[0]);return range;},createTextFinder(value){return {matchEntireCell(){return this;},useRegularExpression(){return this;},findNext:()=>rows.some(row=>row[1]===value)?{}:null};}};return range;
  }};
  const builder={requireValueInList(){return this;},setAllowInvalid(){return this;},build(){return {};}};
  const context=vm.createContext({console:{log(){}},SpreadsheetApp:{openById(){touched++;return {getSheetByName:()=>sheet};},newDataValidation:()=>builder,flush(){}},PropertiesService:{getScriptProperties:()=>({getProperty:()=>token})},LockService:{getScriptLock:()=>({tryLock:()=>{held=true;return true;},hasLock:()=>held,releaseLock:()=>{held=false;}})},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})}});
  vm.runInContext(source,context);headers=JSON.parse(vm.runInContext('JSON.stringify(SHIELD_HEADERS)',context));
  return {context,rows,get touched(){return touched;},get held(){return held;}};
}

test('Apps Script authenticates before touching the sheet and never returns its token',async()=>{
  const fixture=scriptFixture(await readFile(new URL('../integrations/google-sheets/Code.gs',import.meta.url),'utf8'));
  const result=fixture.context.doPost({postData:{contents:JSON.stringify({token:'wrong',reference,enquiry:data})}});
  assert.equal(result.success,false);assert.equal(result.code,'UNAUTHORIZED');assert.equal(fixture.touched,0);assert.ok(!JSON.stringify(result).includes(token));
  const publicStatus=fixture.context.doGet();assert.ok(!JSON.stringify(publicStatus).includes(token));
});

test('Apps Script writes typed dates, literal text and a New status, and deduplicates by reference',async()=>{
  const fixture=scriptFixture(await readFile(new URL('../integrations/google-sheets/Code.gs',import.meta.url),'utf8'));
  const event={postData:{contents:JSON.stringify({token,reference,enquiry:{...data,name:'=IMPORTXML("fixture")',message:'=1+1'}})}};
  const first=fixture.context.doPost(event);assert.equal(first.success,true);assert.equal(fixture.rows.length,1);assert.equal(fixture.held,false);
  const row=fixture.rows[0];assert.equal(row.length,19);assert.equal(row[1],reference);assert.equal(typeof row[0],'number');assert.equal(typeof row[13],'number');assert.equal(row[2],"'=IMPORTXML(\"fixture\")");assert.equal(row[3],"'+91 99999 99999");assert.equal(row[15],"'=1+1");assert.equal(row[17],'New');
  const again=fixture.context.doPost(event);assert.equal(again.success,true);assert.equal(again.duplicate,true);assert.equal(fixture.rows.length,1);
  const bad=fixture.context.doPost({postData:{contents:JSON.stringify({token,reference:'SS-000000000001',enquiry:{...data,preferred_date:'2026-02-30'}})}});assert.equal(bad.success,false);assert.equal(fixture.rows.length,1);
});
