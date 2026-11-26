// Editorial guidance, not a record of completed VBK jobs.
export const knowledgeSources = {
  fssai: { title:'Food Safety Inspection Checklists', publisher:'Food Safety and Standards Authority of India (FSSAI)', url:'https://fssai.gov.in/inspection/inspection-matrices', region:'India' },
  cockroaches: { title:'Cockroaches', publisher:'University of California Statewide IPM Program', url:'https://ipm.ucanr.edu/home-and-landscape/cockroaches/' },
  bedbugs: { title:'How to Find Bed Bugs', publisher:'US Environmental Protection Agency', url:'https://www.epa.gov/bedbugs/how-find-bed-bugs' },
  rodents: { title:'Identify and Prevent Rodent Infestations', publisher:'US Environmental Protection Agency', url:'https://www.epa.gov/rodenticides/identify-and-prevent-rodent-infestations' },
  cleanup: { title:'How to Clean Up After Rodents', publisher:'US Centers for Disease Control and Prevention', url:'https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html' },
  prevention: { title:'Smart Pest Control to Protect Your Health', publisher:'US Environmental Protection Agency', url:'https://www.epa.gov/pesticides/smart-pest-control-protect-your-health' },
};

export const pestTopics = [
  { id:'cockroaches', number:'01', name:'Cockroaches', icon:'i-roach', description:'Understand what you are noticing, reduce everyday attractants, and discuss care for the affected space.', service:'/services/cockroach-control', serviceLabel:'Cockroach control for your space', guide:'/guides/cockroach-signs-prevention', guideLabel:'Cockroach signs and everyday prevention' },
  { id:'bed-bugs', number:'02', name:'Bed bugs', icon:'i-bedbug', description:'Separate possible signs from assumptions, record the affected furnishings, and prepare a useful conversation.', service:'/services/bed-bug-control', serviceLabel:'Bed bug control for your space', guide:'/guides/bed-bug-signs-next-steps', guideLabel:'Bed bug signs and what to ask next' },
  { id:'rodents', number:'03', name:'Rodents', icon:'i-rodent', description:'Record possible activity, consider access and storage, and understand what needs an assessment.', service:'/services/rodent-control', serviceLabel:'Rodent control for your space', guide:'/guides/rodent-signs-entry-points', guideLabel:'Rodent signs, storage and entry points' },
];

