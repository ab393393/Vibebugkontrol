import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEnquiry, validateEnquiry } from '../lib/enquiries.mjs';
import { enquiryEmailLink, enquiryCopyRecipients, sendEnquiry, validateFormSubmitDelivery, showEnquiryStatus } from '../public/enquiry-delivery.mjs';

const config={origin:'https://shield.test',recipient:'owner@example.test'};
const fields={name:'Example Visitor',phone:'+91 90000 00000',email:'visitor@example.test',property_type:'Business',pest_concern:'Rodents',area:'Example area',message:'Test fixture only',request_type:'Callback request',preferred_time:'Morning'};
function request(body=fields,headers={}) {
  return new Request(config.origin+'/api/enquiries',{method:'POST',headers:{Origin:config.origin,'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
}

test('a commercial callback makes one server-side request to the approved recipient',async()=>{
  const sent=[];
  const response=await handleEnquiry(request({...fields,to:'attacker@example.test',_subject:'untrusted'}),config,{fetchImpl:async(url,options)=>{sent.push({url,body:JSON.parse(options.body)});return Response.json({success:'true'});}});
  assert.equal(response.status,200);assert.equal((await response.json()).success,true);assert.equal(sent.length,1);
  assert.equal(sent[0].url,'https://formsubmit.co/ajax/owner%40example.test');
  assert.match(sent[0].body._subject,/^New callback request — VBK \[SS-[A-F0-9]{12}\]$/);
  assert.equal(sent[0].body._replyto,fields.email);assert.equal(sent[0].body.preferred_time,'Morning');assert.equal(sent[0].body.to,undefined);
});
test('malformed, missing and non-string fields fail before delivery',async()=>{
  for(const data of [{...fields,name:{attack:true}},{...fields,phone:'abc'},{...fields,email:'x\r\nBcc:bad@example.test'},{...fields,pincode:'123'},{...fields,preferred_date:'2000-01-01'},[],null]) {
    let calls=0;const result=await handleEnquiry(request(data),config,{fetchImpl:async()=>{calls++;throw new Error('must not run');}});
    assert.equal(result.status,400);assert.equal(calls,0);
  }
});
test('origin, request size, bot field, content type and rate checks prevent delivery',async()=>{
  const cases=[
    [request(fields,{Origin:'https://elsewhere.test'}),403,{}],
    [request(fields,{'Content-Type':'text/plain'}),415,{}],
    [request({...fields,message:'x'.repeat(17000)}),413,{}],
    [request({...fields,_honey:'bot'}),400,{}],
    [request('{bad json'),400,{}],
    [request(fields,{'CF-Connecting-IP':'192.0.2.1'}),429,{rateLimiter:()=>false}],
  ];
  for(const [req,status,options] of cases) {
    let calls=0;const response=await handleEnquiry(req,config,{...options,fetchImpl:async()=>{calls++;throw new Error('must not run');}});
    assert.equal(response.status,status);assert.equal(calls,0);assert.equal(response.headers.get('Cache-Control'),'no-store');
  }
});
test('rejection, malformed acknowledgement, network failure and timeout never become success',async()=>{
  const fixtures=[
    async()=>Response.json({success:false}),
    async()=>Response.json({}),
    async()=>new Response('not json'),
    async()=>{throw new TypeError('network');},
    async(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout')),{once:true})),
  ];
  for(const fetchImpl of fixtures) {
    const response=await handleEnquiry(request(),config,{fetchImpl,timeoutMs:5});
    assert.equal(response.status,502);assert.equal((await response.json()).success,false);
  }
});
test('optional Resend credentials stay on the server and require an explicit message id',async()=>{
  let outbound;
  const response=await handleEnquiry(request(),{...config,resendKey:'fixture-key',from:'Shield <verified@example.test>'},{fetchImpl:async(url,options)=>{outbound={url,options,body:JSON.parse(options.body)};return Response.json({id:'fixture-message'});}});
  assert.equal(response.status,200);assert.equal(outbound.url,'https://api.resend.com/emails');
  assert.deepEqual(outbound.body.to,[config.recipient]);assert.equal(outbound.body.reply_to,fields.email);
  assert.ok(outbound.body.text.includes('Test fixture only'));assert.equal(outbound.options.headers.Authorization,'Bearer fixture-key');
  assert.ok(!(await response.text()).includes('fixture-key'));
});
test('browser submission uses the same-origin endpoint and email fallback preserves Unicode and entered details',async()=>{
  const calls=[];
  await sendEnquiry(fields,{fetchImpl:async(url,options)=>{calls.push({url,options});return Response.json({success:true});}});
  assert.equal(calls.length,1);assert.equal(calls[0].url,'/api/enquiries');assert.deepEqual(JSON.parse(calls[0].options.body),fields);
  const subject='A home & business enquiry — VBK';const body='Name: A&B\nConcern: “Not sure” + rodents';
  const link=new URL(enquiryEmailLink(subject,body,'owner@example.test'));assert.equal(link.searchParams.get('subject'),subject);assert.equal(link.searchParams.get('body'),body);
  await assert.rejects(sendEnquiry(fields,{fetchImpl:async()=>Response.json({success:false,message:'Please check your number.'})}),/Please check your number/);
});
test('date and optional contact preferences preserve valid enquiries',()=>{
  const now=new Date('2026-10-23T19:00:00Z');
  assert.equal(validateEnquiry({...fields,preferred_date:'2026-10-23'},now).errors.preferred_date,'Choose today or a future requested date.');
  assert.deepEqual(validateEnquiry({...fields,email:'',preferred_date:'2026-10-24'},now).errors,{});
  assert.ok(validateEnquiry({...fields,preferred_date:'2027-02-30'},now).errors.preferred_date);
});
test('native HTML forms deliver through the same validated endpoint without JavaScript',async()=>{
  const native=new Request(config.origin+'/api/enquiries',{method:'POST',headers:{Origin:config.origin,'Content-Type':'application/x-www-form-urlencoded',Accept:'text/html'},body:new URLSearchParams(fields)});
  let sent=0;
  const response=await handleEnquiry(native,config,{fetchImpl:async()=>{sent++;return Response.json({success:true});}});
  assert.equal(sent,1);assert.match(response.headers.get('content-type'),/text\/html/);
  assert.match(await response.text(),/has been submitted/);
});
test('native form errors preserve escaped input and never acknowledge a failed provider',async()=>{
  const data={...fields,name:'<script>fixture</script>',message:'Keep <this> & my enquiry'};
  const native=new Request(config.origin+'/api/enquiries',{method:'POST',headers:{Origin:config.origin,'Content-Type':'application/x-www-form-urlencoded',Accept:'text/html'},body:new URLSearchParams(data)});
  const response=await handleEnquiry(native,config,{fetchImpl:async()=>Response.json({success:false})});
  const html=await response.text();assert.equal(response.status,502);
  assert.ok(!html.includes('has been submitted'));assert.ok(!html.includes('<script>fixture</script>'));
  assert.ok(html.includes('&lt;script&gt;fixture&lt;/script&gt;'));assert.ok(html.includes('Keep &lt;this&gt; &amp; my enquiry'));
});
test('browser delivery validates first, then uses AJAX once and stays independent of document navigation',async()=>{
  let sent=0;
  const response=await handleEnquiry(request({...fields,to:'attacker@example.test',_cc:'attacker@example.test'}),{...config,formsubmitBrowser:true},{fetchImpl:async()=>{sent++;throw new Error('No server delivery in browser mode');}});
  const result=await response.json();assert.equal(response.status,202);assert.equal(sent,0);
  assert.equal(result.success,false);assert.equal(result.code,'PROVIDER_AJAX');
  assert.equal(result.delivery.url,'https://formsubmit.co/ajax/owner%40example.test');
  assert.equal(result.delivery.fields.phone,fields.phone);assert.equal(result.delivery.fields._cc,undefined);assert.equal(result.delivery.fields.to,undefined);
  assert.equal(result.delivery.fields._url,config.origin+'/quote');assert.match(result.reference,/^SS-[A-F0-9]{12}$/);
  const calls=[];const states=[];
  const delivered=await sendEnquiry(fields,{onStatus:state=>states.push(state),fetchImpl:async(url,options)=>{calls.push({url,options});return url==='/api/enquiries'?Response.json(result,{status:202}):Response.json({success:'true',message:'Form submitted successfully'});}});
  assert.equal(delivered.accepted,true);assert.equal(delivered.reference,result.reference);assert.equal(delivered.provider,'FormSubmit');
  assert.deepEqual(states,['validating','sending']);assert.equal(calls.length,2);
  assert.equal(calls[1].url,result.delivery.url);assert.deepEqual(JSON.parse(calls[1].options.body),result.delivery.fields);
  assert.equal(calls[1].options.redirect,'error');assert.equal(calls[1].options.credentials,'omit');
  assert.equal(result.delivery.fields._captcha,undefined);assert.equal(result.delivery.fields._next,undefined);
});
test('browser delivery still rejects malformed enquiries, arbitrary targets and malformed copy addresses',async()=>{
  const response=await handleEnquiry(request({...fields,phone:'bad'}),{...config,formsubmitBrowser:true});assert.equal(response.status,400);
  const valid={url:'https://formsubmit.co/ajax/owner%40example.test',fields:{name:fields.name,phone:fields.phone,enquiry_reference:'SS-123456ABCDEF'}};
  assert.doesNotThrow(()=>validateFormSubmitDelivery(valid));
  for(const value of [{...valid,url:'https://attacker.example.test/steal'},{...valid,url:'https://formsubmit.co/owner@example.test'},{...valid,url:'https://formsubmit.co/ajax/owner@example.test?next=elsewhere'},{...valid,fields:{...valid.fields,_cc:'copy@example.test\r\nBcc:attacker@example.test'}},{...valid,fields:{...valid.fields,_cc:'copy@example.test,'}},{...valid,fields:{name:{bad:true},phone:fields.phone}}])assert.throws(()=>validateFormSubmitDelivery(value));
});
test('native forms use server AJAX and return an on-site acknowledged receipt',async()=>{
  const native=new Request(config.origin+'/api/enquiries',{method:'POST',headers:{Origin:config.origin,'Content-Type':'application/x-www-form-urlencoded',Accept:'text/html'},body:new URLSearchParams({...fields,message:'Keep <this> & my enquiry'})});
  let outbound;
  const response=await handleEnquiry(native,{...config,formsubmitBrowser:true},{fetchImpl:async(url,options)=>{outbound={url,body:JSON.parse(options.body)};return Response.json({success:true});}});const html=await response.text();
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);
  assert.equal(outbound.url,'https://formsubmit.co/ajax/owner%40example.test');assert.equal(outbound.body.message,'Keep <this> & my enquiry');
  assert.ok(html.includes('data-state="accepted"'));assert.ok(!html.includes('action="https://formsubmit.co'));assert.ok(html.includes(outbound.body.enquiry_reference));
});

test('configured copies survive browser and native AJAX while submitted routing fields are ignored',async()=>{
  const cc=['copy@example.test'];
  const untrusted={...fields,_cc:'attacker@example.test',cc:'attacker@example.test',to:'attacker@example.test'};
  let calls=0;
  const response=await handleEnquiry(request(untrusted),{...config,cc,formsubmitBrowser:true},{fetchImpl:async()=>{calls++;throw new Error('Must not send');}});
  const result=await response.json();assert.equal(calls,0);assert.equal(result.success,false);
  assert.equal(result.delivery.fields._cc,cc[0]);assert.equal(result.delivery.fields.cc,undefined);assert.equal(result.delivery.fields.to,undefined);
  let browserBody;
  const delivery=await sendEnquiry(fields,{fetchImpl:async(url,options)=>{if(url==='/api/enquiries')return Response.json(result,{status:202});browserBody=JSON.parse(options.body);return Response.json({success:true});}});
  assert.equal(delivery.accepted,true);assert.equal(browserBody._cc,cc[0]);
  const native=new Request(config.origin+'/api/enquiries',{method:'POST',headers:{Origin:config.origin,'Content-Type':'application/x-www-form-urlencoded',Accept:'text/html'},body:new URLSearchParams(untrusted)});
  let nativeBody;
  await handleEnquiry(native,{...config,cc,formsubmitBrowser:true},{fetchImpl:async(_url,options)=>{nativeBody=JSON.parse(options.body);return Response.json({success:true});}});
  assert.equal(nativeBody._cc,cc[0]);assert.ok(!JSON.stringify(nativeBody).includes('attacker@example.test'));
});

test('both server providers use only configured, deduplicated copies and invalid routing fails before sending',async()=>{
  const cc=['copy@example.test','COPY@example.test',config.recipient];
  assert.deepEqual(enquiryCopyRecipients(cc,config.recipient),['copy@example.test']);
  for(const provider of ['formsubmit','resend']) {
    let body;
    const response=await handleEnquiry(request({...fields,_cc:'attacker@example.test',cc:['attacker@example.test']}),{...config,cc,...(provider==='resend'?{resendKey:'fixture-key',from:'verified@example.test'}:{})},{fetchImpl:async(_url,options)=>{body=JSON.parse(options.body);return Response.json(provider==='resend'?{id:'fixture-id'}:{success:true});}});
    assert.equal(response.status,200);
    if(provider==='resend'){assert.deepEqual(body.to,[config.recipient]);assert.deepEqual(body.cc,['copy@example.test']);}
    else assert.equal(body._cc,'copy@example.test');
    assert.ok(!JSON.stringify(body).includes('attacker@example.test'));
  }
  for(const invalid of ['copy@example.test',['copy@example.test\r\nBcc:attacker@example.test'],['copy@example.test,attacker@example.test'],[{}],Array(6).fill('copy@example.test')]) {
    let calls=0;
    const response=await handleEnquiry(request(),{...config,cc:invalid},{fetchImpl:async()=>{calls++;throw new Error('Must not send');}});
    assert.equal(response.status,503);assert.equal(calls,0);
  }
});

test('the direct email fallback includes configured copies and preserves the prepared enquiry',()=>{
  const link=new URL(enquiryEmailLink('Prepared enquiry','Name: Example\nDetails: A&B',config.recipient,['copy@example.test',config.recipient]));
  assert.equal(link.searchParams.get('cc'),'copy@example.test');assert.equal(link.searchParams.get('body'),'Name: Example\nDetails: A&B');
  const withoutCopies=new URL(enquiryEmailLink('Prepared enquiry','Details',config.recipient,[]));assert.equal(withoutCopies.searchParams.has('cc'),false);
});

test('an empty CC list is omitted from browser, FormSubmit server and Resend requests',async()=>{
  const result=await (await handleEnquiry(request(),{...config,cc:[],formsubmitBrowser:true})).json();
  assert.equal(result.delivery.fields._cc,undefined);
  const receipt=await sendEnquiry(fields,{fetchImpl:async(url,options)=>{if(url==='/api/enquiries')return Response.json(result,{status:202});assert.equal(JSON.parse(options.body)._cc,undefined);return Response.json({success:true});}});
  assert.equal(receipt.accepted,true);
  for(const provider of ['formsubmit','resend']) {
    const response=await handleEnquiry(request(),{...config,cc:[],...(provider==='resend'?{resendKey:'fixture-key',from:'verified@example.test'}:{})},{fetchImpl:async(_url,options)=>{const body=JSON.parse(options.body);assert.equal(body.cc,undefined);assert.equal(body._cc,undefined);return Response.json(provider==='resend'?{id:'fixture-id'}:{success:true});}});
    assert.equal(response.status,200);
  }
});

test('AJAX activation, provider rejection, unreadable responses and network errors never become success or retry',async()=>{
  const prepared=await (await handleEnquiry(request(),{...config,formsubmitBrowser:true})).json();
  const cases=[
    [()=>Response.json({success:false,message:'Form needs Activation. Please activate your form.'}),'ACTIVATION_REQUIRED'],
    [()=>Response.json({success:true,message:'Please confirm your email to activate the form.'}),'ACTIVATION_REQUIRED'],
    [()=>Response.json({success:false,message:'Rejected'}),'PROVIDER_REJECTED'],
    [()=>Response.json({success:true},{status:403}),'PROVIDER_REJECTED'],
    [()=>Response.json({}),'PROVIDER_REJECTED'],
    [()=>new Response('<html>Verification required</html>'),'UNREADABLE_RESPONSE'],
    [()=>{throw new TypeError('CORS or network');},'NETWORK_ERROR']
  ];
  for(const [provider,code] of cases) {
    let calls=0;
    await assert.rejects(sendEnquiry(fields,{fetchImpl:async url=>{calls++;return url==='/api/enquiries'?Response.json(prepared,{status:202}):provider();}}),error=>error.code===code&&error.reference===prepared.reference);
    assert.equal(calls,2);
  }
  await assert.rejects(sendEnquiry(fields,{timeoutMs:5,fetchImpl:async(url,{signal})=>url==='/api/enquiries'?Response.json(prepared,{status:202}):new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout')),{once:true}))}),error=>error.code==='TIMEOUT'&&error.reference===prepared.reference);
});

test('native activation failures preserve input, show a reference and provide real Call, WhatsApp and email links',async()=>{
  const native=new Request(config.origin+'/api/enquiries',{method:'POST',headers:{Origin:config.origin,'Content-Type':'application/x-www-form-urlencoded',Accept:'text/html'},body:new URLSearchParams({...fields,message:'Keep <these> details'})});
  const response=await handleEnquiry(native,{...config,formsubmitBrowser:true},{fetchImpl:async()=>Response.json({success:false,message:'Form needs Activation'})});
  const html=await response.text();assert.equal(response.status,502);
  assert.ok(html.includes('ACTIVATION_REQUIRED'));assert.ok(html.includes('data-state="failed"'));assert.ok(html.includes('Keep &lt;these&gt; details'));
  assert.ok(html.includes('href="tel:+918291689183"'));assert.ok(html.includes('+91 82916 89183'));assert.ok(html.includes('href="https://wa.me/918291689183"'));assert.ok(html.includes('Email this enquiry'));
  assert.ok(!html.includes('has been submitted'));assert.match(html,/SS-[A-F0-9]{12}/);
});

test('visible status distinguishes sending, provider acceptance and activation failure with a searchable reference',()=>{
  const node={dataset:{},textContent:''};const details={reference:'SS-123456ABCDEF'};
  showEnquiryStatus(node,'sending',details);assert.equal(node.dataset.state,'sending');assert.ok(node.textContent.includes(details.reference));
  showEnquiryStatus(node,'accepted',details);assert.equal(node.dataset.state,'accepted');assert.match(node.textContent,/accepted for email delivery/);
  showEnquiryStatus(node,'failed',{...details,code:'ACTIVATION_REQUIRED'});assert.equal(node.dataset.state,'failed');assert.match(node.textContent,/email activation required/);
});
