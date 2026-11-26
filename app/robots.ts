import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/site-config';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots {
  const config=siteConfig();
  return config.indexable?{rules:{userAgent:'*',allow:'/',disallow:['/api/','/signin-with-chatgpt','/signout-with-chatgpt']},sitemap:config.origin+'/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}};
}
