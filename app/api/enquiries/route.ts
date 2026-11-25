import { env } from 'cloudflare:workers';
import { handleEnquiry } from '../../../lib/enquiries.mjs';
import { siteConfig } from '../../../lib/site-config';

export async function POST(request:Request) {
  const values=env as unknown as Record<string,string|undefined>;
  const config=siteConfig();
  const recipient=values.ENQUIRY_TO||config.business.email;
  if(!recipient||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient))return Response.json({success:false,message:'The enquiry service is unavailable. Please use the contact details on this website.'},{status:503});
  // Public-email FormSubmit uses browser fetch to /ajax/ after server validation.
  const formsubmitBrowser=recipient===config.business.email&&!(values.RESEND_API_KEY&&values.ENQUIRY_FROM);
  return handleEnquiry(request,{origin:config.origin,recipient,cc:config.enquiryCc,resendKey:values.RESEND_API_KEY,from:values.ENQUIRY_FROM,formsubmitBrowser,sheetWebhookUrl:values.GOOGLE_SHEETS_WEBHOOK_URL,sheetWebhookToken:values.GOOGLE_SHEETS_WEBHOOK_TOKEN});
}
