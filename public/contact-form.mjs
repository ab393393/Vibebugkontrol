import { sendEnquiry, enquiryEmailLink, showEnquiryStatus } from './enquiry-delivery.mjs';

export function initContactForm() {
  const form=document.querySelector('#contact-page-form');if(!form) return;
  const button=form.querySelector('[type="submit"]');
  const error=document.querySelector('#contact-error');
  const success=document.querySelector('#contact-success');
  const status=document.querySelector('#contact-status');
  let sending=false;
  form.addEventListener('input',event=>{
    event.target.setCustomValidity?.('');
    if(!sending) button.disabled=false;
    success.hidden=true;error.hidden=true;
    if(!sending)showEnquiryStatus(status,'idle');
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(sending) return;
    error.hidden=true;success.hidden=true;
    const data=Object.fromEntries(new FormData(form));
    if(!String(data.name).trim()) {form.elements.name.setCustomValidity('Please enter your name.');form.elements.name.reportValidity();return;}
    const digits=String(data.phone).replace(/\D/g,'').length;
    if(digits<7 || digits>15 || !/^\+?[\d\s().-]+$/.test(String(data.phone).trim())) {form.elements.phone.setCustomValidity('Enter a valid contact number with 7–15 digits.');form.elements.phone.reportValidity();return;}
    const payload={...data,request_type:data.request_type||'Quote request',pest_concern:data.pest_concern||'Please see enquiry message',preferred_time:'Any time'};
    const text=['VBK — ENQUIRY','',`Name: ${data.name}`,`Contact: ${data.phone}`,`Email: ${data.email||'Not provided'}`,`Space: ${data.property_type}`,`Area / city: ${data.area||'To be discussed'}`,`Message: ${data.message||'Please discuss a pest control plan with me.'}`].join('\n');
    error.querySelector('[data-enquiry-email]').href=enquiryEmailLink('Pest control enquiry — VBK',text);
    sending=true;form.setAttribute('aria-busy','true');button.disabled=true;button.querySelector('span').textContent='Sending enquiry…';
    try {
      const delivery=await sendEnquiry(payload,{onStatus:(state,details)=>showEnquiryStatus(status,state,details)});
      showEnquiryStatus(status,'accepted',delivery);success.textContent=delivery.message;
      success.hidden=false;success.focus();window.shieldTrack?.('generate_lead');
    } catch(failure) {
      error.querySelector('p').textContent=failure.message;error.hidden=false;error.focus();button.disabled=false;
      showEnquiryStatus(status,'failed',failure);
    } finally {
      sending=false;form.setAttribute('aria-busy','false');button.querySelector('span').textContent='Send enquiry';
      button.disabled=false;
    }
  });
}
