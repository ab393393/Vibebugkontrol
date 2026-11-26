import type { Metadata, Viewport } from 'next';
import header from '../content/header.html?raw';
import footer from '../content/footer.html?raw';
import dialogs from '../content/dialogs.html?raw';
import criticalCss from '../public/critical.css?raw';
import { JsonLd } from '../lib/seo';
import { siteConfig } from '../lib/site-config';
import { businessSchemas } from '../lib/business-schema.mjs';
import { renderTemplate } from '../lib/render-template.mjs';
import { areaPages } from '../lib/catalog.mjs';
import assetManifest from '../public/asset-manifest.json';
import { SiteInteractions } from '../components/SiteInteractions';

export function generateMetadata():Metadata {
  const config=siteConfig();
  return {metadataBase:new URL(config.origin),manifest:'/manifest.webmanifest',icons:{icon:[{url:'/assets/favicon.svg',type:'image/svg+xml'},{url:'/assets/favicon.png',type:'image/png',sizes:'32x32'}],apple:[{url:'/assets/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},verification:{google:config.verification}};
}
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',interactiveWidget:'resizes-content',themeColor:'#183d32'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  const config=siteConfig();
  return <html lang="en-IN"><head>
    <link rel="preload" href="/assets/shine-sans.woff" as="font" type="font/woff" crossOrigin="anonymous" />
    <style dangerouslySetInnerHTML={{__html:criticalCss}} />
    <link rel="stylesheet" href={assetManifest.css} />
    <meta name="vbk-motion-module" content={assetManifest.motion} />
    {config.gtmId?<meta name="shield-gtm-id" content={config.gtmId} />:config.gaId?<meta name="shield-ga-id" content={config.gaId} />:null}
  </head><body>
    <div className="layout-fragment" dangerouslySetInnerHTML={{__html:renderTemplate(header,config.business)}} />
    {children}
    <div className="layout-fragment" dangerouslySetInnerHTML={{__html:renderTemplate(footer,config.business)}} />
    <div className="layout-fragment" dangerouslySetInnerHTML={{__html:renderTemplate(dialogs,config.business)}} />
    <JsonLd data={businessSchemas(config.origin,config.business,[...config.business.areaServed,...areaPages.map(area=>area.name)])} />
    <noscript><p className="noscript-note">You can request a quote using our <a href="/quote">enquiry form</a> without JavaScript.</p></noscript>
    <script id="shield-interactions" type="module" src={assetManifest.js} />
    <SiteInteractions />
  </body></html>;
}
