import { sendEnquiry, enquiryEmailLink, showEnquiryStatus } from './enquiry-delivery.mjs';
import { enquiryPayload, enquirySummary } from './enquiry-model.mjs';
import { validPreferredDate } from './site-content.mjs';
import { initDatePicker } from './date-picker.mjs';

export function initContactForm() {
  const form=document.querySelector('#contact-page-form');if(!form) return;
  const button=form.querySelector('[type="submit"]');
  const error=document.querySelector('#contact-error');
  const success=document.querySelector('#contact-success');
  const status=document.querySelector('#contact-status');
  const date=form.elements.preferred_date;
  initDatePicker(date);
  const syncPremises=()=>{
    const select=form.elements.premises_type;
    if(!select)return;
    for(const option of select.options)if(option.dataset.family)option.disabled=option.dataset.family!==form.elements.property_type.value;
    if(select.selectedOptions[0]?.disabled)select.value='';
  };
  syncPremises();
  form.elements.property_type?.addEventListener('change',syncPremises);
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
    if(date&&!validPreferredDate(date.value)){date.setCustomValidity('Choose today or a future date for your requested date.');date.reportValidity();return;}
    if(form.reportValidity?.()===false)return;
    const data=enquiryPayload(new FormData(form));
    if(!String(data.name).trim()) {form.elements.name.setCustomValidity('Please enter your name.');form.elements.name.reportValidity();return;}
    const digits=String(data.phone).replace(/\D/g,'').length;
    if(digits<7 || digits>15 || !/^\+?[\d\s().-]+$/.test(String(data.phone).trim())) {form.elements.phone.setCustomValidity('Enter a valid contact number with 7–15 digits.');form.elements.phone.reportValidity();return;}
    const payload={...data};
    const text=enquirySummary(payload);
    error.querySelector('[data-enquiry-email]').href=enquiryEmailLink('Pest control enquiry — VBK',text);
    sending=true;form.setAttribute('aria-busy','true');button.disabled=true;button.querySelector('span').textContent='Sending enquiry…';
    try {
      const delivery=await sendEnquiry(payload,{onStatus:(state,details)=>showEnquiryStatus(status,state,details)});
      showEnquiryStatus(status,'accepted',delivery);success.textContent=delivery.message;
      success.hidden=false;success.focus();window.shieldTrack?.('generate_lead');
    } catch(failure) {
      error.querySelector('[data-enquiry-email]').href=enquiryEmailLink('Pest control enquiry — VBK',text);
      error.querySelector('p').textContent=failure.message;error.hidden=false;error.focus();button.disabled=false;
      showEnquiryStatus(status,'failed',failure);
    } finally {
      sending=false;form.setAttribute('aria-busy','false');button.querySelector('span').textContent='Send enquiry';
      button.disabled=false;
    }
  });
}
