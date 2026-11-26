import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { legacyRedirect } from '../lib/routing.mjs';
import { pestTopics, topicGuides } from '../public/knowledge-content.mjs';
import { publishedReports } from '../lib/research.mjs';
import { areaPages, extraServices, approvedAreas, approvedServices } from '../lib/catalog.mjs';
import { searchContent } from '../public/site-content.mjs';
import { businessInfo } from '../lib/business.mjs';
import { businessSchemas } from '../lib/business-schema.mjs';
import { renderTemplate } from '../lib/render-template.mjs';

const require=createRequire(import.meta.url);
const viteRequire=createRequire(require.resolve('vite'));
const {build}=viteRequire('esbuild');
const root=path.resolve(import.meta.dirname,'..');
await mkdir(path.join(root,'.sites-runtime'),{recursive:true});
globalThis.__shieldTestEnv={};
await build({entryPoints:[path.join(root,'tests/ssr-entry.tsx')],outfile:path.join(root,'.sites-runtime/ssr-fixture.mjs'),bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',logLevel:'silent',plugins:[{
  name:'server-test-fixtures',setup(build){
    build.onResolve({filter:/^next\/server$/},()=>({path:'next/server.js',external:true}));
    build.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'fixture'}));
    build.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const env=globalThis.__shieldTestEnv;',loader:'js'}));
    build.onResolve({filter:/\.(?:html|css)\?raw$/},args=>({path:path.resolve(path.dirname(args.importer),args.path.replace(/\?raw$/,'')),namespace:'raw'}));
    build.onLoad({filter:/.*/,namespace:'raw'},async args=>({contents:'export default '+JSON.stringify(await readFile(args.path,'utf8')),loader:'js'}));
  }
}]});
const site=await import(pathToFileURL(path.join(root,'.sites-runtime/ssr-fixture.mjs')));
const documents=new Map(site.pages.map(page=>[page.path,site.render(page.path)]));

