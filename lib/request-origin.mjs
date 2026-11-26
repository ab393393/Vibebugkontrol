import { AsyncLocalStorage } from 'node:async_hooks';

const origins=new AsyncLocalStorage();
// Read the platform's request URL, never a forwarded Host header. Each request
// keeps its own fallback origin when a custom SITE_URL has not been configured.
export function runWithRequestOrigin(url,run) {
  const parsed=new URL(url);
  const origin=['https:','http:'].includes(parsed.protocol)?parsed.origin:undefined;
  return origins.run(origin,run);
}
export function requestOrigin() {return origins.getStore();}
