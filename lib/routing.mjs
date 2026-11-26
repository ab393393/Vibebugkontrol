import { redirectPath } from './pages.mjs';
import { normaliseQuoteQuery } from '../public/quote-context.mjs';
export function legacyRedirect(request) {
  if(!['GET','HEAD'].includes(request.method))return null;
  const url=new URL(request.url);const path=redirectPath(url.pathname);
  if(path)url.pathname=path;
  const queryChanged=normaliseQuoteQuery(url);
  if(!path&&!queryChanged)return null;
  return Response.redirect(url,301);
}