test('all registered pages render useful HTML on the server with one H1 and no duplicate IDs',()=>{
  assert.equal(site.pages.length,28+publishedReports.length+areaPages.length+extraServices.length);
  for(const [url,html] of documents) {
    assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,url);
    assert.ok(html.includes('VBK'));assert.doesNotMatch(html,/shield\s*(?:&amp;|&|and)\s*shine/i,url);assert.ok(html.includes('id="quote-form"'));
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.equal(new Set(ids).size,ids.length,url);
    assert.ok(!html.includes('Starter Project'));assert.ok(!html.includes('codex-preview'));
  }
});
test('titles, descriptions, canonical URLs, share images and JSON-LD match each route',()=>{
  const titles=new Set(),descriptions=new Set();
  for(const page of site.pages) {
    const metadata=site.pageMetadata(page);titles.add(metadata.title.absolute);descriptions.add(metadata.description);
    assert.ok(metadata.description.length>=90 && metadata.description.length<=180,page.path);
    assert.equal(metadata.alternates.canonical,site.siteConfig().origin+page.path);
    assert.equal(metadata.openGraph.url,metadata.alternates.canonical);
    assert.equal(metadata.openGraph.images[0].width,1200);assert.equal(metadata.openGraph.images[0].height,630);
    const schemas=[...documents.get(page.path).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match=>JSON.parse(match[1]));
    assert.ok(schemas.some(schema=>schema['@type']==='Organization'),page.path);
    if(page.path!=='/')assert.ok(schemas.some(schema=>schema['@type']==='BreadcrumbList'),page.path);
  }
  assert.equal(titles.size,site.pages.length);assert.equal(descriptions.size,site.pages.length);
});
test('every internal page and anchor link resolves, and all pages can be reached from home',()=>{
  const graph=new Map();
  for(const [url,html] of documents) {
    const links=[];
    for(const match of html.matchAll(/<a\b[^>]*\bhref="([^"\s]+)"/g)) {
      const href=match[1];if(!href.startsWith('/')&&!href.startsWith('#'))continue;
      const target=new URL(href,'https://shield.test'+url);assert.ok(documents.has(target.pathname),url+' -> '+href);links.push(target.pathname);
      if(target.hash) assert.ok(documents.get(target.pathname).includes(`id="${target.hash.slice(1)}"`),url+' -> '+href);
    }
    graph.set(url,links);
  }
  const reached=new Set(['/']);const queue=['/'];const depths=new Map([['/',0]]);
  while(queue.length){const source=queue.shift();for(const target of graph.get(source))if(!reached.has(target)){reached.add(target);depths.set(target,depths.get(source)+1);queue.push(target);}}
  assert.equal(reached.size,site.pages.length,'No orphan pages');
  assert.ok([...depths.values()].every(depth=>depth<=3),'Every page is within three links of home');
});
test('content images have meaningful alt text, dimensions, WebP sources and below-fold lazy loading',async()=>{
  for(const [url,html] of documents)for(const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag=match[0];assert.match(tag,/alt="[^"]{20,}"/,url);assert.match(tag,/width="\d+"/);assert.match(tag,/height="\d+"/);assert.match(tag,/\.webp/);
    const src=tag.match(/\bsrc="([^"]+)"/)[1];await access(path.join(root,'public',src));
  }
  const home=documents.get('/');assert.match(home,/<img[^>]*class="hero-image"[^>]*fetchPriority="high"|<img[^>]*class="hero-image"[^>]*fetchpriority="high"/);
  assert.ok((home.match(/loading="lazy"/g)||[]).length>=2);
  for(const name of ['home-480.webp','home-800.webp','business-480.webp','business-800.webp','vbk-social-card.png','logo.png'])await access(path.join(root,'public/assets',name));
});
test('each gallery illustration has one shared identity and a matching service hero',()=>{
  const identities=html=>[...html.matchAll(/<img\b[^>]*data-shared-image="([^"]+)"/g)].map(match=>match[1]);
  const home=identities(documents.get('/'));
  assert.equal(home.length,3);assert.equal(new Set(home).size,home.length,'Duplicate names disable native view transitions');
  for(const identity of home){
    const target='/commercial/'+identity;
    assert.ok(documents.has(target),target);
    assert.deepEqual(identities(documents.get(target)),[identity]);
  }
});
test('all public pages allow indexing and configured origins supply absolute metadata and sitemap URLs',()=>{
  assert.equal(site.siteConfig().indexable,true);assert.equal(site.robots().rules.allow,'/');
  Object.assign(globalThis.__shieldTestEnv,{SITE_URL:'https://example.test',GA_MEASUREMENT_ID:'G-ABC1234567',GOOGLE_SITE_VERIFICATION:'verification-example-token'});
  assert.equal(site.siteConfig().origin,'https://example.test');
  assert.equal(site.sitemap().length,site.pages.length);assert.ok(site.sitemap().every(entry=>entry.url.startsWith('https://example.test/')));
  assert.equal(site.siteConfig().gaId,'G-ABC1234567');
  assert.equal(site.siteConfig().verification,'verification-example-token');
  for(const page of site.pages){const metadata=site.pageMetadata(page);assert.equal(metadata.robots.index,true);assert.equal(metadata.robots.follow,true);}
  for(const key of Object.keys(globalThis.__shieldTestEnv))delete globalThis.__shieldTestEnv[key];
});
test('custom 404 is rendered and known old paths have direct redirect targets',()=>{
  assert.match(site.render('/missing-page'),/404 · A SMALL DETOUR/);
  assert.equal(site.redirectPath('/contact-us'),'/contact');assert.equal(site.redirectPath('/index.html'),'/');assert.equal(site.redirectPath('/services/'),'/services');
  assert.equal(site.redirectPath('/unknown'),null);
  const redirect=legacyRedirect(new Request('https://shield.test/contact-us?source=card'));
  assert.equal(redirect.status,301);assert.equal(redirect.headers.get('Location'),'https://shield.test/contact?source=card');
  assert.equal(legacyRedirect(new Request('https://shield.test/contact-us',{method:'POST'})),null);
  assert.equal(site.routeResponse('/missing-page').status,404);
  assert.equal(site.routeResponse('/contact').status,200);
  assert.equal(site.routeResponse('/contact-us').status,301);
});
test('each pest topic has reciprocal contextual links between care and sourced guidance',()=>{
  for(const topic of pestTopics) {
    const service=documents.get(topic.service),guide=documents.get(topic.guide);
    assert.match(service,new RegExp('data-related-reading[\\s\\S]*href="'+topic.guide+'"'));
    assert.match(guide,new RegExp('<article[^>]*>[\\s\\S]*href="'+topic.service+'"'));
    assert.ok(documents.get('/pest-library').includes('id="'+topic.id+'"'));
  }
  for(const guide of topicGuides) {
    const html=documents.get('/guides/'+guide.id);
    assert.ok(html.includes('id="guide-sources"'));
    assert.ok(html.includes('US Environmental Protection Agency')||html.includes('University of California'));
    const article=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match=>JSON.parse(match[1])).find(item=>item['@type']==='Article');
    assert.equal(article.headline,guide.title);assert.ok(article.citation.length>=1);
  }
});
test('research is honest about unpublished data and knowledge search opens real page URLs',()=>{
  const research=documents.get('/research');
  if(!publishedReports.length){assert.ok(!research.includes('Original field observations'));assert.ok(!research.includes('No original field reports have been published yet'));}
  assert.ok(research.includes('Food Safety and Standards Authority of India'));
  assert.ok(!research.includes('"@type":"Dataset"'));
  assert.ok(searchContent('AMC').some(result=>result.href==='/commercial/amc'));
  for(const query of ['research','cockroach signs','bed bug signs','rodent signs','commercial monitoring']) {
    const results=searchContent(query);assert.ok(results.length>0,query);
    assert.ok(results.some(result=>result.href&&documents.has(result.href)),query);
  }
});
test('the report renderer shows computed shares, the denominator, review and visible corrections',()=>{
  const html=site.renderReport({title:'Synthetic rendering fixture',summary:'Synthetic test input only.',publishedOn:'2026-10-24',modifiedOn:'2026-10-24',version:2,correctionNote:'Synthetic correction note.',reviewedBy:'Test reviewer',sampleUnit:'enquiries',sampleSize:40,periodStart:'2026-09-01',periodEnd:'2026-09-30',geography:'Synthetic geography',counts:[{category:'Cockroaches',count:30},{category:'Rodents',count:10}],collectionMethod:'Synthetic method.',inclusionCriteria:'Synthetic inclusion rules.',verificationNote:'Synthetic verification.',limitations:'Synthetic limitations.'});
  assert.match(html,/>75\.0%<\/td>/);assert.match(html,/>25\.0%<\/td>/);
  assert.match(html,/among 40 enquiries/);assert.match(html,/Synthetic correction note/);
  for(const label of ['Collection method','Inclusion and repeat records','Source verification','Limitations','Test reviewer'])assert.ok(html.includes(label),label);
});
test('Mumbai pages expose local titles, descriptions, H1s and substantial service guidance',()=>{
  for(const page of site.pages.filter(page=>page.kind==='service'||page.kind==='home')) {
    assert.match(page.title,/Mumbai/);assert.match(page.description,/Mumbai/);
    const html=documents.get(page.path);assert.match(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1],/Mumbai/);
    if(page.kind==='service') {
      const body=html.match(/<article class="prose-page">([\s\S]*?)<\/article>/)[1].replace(/<[^>]+>/g,' ');
      assert.ok(body.trim().split(/\s+/).length>=400,page.path);
      for(const term of ['Safety','quotation','Common questions'])assert.ok(body.toLowerCase().includes(term.toLowerCase()),page.path+' '+term);
    }
  }
  assert.ok(documents.get('/commercial/amc').includes('Emergency requests'));
});
test('quote CTAs resolve to an actual form and public schema never receives unresolved placeholders',()=>{
  const home=documents.get('/');assert.match(home,/<a href="\/quote"[^>]*data-quote/);
  assert.match(documents.get('/quote'),/<form[^>]*action="\/api\/enquiries"[^>]*method="post"/);
  for(const [url,html] of documents) {
    assert.ok(!/\[(?:YOUR DOMAIN|BUSINESS EMAIL|PHONE|LICENSE NUMBER)\]/.test(html),url);
    for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert.ok(!match[1].includes('abhishek.bhole123@gmail.com'));
  }
});
test('configured contact details match LocalBusiness schema, footer, mobile actions and lazy map',()=>{
  const b=businessInfo({email:'business@example.test',phone:'+1 999 555 0123',whatsappNumber:'19995550123',address:{streetAddress:'Synthetic fixture street',addressLocality:'Mumbai',addressRegion:'Maharashtra',postalCode:'400001',addressCountry:'IN'},openingHours:['Mo-Sa 09:00-18:00'],sameAs:['https://example.test/profile'],mapEmbedUrl:'https://www.google.com/maps/embed?pb=synthetic-fixture',priceRange:'Fixture price range'});
  const schemas=businessSchemas('https://example.test',b);const local=schemas.find(schema=>schema['@type']==='LocalBusiness');
  assert.equal(local.email,undefined);assert.equal(local.telephone,b.telephone);assert.deepEqual(local.address,{'@type':'PostalAddress',...b.address});
  const html=renderTemplate('<!--contact:header--><!--contact:hero--><!--business:footer--><!--business:mobile--><!--business:areas-->',b);
  assert.ok(html.includes(b.email));assert.ok(html.includes(b.addressText));assert.ok(html.includes('tel:'+b.telephone));assert.ok(html.includes(b.whatsappUrl));
  assert.match(html,/<iframe[^>]*width="1000"[^>]*height="360"[^>]*loading="lazy"/);
  const unconfigured=renderTemplate('<!--contact:header--><!--business:footer--><!--business:mobile-->',businessInfo({email:'',phone:'',whatsappNumber:''}));
  assert.ok(!unconfigured.includes('tel:'));assert.ok(!unconfigured.includes('wa.me/'));assert.ok(!unconfigured.includes('[PHONE]'));
  const longMap='https://www.google.com/maps/embed?pb='+('fixture'.repeat(180));assert.equal(businessInfo({mapEmbedUrl:longMap}).mapEmbedUrl,longMap);
});
test('draft area/service placeholders stay unpublished and incomplete published records are rejected',()=>{
  assert.deepEqual(approvedAreas([{published:false,name:'[AREA]'}]),[]);
  assert.deepEqual(approvedServices([{published:false,title:'[SERVICE]'}]),[]);
  assert.throws(()=>approvedAreas([{published:true,name:'[AREA]'}]));
  assert.throws(()=>approvedServices([{published:true,title:'[SERVICE]'}]));
});
test('the deployed enquiry route prepares approved browser AJAX recipients without sending or exposing keys',async()=>{
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;throw new Error('Public FormSubmit delivery must continue from the browser');};
  try {
    const response=await site.submitEnquiry(new Request(site.siteConfig().origin+'/api/enquiries',{method:'POST',headers:{Origin:site.siteConfig().origin,'Content-Type':'application/json'},body:JSON.stringify({name:'Synthetic route fixture',phone:'9999999999',property_type:'Home'})}));
    const result=await response.json();assert.equal(response.status,202);assert.equal(result.success,false);assert.equal(calls,0);
    assert.equal(result.code,'PROVIDER_AJAX');assert.equal(decodeURIComponent(new URL(result.delivery.url).pathname.slice('/ajax/'.length)),businessInfo().email);
    assert.equal(result.delivery.fields._cc,'abhishek.bhole123@gmail.com');assert.equal(result.delivery.fields.enquiry_reference,result.reference);
    for(const html of documents.values())assert.doesNotMatch(html,/<meta[^>]+name="shield-(?:business-email|enquiry-cc)"/);
  }finally{globalThis.fetch=original;}
});
test('all enquiry forms render explicit status regions and configured failure contact options',()=>{
  for(const [url,html] of documents) {
    const error=html.match(/id="quote-error"[\s\S]*?<div class="form-actions"/)?.[0];assert.ok(error,url);
    assert.ok(error.includes('tel:+918291689183'));assert.ok(error.includes('+91 82916 89183'));assert.ok(error.includes('https://wa.me/918291689183'));
    assert.ok(html.includes('id="quote-delivery-status"'));assert.ok(html.includes('id="quote-submission-status"'));
    if(['/quote','/contact'].includes(url)) {
      assert.ok(html.includes('id="contact-status"'));assert.ok(html.includes('data-enquiry-email'));
      const contactError=html.match(/id="contact-error"[\s\S]*?<button/)?.[0];assert.ok(contactError.includes('tel:+918291689183'));assert.ok(contactError.includes('https://wa.me/918291689183'));
    }
  }
});
test('one stylesheet, inline critical CSS, deferred module and correctly sized PNG icons are available',async()=>{
  const home=documents.get('/');assert.match(home,/<style>/);assert.match(home,/<link rel="stylesheet" href="\/site.css\?v=[a-f0-9]{12}"/);
  assert.ok(!/rel="stylesheet" href="\/(styles|experience|pages|refinements)\.css/.test(home));
  assert.match(home,/<script[^>]*type="module"[^>]*src="\/site.js\?v=[a-f0-9]{12}"/);
  for(const [name,size] of [['favicon.png',32],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]){
    const data=await readFile(path.join(root,'public/assets',name));assert.equal(data.readUInt32BE(16),size);assert.equal(data.readUInt32BE(20),size);
  }
});

test('commercial services expose business quote routes, selected concerns and editable context without sending',()=>{
  const expectations=[
    ['/commercial/restaurant-pest-control','Other / not sure','restaurant'],
    ['/commercial/office-bed-bug-control','Bed bugs','office-bed-bugs'],
    ['/commercial/industrial-rodent-control','Rodents','industrial-rodents']
  ];
  for(const [path,pest,topic] of expectations) {
    const page=site.pages.find(item=>item.path===path),html=documents.get(path);
    const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match=>JSON.parse(match[1]));
    const service=schemas.find(schema=>schema['@type']==='Service');
    assert.ok(service,path);assert.ok(schemas.some(schema=>schema['@type']==='BreadcrumbList'),path);
    assert.deepEqual(service.areaServed.map(area=>area.name),['Mumbai','Thane']);
    const href=page.record.quoteHref;
    assert.ok(html.includes(href.replaceAll('&','&amp;')),path+' has a real context-specific quote link');
    const url=new URL(href,'https://fixture.test');
    assert.equal(url.pathname,'/quote');assert.equal(url.searchParams.get('property'),'business');assert.equal(url.searchParams.get('topic'),topic);
    const quote=site.render('/quote',Object.fromEntries(url.searchParams));
    const property=quote.match(/<select name="property_type"[^>]*>([\s\S]*?)<\/select>/)[1];
    assert.match(property,/<option selected="">Business<\/option>/);
    const concern=[...quote.matchAll(/<input[^>]+name="pest"[^>]*>/g)].find(match=>match[0].includes('value="'+pest+'"')&&match[0].includes('checked=""'));
    assert.ok(concern,path+' preselects the concern');
    assert.equal(quote.match(/<textarea name="message"[^>]*>([\s\S]*?)<\/textarea>/)[1],page.record.enquiryMessage);
  }
  assert.equal(site.render('/quote',{topic:'unrecognised-topic'}).match(/<textarea name="message"[^>]*>([\s\S]*?)<\/textarea>/)[1],'');
});
test('all 44 supplied commercial keyword targets resolve to public page sections',async()=>{
  const map=JSON.parse(await readFile(path.join(root,'docs/research/commercial-keyword-map-2026-11-23.json'),'utf8'));
  assert.equal(map.targets.length,44);assert.equal(new Set(map.targets.map(item=>item.keyword.toLowerCase())).size,44);
  for(const target of map.targets) {
    const url=new URL(target.destination,'https://fixture.test');
    assert.ok(documents.has(url.pathname),target.keyword);
    if(url.hash)assert.ok(documents.get(url.pathname).includes('id="'+url.hash.slice(1)+'"'),target.keyword+' '+target.destination);
  }
  const thane=site.pages.find(page=>page.path==='/areas/thane');
  assert.ok(thane);assert.doesNotMatch(thane.description,/Thane, Mumbai/);
  assert.match(documents.get('/'),/href="\/areas\/thane"/);
  assert.ok(site.sitemap().some(entry=>entry.url.endsWith('/areas/thane')));
});