export const topicGuides = [
  {
    id:'cockroach-signs-prevention', title:'Cockroach signs and everyday prevention', category:'Understanding cockroaches', icon:'i-roach', topic:'cockroaches',
    keywords:'cockroach signs prevention kitchen cupboards food leaks moisture recurring roaches',
    description:'Know what to record about cockroach activity, the everyday conditions worth checking, and the questions to ask before arranging care.',
    introduction:'A useful starting point is a record of where activity occurs, rather than a guess about how widespread it is.',
    details:['Record the room, time and frequency of sightings.','Check food storage, waste and moisture.','Discuss recurring activity and previous treatment.'],
    next:'Share the affected areas and your property type when requesting a quotation.',
    published:'2026-10-24', sourceIds:['cockroaches'],
    sections:[
      {id:'record-signs',heading:'Start with what you can observe',paragraphs:[['Cockroaches can hide in dark gaps around cupboards and appliances and may be more noticeable at night. Note the room, time and frequency of sightings. A description is useful even when you cannot identify the species.'],['If you are uncertain about the insect, use our ',{text:'unknown pest enquiry guidance',href:'/services/pest-identification'},' rather than assuming every small insect needs the same treatment.']],points:['Record each affected area separately.','Mention recent deliveries, stored boxes or appliances if relevant.','Tell us about previous treatment and whether activity continued.']},
      {id:'everyday-prevention',heading:'Look at food, water and hiding places',paragraphs:[['UC IPM recommends reducing food and moisture sources alongside hiding places. Store food in closed containers, clear spills and crumbs, keep waste covered, and arrange repairs for leaking plumbing. Gaps around cupboards and building access points are also worth discussing.'],['These measures support pest management; they do not establish the species, extent of activity or the treatment needed at a particular property.']]},
      {id:'discuss-care',heading:'Bring the context to your enquiry',paragraphs:[['For ',{text:'cockroach control',href:'/services/cockroach-control'},', describe the affected rooms and any shared areas. A home kitchen and an operating food business have different access and scheduling questions.'],['Use the ',{text:'commercial monitoring checklist',href:'/guides/commercial-pest-monitoring'},' for a workplace, or the ',{text:'guide to preparing an enquiry',href:'/guides/prepare-enquiry'},' for the details to share first.']]},
    ],
  },
  {
    id:'bed-bug-signs-next-steps', title:'Bed bug signs and what to ask next', category:'Understanding bed bugs', icon:'i-bedbug', topic:'bed-bugs',
    keywords:'bed bug bedbug signs bites mattress stains identification bedroom furnishings',
    description:'Understand why bites alone do not confirm bed bugs, which physical signs to describe, and what to ask before agreeing a visit.',
    introduction:'An unexplained mark or a sighting deserves a closer look. It does not, by itself, confirm a bed bug infestation.',
    details:['Describe physical signs rather than diagnosing from bites.','Note the affected rooms and furnishings.','Ask for specific preparation and follow-up instructions.'],
    next:'Discuss your observations and the next assessment step before agreeing preparation or treatment.',
    published:'2026-10-24', sourceIds:['bedbugs'],
    sections:[
      {id:'physical-signs',heading:'Physical signs are more useful than bites alone',paragraphs:[['The US EPA describes skin bites as a poor indicator: reactions can resemble other conditions, and some people have no reaction. Useful physical observations include live insects, dark spots, rusty marks on bedding, shed skins or eggs. These observations still need correct identification.'],['Record what you see and where. If you do not know the pest, start with ',{text:'help identifying your concern',href:'/services/pest-identification'},'.']]},
      {id:'affected-furnishings',heading:'Describe the rooms and furnishings',paragraphs:[['EPA guidance highlights mattress seams, bed frames and headboards as possible hiding places; upholstered furniture can also be involved. Describe the affected items and whether signs occur in more than one room. Do not dismantle electrical fittings or other inaccessible areas to look for evidence.'],['For ',{text:'bed bug care',href:'/services/bed-bug-control'},', include when the signs were first noticed and any previous inspection or treatment.']]},
      {id:'before-agreeing',heading:'Ask what the proposed visit includes',paragraphs:[['Ask how identification will be checked, which areas the quotation covers, and what preparation is specific to the proposed service. Discuss follow-up arrangements and access to affected rooms.'],['Our ',{text:'before-visit guide',href:'/guides/before-visit'},' lists the questions to settle before a visit is confirmed. Requested dates remain subject to confirmation.']]},
    ],
  },
  {
    id:'rodent-signs-entry-points', title:'Rodent signs, storage and entry points', category:'Understanding rodents', icon:'i-rodent', topic:'rodents',
    keywords:'rodent rat mouse mice signs droppings gnawing entry holes storage waste',
    description:'Learn which possible rodent signs to describe, why storage and access matter, and what information helps an assessment of your property.',
    introduction:'You may notice possible rodent activity without seeing the animal itself. Record the location and timing without disturbing contaminated material.',
    details:['Note signs and the areas where they occur.','Describe accessible gaps, food storage and waste arrangements.','Ask about assessment, access and follow-up.'],
    next:'Share your observations and site requirements with us before discussing a quotation.',
    published:'2026-10-24', sourceIds:['rodents','cleanup'],
    sections:[
      {id:'possible-signs',heading:'Describe the evidence, not just a sighting',paragraphs:[['The US EPA lists droppings near food or cupboards, chewed packaging, nesting material and gnawed openings among possible signs. Describe what you noticed, the location and whether it is recurring. A sighting alone does not establish the number of animals or every route they use.'],['Do not sweep or vacuum rodent droppings, urine or nesting material; CDC guidance explains that this can put contaminated particles into the air. Refer to the cleanup source below and seek advice for the specific situation.']]},
      {id:'storage-access',heading:'Include storage and access in the conversation',paragraphs:[['Food, water, shelter and entry points matter to prevention. Describe waste storage, food packaging and visible building gaps. Arrange appropriate repairs with the property manager; an assessment can help distinguish a possible access point from a confirmed route.'],['For ',{text:'rodent control',href:'/services/rodent-control'},', include restricted areas and any operating-hour requirements. Do not handle droppings or nests to obtain a photograph.']]},
      {id:'record-follow-up',heading:'Keep a useful record for follow-up',paragraphs:[['For a workplace, record observations in the same format each time: date, area, type of sign and the action taken. Keep a new sighting separate from an assumption that a previous service failed.'],['Use the ',{text:'commercial monitoring checklist',href:'/guides/commercial-pest-monitoring'},' or explore ',{text:'residential care',href:'/residential'},' before sending the details of your space.']]},
    ],
  },
  {
    id:'commercial-pest-monitoring', title:'A practical commercial pest monitoring checklist', category:'Care for a workplace', icon:'i-building', topic:'commercial',
    keywords:'commercial pest monitoring checklist office retail restaurant hospitality log inspection premises IPM',
    description:'Create a consistent record of pest observations, premises conditions and follow-up questions before discussing a commercial care plan.',
    introduction:'A consistent observation log helps a business explain what changed, where it happened, and what still needs attention.',
    details:['Use a repeatable location and date format.','Record observations separately from confirmed identification.','Track repairs and follow-up questions.'],
    next:'Discuss the record, access requirements and proposed scope with us.',
    published:'2026-10-24', sourceIds:['prevention','fssai'],
    sections:[
      {id:'indian-food-premises',heading:'For Indian restaurants and food premises',paragraphs:[['FSSAI publishes inspection checklists for food businesses, including catering. Use the checklist for your business type alongside your pest observations, service records and hygiene procedures. A pest-control contract alone does not certify the premises or guarantee an inspection result.']]},
      {id:'observation-log',heading:'Use the same fields for each observation',paragraphs:[['Give each area a consistent name so that two entries can be compared. Keep personal customer and employee information out of a general monitoring log. An observation is a record of what someone noticed; identification and treatment decisions need appropriate assessment.']],points:['Observation date and approximate time.','Premises area, such as dry store or staff kitchen.','What was seen and whether the pest is confirmed or uncertain.','Previous relevant action, open maintenance issue and person responsible for follow-up.']},
      {id:'premises-review',heading:'Look beyond a single pest sighting',paragraphs:[['EPA guidance on integrated pest management combines prevention with an appropriate response. Review food and waste storage, water leaks, shelter and possible access points. These notes help explain the premises; a checklist does not certify hygiene or regulatory compliance.'],['Connect the observation to the relevant guidance for ',{text:'cockroaches',href:'/guides/cockroach-signs-prevention'},', ',{text:'bed bugs',href:'/guides/bed-bug-signs-next-steps'},' or ',{text:'rodents',href:'/guides/rodent-signs-entry-points'},'.']]},
      {id:'agree-scope',heading:'Agree what will be checked and followed up',paragraphs:[['When discussing a ',{text:'commercial pest care plan',href:'/commercial'},', include operating hours, restricted areas and whether more than one site is involved. Ask how findings, preparation instructions and follow-up arrangements will be communicated.'],['For ',{text:'ongoing care',href:'/guides/choosing-care'},', agree visit frequency and coverage in the quotation. Monitoring observations alone cannot demonstrate a treatment success rate or describe pest prevalence across a city.']]},
    ],
  },
];
