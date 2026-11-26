import { planningGuides } from './planning-guides.mjs';
import { topicGuides } from './knowledge-content.mjs';
import { launchGuides } from './launch-guides.mjs';
import { additionalServices } from './additional-services.mjs';

export const services = [
  {
    id: 'cockroaches', title: 'Cockroach control', pest: 'Cockroaches', icon: 'i-roach',
    category: 'Pest care', keywords: 'cockroach roach kitchen cupboards pantry insects pest treatment',
    description: 'Seeing cockroaches in the kitchen or cupboards? Explore assessment, preparation and follow-up for your Mumbai property.',
    introduction: 'Tell us where you’re noticing activity, how often it happens, and which rooms are affected. Those details help shape a useful discussion about your space.',
    details: ['The rooms, cupboards, or common areas affected.', 'When you first noticed the issue and how often you see activity.', 'Any previous visits or treatments you want to discuss.'],
    next: 'Share your property type and concern. We will discuss scope, preparation, pricing, and a suitable next step with you.'
  },
  {
    id: 'bed-bugs', title: 'Bed bug treatment', pest: 'Bed bugs', icon: 'i-bedbug',
    category: 'Pest care', keywords: 'bedbug bed bug bedroom bed mattress upholstery sleeping bugs',
    description: 'Understand possible signs around beds and furnishings, what to prepare and which follow-up questions to ask.',
    introduction: 'Let us know which rooms or furnishings concern you, when you noticed the signs, and whether more than one room is involved. You don’t have to identify the pest before asking for help.',
    details: ['The rooms and furnishings you’re concerned about.', 'How long the issue has been noticeable.', 'Your questions about preparation and any follow-up arrangements.'],
    next: 'The proposed approach and any preparation instructions should be discussed before a visit is confirmed.'
  },
  {
    id: 'rodents', title: 'Rodent control', pest: 'Rodents', icon: 'i-rodent',
    category: 'Pest care', keywords: 'rat rats mouse mice rodent rodents movement office store room',
    description: 'Discuss rat or mouse sightings, damaged packaging and possible entry points in homes, restaurants and workplaces.',
    introduction: 'Describe the signs you’ve noticed and where they occur. For a business, include the type of premises, operating hours, and areas with restricted access.',
    details: ['The areas where you’ve noticed movement or other signs.', 'Your property type and approximate size.', 'Any access, storage, or operating-hour requirements.'],
    next: 'Start with an enquiry so we can discuss the concern, site requirements, and the scope of an appropriate quotation.'
  },
  {
    id: 'identify-concern', title: 'Help with an unknown pest', pest: 'Not sure yet', icon: 'i-search',
    category: 'Find your next step', keywords: 'unknown identify not sure which pest insect signs infestation guidance help',
    description: 'Not sure what you’re seeing? Start with the signs.',
    introduction: 'You don’t need to know the name of the pest to enquire. Describe what you’ve seen, which parts of your space are affected, and when you first noticed it.',
    details: ['What you’ve seen or noticed.', 'Where it happens and how often.', 'Whether this is for a home, a business, or a shared property.'],
    next: 'Select “Other / not sure” in your enquiry. Service coverage and the next step will be discussed with you.'
  }
];

export const guides = [
  planningGuides[0],
  {
    id: 'choosing-care', title: 'One-off pest control or an AMC?', category: 'Finding your plan', icon: 'i-shield',
    keywords: 'annual AMC maintenance recurring regular ongoing one time single plan contract',
    description: 'Compare an enquiry for a current pest problem with a discussion about scheduled visits and an annual maintenance contract.',
    introduction: 'Some enquiries start with a current concern; others are about discussing care over time. The right starting point depends on your space and what you want to address.',
    details: ['Choose “A current pest concern” if you want to discuss an issue now.', 'Choose “Discuss ongoing care” if you’d like to explore repeat visits or a longer-term plan.', 'Choose “Help me decide” if you want to discuss the options first.'],
    next: 'Visit frequency, coverage, follow-up terms, and pricing are discussed as part of your quotation.'
  },
  planningGuides[1],
  ...topicGuides,...launchGuides
];

export const industryNotes = {
  'Office / retail': 'Include your opening hours, stockrooms, staff areas and access arrangements. Tell us whether you need help with a current problem or scheduled pest control.',
  'Food / hospitality': 'Describe the kitchen, food stores, waste area and times when the premises can be accessed. Include the pest activity you have recorded and any AMC requirements.',
  'Shared / multiple sites': 'Let us know how many locations or shared areas are involved and who we should contact about access and scope.',
  'Other workplace': 'Every workspace has its own routine. Describe the premises, concern, and anything we need to know before discussing a plan.'
};

