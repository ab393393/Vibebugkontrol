import type { Metadata } from 'next';
import { siteConfig } from './site-config';
import { breadcrumbs } from './pages.mjs';
import { knowledgeSources } from '../public/knowledge-content.mjs';

export function pageMetadata(page: { path:string; title:string; description:string }): Metadata {
  const config = siteConfig();
  const url = config.origin + page.path;
  return {
    title: { absolute:page.title }, description:page.description,
    alternates:{ canonical:url },
    robots:{ index:config.indexable, follow:true },
    openGraph:{ type:'website', siteName:config.business.name, locale:'en_IN', title:page.title, description:page.description, url, images:[{url:config.origin+'/assets/vbk-social-card.png?v=vibe-bug-kontrol',width:1200,height:630,alt:'VBK — Vibe Bug Kontrol. Spaces worth protecting. Pest control for homes and businesses.'}] },
    twitter:{card:'summary_large_image', title:page.title,description:page.description,images:[config.origin+'/assets/vbk-social-card.png?v=vibe-bug-kontrol']},
  };
}

export function JsonLd({ data }: { data:unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}} />;
}

export function PageSchema({ page }: { page:any }) {
  const { origin,business } = siteConfig();
  const items:any[] = [{
    '@context':'https://schema.org', '@type':'WebPage', '@id':origin+page.path+'#webpage',
    url:origin+page.path, name:page.title, description:page.description,
    isPartOf:{'@id':origin+'/#website'}, about:{'@id':origin+'/#organization'},
  }];
  if(page.path !== '/') items.push({
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:breadcrumbs(page).map((item:any,index:number)=>({'@type':'ListItem',position:index+1,name:item.label,item:origin+item.path}))
  });
  if(['service','amc'].includes(page.kind)) items.push({
    '@context':'https://schema.org','@type':'Service',name:page.kind==='amc'?'Pest control AMC for restaurants and businesses in Mumbai':page.heading,
    serviceType:page.kind==='amc'?'Pest control annual maintenance contract':page.record.title,
    description:page.description,url:origin+page.path,provider:{'@id':origin+'/#business'},
    areaServed:business.areaServed.map((name:string)=>({'@type':'Place',name})),
    ...(business.startingPrices[page.record?.id]?{offers:{'@type':'Offer',priceCurrency:'INR',priceSpecification:{'@type':'PriceSpecification',minPrice:business.startingPrices[page.record.id],priceCurrency:'INR'},description:'Starting price; final scope and quotation require confirmation.'}}:{}),
  });
  if(page.kind==='guide' && page.record.published) items.push({
    '@context':'https://schema.org','@type':'Article','@id':origin+page.path+'#article',
    headline:page.record.title,description:page.record.description,
    datePublished:page.record.published,dateModified:page.record.modified||page.record.published,
    author:{'@id':origin+'/#organization'},publisher:{'@id':origin+'/#organization'},
    mainEntityOfPage:{'@id':origin+page.path+'#webpage'},inLanguage:'en-IN',
    citation:page.record.sourceIds.map((id:keyof typeof knowledgeSources)=>knowledgeSources[id].url),
  });
  if(page.kind==='report') items.push({
    '@context':'https://schema.org','@type':'Article','@id':origin+page.path+'#article',
    headline:page.record.title,description:page.record.summary,
    datePublished:page.record.publishedOn,dateModified:page.record.modifiedOn,
    author:{'@id':origin+'/#organization'},publisher:{'@id':origin+'/#organization'},
    mainEntityOfPage:{'@id':origin+page.path+'#webpage'},inLanguage:'en-IN',
  });
  return <JsonLd data={items} />;
}
