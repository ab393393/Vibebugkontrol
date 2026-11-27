import { enquiryPayload, enquirySummary } from './enquiry-model.mjs';
import { sendEnquiry, enquiryEmailLink, showEnquiryStatus } from './enquiry-delivery.mjs';
import { openModal, closeModal, motionAllowed } from './dialogs.mjs';
import { validPreferredDate } from './site-content.mjs';
import { initDatePicker } from './date-picker.mjs';
import { initExperience } from './experience.mjs';
import { initContactForm } from './contact-form.mjs';
import { initPrivacyControls } from './privacy-controls.mjs';
import { MOTION_EASE, revealPanel, trackMotion, initMotionInput } from './motion.mjs';
import { initDiagonalGalleries } from './diagonal-gallery.mjs';
import { loadPremiumMotion } from './premium-loader.mjs';

let initialised = false;
function initSite() {
  if (initialised) return;
  initialised = true;
  initMotionInput();

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const dialog = $('#quote-dialog');
  const form = $('#quote-form');
  initDatePicker(form.elements.preferred_date);
  const stepOne = $('#quote-step-one');
  const stepTwo = $('#quote-step-two');
  const result = $('#quote-result');
  const progress = $('#quote-progress');
  const title = $('#quote-title');
  const description = $('#quote-description');
  let enquiryText = '';
  let toastTimer;
  let submitting = false;
  const submitButton = $('#submit-enquiry');
  const formError = $('#quote-error');
  const deliveryStatus = $('#quote-delivery-status');

  function setSending(sending) {
    submitting = sending;
    form.setAttribute('aria-busy', String(sending));
    submitButton.disabled = sending;
    $('.form-back').disabled = sending;
    $('#submit-label').textContent = sending ? 'Sending enquiry…' : 'Send enquiry';
  }

  function clearFormError() {
    formError.hidden = true;
    $('#quote-error-message').textContent = '';
    if(!submitting)showEnquiryStatus(deliveryStatus,'idle');
  }

  function showToast(message) {
    const toast = $('.toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
  }

  function activatePlan(plan, focusTab = false) {
    const selected = plan === 'business' ? 'business' : 'home';
    if(!$('.plan-tabs')) { window.location.assign(selected==='business'?'/commercial':'/residential'); return; }
    const previous = $('[data-tab][aria-selected="true"]')?.dataset.tab;
    $('.plan-tabs').style.setProperty('--tab-index',selected === 'business' ? '1' : '0');
    $$('[data-tab]').forEach(tab => {
      const active = tab.dataset.tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      $(`#plan-${tab.dataset.tab}`).hidden = !active;
      if (active && focusTab) tab.focus();
    });
    const planNavigation=$$('.desktop-nav a[data-plan-link]');
    if(planNavigation.some(link=>link.hasAttribute('aria-current'))) planNavigation.forEach(link=>{if(link.dataset.planLink===selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    if(previous !== selected && motionAllowed()) {
      const panel=$(`#plan-${selected}`);
      panel.querySelectorAll('.plan-image, .plan-copy').forEach((part,index)=>{
        part.getAnimations().forEach(animation=>animation.cancel());
        trackMotion(part.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,delay:index*50,easing:MOTION_EASE}));
      });
    }
  }

  $$('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => activatePlan(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 'home' : event.key === 'End' ? 'business' : tab.dataset.tab === 'home' ? 'business' : 'home';
        activatePlan(next, true);
      }
    });
  });
  $$('[data-plan-link]').forEach(link => link.addEventListener('click', () => activatePlan(link.dataset.planLink)));

  const menu = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
    revealPanel(mobileNav,false);
  }
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    menu.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    revealPanel(mobileNav,!expanded);
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menu.focus(); }
  });
  window.matchMedia('(min-width:1001px)').addEventListener('change', event => { if(event.matches) closeMenu(); });

  function setStep(step, focus = true) {
    const first = step === 1;
    form.hidden = false;
    result.hidden = true;
    stepOne.hidden = !first;
    stepTwo.hidden = first;
    $$('input, textarea, select', stepTwo).forEach(input => { input.disabled = first; });
    clearFormError();
    if(!first) {
      const data=new FormData(form);
      const selections=[
        ['Space',[data.get('property'),data.get('premises_type'),data.get('size')==='Not specified'?'':data.get('size')].filter(Boolean).join(' · ')],
        ['Concern',data.getAll('pest').join(', ')||'Not sure yet'],
        ['Location',[String(data.get('area')||'').trim(),data.get('pincode')].filter(Boolean).join(' · ')||'To be discussed'],
        ['Care',data.get('care_preference')||'Help me decide']
      ];
      $('#space-summary').replaceChildren(...selections.map(([label,value])=>{const item=document.createElement('li');const key=document.createElement('strong');key.textContent=label;const text=document.createElement('span');text.textContent=value;item.append(key,text);return item;}));
    }
    const requestType=form.elements.request_type.value;
    progress.textContent = requestType === 'Callback request' ? (first ? 'YOUR CALLBACK · YOUR SPACE' : 'YOUR CALLBACK · CONTACT DETAILS') : `YOUR ENQUIRY · STEP ${step} OF 2`;
    $('#request-type-chip').textContent=requestType.toUpperCase();
    $('#preferred-date-label').textContent=requestType==='Callback request' ? 'Preferred callback date' : 'Preferred visit date';
    $('#date-preference-help').textContent=requestType==='Callback request' ? 'Your preferred callback time is a request.' : 'Your preferences are requests. The team will confirm availability.';
    dialog.style.setProperty('--step-progress', first ? '.5' : '1');
    title.replaceChildren();
    title.append(document.createTextNode(first ? 'Let’s start with' : 'A few more'));
    title.append(document.createElement('br'));
    const emphasis = document.createElement('em');
    emphasis.textContent = first ? 'your space.' : 'details.';
    title.append(emphasis);
    description.textContent = first ? 'Tell us a little about your space. We’ll send your enquiry directly to VBK.' : 'How can we reach you about your enquiry?';
    dialog.scrollTop = 0;
    if(dialog.open && motionAllowed()) trackMotion((first ? stepOne : stepTwo).animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:MOTION_EASE}));
    if (focus) requestAnimationFrame(() => first ? $('input[name="property"]:checked').focus() : $('#customer-name').focus());
  }

  function syncPremises() {
    const property=$('input[name="property"]:checked').value;
    $$('#premises-type option[data-family]').forEach(option=>{option.disabled=option.dataset.family!==property;});
    if($('#premises-type').selectedOptions[0]?.disabled) $('#premises-type').value='';
  }
  $$('input[name="property"]').forEach(input=>input.addEventListener('change',syncPremises));
  syncPremises();

  function openQuote(trigger, property, pest, preferences = {}) {
    closeMenu();
    document.dispatchEvent(new CustomEvent('shield:quote-open'));
    if (property && !submitting) {
      const selected = property === 'business' ? 'Business' : 'Home';
      $$('input[name="property"]').forEach(input => input.checked = input.value === selected);
    }
    if (pest && !submitting) {
      const value = pest === 'Not sure yet' ? 'Other / not sure' : pest;
      $$('input[name="pest"]').forEach(input => input.checked = input.value === value);
    }
    if(!submitting) {
      syncPremises();
      const requestType=['Quote request','Callback request','Coverage enquiry'].includes(preferences.requestType) ? preferences.requestType : 'Quote request';
      form.elements.request_type.value=requestType;
      if(preferences.care) form.elements.care_preference.value=preferences.care;
      if(preferences.premisesType && [...form.elements.premises_type.options].some(option=>option.value===preferences.premisesType&&!option.disabled)) form.elements.premises_type.value=preferences.premisesType;
      if(preferences.area) form.elements.area.value=preferences.area;
      setStep(preferences.step===2 ? 2 : 1,false);
    }
    openModal(dialog,trigger);
    window.shieldTrack?.(preferences.requestType==='Callback request'?'callback_request':'quote_open');
    dialog.scrollTop = 0;
    if(preferences.focus==='area') requestAnimationFrame(()=>form.elements.area.focus());
    else $('.dialog-close').focus();
  }

  function closeQuote() { closeModal(dialog); }
  $('.dialog-close').addEventListener('click', closeQuote);
  $$('[data-quote]').forEach(button => button.addEventListener('click', event => {if(button.tagName==='A'){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();}openQuote(button,button.dataset.quote||undefined);}));
  $$('[data-pest]').forEach(button => button.addEventListener('click', event => {if(button.tagName==='A'){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();}openQuote(button,undefined,button.dataset.pest);}));
  function advanceFromSpace() {
    const invalid=$$('input, select, textarea',stepOne).find(input=>!input.disabled&&!input.checkValidity());
    if(invalid) { invalid.reportValidity(); return; }
    setStep(2);
  }
  $('.form-next').addEventListener('click', advanceFromSpace);
  $('.form-back').addEventListener('click', () => setStep(1));
  $('.new-enquiry').addEventListener('click', () => { form.reset(); syncPremises(); setStep(1); });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    if (stepTwo.hidden) { advanceFromSpace(); return; }
    clearFormError();
    if(!validPreferredDate(form.elements.preferred_date.value)) {
      $('#preferred-date').setCustomValidity('Choose today or a future date for your requested date.');
      $('#preferred-date').reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (!String(data.get('customer') || '').trim()) {
      $('#customer-name').setCustomValidity('Please enter your name.');
      $('#customer-name').reportValidity();
      return;
    }
    const phone = String(data.get('phone') || '').trim();
    const digitCount = phone.replace(/\D/g, '').length;
    if (digitCount < 7 || digitCount > 15 || !/^\+?[\d\s().-]+$/.test(phone)) {
      $('#customer-phone').setCustomValidity('Enter a valid contact number with 7–15 digits.');
      $('#customer-phone').reportValidity();
      return;
    }
    const payload=enquiryPayload(data);
    payload._url=window.location.origin+window.location.pathname;
    enquiryText=enquirySummary(payload);
    $('#enquiry-email-fallback').href=enquiryEmailLink(payload._subject,enquiryText);
    setSending(true);
    try {
      const delivery=await sendEnquiry(payload,{onStatus:(state,details)=>showEnquiryStatus(deliveryStatus,state,details)});
      showEnquiryStatus(deliveryStatus,'accepted',delivery);
      showEnquiryStatus($('#quote-submission-status'),'accepted',delivery);
      window.shieldTrack?.('generate_lead');
      $('#enquiry-preview').textContent = enquiryText;
      $('#enquiry-preview').hidden=false;
      form.hidden = true;
      result.hidden = false;
      progress.textContent = 'YOUR ENQUIRY · SUBMITTED';
      title.textContent = 'A good place to start.';
      description.textContent = 'Thank you for getting in touch.';
      dialog.scrollTop = 0;
      if (dialog.open) $('.result-message').focus({preventScroll:true});
    } catch (error) {
      $('#enquiry-email-fallback').href=enquiryEmailLink(payload._subject,enquiryText);
      $('#quote-error-message').textContent = error.message || 'We couldn’t submit your enquiry. Please try again, or email us directly.';
      showEnquiryStatus(deliveryStatus,'failed',error);
      formError.hidden = false;
      if (dialog.open) formError.focus();
    } finally {
      setSending(false);
    }
  });
  const validatedFields=$$('[data-error]',form);
  function clearFieldError(field) {
    field.setCustomValidity('');field.removeAttribute('aria-invalid');
    const error=document.getElementById(field.dataset.error);error.hidden=true;error.textContent='';
  }
  form.addEventListener('invalid',event=>{
    const field=event.target;if(!field.dataset.error)return;
    const error=document.getElementById(field.dataset.error);
    error.textContent=field.name==='pincode'?'Enter a 6-digit PIN code.':field.validationMessage;
    error.hidden=false;field.setAttribute('aria-invalid','true');
  },true);
  validatedFields.forEach(field=>field.addEventListener('input',()=>clearFieldError(field)));
  form.addEventListener('reset',()=>validatedFields.forEach(clearFieldError));

  $('#copy-enquiry').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(enquiryText);
      const button = $('#copy-enquiry');
      button.lastChild.textContent = 'Copied!';
      setTimeout(() => button.lastChild.textContent = 'Copy enquiry', 2500);
      showToast('Your enquiry has been copied for your records.');
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('#enquiry-preview'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      showToast('Select and copy the enquiry, or use Download.');
    }
  });
  $('#download-enquiry').addEventListener('click', () => {
    const blob = new Blob([enquiryText], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'vbk-enquiry.txt';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Your enquiry copy is ready to save.');
  });

  $('#copyright-year').textContent = new Date().getFullYear();
  initPrivacyControls();
  initContactForm();
  initExperience({openQuote,activatePlan,showToast});
  initDiagonalGalleries();
  void loadPremiumMotion();
}

// Either the static module or React's commit can arrive first. The readiness
// flag covers both orders, without importing public assets through the router.
if (window.vbkInteractionsReady) initSite();
else window.addEventListener('vbk:interactions-ready',initSite,{once:true});
