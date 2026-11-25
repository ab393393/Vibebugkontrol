import { pestTopics } from '../public/knowledge-content.mjs';

const link=(href,label,description)=>({href,label,description});
const library=link('/pest-library','Explore the pest library','Start with the concern you are noticing.');
const prepare=link('/guides/prepare-enquiry','Prepare your pest control enquiry','The property details that help a first conversation.');
const before=link('/guides/before-visit','Questions to ask before a visit','Discuss preparation, timing and follow-up.');
const monitoring=link('/guides/commercial-pest-monitoring','Commercial pest monitoring checklist','Keep observations and follow-up questions consistent.');
const research=link('/research','Research and evidence','See our references and standards for original findings.');
const restaurant=link('/commercial/restaurant-pest-control','Restaurant pest control in Mumbai','Cafés, bakeries, cloud kitchens, food outlets and kitchen records.');
const officeBugs=link('/commercial/office-bed-bug-control','Office and commercial bed bug treatment','Corporate offices, coworking spaces, hotels, hostels and PGs.');
const industrial=link('/commercial/industrial-rodent-control','Factory and warehouse rodent control','Industrial units, godowns, food and pharma premises.');
const relations={
  '/quote':[prepare,before,link('/guides/cost-safety-duration','Cost, safety and duration','What to ask before agreeing a service.')],
  '/commercial/amc':[restaurant,industrial,monitoring],
  '/commercial/restaurant-pest-control':[link('/commercial/amc','Restaurant pest control AMC','Compare covered areas, visit frequency and call-out terms.'),link('/areas/thane','Restaurant pest control in Thane','Plan the service around your named premises.'),monitoring],
  '/commercial/office-bed-bug-control':[link('/services/bed-bug-control','Bed bug signs and treatment planning','Identification, preparation and follow-up.'),link('/commercial/amc','Commercial pest control contracts','Check which concerns and visits are included.'),before],
  '/commercial/industrial-rodent-control':[link('/services/rodent-control','Rodent signs and control planning','Assessment, access and follow-up.'),link('/commercial/amc','Factory pest control contracts','Covered sites, monitoring and visit schedules.'),monitoring],
  '/areas/thane':[restaurant,officeBugs,industrial],
  '/guides/cost-safety-duration':[before,link('/commercial/amc','Annual maintenance for businesses','Scheduled visits, emergency request terms and add-ons.'),link('/quote','Request a pest control quote in Mumbai','Share the details of your space.')],
  '/services':[library,prepare,research],
  '/services/pest-identification':[library,prepare,before],
  '/residential':[library,prepare,before],
  '/commercial':[monitoring,link('/guides/choosing-care','Discuss a current issue or ongoing care','Clarify coverage and visit frequency.'),research],
  '/guides':[library,monitoring,research],
  '/guides/prepare-enquiry':[library,before,link('/contact','Send your pest control enquiry','Share the details of your space.')],
  '/guides/choosing-care':[link('/residential','Pest care for a home','Plan around the way you live.'),link('/commercial','Pest care for a business','Discuss access, scope and operating hours.'),monitoring],
  '/guides/before-visit':[prepare,link('/faq','Pest control questions and answers','Quotes, requested dates and getting started.'),research],
  '/guides/commercial-pest-monitoring':[link('/commercial','Commercial pest care plans','Discuss the needs of your premises.'),library,link('/research/standards','How we assess evidence','Why observations need context before becoming statistics.')],
  '/faq':[library,prepare,before],
  '/pest-library':[monitoring,link('/services/pest-identification','Help with an unknown pest','You can enquire without naming the pest.'),research],
  '/research':[link('/research/standards','Read our research standards','Sample definitions, evidence and limitations.'),library,monitoring],
  '/research/standards':[research,monitoring,library],
};
for(const topic of pestTopics) {
  relations[topic.service]=[link(topic.guide,topic.guideLabel,'What to record and what to discuss next.'),prepare,before];
  relations[topic.guide]=[link(topic.service,topic.serviceLabel,'Discuss an assessment and quotation for your space.'),link('/pest-library#'+topic.id,'Explore the '+topic.name.toLowerCase()+' topic','Related reading in one place.'),before];
}
relations['/services/cockroach-control'].push(restaurant);
relations['/services/bed-bug-control'].push(officeBugs);
relations['/services/rodent-control'].push(industrial);
export function relatedReading(path) { return relations[path] || (path.startsWith('/research/')?[research,library]:[]); }
