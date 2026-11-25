import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/site-config';
import { pages } from '../lib/pages.mjs';
export const dynamic='force-dynamic';
export default function sitemap():MetadataRoute.Sitemap {
  const {origin,indexable}=siteConfig();
  if(!indexable)return [];
  return pages.map(page=>({url:origin+page.path}));
}
