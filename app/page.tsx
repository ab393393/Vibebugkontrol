import home from '../content/home.html?raw';
import { siteConfig } from '../lib/site-config';
import { renderTemplate } from '../lib/render-template.mjs';
import { pageFor } from '../lib/pages.mjs';
import { pageMetadata, PageSchema } from '../lib/seo';
export const dynamic='force-dynamic';
export function generateMetadata() { return pageMetadata(pageFor('/')!); }
export default function Home() {
  return <><div dangerouslySetInnerHTML={{__html:renderTemplate(home,siteConfig().business)}} /><PageSchema page={pageFor('/')} /></>;
}
