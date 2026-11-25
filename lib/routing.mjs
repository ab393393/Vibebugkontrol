import { redirectPath } from './pages.mjs';
export function legacyRedirect(request) {
  if(!['GET','HEAD'].includes(request.method))return null;
  const url=new URL(request.url);const path=redirectPath(url.pathname);
  if(!path)return null;
  url.pathname=path;
  return Response.redirect(url,301);
}
