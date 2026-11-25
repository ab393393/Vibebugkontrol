/** Optional owner-owned Apps Script connection. Credentials never reach the browser. */
export async function saveEnquiryToSheet(data,reference,config={}, {fetchImpl=fetch,timeoutMs=4000}={}) {
  if(!config.sheetWebhookUrl&&!config.sheetWebhookToken)return {state:'not_configured'};
  let endpoint;
  try {
    endpoint=new URL(config.sheetWebhookUrl);
    if(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||endpoint.port||endpoint.username||endpoint.password||endpoint.search||endpoint.hash||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint.pathname)||typeof config.sheetWebhookToken!=='string'||!/^[A-Za-z0-9_-]{32,200}$/.test(config.sheetWebhookToken))throw new Error('config');
  } catch {
    console.warn(JSON.stringify({event:'enquiry_sheet_failed',reference,reason:'invalid_configuration'}));
    return {state:'failed'};
  }
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response=await fetchImpl(endpoint.href,{method:'POST',signal:controller.signal,redirect:'follow',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({token:config.sheetWebhookToken,reference,enquiry:data})});
    const receipt=await response.json();
    if(!response.ok||receipt?.success!==true||receipt.reference!==reference)throw new Error('unconfirmed');
    return {state:'saved'};
  } catch {
    console.warn(JSON.stringify({event:'enquiry_sheet_failed',reference,reason:controller.signal.aborted?'timeout':'unconfirmed'}));
    return {state:'failed'};
  } finally {clearTimeout(timer);}
}
