import { formReceipt } from './form-receipt.mjs';
import { validPreferredDate } from '../public/site-content.mjs';
import { enquiryCopyRecipients, formSubmitAcknowledgement, ENQUIRY_ACCEPTED_MESSAGE } from '../public/enquiry-delivery.mjs';
import { saveEnquiryToSheet } from './enquiry-sheet.mjs';

const limits={name:100,phone:25,email:254,property_type:20,pest_concern:200,area:100,approximate_size:100,premises_type:100,care_preference:100,pincode:6,preferred_date:10,preferred_time:30,request_type:30,message:1000,_honey:200};
const requests=['Quote request','Callback request','Coverage enquiry'];
const slots=['Any time','Morning','Afternoon','Evening'];
const attempts=new Map();

export function validateEnquiry(input,now=new Date()) {
  const data={};const errors={};
  if(!input || typeof input!=='object' || Array.isArray(input)) return {data,errors:{form:'Please check your enquiry details.'}};
  for(const [key,max] of Object.entries(limits)) {
    data[key]='';
    const value=input[key];
    if(value!=null && typeof value!=='string') {errors[key]='Please enter a valid value.';continue;}
    data[key]=String(value||'').trim();
    if(data[key].length>max) errors[key]=`Please use ${max} characters or fewer.`;
  }
  if(!data.name || /[\r\n\x00]/.test(data.name)) errors.name='Please enter your name.';
  const digits=data.phone.replace(/\D/g,'').length;
  if(digits<7 || digits>15 || !/^\+?[\d\s().-]+$/.test(data.phone)) errors.phone='Enter a valid contact number with 7–15 digits.';
  if(data.email && (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)||/[\r\n]/.test(data.email))) errors.email='Enter a valid email address.';
  if(!['Home','Business'].includes(data.property_type)) errors.property_type='Choose Home or Business.';
  if(data.pincode && !/^\d{6}$/.test(data.pincode)) errors.pincode='Enter a 6-digit PIN code.';
  if(!validPreferredDate(data.preferred_date,now)) errors.preferred_date='Choose today or a future requested date.';
  if(data.request_type && !requests.includes(data.request_type)) errors.request_type='Choose a valid enquiry type.';
  if(data.preferred_time && !slots.includes(data.preferred_time)) errors.preferred_time='Choose a valid time preference.';
  if(data._honey) errors.form='This enquiry could not be processed.';
  data.request_type ||= 'Quote request';data.preferred_time ||= 'Any time';
  return {data,errors};
}

export function formatEnquiry(data) {
  return [
    'VBK — ENQUIRY','',
    ...[['Request','request_type'],['Space','property_type'],['Premises','premises_type'],['Pest concern','pest_concern'],['Area / city','area'],['PIN code','pincode'],['Approximate size','approximate_size'],['Care preference','care_preference'],['Requested date','preferred_date'],['Requested time','preferred_time'],['Name','name'],['Contact number','phone'],['Email','email'],['Additional details','message']].map(([label,key])=>`${label}: ${data[key] || 'Not provided'}`),
    '', 'Requested timing is subject to confirmation.'
  ].join('\n');
}

function allowAttempt(key,now=Date.now()) {
  for(const [id,value] of attempts) if(value.until<=now) attempts.delete(id);
  if(attempts.size>=2000 && !attempts.has(key)) return false;
  const value=attempts.get(key)||{count:0,until:now+600000};
  value.count++;attempts.set(key,value);return value.count<=5;
}

function json(status,body,extra={}) {
  return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
}

