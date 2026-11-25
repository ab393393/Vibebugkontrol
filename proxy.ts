import { NextRequest, NextResponse } from 'next/server';
import { pageFor } from './lib/pages.mjs';
import { legacyRedirect } from './lib/routing.mjs';
export function proxy(request:NextRequest) {
  const redirect=legacyRedirect(request);if(redirect)return redirect;
  const pathname=request.nextUrl.pathname;
  const missing=!pathname.includes('.')&&!pathname.startsWith('/api/')&&!pageFor(pathname);
  const response=NextResponse.next(missing?{status:404}:undefined);
  response.headers.set('X-Content-Type-Options','nosniff');
  response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  return response;
}
export const config={matcher:['/((?!_next|assets|favicon).*)']};
