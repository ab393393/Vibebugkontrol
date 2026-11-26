import { serviceVisuals,serviceFacts } from '../lib/service-visuals.mjs';

export function ServiceIllustration({id}:{id:string}) {
  const visual=(serviceVisuals as Record<string,any>)[id];
  if(!visual)return null;
  return <figure className="service-illustration"><img data-shared-image={id} src={'/assets/'+visual.image+'.webp'} srcSet={`/assets/${visual.image}-480.webp 480w, /assets/${visual.image}-800.webp 800w, /assets/${visual.image}.webp 1536w`} sizes="(max-width:760px) 90vw, 45vw" width={1536} height={1024} alt={visual.alt} fetchPriority="high" /><figcaption><span>Illustration</span><span>{visual.tags.join(' · ')}</span></figcaption></figure>;
}

export function ServiceAtGlance({id}:{id:string}) {
  const facts=(serviceVisuals as Record<string,any>)[id]?.facts||(serviceFacts as Record<string,any>)[id];
  if(!facts)return null;
  return <section className="service-glance" aria-labelledby="service-glance-heading"><p className="eyebrow">THE ESSENTIALS</p><h2 id="service-glance-heading">At a glance.</h2><ul className="glance-grid">{facts.map(([icon,label,text]:string[])=><li key={label}><svg aria-hidden="true"><use href={'#'+icon} /></svg><span>{label}</span><strong>{text}</strong></li>)}</ul><p className="glance-note">Explore the details below, or start with an enquiry.</p></section>;
}

export function AMCAtGlance() {
  return <section className="amc-visual" aria-labelledby="amc-visual-heading"><p className="eyebrow">YOUR AMC, MADE CLEARER</p><h2 id="amc-visual-heading">Three things to agree.</h2><ol className="amc-visual-grid"><li><svg aria-hidden="true"><use href="#i-clock" /></svg><span>Contract period</span><strong>Annual agreement</strong><p>The period your contract covers.</p></li><li><svg aria-hidden="true"><use href="#i-calendar" /></svg><span>Visit frequency</span><strong>An agreed schedule</strong><p>Monthly, quarterly or another suitable plan.</p></li><li><svg aria-hidden="true"><use href="#i-shield" /></svg><span>Covered scope</span><strong>Clear inclusions</strong><p>Pests, areas, follow-up and extra visit terms.</p></li></ol><a className="button button-dark" href="/quote?property=business&amp;topic=amc">Discuss my AMC</a></section>;
}
