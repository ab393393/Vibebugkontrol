import { services } from '../public/site-content.mjs';
import { servicePaths } from '../lib/pages.mjs';
import { extraServices } from '../lib/catalog.mjs';

// The feature-accordion pattern is adapted from the public 21st.dev references.
// Native disclosures keep every answer and service link in the server HTML.
export function ServiceExplorer() {
  return <section className="service-explorer" aria-labelledby="service-explorer-title">
    <div className="explorer-heading"><h2 id="service-explorer-title">What needs attention?</h2><p>Start with the concern. We’ll help you discuss the next step.</p></div>
    <div className="explorer-layout">
      <div className="service-accordion">
        {[...services,...extraServices].map((service,index)=><details className="service-choice" name="pest-care" key={service.id} open={index===0}>
          <summary><span className="choice-index" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><svg className="choice-icon" aria-hidden="true"><use href={'#'+service.icon} /></svg><span>{service.title}</span><span className="choice-toggle" aria-hidden="true" /></summary>
          <div className="service-choice-panel"><p>{service.introduction}</p><div className="choice-actions"><a className="button button-dark" href={'/quote?pest='+encodeURIComponent(service.pest||service.title)}>Start an enquiry<svg className="icon" data-icon="inline-end" aria-hidden="true"><use href="#i-arrow" /></svg></a><a className="text-link" href={servicePaths[service.id]}>View service details<svg className="icon" aria-hidden="true"><use href="#i-arrow" /></svg></a></div></div>
        </details>)}
      </div>
      <figure className="service-visual"><img src="/assets/business.webp" srcSet="/assets/business-480.webp 480w, /assets/business-800.webp 800w, /assets/business.webp 1536w" sizes="(max-width:760px) 90vw, 40vw" width={1536} height={1024} loading="lazy" alt="Illustrative restaurant interior with green seating and natural timber" /><figcaption><strong>Care around real life.</strong><span>For the places you live and work.</span></figcaption></figure>
    </div>
  </section>;
}
