import { extraServices } from '../lib/catalog.mjs';
import { services } from '../public/site-content.mjs';
import { breadcrumbs, servicePaths } from '../lib/pages.mjs';
import { siteConfig } from '../lib/site-config';
import faqs from '../content/faqs.json';
import { JsonLd } from '../lib/seo';
import { Button } from './ui/button';
import { ServiceBody, AMCContent, AreaContent } from './LaunchContent';
import { businessFooter, serviceAreasHtml, enquiryFallbackHtml } from '../lib/render-template.mjs';
import { ServiceExplorer } from './ServiceExplorer';
import { CommercialServiceLinks } from './CommercialServiceLinks';
import { commercialServices } from '../lib/commercial-services.mjs';
import { serviceVisuals } from '../lib/service-visuals.mjs';
import { ServiceIllustration } from './ServiceVisuals';
import { GuideBody, GuideDirectory, TopicLibrary, ResearchHub, ResearchStandards, ResearchReportBody, RelatedReading } from './Knowledge';

function Arrow() { return <svg className="icon" data-icon="inline-end" aria-hidden="true"><use href="#i-arrow" /></svg>; }
function Enquire({page}:{page:any}) {
  const href=page.record?.quoteHref||(page.kind==='service'?'/quote?pest='+encodeURIComponent(page.record.pest||page.record.title):['commercial','amc'].includes(page.kind)?'/quote?property=Business'+(page.kind==='amc'?'&topic=AMC':''):'/quote');
  return <a className="button button-dark" href={href}>Get a quote <Arrow /></a>;
}
function ServiceLinks() {
  return <div className="page-card-grid">{[...services,...extraServices].map((item:any)=><a className="page-card" href={servicePaths[item.id]} key={item.id}><svg className="page-card-icon" aria-hidden="true"><use href={'#'+item.icon} /></svg><h3>{item.title}</h3><p>{item.description}</p><span className="text-link">Explore care <Arrow /></span></a>)}</div>;
}
function FAQList() {
  return <><div className="faq-list">{faqs.map(item=><details key={item.question}><summary>{item.question}<span className="faq-toggle" aria-hidden="true" /></summary><div><p>{item.answer}</p></div></details>)}</div><JsonLd data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))}} /></>;
}
function ContactForm({query={}}:{query?:any}) {
  const business=siteConfig().business;
  const property=query.property==='Business'||query['finder-property']==='business'?'Business':'Home';
  const requestedPest=query.pest||query['finder-pest'];
  const concern=[...services,...extraServices].some(service=>(service.pest||service.title)===requestedPest)?requestedPest:'Other / not sure';
  const topicMessage=query.topic==='AMC'?'I would like to discuss an annual maintenance contract for my business.':commercialServices.find(service=>service.quoteTopic===query.topic)?.enquiryMessage||'';
  return <form id="contact-page-form" className="contact-page-form" action="/api/enquiries" method="post">
    <h2>Tell us about <em>your space.</em></h2><p>Share a few details. We’ll use them to respond to this enquiry. Your submission status will appear here.</p>
    <input type="hidden" name="request_type" value={query.request==='callback'?'Callback request':'Quote request'} /><input type="hidden" name="preferred_time" value="Any time" /><input type="hidden" name="care_preference" value={typeof query['finder-care']==='string'?query['finder-care'].slice(0,100):'Help me decide'} />
    <input name="_honey" type="text" autoComplete="off" tabIndex={-1} hidden aria-hidden="true" />
    <div className="form-row"><label className="field-label">Your name <span className="required-label">Required</span><input name="name" autoComplete="name" required maxLength={100} /></label><label className="field-label">Contact number <span className="required-label">Required</span><input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={25} /></label></div>
    <label className="field-label">Email address <span className="optional">Optional</span><input name="email" type="email" autoComplete="email" maxLength={254} /></label>
    <div className="form-row"><label className="field-label">Your space<select name="property_type" defaultValue={property}><option>Home</option><option>Business</option></select></label><label className="field-label">Your area / city <span className="optional">Optional</span><input name="area" defaultValue={typeof query.area==='string'?query.area.slice(0,100):''} autoComplete="address-level2" maxLength={100} /></label></div>
    <label className="field-label">Pest concern<select name="pest_concern" defaultValue={concern}><option>Cockroaches</option><option>Bed bugs</option><option>Rodents</option><option>Other / not sure</option>{extraServices.map(service=><option key={service.id}>{service.pest||service.title}</option>)}</select></label>
    <label className="field-label">What would you like to discuss?<textarea name="message" defaultValue={topicMessage} rows={4} maxLength={1000} placeholder="Your pest concern, affected areas, or a question for us…" /></label>
    <p className="privacy-note">By sending, you agree to be contacted about this enquiry. Read our <a href="/privacy-policy">privacy policy</a>.</p>
    <div className="form-error" id="contact-error" role="alert" tabIndex={-1} hidden><p /><a data-enquiry-email href="/contact">Email this enquiry ↗</a><div dangerouslySetInnerHTML={{__html:enquiryFallbackHtml(business)}} /></div>
    <Button type="submit" variant="shield" size="brand"><span>Send enquiry</span><Arrow /></Button>
    <p id="contact-status" className="form-help enquiry-status" role="status" aria-live="polite" data-state="idle">Status: Ready to send.</p>
    <p id="contact-success" className="contact-success" tabIndex={-1} hidden />
  </form>;
}
function Privacy() {
  const config=siteConfig();
  return <article className="prose-page"><p className="policy-date">Updated 24 October 2026</p>
    <p>This policy describes how VBK uses information collected through this website. For a privacy question or request, {config.business.email?<a href={'mailto:'+config.business.email}>{config.business.email}</a>:<a href="/contact">use our contact form and mention “Privacy request”</a>}.</p>
    <h2>Information you choose to share</h2><p>Enquiries ask for your name and contact number. You can also provide an email address, property type, pest concerns, location or PIN code, approximate space, care preferences, requested timing, and a message. Please leave out payment details, identity documents, and other sensitive information that is not needed for an enquiry.</p>
    <h2>How we use it</h2><p>We use your details to respond, discuss your pest control requirements, prepare a quotation, and arrange an agreed next step. Sending an enquiry gives us permission to contact you about that request. The form does not subscribe you to a marketing mailing list or confirm an appointment.</p>
    <h2>Email delivery and service providers</h2><p>Enquiry details are validated by the website server. With FormSubmit, the checked details are sent through its AJAX endpoint while you stay on this website. With Resend, delivery is requested by the server. The selected provider is {config.emailProvider}. A submission reference helps match the status shown on the website with the resulting enquiry email. Provider acceptance does not independently verify inbox receipt. Our hosting and email providers may process technical information needed to operate and protect their services. These providers may process information outside your country.</p><p>{config.emailProvider==='Resend'?<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Read Resend’s privacy policy ↗</a>:<a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener noreferrer">Read FormSubmit’s privacy policy ↗</a>}</p>
    <h2>Keeping and removing enquiry details</h2><p>The website does not create a customer account. Enquiry emails may remain in our inbox while we respond and manage the relevant business relationship, or where retention is required. When our enquiry register is connected, validated enquiries are also saved in a private Google Sheet for follow-up, including when email delivery is not confirmed. Google processes that information as the spreadsheet provider. A register entry does not independently verify email receipt. You can ask us to correct or remove your enquiry information using the contact route above; we may need to confirm your identity first.</p>
    <h2>Analytics and cookie preferences</h2><p>Optional Google Analytics or Google Tag Manager is used only when configured for the public website and when you choose to allow analytics. It helps us understand page visits and general website use. The analytics integration sends page paths and generic interaction events; we do not send form contents, names, contact numbers, email addresses, or enquiry notes as analytics events.</p><p>Before you allow analytics, the analytics and tag management scripts are not loaded. Your cookie choice is stored in your browser for up to six months. You can change it using “Cookie preferences” in the footer. Declining analytics does not stop you from using the site or sending an enquiry. Hosting services may use necessary security or access cookies.</p><button className="text-link" type="button" data-cookie-settings>Manage cookie preferences ↗</button>
    <h2>Business location map</h2><p>If a business-location map is displayed, the embedded Google Maps frame loads as it approaches the visible page. Loading the frame connects your browser to Google, which handles the request under its own <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>. You can use the enquiry form without opening a map.</p>
    <h2>Technical security</h2><p>The contact endpoint validates enquiry fields and applies request-size, origin and basic abuse checks. We do not include email-service credentials in browser code. No website can promise absolute security; please contact us if you believe information has been sent or used incorrectly.</p>
    <h2>Changes and contacting us</h2><p>We may update this policy as the website or its providers change. The date above shows the latest revision. Use <a href="/contact">our contact form</a> for questions, access or correction requests, deletion requests, or a request to stop further contact.</p>
  </article>;
}

export function ContentPage({page,query={}}:{page:any;query?:any}) {
  const business=siteConfig().business;
  const plan=['residential','commercial'].includes(page.kind);
  const image=page.kind==='commercial'?'business':'home';
  const illustrated=page.kind==='service'&&Object.hasOwn(serviceVisuals,page.record?.id||'');
  const trail=breadcrumbs(page);
  return <main id="main" className={'content-page page-'+page.kind}>
    <nav className="breadcrumbs container" aria-label="Breadcrumb"><ol>{trail.map((item:any,index:number)=><li key={item.path}>{index<trail.length-1?<a href={item.path}>{item.label}</a>:<span aria-current="page">{item.label}</span>}</li>)}</ol></nav>
    <section className={'page-intro container'+(plan||illustrated?' page-intro-split':'')}>
      <div><p className="eyebrow">{page.kicker}</p><h1>{page.heading}<br /><em>{page.emphasis}</em></h1><p className="page-lede">{(page.kind==='service'?page.description:page.record?.description) || (page.kind==='residential'?'Care for your apartment or independent home, starting with what you’re noticing and the way you live.':page.kind==='commercial'?'A shop, a workplace, or more than one location. Let’s start with the details that matter to your business.':page.kind==='contact'?'Tell us what you’re noticing, request a callback, or ask about your area. There’s a useful next step for every enquiry.':page.kind==='privacy'?'Clear information about enquiries, optional analytics, and the choices you have.':page.description)}</p>{page.record?.quoteHref&&<div className="page-actions"><Enquire page={page} /></div>}{plan&&<div className="page-actions"><Enquire page={page} /><a className="text-link" href="/contact">Talk to us <Arrow /></a></div>}</div>
      {illustrated&&<ServiceIllustration id={page.record.id} />}
      {plan&&<figure className="page-hero-image"><img src={'/assets/'+image+'.webp'} srcSet={`/assets/${image}-480.webp 480w, /assets/${image}-800.webp 800w, /assets/${image}.webp 1536w`} sizes="(max-width:760px) 90vw, 45vw" width={1536} height={1024} alt={page.kind==='commercial'?'Illustrative restaurant interior with green seating and natural timber':'Illustrative sunlit living room with natural wood and soft furnishings'} fetchPriority="high" /><figcaption>Spaces worth protecting.</figcaption></figure>}
    </section>
    <div className="page-body container">
      {page.kind==='services'&&<><ServiceExplorer /><CommercialServiceLinks /><section className="page-callout"><h2>Not sure where <em>to begin?</em></h2><p>Describe the signs you’ve noticed. You don’t have to identify the pest to start a conversation.</p><a className="text-link" href="/services/pest-identification">Find your starting point <Arrow /></a></section></>}
      {['service','guide'].includes(page.kind)&&<div className="article-layout">
        <article className="prose-page">{page.kind==='service'?<ServiceBody record={page.record} />:page.record.sections?<GuideBody record={page.record} />:<><p>{page.record.introduction}</p><h2>{page.kind==='service'?'Useful details for your quotation':'A few useful things to consider'}</h2><ul>{page.record.details.map((detail:string)=><li key={detail}>{detail}</li>)}</ul><h2>Your next step</h2><p>{page.record.next}</p></>}<Enquire page={page} /></article>
        <aside className="article-aside"><svg aria-hidden="true"><use href={'#'+page.record.icon} /></svg><h2>A plan starts<br />with <em>your space.</em></h2><p>Tell us about your property, the concern, and a suitable time to reach you.</p><a className="text-link" href="/contact">Get in touch <Arrow /></a><a className="text-link" href="/faq">Common questions <Arrow /></a></aside>
      </div>}
      {plan&&<><section className="plan-details"><div><h2>Care around <em>your routine.</em></h2><p>{page.kind==='commercial'?'Share your premises type, operating hours, access arrangements, and the areas affected. These details help start a practical conversation about scope and scheduling.':'Tell us which rooms are affected, when you noticed the signs, and any questions about your household’s routine. Your enquiry helps shape a useful discussion about care.'}</p></div><div><h3>What to include</h3><ul>{(page.kind==='commercial'?['Premises type and number of locations','Pest concerns and affected areas','Operating hours and access requirements','A current concern or a discussion about ongoing care']:['Apartment or independent home, and approximate size','Pest concerns and affected rooms','Your area or PIN code','Questions about preparation, timing or ongoing care']).map(text=><li key={text}>{text}</li>)}</ul><p className="form-help">Scope, coverage, visit frequency, preparation and pricing are confirmed with your quotation.</p></div></section><section className="related-pages"><h2>Start with <em>your concern.</em></h2><ServiceLinks /></section><section className="page-callout"><h2>One space or several.<br /><em>Let’s start a conversation.</em></h2><Enquire page={page} /></section></>}
      {page.kind==='commercial'&&<CommercialServiceLinks />}
      {page.kind==='amc'&&<><AMCContent /><div className="page-actions"><Enquire page={page} /></div></>}
      {page.kind==='area'&&<AreaContent record={page.record} />}
      {page.kind==='quote'&&<div className="quote-page-layout"><ContactForm query={query} /><aside className="article-aside"><h2>A clear <em>next step.</em></h2><p>Share the concern and your property details. The team will discuss scope, service availability, preparation, pricing and requested timing before a visit is confirmed.</p><p>For a commercial contract, include operating hours, locations and access requirements.</p><a className="text-link" href="/commercial/amc">Explore business AMC plans ↗</a><a className="text-link" href="/faq">Cost, safety and timing questions ↗</a></aside></div>}
      {page.kind==='guides'&&<GuideDirectory />}
      {page.kind==='topics'&&<TopicLibrary />}
      {page.kind==='research'&&<ResearchHub />}
      {page.kind==='standards'&&<ResearchStandards />}
      {page.kind==='report'&&<ResearchReportBody record={page.record} />}
      {page.kind==='faq'&&<div className="faq-page-content"><FAQList /><section className="page-callout"><h2>Have a different <em>question?</em></h2><Enquire page={page} /></section></div>}
      {page.kind==='contact'&&<div className="contact-layout"><aside><h2>Let’s talk about<br /><em>your space.</em></h2><div dangerouslySetInnerHTML={{__html:businessFooter(business)}} /><div className="contact-option"><h3>Prefer a conversation?</h3><p>Leave your number and a requested callback time.</p><button className="text-link" data-callback>Request a callback <Arrow /></button></div><div className="contact-option"><h3>Check your area</h3><p>Share your area or PIN code so the team can discuss availability.</p><button className="text-link" data-coverage>Ask about coverage <Arrow /></button></div><p className="contact-footnote">Service availability, quotation and requested timing are confirmed with the team.</p></aside><ContactForm /></div>}
      {page.kind==='contact'&&<div dangerouslySetInnerHTML={{__html:serviceAreasHtml(business).replace('section container','')}} />}
      {page.kind==='privacy'&&<Privacy />}
      <RelatedReading path={page.path} />
    </div>
    {page.kind!=='privacy'&&<nav className="page-end-links container" aria-label="More from VBK"><a href="/services">Our services ↗</a><a href="/residential">For your home ↗</a><a href="/commercial">For your business ↗</a><a href="/guides">Useful guides ↗</a><a href="/pest-library">Pest library ↗</a><a href="/research">Research &amp; evidence ↗</a><a href="/contact">Contact us ↗</a></nav>}
  </main>;
}
