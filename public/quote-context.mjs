// Stable machine values keep enquiry URLs lowercase and free of encoded spaces.
// Older shared links continue to prefill the same human-readable form choices.
const concerns={cockroaches:'Cockroaches','bed-bugs':'Bed bugs',rodents:'Rodents','not-sure':'Other / not sure'};
export function pestQueryValue(value) {
  const text=String(value||'').trim().toLowerCase();
  if(text in concerns)return text;
  return Object.keys(concerns).find(key=>concerns[key].toLowerCase()===text)||(['not sure yet','identify-concern','other'].includes(text)?'not-sure':'');
}
export function pestFromQuery(value) {return concerns[pestQueryValue(value)]||'Other / not sure';}
export function quoteHref({property='',pest='',topic='',area='',request=''}={}) {
  const query=new URLSearchParams();
  if(['home','business'].includes(property.toLowerCase()))query.set('property',property.toLowerCase());
  if(pestQueryValue(pest))query.set('pest',pestQueryValue(pest));
  if(topic)query.set('topic',topic.toLowerCase());
  if(area)query.set('area',area.toLowerCase());
  if(request)query.set('request',request.toLowerCase());
  return '/quote'+(query.size?'?'+query.toString():'');
}
export function normaliseQuoteQuery(url) {
  if(url.pathname!=='/quote')return false;
  let changed=false;
  for(const key of ['property','pest','topic','area']) {
    if(url.searchParams.getAll(key).length!==1)continue;
    const value=url.searchParams.get(key);
    const next=key==='pest'?pestQueryValue(value):key==='property'&&/^(home|business)$/i.test(value)?value.toLowerCase():key==='topic'&&/^amc$/i.test(value)?'amc':key==='area'&&/^thane$/i.test(value)?'thane':value;
    if(next&&next!==value){url.searchParams.set(key,next);changed=true;}
  }
  return changed;
}
