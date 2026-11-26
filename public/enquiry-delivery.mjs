export const ENQUIRY_ENDPOINT = '/api/enquiries';

export function enquiryCopyRecipients(value=[],recipient='') {
  if(!Array.isArray(value)||value.length>5||value.some(email=>typeof email!=='string'||email.trim().length>254||!/^[^\s@<>,;"\\]+@[^\s@<>,;"\\]+\.[^\s@<>,;"\\]+$/.test(email.trim())))throw new Error('The enquiry copy recipients are not configured correctly.');
  const seen=new Set([recipient.toLowerCase()]);
  return value.map(email=>email.trim()).filter(email=>{const key=email.toLowerCase();if(seen.has(key))return false;seen.add(key);return true;});
}

const deliveryFields=new Set(['name','phone','email','property_type','pest_concern','area','approximate_size','premises_type','care_preference','pincode','preferred_date','preferred_time','request_type','message','enquiry_reference','_honey','_subject','_template','_url','_replyto','_cc']);
const referencePattern=/^SS-[A-F0-9]{12}$/;
let preparedContact;
export const ENQUIRY_ACCEPTED_MESSAGE='Enquiry sent. Thank you for contacting VBK. The email service accepted your enquiry for delivery. Requested visits remain subject to confirmation.';
export function enquiryFailure(message,code='DELIVERY_UNCONFIRMED',reference='') {
  return Object.assign(new Error(message),{code,reference:referencePattern.test(reference)?reference:''});
}
export function validateFormSubmitDelivery(value) {
  if(!value||typeof value!=='object'||typeof value.url!=='string'||!value.fields||typeof value.fields!=='object'||Array.isArray(value.fields))throw enquiryFailure('The enquiry could not be prepared. Your details are still here.','INVALID_DELIVERY');
  const target=new URL(value.url);const account=target.pathname.slice('/ajax/'.length);let email='';try{email=decodeURIComponent(account);}catch{}
  if(target.protocol!=='https:'||target.hostname!=='formsubmit.co'||target.port||target.username||target.password||target.search||target.hash||!target.pathname.startsWith('/ajax/')||account.includes('/')||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw enquiryFailure('The delivery destination could not be verified.','INVALID_DELIVERY');
  const entries=Object.entries(value.fields);
  if(!entries.length||entries.some(([key,text])=>!deliveryFields.has(key)||typeof text!=='string'||text.length>2000)||!value.fields.name||!value.fields.phone||!referencePattern.test(value.fields.enquiry_reference))throw enquiryFailure('The delivery details could not be verified.','INVALID_DELIVERY');
  const fields=Object.fromEntries(entries);
  if('_cc' in fields){const copies=enquiryCopyRecipients(fields._cc.split(','),email);if(copies.length)fields._cc=copies.join(',');else delete fields._cc;}
  return {url:target.href,fields};
}

export async function formSubmitAcknowledgement(response,reference='') {
  let reply;
  try {reply=await response.json();}catch{throw enquiryFailure('The email service returned an unreadable response. Delivery could not be confirmed. Your details are still here.','UNREADABLE_RESPONSE',reference);}
  if(/activat|confirm(?:ation)?[\s\S]{0,40}(?:email|form)/i.test(typeof reply?.message==='string'?reply.message:''))throw enquiryFailure('Online enquiries are awaiting email activation. Delivery is not confirmed. Your details are still here; please call or WhatsApp us.','ACTIVATION_REQUIRED',reference);
  if(!response.ok||![true,'true'].includes(reply?.success))throw enquiryFailure('The email service did not accept your enquiry. Your details are still here. Please try again, call or WhatsApp us.','PROVIDER_REJECTED',reference);
  return {accepted:true,provider:'FormSubmit',code:'PROVIDER_ACCEPTED',reference,message:ENQUIRY_ACCEPTED_MESSAGE};
}

export function showEnquiryStatus(node,state,details={}) {
  if(!node)return;
  node.hidden=state==='idle';
  if(state==='idle'){node.dataset.state=state;node.textContent='';return;}
  const labels={validating:'Checking your details…',sending:'Sending enquiry…',accepted:'Sent — accepted for email delivery.',failed:details.code==='ACTIVATION_REQUIRED'?'Not sent — email activation required.':'Submission failed — delivery not confirmed.'};
  node.dataset.state=state;
  const reference=referencePattern.test(details.reference)?` Reference: ${details.reference}.`:'';
  const code=state==='failed'&&/^[A-Z_]{3,40}$/.test(details.code||'')?` Code: ${details.code}.`:'';
  node.textContent=`Status: ${labels[state]||labels.failed}${reference}${code}`;
}

export function enquiryEmailLink(subject,text,email=preparedContact?.email||globalThis.document?.querySelector('.business-footer-details a[href^="mailto:"]')?.getAttribute('href')?.slice(7).split('?')[0]||'',copies=preparedContact?.copies||[]) {
  if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))return '/contact';
  const cc=enquiryCopyRecipients(copies,email);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}${cc.length?'&cc='+encodeURIComponent(cc.join(',')):''}`;
}

/** Submit once. Only an explicit provider acknowledgement counts as accepted. */
export async function sendEnquiry(fields, { fetchImpl = globalThis.fetch, timeoutMs = 25000, onStatus=()=>{} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let reference='';
  try {
    onStatus('validating');
    const response = await fetchImpl(ENQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(fields),
      signal: controller.signal
    });
    let acknowledgement;
    try { acknowledgement = await response.json(); }
    catch { throw enquiryFailure('We couldn’t confirm your enquiry was submitted. Your details are still here. Please call or WhatsApp us.','UNREADABLE_RESPONSE'); }
    reference=referencePattern.test(acknowledgement?.reference)?acknowledgement.reference:'';
    if(response.status===202&&acknowledgement?.success===false&&acknowledgement?.code==='PROVIDER_AJAX') {
      const delivery=validateFormSubmitDelivery(acknowledgement.delivery);
      preparedContact={email:decodeURIComponent(new URL(delivery.url).pathname.slice('/ajax/'.length)),copies:delivery.fields._cc?.split(',')||[]};
      reference=delivery.fields.enquiry_reference;
      onStatus('sending',{reference});
      const providerResponse=await fetchImpl(delivery.url,{
        method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
        credentials:'omit',redirect:'error',signal:controller.signal,body:JSON.stringify(delivery.fields)
      });
      return await formSubmitAcknowledgement(providerResponse,reference);
    }
    if (!response.ok || ![true, 'true'].includes(acknowledgement?.success)) {
      if (response.status === 429) throw enquiryFailure('Too many requests. Please wait a little before trying again, or call or WhatsApp us.','RATE_LIMITED',reference);
      throw enquiryFailure(acknowledgement?.message || 'Your enquiry could not be submitted. Your details are still here. Please call or WhatsApp us.',acknowledgement?.code||'DELIVERY_UNCONFIRMED',reference);
    }
    return {accepted:true,provider:acknowledgement.provider,code:acknowledgement.code,reference,message:ENQUIRY_ACCEPTED_MESSAGE};
  } catch (error) {
    if (controller.signal.aborted) {
      throw enquiryFailure('The connection timed out before delivery could be confirmed. Your details are still here. Please call or WhatsApp us.','TIMEOUT',reference);
    }
    if (error instanceof TypeError) {
      throw enquiryFailure('We couldn’t reach the enquiry service. Check your connection, or call or WhatsApp us. Your details are still here.','NETWORK_ERROR',reference);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
