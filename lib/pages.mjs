import { services, guides } from '../public/site-content.mjs';
import { publishedReports } from './research.mjs';
import { areaPages, extraServices } from './catalog.mjs';
import { commercialServices } from './commercial-services.mjs';

/** @type {Record<string,string>} */
export const servicePaths = {
  cockroaches: '/services/cockroach-control', 'bed-bugs': '/services/bed-bug-control',
  rodents: '/services/rodent-control', 'identify-concern': '/services/pest-identification',
  ...Object.fromEntries(extraServices.map(service=>[service.id,'/services/'+service.slug]))
};

const serviceDescriptions = {
  cockroaches:'Cockroach control in Mumbai for homes, restaurants and offices. Understand kitchen activity, assessment, preparation and follow-up. Request a VBK quote.',
  'bed-bugs':'Bed bug treatment in Mumbai for homes and businesses. Learn which physical signs to record, how to prepare and what to ask about follow-up. Get a VBK quote.',
  rodents:'Rodent control in Mumbai for homes, restaurants and workplaces. Discuss rat or mouse signs, entry points, site access and monitoring. Request a VBK quote.',
  'identify-concern':'Not sure which pest you are seeing in Mumbai? Describe the signs, affected areas and property details to discuss identification, assessment and a quote.'
};

export const pages = [
  { path:'/', title:'Pest Control in Mumbai for Homes & Businesses | VBK', description:'Pest control in Mumbai for homes, restaurants and offices. Explore cockroach, bed bug and rodent services, compare AMC options and request a quote from VBK.', label:'Home', kind:'home' },
  { path:'/services', title:'Pest Control Services in Mumbai | VBK', description:'Explore pest control services in Mumbai for cockroaches, bed bugs and rodents. Discuss your home or business, affected areas and a personalised quotation.', label:'Our services', kind:'services', kicker:'LET’S START WITH YOUR CONCERN', heading:'Pest control in Mumbai.', emphasis:'A clearer next step.' },
  ...[...services,...extraServices].map(record => {
    const name=record.id==='identify-concern'?'Pest Identification':record.id==='cockroaches'?'Cockroach Control':record.id==='bed-bugs'?'Bed Bug Treatment':record.id==='rodents'?'Rodent Control':record.title;
    return {path:servicePaths[record.id],title:name+' in Mumbai | VBK',description:serviceDescriptions[record.id]||name+' in Mumbai for homes and businesses. Discuss signs, assessment, suitable methods, safety instructions, follow-up and a personalised quote.',label:record.title,kind:'service',record,kicker:'PEST CONTROL FOR HOMES & BUSINESSES',heading:name+' in Mumbai.',emphasis:'Start with what you’ve noticed.'};
  }),
  { path:'/residential', title:'Residential Pest Control in Mumbai | VBK', description:'Home pest control in Mumbai for cockroaches, bed bugs and rodents. Share your flat or house details, compare service scope and request a personalised VBK quote.', label:'Residential plans', kind:'residential', kicker:'FOR THE PLACE YOU COME BACK TO', heading:'Home pest control.', emphasis:'For life in Mumbai.' },
  { path:'/commercial', title:'Commercial Pest Control in Mumbai | VBK', description:'Commercial pest control in Mumbai for restaurants, offices, shops and shared premises. Discuss operating hours, affected areas and an AMC quotation with VBK.', label:'Commercial plans', kind:'commercial', kicker:'FOR THE WAY YOU WORK', heading:'Commercial pest control.', emphasis:'For Mumbai businesses.' },
  { path:'/quote',title:'Request a Pest Control Quote in Mumbai | VBK',description:'Request a pest control quote in Mumbai. Share your property, pest concern, contact details and preferred timing for a residential or commercial enquiry.',label:'Get a quote',kind:'quote',kicker:'YOUR NEXT STEP STARTS HERE',heading:'Pest care in Mumbai.',emphasis:'A quote for your space.' },
  { path:'/commercial/amc',title:'Pest Control AMC in Mumbai for Restaurants & Businesses | VBK',description:'Plan a pest control AMC in Mumbai for your restaurant, office or shop. Discuss scheduled visits, monitoring records, additional call-outs, exclusions and pricing.',label:'AMC for businesses',kind:'amc',kicker:'ANNUAL MAINTENANCE, AROUND YOUR BUSINESS',heading:'AMC for restaurants',emphasis:'and businesses in Mumbai.' },
  ...commercialServices.map(record=>({path:record.path,title:record.pageTitle,description:record.description,label:record.title,kind:'service',record,kicker:'COMMERCIAL PEST CONTROL · MUMBAI & THANE',heading:record.heading,emphasis:record.emphasis})),
  { path:'/guides', title:'Pest Control Guides, Signs & Prevention | VBK', description:'Explore practical guides to cockroach, bed bug and rodent signs, everyday prevention, commercial monitoring, and preparing for a pest control conversation.', label:'Useful guides', kind:'guides', kicker:'A LITTLE KNOWLEDGE. A LITTLE LESS WORRY.', heading:'Good to know,', emphasis:'before you begin.' },
  ...guides.map(record => ({ path:`/guides/${record.id}`, title:`${record.title.replace('?','')} | VBK`, description:record.description, label:record.title, kind:'guide', record, kicker:record.category.toUpperCase(), heading:record.title, emphasis:'A little clarity helps.' })),
  { path:'/pest-library', title:'Pest Library: Signs, Prevention & Care | VBK', description:'Find connected guidance on cockroaches, bed bugs and rodents. Explore possible signs, everyday prevention, service options and useful questions for your space.', label:'Pest library', kind:'topics', kicker:'UNDERSTAND THE CONCERN. FIND YOUR NEXT STEP.', heading:'Know the signs.', emphasis:'Find a clearer path.' },
  { path:'/research', title:'Pest Control Standards & Sources | VBK', description:'Check the Indian FSSAI and general educational sources behind VBK pest guides, with clear publication standards and a way to request corrections.', label:'Standards & sources', kind:'research', kicker:'THE REFERENCES BEHIND OUR GUIDES', heading:'Standards & sources.', emphasis:'Clarity you can check.' },
  { path:'/research/standards', title:'Original Research & Publication Standards | VBK', description:'How VBK will assess original pest observations before publication: sample definitions, verification, privacy review, limitations and corrections.', label:'Research standards', kind:'standards', kicker:'HOW A RECORD BECOMES A RELIABLE FINDING', heading:'Good evidence.', emphasis:'Clear limits.' },
  ...publishedReports.map(record=>({path:'/research/'+record.id,title:record.title+' | VBK',description:record.summary,label:record.title,kind:'report',record,kicker:'ORIGINAL FIELD OBSERVATIONS',heading:record.title,emphasis:'Read the full context.'})),
  ...areaPages.map(record=>({path:'/areas/'+record.slug,title:'Pest Control in '+record.name+' | VBK',description:record.description||'Pest control in '+record.name+', Mumbai for homes and businesses. Discuss cockroach, bed bug and rodent concerns, property access and a personalised quote.',label:record.name,kind:'area',record,kicker:'PEST CARE, AROUND YOUR NEIGHBOURHOOD',heading:'Pest control in '+record.name+'.',emphasis:'A clearer next step.'})),
  { path:'/faq', title:'Pest Control FAQs in Mumbai: Cost, Safety & AMC | VBK', description:'Questions about pest control in Mumbai? Find answers on pricing, children and pets, preparation, follow-up, restaurant AMCs and booking a service with VBK.', label:'Common questions', kind:'faq', kicker:'BEFORE YOU BOOK PEST CONTROL', heading:'Good questions.', emphasis:'Clear answers.' },
  { path:'/contact', title:'Contact VBK for Pest Control in Mumbai | Quote & Callback', description:'Contact VBK for pest control in Mumbai. Call, WhatsApp or send an enquiry about cockroaches, bed bugs, rodents, home services or a business AMC quotation.', label:'Contact us', kind:'contact', kicker:'TELL US WHAT YOU’VE NOTICED', heading:'Pest control in Mumbai.', emphasis:'Let’s talk about your space.' },
  { path:'/privacy-policy', title:'Privacy Policy & Cookie Choices | VBK', description:'How VBK handles enquiry details, email delivery, optional analytics and cookie choices. Find out how to contact us about your personal information.', label:'Privacy policy', kind:'privacy', kicker:'YOUR DETAILS, HANDLED WITH CARE', heading:'Privacy,', emphasis:'in plain language.' },
];