function respond(request,status,body,extra={},data={}) {
  if(request.headers.get('accept')?.includes('text/html') && request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return formReceipt(status,body,data,new URL(request.url).origin);
  return json(status,body,extra);
}

async function readBody(request) {
  if(Number(request.headers.get('content-length')||0)>16384) throw new Error('size');
  if(!request.body) throw new Error('body');
  const reader=request.body.getReader();const chunks=[];let length=0;
  try {
    while(true) {
      const {value,done}=await reader.read();if(done) break;
      length+=value.byteLength;if(length>16384) {await reader.cancel();throw new Error('size');}chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const body=new Uint8Array(length);let offset=0;
  for(const chunk of chunks) {body.set(chunk,offset);offset+=chunk.byteLength;}
  const text=new TextDecoder().decode(body);
  return request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')?Object.fromEntries(new URLSearchParams(text)):JSON.parse(text);
}

/** Server-only delivery. Tests inject fetch; no request data is logged or persisted. */
export async function handleEnquiry(request,config,{fetchImpl=fetch,rateLimiter=allowAttempt,timeoutMs=18000}={}) {
  if(request.method!=='POST') return respond(request,405,{success:false,message:'Please use the enquiry form.'},{Allow:'POST'});
  const origin=request.headers.get('origin');
  if(!origin || ![new URL(request.url).origin,config.origin].includes(origin)) return respond(request,403,{success:false,message:'Please send your enquiry from this website.'});
  if(!['application/json','application/x-www-form-urlencoded'].some(type=>request.headers.get('content-type')?.toLowerCase().startsWith(type))) return respond(request,415,{success:false,message:'Please use the enquiry form, or use our contact page.'});
  // This is an additional per-isolate limit, not a substitute for a global WAF rule.
  const ip=request.headers.get('cf-connecting-ip');
  if(ip) {
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip));
    const key=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    if(!rateLimiter(key)) return respond(request,429,{success:false,message:'Too many requests. Please wait a little, or use our contact page.'},{'Retry-After':'600'});
  }
  let input;
  try {input=await readBody(request);} catch(error) {return respond(request,error.message==='size'?413:400,{success:false,message:'Please check your enquiry and try again.'});}
  const {data,errors}=validateEnquiry(input);
  if(Object.keys(errors).length) return respond(request,400,{success:false,message:Object.values(errors)[0],errors},{},data);
  // Copies come only from owner-controlled configuration, never submitted fields.
  let cc;
  try {cc=enquiryCopyRecipients(config.cc,config.recipient);}catch{return respond(request,503,{success:false,message:'The enquiry service is unavailable. Please use the contact details on this website.'},{},data);}
  const formCopies=cc.length?{_cc:cc.join(',')}:{};
  const reference='SS-'+crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase();
  // Capture validated enquiries independently of email. A Sheet failure must
  // never prevent the existing email flow, and is logged without customer data.
  const sheet=await saveEnquiryToSheet(data,reference,config,{fetchImpl});
  const subject=`New ${data.request_type==='Callback request'?'callback request':data.request_type==='Coverage enquiry'?'coverage enquiry':data.property_type==='Business'?'commercial enquiry':'residential enquiry'} — VBK [${reference}]`;
  // Browser delivery uses fetch to the AJAX endpoint, never a form navigation.
  // Native HTML forms use the server AJAX request below and stay on this origin.
  const nativeForm=request.headers.get('accept')?.includes('text/html')&&request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded');
  if(config.formsubmitBrowser&&!(config.resendKey&&config.from)&&!nativeForm) {
    const fields=Object.fromEntries(Object.entries(data).filter(([key,value])=>key!=='_honey'&&value));
    const delivery={url:'https://formsubmit.co/ajax/'+encodeURIComponent(config.recipient),fields:{...fields,...formCopies,enquiry_reference:reference,_subject:subject,_template:'table',_url:origin+'/quote',_honey:'',...(data.email?{_replyto:data.email}:{})}};
    return respond(request,202,{success:false,code:'PROVIDER_AJAX',reference,delivery,sheet},{},data);
  }
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  let providerStatus;let replyType;
  try {
    let response;
    if(config.resendKey && config.from) {
      response=await fetchImpl('https://api.resend.com/emails',{
        method:'POST',signal:controller.signal,
        headers:{Authorization:`Bearer ${config.resendKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({from:config.from,to:[config.recipient],...(cc.length?{cc}:{}),subject,text:`Reference: ${reference}\n\n${formatEnquiry(data)}`,...(data.email?{reply_to:data.email}:{})})
      });
      providerStatus=response.status;replyType=response.headers.get('content-type')?.split(';')[0];
      const acknowledgement=await response.json();
      if(!response.ok || typeof acknowledgement?.id!=='string' || !acknowledgement.id) throw new Error('provider');
    } else {
      response=await fetchImpl(`https://formsubmit.co/ajax/${encodeURIComponent(config.recipient)}`,{
        method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',Accept:'application/json',Origin:origin,Referer:origin+'/quote'},
        body:JSON.stringify({...data,...formCopies,enquiry_reference:reference,_subject:subject,_template:'table',_url:origin+'/quote',...(data.email?{_replyto:data.email}:{})})
      });
      providerStatus=response.status;replyType=response.headers.get('content-type')?.split(';')[0];
      await formSubmitAcknowledgement(response,reference);
    }
    return respond(request,200,{success:true,code:'PROVIDER_ACCEPTED',provider:config.resendKey&&config.from?'Resend':'FormSubmit',reference,sheet,message:ENQUIRY_ACCEPTED_MESSAGE});
  } catch(error) {
    const reason=controller.signal.aborted?'timeout':error.code==='ACTIVATION_REQUIRED'?'activation_required':error instanceof SyntaxError||error.code==='UNREADABLE_RESPONSE'?'unreadable_reply':providerStatus?'provider_rejected':'connection_failed';
    console.warn(JSON.stringify({event:'enquiry_delivery_failed',provider:config.resendKey&&config.from?'resend':'formsubmit',reference,reason,status:providerStatus,replyType}));
    return respond(request,502,{success:false,reference,code:error.code==='ACTIVATION_REQUIRED'?'ACTIVATION_REQUIRED':'DELIVERY_UNCONFIRMED',message:error.code==='ACTIVATION_REQUIRED'?error.message:'Online delivery could not be confirmed. Your details are still here. Please call or WhatsApp us, or use “Email this enquiry” below.'},{},data);
  } finally {clearTimeout(timeout);}
}
