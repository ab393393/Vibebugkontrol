import { escapeHtml, enquiryFallbackHtml } from './render-template.mjs';
import { businessInfo } from './business.mjs';
import enquirySettings from '../content/enquiries.json' with {type:'json'};
import { enquiryEmailLink, showEnquiryStatus } from '../public/enquiry-delivery.mjs';

export function formReceipt(status,result,data={},origin='') {
  const accepted=result.success===true;
  const business=businessInfo();
  const statusNode={dataset:{},textContent:''};
  showEnquiryStatus(statusNode,accepted?'accepted':'failed',result);
  const email=enquiryEmailLink('Pest control enquiry — VBK',Object.entries(data).filter(([key])=>key!=='_honey').map(([key,value])=>`${key}: ${value}`).join('\n'),business.email,enquirySettings.cc);
  const fallback=accepted?'':`<div class="form-error" role="alert"><p>Your details are still here. You can retry or contact us directly.</p><a href="${escapeHtml(email)}">Email this enquiry ↗</a>${enquiryFallbackHtml(business)}</div>`;
  const input=(name,label,type='text')=>`<label class="field-label">${label}<input name="${name}" type="${type}" value="${escapeHtml(data[name]||'')}" ${['name','phone'].includes(name)?'required':''}></label>`;
  const form=accepted?'':`<form class="contact-page-form" action="/api/enquiries" method="post"><input type="hidden" name="request_type" value="Quote request"><input type="hidden" name="preferred_time" value="Any time"><input type="hidden" name="_honey" value="">${input('name','Your name')}${input('phone','Contact number','tel')}${input('email','Email address (optional)','email')}<label class="field-label">Your space<select name="property_type"><option${data.property_type==='Home'?' selected':''}>Home</option><option${data.property_type==='Business'?' selected':''}>Business</option></select></label>${input('area','Area / city (optional)')}${input('pest_concern','Pest concern')}<label class="field-label">Your message<textarea name="message" maxlength="1000" rows="4">${escapeHtml(data.message||'')}</textarea></label><p class="privacy-note">By sending, you agree to be contacted about this enquiry. <a href="/privacy-policy">Privacy policy</a></p><button class="button button-dark" type="submit">Send enquiry ↗</button></form>`;
  const html=`<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Enquiry update | VBK</title><link rel="canonical" href="${escapeHtml(origin+'/quote')}"><link rel="stylesheet" href="/site.css"></head><body><main id="main" class="content-page container"><section class="page-intro"><p class="eyebrow">VBK</p><h1>${accepted?'Your enquiry<br><em>has been submitted.</em>':'Let’s check<br><em>your enquiry.</em>'}</h1><p class="page-lede">${escapeHtml(result.message||'Please review your details and try again.')}</p><p class="form-help enquiry-status" role="status" data-state="${statusNode.dataset.state}">${escapeHtml(statusNode.textContent)}</p>${accepted?'<p>The email service accepted the enquiry for delivery; this does not independently verify inbox receipt.</p>':''}</section>${fallback}${form}<nav class="page-end-links"><a href="/">Back to home ↗</a><a href="/contact">Contact us ↗</a></nav></main></body></html>`;
  return new Response(html,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
