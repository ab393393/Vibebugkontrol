import { services, guides, industryNotes, buildRecommendation, searchContent } from './site-content.mjs';
import { openModal, closeModal, motionAllowed } from './dialogs.mjs';
import { MOTION_EASE, revealPanel, initPageMotion, trackMotion } from './motion.mjs';

export function initExperience({openQuote,activatePlan}) {
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const ease=MOTION_EASE;

  const menuButton=$('#services-menu-button');
  const flyout=$('#services-flyout');
  const dropdown=$('.nav-dropdown');
  let hoverTimer;
  function setServiceMenu(open) {
    clearTimeout(hoverTimer);
    menuButton.setAttribute('aria-expanded',String(open));
    revealPanel(flyout,open);
  }
  menuButton.addEventListener('click',()=>setServiceMenu(menuButton.getAttribute('aria-expanded')!=='true'));
  dropdown.addEventListener('pointerenter',()=>{
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches) hoverTimer=setTimeout(()=>setServiceMenu(true),90);
  });
  dropdown.addEventListener('pointerleave',()=>{
    clearTimeout(hoverTimer);
    if(!dropdown.contains(document.activeElement)) hoverTimer=setTimeout(()=>setServiceMenu(false),170);
  });
  dropdown.addEventListener('focusout',()=>setTimeout(()=>{if(!dropdown.contains(document.activeElement))setServiceMenu(false);},0));
  $$('a',flyout).forEach(link=>link.addEventListener('click',()=>setServiceMenu(false)));
  document.addEventListener('click',event=>{if(!dropdown.contains(event.target))setServiceMenu(false);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && menuButton.getAttribute('aria-expanded')==='true') {setServiceMenu(false);menuButton.focus();}
  });

  const detailDialog=$('#detail-dialog');
  let detailRecord;
  let detailTrigger;
  function showDetail(id,trigger) {
    const record=[...services,...guides].find(item=>item.id===id);
    if(!record) return;
    detailRecord=record;
    detailTrigger=trigger;
    setServiceMenu(false);
    $('#detail-category').textContent=record.category.toUpperCase();
    $('#detail-title').textContent=record.title;
    $('#detail-description').textContent=record.description;
    $('#detail-introduction').textContent=record.introduction;
    $('#detail-icon use').setAttribute('href',`#${record.icon}`);
    const list=$('#detail-list');
    list.replaceChildren(...record.details.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    $('#detail-next').textContent=record.next;
    $('#detail-enquiry').firstChild.textContent=record.pest ? `Enquire about ${record.pest==='Not sure yet'?'your concern':record.pest.toLowerCase()} ` : 'Start an enquiry ';
    openModal(detailDialog,trigger);
    $('[data-close-detail]').focus();
  }
  $$('[data-service]').forEach(button=>button.addEventListener('click',()=>showDetail(button.dataset.service,button)));
  $$('[data-guide]').forEach(button=>button.addEventListener('click',()=>showDetail(button.dataset.guide,button)));
  $('[data-close-detail]').addEventListener('click',()=>closeModal(detailDialog));
  $('#detail-enquiry').addEventListener('click',async()=>{
    const record=detailRecord;
    const trigger=detailTrigger;
    await closeModal(detailDialog);
    openQuote(trigger,undefined,record?.pest,record?.id==='choosing-care'?{care:'Discuss ongoing care'}:{});
  });

  const finderForm=$('#finder-form');
  const finderResult=$('#finder-result');
  const finderDisclosure=$('details#plan-finder');
  if(finderDisclosure) {
    const revealFinder=()=>{if(window.location.hash==='#plan-finder')finderDisclosure.open=true;};
    revealFinder();
    window.addEventListener('hashchange',revealFinder);
    document.addEventListener('click',event=>{
      const link=event.target.closest?.('a[href]');
      if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const target=new URL(link.href,window.location.href);
      if(target.origin===window.location.origin&&target.pathname===window.location.pathname&&target.hash==='#plan-finder')finderDisclosure.open=true;
    });
  }
  let recommendation=buildRecommendation();
  function updateRecommendation(announce=true) {
    const data=new FormData(finderForm);
    recommendation=buildRecommendation({property:data.get('finder-property'),pest:data.get('finder-pest'),care:data.get('finder-care')});
    $('#finder-label').textContent=recommendation.label;
    $('#finder-title').textContent=recommendation.title;
    $('#finder-description').textContent=recommendation.description;
    $('#finder-chips').replaceChildren(...[recommendation.pest,recommendation.care].map(text=>{const chip=document.createElement('span');chip.textContent=text;return chip;}));
    finderResult.hidden=false;
    if(motionAllowed()) {
      finderResult.getAnimations().forEach(animation=>animation.cancel());
      trackMotion(finderResult.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:ease}));
    }
    if(announce) $('#finder-announcement').textContent=`${recommendation.label}. ${recommendation.title} Your choices: ${recommendation.pest}. ${recommendation.care}.`;
  }
  finderForm?.addEventListener('submit',event=>{event.preventDefault();updateRecommendation();});
  finderForm?.addEventListener('change',()=>{if(!finderResult.hidden) updateRecommendation();});
  $('#continue-finder')?.addEventListener('click',event=>openQuote(event.currentTarget,recommendation.property,recommendation.pest,{care:recommendation.care}));

  let industry='Office / retail';
  $$('[data-industry]').forEach(button=>button.addEventListener('click',()=>{
    industry=button.dataset.industry;
    $$('[data-industry]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    $('#industry-description').textContent=industryNotes[industry];
    const copy=$('#industry-description');
    copy.getAnimations().forEach(animation=>animation.cancel());
    if(motionAllowed()) trackMotion(copy.animate([{opacity:.1,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:ease}));
  }));
  $('#industry-enquiry')?.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();openQuote(event.currentTarget,'business',undefined,{premisesType:industry,care:'Discuss ongoing care'});});

  const searchDialog=$('#search-dialog');
  const searchInput=$('#site-search');
  const searchResults=$('#search-results');
  let searchTrigger;
  async function chooseResult(item) {
    const trigger=searchTrigger;
    await closeModal(searchDialog);
    if(item.href) return window.location.assign(item.href);
    if(item.action==='service'||item.action==='guide') return showDetail(item.id,trigger);
    if(item.action==='callback') return openQuote(trigger,undefined,undefined,{requestType:'Callback request',step:2});
    if(item.action==='home'||item.action==='business') {
      if(!$('#plans')) {window.location.assign(item.action==='business'?'/commercial':'/residential');return;}
      activatePlan(item.action);
      $('#plans').scrollIntoView({behavior:motionAllowed()?'smooth':'instant',block:'start'});
    } else if($('#questions')) $('#questions').scrollIntoView({behavior:motionAllowed()?'smooth':'instant',block:'start'});
    else window.location.assign('/faq');
  }
  function renderSearch() {
    const matches=searchContent(searchInput.value);
    searchResults.replaceChildren();
    $('#search-status').textContent=searchInput.value.trim() ? `${matches.length} result${matches.length===1?'':'s'} for your search` : 'POPULAR STARTING POINTS';
    for(const item of matches) {
      const button=document.createElement(item.href?'a':'button');
      if(item.href)button.href=item.href;
      button.className='search-result';
      const copy=document.createElement('span');
      const category=document.createElement('small'); category.textContent=item.category;
      const title=document.createElement('strong'); title.textContent=item.title;
      const text=document.createElement('span'); text.textContent=item.description;
      copy.append(category,title,text);
      const arrow=document.createElement('span'); arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      button.append(copy,arrow);
      if(!item.href)button.addEventListener('click',()=>chooseResult(item));
      searchResults.append(button);
    }
    if(!matches.length) {
      const empty=document.createElement('p');empty.className='search-empty';empty.textContent='No exact match. You can still tell us what you’re noticing.';
      const ask=document.createElement('button');ask.className='button button-dark';ask.textContent='Ask about your concern ↗';
      ask.addEventListener('click',async()=>{await closeModal(searchDialog);openQuote(searchTrigger,undefined,'Not sure yet');});
      searchResults.append(empty,ask);
    }
  }
  function openSearch(trigger) {
    searchTrigger=trigger;
    setContact(false);
    setServiceMenu(false);
    searchInput.value='';renderSearch();
    openModal(searchDialog,trigger);
    searchInput.focus();
  }
  $$('[data-search]').forEach(button=>button.addEventListener('click',()=>openSearch(button)));
  $('[data-close-search]').addEventListener('click',()=>closeModal(searchDialog));
  searchInput.addEventListener('input',renderSearch);
  searchInput.addEventListener('keydown',event=>{
    const first=$('button',searchResults);
    if(['ArrowDown','Enter'].includes(event.key)&&first){event.preventDefault();if(event.key==='Enter')first.click();else first.focus();}
  });
  searchResults.addEventListener('keydown',event=>{
    if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    event.preventDefault();
    const buttons=$$('button',searchResults);const index=buttons.indexOf(document.activeElement);
    if(event.key==='Home')buttons[0]?.focus();
    else if(event.key==='End')buttons.at(-1)?.focus();
    else if(event.key==='ArrowUp'&&index<=0)searchInput.focus();
    else buttons[Math.max(0,Math.min(buttons.length-1,index+(event.key==='ArrowDown'?1:-1)))]?.focus();
  });
  document.addEventListener('keydown',event=>{
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){event.preventDefault();openSearch($('[data-search]'));}
  });

  const faqSearch=$('#faq-search');
  const questions=$$('#faq-items details');
  faqSearch?.addEventListener('input',()=>{
    const words=faqSearch.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count=0;
    questions.forEach(question=>{const matches=words.every(word=>question.textContent.toLowerCase().includes(word));question.hidden=!matches;if(matches)count++;});
    $('#faq-empty').hidden=count>0;
    $('#faq-count').textContent=`${count} matching question${count===1?'':'s'}`;
  });

  const contactLauncher=$('#contact-launcher');
  const contactPanel=$('#contact-popover');
  function setContact(open) {
    contactLauncher.setAttribute('aria-expanded',String(open));
    revealPanel(contactPanel,open);
  }
  contactLauncher.addEventListener('click',()=>setContact(contactLauncher.getAttribute('aria-expanded')!=='true'));
  $$('[data-callback]').forEach(button=>button.addEventListener('click',event=>{if(button.tagName==='A'){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();}setContact(false);openQuote(button,undefined,undefined,{requestType:'Callback request',step:2});}));
  $$('[data-coverage]').forEach(button=>button.addEventListener('click',event=>{if(button.tagName==='A'){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();}setContact(false);openQuote(button,undefined,undefined,{requestType:'Coverage enquiry',focus:'area'});}));
  document.addEventListener('click',event=>{if(!$('.contact-widget').contains(event.target))setContact(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&contactLauncher.getAttribute('aria-expanded')==='true'){setContact(false);contactLauncher.focus();}});
  document.addEventListener('shield:quote-open',()=>{setContact(false);setServiceMenu(false);});

  const header=$('.site-header');
  const progress=$('.reading-progress span');
  let framePending=false;
  function updateScroll() {
    framePending=false;
    if(document.querySelector('dialog[open]'))return;
    const y=window.scrollY;
    const available=document.documentElement.scrollHeight-window.innerHeight;
    const heroActionsBottom=$('.hero-actions')?.getBoundingClientRect().bottom ?? 250-y;
    progress.style.transform=`scaleX(${available>0?Math.max(0,Math.min(1,y/available)):0})`;
    header.classList.toggle('is-scrolled',y>32);
    document.body.classList.toggle('show-mobile-contact',heroActionsBottom<90);
  }
  window.addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(updateScroll);}},{passive:true});
  window.addEventListener('resize',updateScroll,{passive:true});
  updateScroll();

  initPageMotion();
  if('IntersectionObserver' in window) {
    const sections=$$('main section[id]');
    const navigation=$$('.desktop-nav a[href^="#"]');
    const navObserver=new IntersectionObserver(entries=>{
      const current=entries.find(entry=>entry.isIntersecting);
      if(current) navigation.forEach(link=>{if(link.getAttribute('href')===`#${current.target.id}`&&(!link.dataset.planLink||link.dataset.planLink===$('[data-tab][aria-selected="true"]').dataset.tab))link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    },{rootMargin:'-15% 0px -60% 0px',threshold:0});
    sections.forEach(section=>navObserver.observe(section));
  }
}