test('deployed requests supply the canonical origin independently and configured domains take priority',async()=>{
  const urls=['https://worker-a.example.test/quote','https://worker-b.example.test/services'];
  const results=await Promise.all(urls.map(url=>site.runWithRequestOrigin(url,async()=>{
    await new Promise(resolve=>setImmediate(resolve));
    return site.pageMetadata(site.pages[0]).alternates.canonical;
  })));
  assert.deepEqual(results,['https://worker-a.example.test/','https://worker-b.example.test/']);
  globalThis.__shieldTestEnv.SITE_URL='https://canonical.example.test';
  try {assert.equal(site.runWithRequestOrigin(urls[0],()=>site.siteConfig().origin),'https://canonical.example.test');}
  finally {delete globalThis.__shieldTestEnv.SITE_URL;}
  globalThis.__shieldTestEnv.SITE_ENV='staging';
  try {assert.equal(site.pageMetadata(site.pages[0]).robots.index,false);assert.equal(site.robots().rules.disallow,'/');}
  finally {delete globalThis.__shieldTestEnv.SITE_ENV;}
});

test('both enquiry interfaces expose optional property and scheduling fields with native callback navigation',()=>{
  const html=documents.get('/quote');
  const drawer=html.match(/<form id="quote-form"[\s\S]*?<\/form>/)[0];
  const page=html.match(/<form id="contact-page-form"[\s\S]*?<\/form>/)[0];
  for(const form of [drawer,page]){
    for(const name of ['phone','pest','premises_type','care_preference','pincode','preferred_date','preferred_time'])assert.ok(form.includes('name="'+name+'"'),name);
    assert.ok(form.includes('Help me decide'));assert.ok(form.includes('Other / not sure'));
    assert.ok(!form.includes('Status: Ready to send.'));
  }
  assert.match(site.render('/quote',{request:'callback'}),/<h2>Request a callback\.<\/h2>/);
  assert.match(documents.get('/contact'),/<a[^>]+href="\/quote\?request=callback"[^>]+data-callback/);
  assert.match(html,/<pre id="enquiry-preview" hidden(?:="")?><\/pre>/);
});


