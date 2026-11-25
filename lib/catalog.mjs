import areaRecords from '../content/service-areas.json' with {type:'json'};
import { additionalServices as serviceRecords } from '../public/additional-services.mjs';
import { realText } from './business.mjs';

const slug=value=>typeof value==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export function approvedAreas(records=areaRecords) {
  const active=records.filter(area=>area.published===true);
  const slugs=new Set(),intros=new Set();
  for(const area of active) {
    if(!slug(area.slug)||!realText(area.name)||!realText(area.intro)||area.intro.length<150||!realText(area.localContext)||area.localContext.length<200||!Array.isArray(area.planningNotes)||area.planningNotes.length<3||area.planningNotes.some(note=>!realText(note)))throw new Error('Area pages need confirmed names and unique local content.');
    if(slugs.has(area.slug)||intros.has(area.intro.trim()))throw new Error('Area pages must have unique slugs and introductions.');
    slugs.add(area.slug);intros.add(area.intro.trim());
  }
  return active;
}
export function approvedServices(records=serviceRecords) {
  const active=records.filter(service=>service.published===true);const ids=new Set(['cockroaches','bed-bugs','rodents','identify-concern']);
  for(const service of active) {
    if(!slug(service.id)||!slug(service.slug)||ids.has(service.id)||!realText(service.title)||!realText(service.description)||service.description.length<90||service.description.length>180||!Array.isArray(service.sections)||!service.sections.length||!Array.isArray(service.faqs)||service.faqs.length<2)throw new Error('Additional services need complete original content and unique identifiers.');
    const words=JSON.stringify([service.introduction,service.sections,service.faqs]).split(/\s+/).length;
    if(words<420)throw new Error('Additional service content must exceed 400 words.');
    ids.add(service.id);
  }
  return active;
}
export const areaPages=approvedAreas();
export const extraServices=approvedServices();
