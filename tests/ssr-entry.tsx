import { renderToStaticMarkup } from 'react-dom/server';
import Layout from '../app/layout';
import Home from '../app/page';
import NotFound from '../app/not-found';
import { ContentPage } from '../components/ContentPage';
import { pages, pageFor, redirectPath } from '../lib/pages.mjs';
import { pageMetadata, PageSchema } from '../lib/seo';
import { siteConfig } from '../lib/site-config';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import { proxy } from '../proxy';
import { NextRequest } from 'next/server';
import { ResearchReportBody } from '../components/Knowledge';
export { pages, pageMetadata, siteConfig, robots, sitemap, redirectPath };
export { runWithRequestOrigin } from '../lib/request-origin.mjs';
export { POST as submitEnquiry } from '../app/api/enquiries/route';
export function routeResponse(path:string) {return proxy(new NextRequest('https://shield.test'+path));}
export function render(path:string,query:any={}) {
  const page=pageFor(path);
  return renderToStaticMarkup(<Layout>{page?(page.path==='/'?<Home />:<><ContentPage page={page} query={query} /><PageSchema page={page} /></>):<NotFound />}</Layout>);
}

export function renderReport(record:any) { return renderToStaticMarkup(<ResearchReportBody record={record} />); }