test('canonical content has concise unique snippets, and prefilled quote links use lowercase machine values',()=>{
  const titles=new Set(),descriptions=new Set();
  for(const page of site.pages){
    assert.ok(page.title.length>=30&&page.title.length<=60,page.path+' title length');
    assert.ok(page.description.length>=90&&page.description.length<=155,page.path+' description length');
    titles.add(page.title);descriptions.add(page.description);
    for(const match of documents.get(page.path).matchAll(/href="(\/quote\?[^"#]+)"/g)){
      const href=match[1].replaceAll('&amp;','&');assert.equal(href,href.toLowerCase(),page.path+' '+href);assert.doesNotMatch(href,/%20|\s/,page.path);
    }
  }
  assert.equal(titles.size,site.pages.length);assert.equal(descriptions.size,site.pages.length);
  const quote=site.render('/quote',{property:'business',pest:'bed-bugs',topic:'office-bed-bugs',area:'thane'});
  assert.match(quote,/<option selected="">Business<\/option>/);
  assert.match(quote,/<input[^>]*name="pest"[^>]*checked=""[^>]*value="Bed bugs"|<input[^>]*name="pest"[^>]*value="Bed bugs"[^>]*checked=""/);
  assert.match(quote,/name="area"[^>]*value="Thane"/);
  assert.ok(!site.render('/quote',{topic:'amc'}).includes('value="Callback request"'));
});
