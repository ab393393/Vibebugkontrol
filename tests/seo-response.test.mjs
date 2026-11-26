import test from 'node:test';
import assert from 'node:assert/strict';
import { contentSecurityPolicy, renderRequest, secureResponse, securityHeaders, staticSecurityHeaders } from '../lib/security-headers.mjs';
import { quoteHref, pestFromQuery } from '../public/quote-context.mjs';
import { legacyRedirect } from '../lib/routing.mjs';

test('HTML, API failures and redirects retain their response while receiving security headers',async()=>{
  for(const [status,type,body] of [[200,'text/html','<p>Page</p>'],[400,'application/json','{"success":false}'],[301,'text/plain','']]) {
    const original=new Response(body,{status,headers:{'Content-Type':type,...(status===301?{Location:'https://fixture.test/quote'}:{})}});
    const response=secureResponse(original,{nonce:'fixture-nonce',canonical:'https://fixture.test/quote'});
    assert.equal(response.status,status);assert.equal(await response.text(),body);
    for(const [key,value] of Object.entries(securityHeaders({nonce:'fixture-nonce'})))assert.equal(response.headers.get(key),value);
    assert.equal(response.headers.get('Link'),status===200?'<https://fixture.test/quote>; rel="canonical"':null);
    if(status===301)assert.equal(response.headers.get('Location'),'https://fixture.test/quote');
  }
});
test('CSP permits enquiry delivery, consented Google analytics, maps and local animation modules',()=>{
  const policy=contentSecurityPolicy({nonce:'fresh-request-nonce'});
  assert.match(policy,/script-src 'self' 'nonce-fresh-request-nonce'/);
  assert.doesNotMatch(policy,/script-src[^;]*'unsafe-inline'/);
  assert.match(policy,/connect-src[^;]*https:\/\/formsubmit\.co/);
  assert.match(policy,/connect-src[^;]*google-analytics\.com/);
  assert.match(policy,/script-src[^;]*googletagmanager\.com/);
  assert.match(policy,/frame-src https:\/\/www.google.com https:\/\/maps.google.com/);
  assert.match(policy,/worker-src 'self' blob:/);
  assert.match(policy,/object-src 'none'/);
  assert.doesNotMatch(policy,/unsafe-eval/);
  assert.match(contentSecurityPolicy({development:true}),/unsafe-eval/);
  const assetHeaders=staticSecurityHeaders();
  assert.match(assetHeaders,/\n\/\*\n/);
  for(const name of Object.keys(securityHeaders()))assert.ok(assetHeaders.includes('  '+name+': '),name);
});
test('renderer policy preserves request data and gives missing User-Agent an application identity',async()=>{
  const request=new Request('https://fixture.test/api/enquiries',{method:'POST',headers:{Origin:'https://fixture.test','Content-Type':'application/json'},body:'{"name":"Synthetic fixture"}'});
  const prepared=renderRequest(request,{nonce:'fixture-nonce'});
  assert.equal(prepared.method,'POST');assert.equal(prepared.headers.get('Origin'),'https://fixture.test');
  assert.equal(await prepared.text(),'{"name":"Synthetic fixture"}');
  assert.equal(prepared.headers.get('User-Agent'),'VBKMetadataRenderer/1.0');
  assert.ok(prepared.headers.get('Content-Security-Policy').includes("'nonce-fixture-nonce'"));
  const supplied=renderRequest(new Request('https://fixture.test/',{headers:{'User-Agent':'Existing client'}}),{nonce:'new'});
  assert.equal(supplied.headers.get('User-Agent'),'Existing client');
});
test('canonical quote URLs retain all prefill context and legacy links redirect once',()=>{
  assert.equal(quoteHref({property:'Business',pest:'Bed bugs',topic:'office-bed-bugs'}),'/quote?property=business&pest=bed-bugs&topic=office-bed-bugs');
  const response=legacyRedirect(new Request('https://fixture.test/quote.html?property=Business&pest=Bed%20bugs&topic=AMC&utm_source=Newsletter'));
  assert.equal(response.status,301);
  const target=new URL(response.headers.get('Location'));
  assert.equal(target.pathname,'/quote');assert.equal(target.searchParams.get('property'),'business');
  assert.equal(target.searchParams.get('pest'),'bed-bugs');assert.equal(target.searchParams.get('topic'),'amc');assert.equal(target.searchParams.get('utm_source'),'Newsletter');
  assert.equal(legacyRedirect(new Request(target)),null);
  assert.equal(pestFromQuery('bed-bugs'),'Bed bugs');assert.equal(pestFromQuery('Bed bugs'),'Bed bugs');
  assert.equal(pestFromQuery('Not sure yet'),'Other / not sure');
  assert.equal(legacyRedirect(new Request('https://fixture.test/quote?property=Business',{method:'POST'})),null);
});
test('independent HTML responses use their own CSP nonce without modifying the original response',async()=>{
  const original=new Response('<p>Fixture</p>',{headers:{'Content-Type':'text/html'}});
  const a=secureResponse(original.clone(),{nonce:'nonce-a'}),b=secureResponse(original.clone(),{nonce:'nonce-b'});
  assert.ok(a.headers.get('Content-Security-Policy').includes("'nonce-nonce-a'"));
  assert.ok(b.headers.get('Content-Security-Policy').includes("'nonce-nonce-b'"));
  assert.equal(original.headers.get('Content-Security-Policy'),null);
  assert.equal(await a.text(),await b.text());
});
