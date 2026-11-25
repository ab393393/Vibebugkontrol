import { openModal, closeModal } from './dialogs.mjs';

export function initPrivacyControls() {
  const id=document.querySelector('meta[name="shield-ga-id"]')?.content;
  const candidate=document.querySelector('meta[name="shield-gtm-id"]')?.content;
  const gtmId=/^GTM-[A-Z0-9]{4,15}$/.test(candidate||'')?candidate:'';
  const configured=!!gtmId||/^G-[A-Z0-9]{6,15}$/.test(id||'');
  const key='shield-privacy-v1';const lifetime=180*24*60*60*1000;
  const blocked=navigator.globalPrivacyControl===true;
  let choice;let loaded=false;
  try {const saved=JSON.parse(localStorage.getItem(key));if(saved?.expires>Date.now()&&['allow','decline'].includes(saved.choice))choice=saved.choice;}catch{}
  const safeLocation=location.origin+location.pathname;

  function loadAnalytics() {
    if(!configured||blocked||choice!=='allow')return;
    if(id)window[`ga-disable-${id}`]=false;
    if(loaded) {window.gtag?.('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});return;}
    loaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    if(gtmId) {
      window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js',page_location:safeLocation,page_referrer:''});
      const script=document.createElement('script');script.id='shield-analytics';script.async=true;script.src=`https://www.googletagmanager.com/gtm.js?id=${gtmId}`;document.head.append(script);
      window.dataLayer.push({event:'page_view',page_location:safeLocation,page_title:document.title,page_referrer:''});return;
    }
    window.gtag('js',new Date());
    window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:safeLocation,page_referrer:''});
    window.gtag('event','page_view',{page_location:safeLocation,page_title:document.title,page_referrer:''});
    const script=document.createElement('script');script.id='shield-analytics';script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${id}`;document.head.append(script);
  }
  window.shieldTrack=name=>{
    if(choice==='allow'&&loaded&&!blocked&&['generate_lead','quote_open','callback_request'].includes(name)) {
      if(gtmId)window.dataLayer.push({event:name,page_location:safeLocation,page_referrer:''});
      else window.gtag?.('event',name,{page_location:safeLocation,page_referrer:''});
    }
  };
  function removeAnalyticsCookies() {
    for(const cookie of document.cookie.split(';')) {
      const name=cookie.split('=')[0].trim();if(!/^_ga(?:_|$)|^_gid$|^_gat/.test(name))continue;
      document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;
      const parts=location.hostname.split('.');
      for(let i=0;i<parts.length-1;i++)document.cookie=`${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join('.')}; SameSite=Lax`;
    }
  }
  const banner=document.createElement('aside');banner.className='privacy-banner';banner.setAttribute('aria-label','Optional analytics');banner.hidden=true;
  banner.innerHTML='<div><strong>A little insight. Your choice.</strong><p>Allow optional analytics to help us improve this website? <a href="/privacy-policy">Privacy policy</a></p></div><div class="privacy-actions"><button type="button" data-decline>Decline</button><button class="button button-dark" type="button" data-allow>Allow analytics</button></div>';
  const dialog=document.createElement('dialog');dialog.className='privacy-dialog';dialog.id='privacy-dialog';dialog.setAttribute('aria-labelledby','privacy-title');
  dialog.innerHTML='<button type="button" class="icon-button privacy-close" aria-label="Close privacy preferences">×</button><p class="eyebrow">YOUR PRIVACY CHOICES</p><h2 id="privacy-title">A little insight.<br><em>Your choice.</em></h2><p>Optional analytics helps us understand how the website is used. You can browse and enquire either way.</p><p class="privacy-current" role="status"></p><p>Necessary website and security features stay available. <a href="/privacy-policy">Read our privacy policy ↗</a></p><div class="privacy-actions"><button type="button" class="button button-outline" data-decline>Decline analytics</button><button type="button" class="button button-dark" data-allow>Allow analytics</button></div>';
  document.body.append(banner,dialog);
  function status() {
    dialog.querySelector('.privacy-current').textContent=blocked?'Your browser’s privacy preference is keeping optional analytics off.':!configured?'Optional analytics is currently off for this website.':choice==='allow'?'Your current choice: analytics allowed.':choice==='decline'?'Your current choice: analytics declined.':'Optional analytics is off until you choose to allow it.';
    dialog.querySelector('[data-allow]').disabled=!configured||blocked;
  }
  function choose(value) {
    choice=value;try{localStorage.setItem(key,JSON.stringify({choice,expires:Date.now()+lifetime}));}catch{}
    if(value==='allow')loadAnalytics();
    else {
      if(id)window[`ga-disable-${id}`]=true;
      window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      removeAnalyticsCookies();
      if(gtmId&&loaded)location.reload?.();
    }
    banner.hidden=true;status();if(dialog.open)closeModal(dialog);
  }
  [banner,dialog].forEach(element=>{
    element.querySelector('[data-allow]').addEventListener('click',()=>choose('allow'));
    element.querySelector('[data-decline]').addEventListener('click',()=>choose('decline'));
  });
  dialog.querySelector('.privacy-close').addEventListener('click',()=>closeModal(dialog));
  document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',()=>{status();openModal(dialog,button);dialog.querySelector('.privacy-close').focus();}));
  status();loadAnalytics();
  if(configured&&!choice&&!blocked)banner.hidden=false;
}
