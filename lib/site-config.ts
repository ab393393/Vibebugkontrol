import { env } from 'cloudflare:workers';
import { businessInfo, validOrigin } from './business.mjs';
import enquirySettings from '../content/enquiries.json';
import { enquiryCopyRecipients } from '../public/enquiry-delivery.mjs';

export function siteConfig() {
  const values=env as unknown as Record<string,string|undefined>;
  const business=businessInfo();
  const staging=values.SITE_ENV==='staging';
  // Set the owner's custom domain in business.json or runtime SITE_URL.
  // No hosting-provider hostname is embedded in the project or export.
  const origin=(staging?validOrigin(values.SITE_URL):business.domain||validOrigin(values.SITE_URL))||'http://localhost:5173';
  const gaId=/^G-[A-Z0-9]{6,15}$/.test(values.GA_MEASUREMENT_ID||'')?values.GA_MEASUREMENT_ID!:'';
  const gtmId=/^GTM-[A-Z0-9]{4,15}$/.test(values.GTM_CONTAINER_ID||'')?values.GTM_CONTAINER_ID!:'';
  return {origin,business,enquiryCc:enquiryCopyRecipients(enquirySettings.cc,business.email),indexable:!staging,gaId,gtmId,
    verification:/^[A-Za-z0-9_-]{10,200}$/.test(values.GOOGLE_SITE_VERIFICATION||'')?values.GOOGLE_SITE_VERIFICATION:undefined,
    emailProvider:values.RESEND_API_KEY&&values.ENQUIRY_FROM?'Resend':'FormSubmit',
  };
}