export function buildRecommendation({property = 'home', pest = 'Not sure yet', care = 'Help me decide'} = {}) {
  const type = property === 'business' ? 'business' : 'home';
  const knownPest = services.some(service=>service.pest===pest) ? pest : 'Not sure yet';
  const knownCare = ['A current pest concern','Discuss ongoing care','Help me decide'].includes(care) ? care : 'Help me decide';
  return {
    property: type, pest: knownPest, care: knownCare,
    title: type === 'home' ? 'A calmer home starts here.' : 'Care around the way you work.',
    label: `${type === 'home' ? 'Residential' : 'Commercial'} enquiry`,
    description: knownCare === 'Discuss ongoing care'
      ? 'Start a conversation about ongoing care for your space. Scope, visit frequency, and pricing will be discussed with us.'
      : knownCare === 'A current pest concern'
        ? 'Start with the concern you’re noticing now. Share a few details so we can discuss an appropriate next step.'
        : 'You don’t need to have everything worked out. Share what you’ve noticed and discuss the options with us.'
  };
}

const navigationResults = [
  {id:'restaurant-pest-control',title:'Restaurant pest control in Mumbai and Thane',category:'Commercial services',description:'Cafés, bakeries, cloud kitchens, food outlets and kitchen pest concerns.',keywords:'restaurant cafe bakery cloud kitchen food outlet commercial kitchen cockroach rodent FSSAI price hotel near me Mumbai Thane',href:'/commercial/restaurant-pest-control',action:'page'},
  {id:'office-bed-bug-control',title:'Office and commercial bed bug treatment in Mumbai',category:'Commercial services',description:'Corporate offices, coworking spaces, hotels, hostels and PGs.',keywords:'office corporate coworking bed bug bedbug inspection commercial hotel hostel PG Mumbai',href:'/commercial/office-bed-bug-control',action:'page'},
  {id:'industrial-rodent-control',title:'Factory and warehouse rodent control in Mumbai',category:'Commercial services',description:'Rodent enquiries for industrial units, godowns, food and pharma premises.',keywords:'factory warehouse industrial unit godown rat rodent food pharma MIDC proofing contract Mumbai Thane',href:'/commercial/industrial-rodent-control',action:'page'},
  {id:'thane-area',title:'Pest control in Thane',category:'Service areas',description:'Home, restaurant, office and industrial pest control enquiries in Thane.',keywords:'Thane near me restaurant home business pest control AMC',href:'/areas/thane',action:'page'},
  {id:'amc',title:'AMC for restaurants and businesses in Mumbai',category:'Commercial care',description:'Annual contracts, visit frequency, covered sites and additional call-out terms.',keywords:'AMC annual yearly monthly quarterly maintenance contract restaurant office society societies factory commercial emergency visits add-ons Mumbai Thane',href:'/commercial/amc',action:'page'},
  {id:'quote-page',title:'Get a pest control quote in Mumbai',category:'Get in touch',description:'Send your residential or commercial enquiry.',keywords:'quote enquiry Mumbai price cost form',href:'/quote',action:'page'},
  {id:'pest-library',title:'Pest library',category:'Knowledge',description:'Signs, prevention and care, organised by pest.',keywords:'pest library knowledge signs prevention learning guide',href:'/pest-library',action:'page'},
  {id:'research',title:'Research and evidence',category:'Knowledge',description:'References and standards for original observations.',keywords:'research evidence data methodology study statistics reports',href:'/research',action:'page'},
  {id:'research-standards',title:'Our research standards',category:'Knowledge',description:'How a finding needs context, verification and clear limits.',keywords:'research evidence data methodology standards sample limitations',href:'/research/standards',action:'page'},
  {id:'home-plan',title:'Residential plans',category:'Your space',description:'Explore care for your home.',keywords:'home residential apartment flat house plan price quote',action:'home'},
  {id:'business-plan',title:'Commercial plans',category:'Your space',description:'Start with your premises and operating needs.',keywords:'commercial business office shop restaurant retail hospitality plan',action:'business'},
  {id:'callback',title:'Request a callback',category:'Get in touch',description:'Leave a contact number and a preferred time.',keywords:'callback phone contact call consultation enquiry email',action:'callback'},
  {id:'questions',title:'Common questions',category:'Good to know',description:'Pricing, plans, and getting started.',keywords:'FAQ questions answers costs pricing booking schedule',action:'questions'}
];

export function searchContent(query) {
  const serviceSlugs={cockroaches:'cockroach-control','bed-bugs':'bed-bug-control',rodents:'rodent-control','identify-concern':'pest-identification'};
  const all = [...[...services,...additionalServices.filter(service=>service.published===true)].map(x=>({...x,href:'/services/'+(serviceSlugs[x.id]||x.slug),action:'service'})),...guides.map(x=>({...x,href:'/guides/'+x.id,action:'guide'})),...navigationResults];
  const words = String(query || '').toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0,12);
  if(!words.length) return all.filter(x=>['cockroaches','bed-bugs','rodents','home-plan','business-plan','callback'].includes(x.id));
  return all.map(item=>{
    const title=item.title.toLowerCase();
    const haystack=`${title} ${item.category} ${item.keywords} ${item.description}`.toLowerCase();
    return {...item,score:words.every(word=>haystack.includes(word)) ? words.reduce((score,word)=>score+(title.includes(word)?3:1),0):0};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
}

export function indiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function validPreferredDate(value, now = new Date()) {
  if(!value) return true;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date=new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===value && value>=indiaDateKey(now);
}