export function pageFor(path) { return pages.find(page => page.path === path); }
export function breadcrumbs(page) {
  const list = [{ label:'Home', path:'/' }];
  if (page.path.startsWith('/services/')) list.push({ label:'Our services', path:'/services' });
  if (page.path.startsWith('/guides/')) list.push({ label:'Useful guides', path:'/guides' });
  if (page.path.startsWith('/commercial/')) list.push({ label:'Commercial plans',path:'/commercial' });
  if (page.path.startsWith('/areas/')) list.push({ label:'Service areas',path:'/#service-areas' });
  if (page.path.startsWith('/research/')) list.push({ label:'Standards & sources', path:'/research' });
  if (page.path !== '/') list.push({ label:page.label, path:page.path });
  return list;
}

export const redirects = new Map([
  ['/index.html','/'], ['/home','/'], ['/contact-us','/contact'], ['/privacy','/privacy-policy'],
  ['/get-a-quote','/quote'], ['/quote.html','/quote'], ['/amc','/commercial/amc'],
  ['/home-pest-control','/residential'], ['/business-pest-control','/commercial'],
  ['/residential-pest-control','/residential'], ['/commercial-pest-control','/commercial'],
]);
export function redirectPath(path) {
  return redirects.get(path) || (path.length > 1 && path.endsWith('/') ? path.replace(/\/+$/,'') : null);
}
