import { areaPages } from './catalog.mjs';
import { commercialServices } from './commercial-services.mjs';
import { serviceVisuals } from './service-visuals.mjs';
import { diagonalGalleryHtml } from './diagonal-gallery.mjs';

export const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon=id=>`<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
export function commercialCardsHtml() {
  return `<div class="page-card-grid commercial-visual-grid">${commercialServices.map(record=>{
    const visual=serviceVisuals[record.id];const asset='/assets/'+visual.image;
    return `<a class="page-card commercial-visual-card" href="${escapeHtml(record.path)}" aria-label="${escapeHtml(record.title)} in Mumbai and Thane"><div class="commercial-card-image"><img src="${asset}.webp" srcset="${asset}-480.webp 480w, ${asset}-800.webp 800w, ${asset}.webp 1536w" sizes="(max-width:760px) 90vw, 30vw" width="1536" height="1024" loading="lazy" alt="${escapeHtml(visual.alt)}"><span class="illustration-label">Illustration</span></div><div class="commercial-card-copy"><h3>${escapeHtml(visual.cardTitle)}</h3><p>${escapeHtml(visual.cardDescription)}</p><ul class="visual-tags">${visual.tags.map(tag=>`<li>${escapeHtml(tag)}</li>`).join('')}</ul><span class="text-link">View service details</span></div></a>`;
  }).join('')}</div>`;
}
export function businessGalleryHtml() {
  return diagonalGalleryHtml({step:110,duration:.9,thumb:22,photos:commercialServices.map(record=>{
    const visual=serviceVisuals[record.id];const asset='/assets/'+visual.image;
    return {id:record.id,src:asset+'.webp',srcset:`${asset}-480.webp 480w, ${asset}-800.webp 800w, ${asset}.webp 1536w`,thumbnail:asset+'-480.webp',alt:visual.alt,title:visual.cardTitle,description:visual.cardDescription,tags:visual.tags,href:record.path,linkLabel:record.title};
  })});
}
export function contactLinks(business,where='hero') {
  return `<div class="business-contact-links contact-links-${where}">${business.telephone?`<a href="tel:${escapeHtml(business.telephone)}" aria-label="Call VBK">${icon('i-phone')}<span>Call us</span></a>`:''}${business.whatsappUrl?`<a href="${escapeHtml(business.whatsappUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Contact VBK on WhatsApp">${icon('i-whatsapp')}<span>WhatsApp</span></a>`:''}</div>`;
}
export function enquiryFallbackHtml(business) {
  return `<p class="enquiry-fallback-links">${business.telephone?`<a href="tel:${escapeHtml(business.telephone)}">Call ${escapeHtml(business.phone)}</a>`:''}${business.telephone&&business.whatsappUrl?' · ':''}${business.whatsappUrl?`<a href="${escapeHtml(business.whatsappUrl)}" target="_blank" rel="noopener noreferrer">WhatsApp us ↗</a>`:''}</p>`;
}
export function businessFooter(business) {
  return `<div class="business-footer-details"><strong>${escapeHtml(business.name)}</strong>${business.address?`<address>${escapeHtml(business.addressText)}</address>`:''}${business.phone?`<a href="tel:${escapeHtml(business.telephone)}">${escapeHtml(business.phone)}</a>`:''}${business.email?`<a href="mailto:${escapeHtml(business.email)}">${escapeHtml(business.email)}</a>`:''}${business.openingHours.length?`<p>Opening hours: ${business.openingHours.map(escapeHtml).join(' · ')}</p>`:''}${contactLinks(business,'footer')}</div>`;
}
export function serviceAreasHtml(business,{compact=false}={}) {
  const names=[...new Set([...business.areaServed,...areaPages.map(area=>area.name)])];
  const coverage=names.includes('Thane')?'Mumbai and Thane':'Mumbai';
  if(compact)return `<section class="home-coverage section container" id="service-areas" aria-labelledby="service-areas-heading"><div><p class="eyebrow">LOCAL PEST CARE</p><h2 id="service-areas-heading">Serving ${escapeHtml(coverage)}.</h2><p>Share your neighbourhood and premises. Coverage, access and appointment timing are confirmed with your quote.</p></div><div class="home-coverage-links"><ul class="area-links">${names.map(name=>{const area=areaPages.find(item=>item.name===name);return `<li>${area?`<a href="/areas/${escapeHtml(area.slug)}">Pest control in ${escapeHtml(name)} ↗</a>`:escapeHtml(name)}</li>`;}).join('')}</ul><a class="text-link" href="/quote">Ask about your area ↗</a></div></section>`;
  return `<section class="local-section section container" id="service-areas" aria-labelledby="service-areas-heading"><p class="eyebrow">LOCAL CARE. A CLEARER NEXT STEP.</p><h2 id="service-areas-heading">Pest control service areas<br>in <em>${escapeHtml(coverage)}.</em></h2><p>Tell us your neighbourhood, property type and the concern you are noticing. Access, coverage and requested timing are confirmed before a visit is agreed.</p><ul class="area-links">${names.map(name=>{const area=areaPages.find(item=>item.name===name);return `<li>${area?`<a href="/areas/${escapeHtml(area.slug)}">Pest control in ${escapeHtml(name)} ↗</a>`:escapeHtml(name)}</li>`;}).join('')}</ul><a class="text-link" href="/quote">Ask about your area ↗</a>${business.mapEmbedUrl?`<div class="business-map"><iframe title="${escapeHtml(business.name)} business location in Mumbai" src="${escapeHtml(business.mapEmbedUrl)}" width="1000" height="360" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`:''}</section>`;
}
export function trustHtml(business) {
  if(!business.licenseNumber&&!business.certifications.length&&!business.yearsExperience&&!business.reviews.length&&!business.clients.length)return '';
  return `<section class="local-section section container" aria-labelledby="business-evidence-heading"><p class="eyebrow">ABOUT VBK</p><h2 id="business-evidence-heading">The people and proof<br>behind <em>your care.</em></h2>${business.licenseNumber?`<p>License number: ${escapeHtml(business.licenseNumber)}</p>`:''}${business.yearsExperience?`<p>${business.yearsExperience} years of experience.</p>`:''}${business.certifications.length?`<ul>${business.certifications.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`:''}${business.reviews.map(review=>`<blockquote><p>${escapeHtml(review.quote)}</p><cite>${escapeHtml(review.author)}</cite></blockquote>`).join('')}${business.clients.length?`<h3>Clients</h3><ul>${business.clients.map(name=>`<li>${escapeHtml(name)}</li>`).join('')}</ul>`:''}</section>`;
}
export function renderTemplate(source,business) {
  source=source.replaceAll('<!--visual:diagonal-->',source.includes('<!--visual:diagonal-->')?businessGalleryHtml():'');
  source=source.replaceAll('<!--business:areas-compact-->',source.includes('<!--business:areas-compact-->')?serviceAreasHtml(business,{compact:true}):'');
  return source.replaceAll('<!--visual:commercial-->',source.includes('<!--visual:commercial-->')?commercialCardsHtml():'').replaceAll('<!--contact:header-->',contactLinks(business,'header')).replaceAll('<!--contact:hero-->',contactLinks(business,'hero')).replaceAll('<!--business:footer-->',businessFooter(business)).replaceAll('<!--business:areas-->',serviceAreasHtml(business)).replaceAll('<!--business:trust-->',trustHtml(business)).replaceAll('<!--business:enquiry-fallback-->',enquiryFallbackHtml(business))
    .replaceAll('<!--business:mobile-->',`<div class="mobile-contact-bar" aria-label="Quick enquiry">${business.telephone?`<a href="tel:${escapeHtml(business.telephone)}" aria-label="Call VBK">${icon('i-phone')}<span>Call</span></a>`:`<a href="/quote?request=callback">${icon('i-phone')}<span>Callback</span></a>`}${business.whatsappUrl?`<a href="${escapeHtml(business.whatsappUrl)}" target="_blank" rel="noopener noreferrer">${icon('i-whatsapp')}<span>WhatsApp</span></a>`:''}<a class="button button-dark" href="/quote">Get a quote ${icon('i-arrow')}</a></div>`)
    .replaceAll('mailto:abhishek.bhole123@gmail.com',business.email?'mailto:'+escapeHtml(business.email):'/contact')
    .replaceAll('abhishek.bhole123@gmail.com',business.email?escapeHtml(business.email):'Contact VBK')
    .replaceAll('Email us',business.email?'Email us':'Contact us');
}
