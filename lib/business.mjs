import details from '../content/business.json' with {type:'json'};

export function realText(value,max=500) {
  return typeof value==='string' && !/\[[^\]]*\]/.test(value) ? value.trim().slice(0,max) : '';
}
export function validOrigin(value) {
  const text=realText(value);if(!text)return '';
  try {const url=new URL(text.includes('://')?text:'https://'+text);return !url.username&&!url.password&&(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))?url.origin:'';}catch{return '';}
}
export function businessInfo(overrides={}) {
  const value={...details,...overrides};
  const email=realText(value.email);const rawPhone=realText(value.phone);
  const phone=/^\+[1-9]\d{6,14}$/.test(rawPhone.replace(/[\s().-]/g,''))?rawPhone:'';
  const digits=realText(value.whatsappNumber).replace(/[\s()+.-]/g,'');
  const whatsappNumber=/^[1-9]\d{7,14}$/.test(digits)?digits:'';
  const a=value.address||{};
  const address=Object.fromEntries(['streetAddress','addressLocality','addressRegion','postalCode','addressCountry'].map(key=>[key,realText(a[key])]));
  const hasAddress=!!(address.streetAddress&&address.addressLocality&&/^\d{6}$/.test(address.postalCode));
  const openingHours=(value.openingHours||[]).filter(item=>/^(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))? (?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d$/.test(item));
  const sameAs=(value.sameAs||[]).filter(item=>{try{return new URL(item).protocol==='https:'&&!/\[|\]/.test(item);}catch{return false;}});
  let mapEmbedUrl='';try {const u=new URL(realText(value.mapEmbedUrl,6000));if(u.protocol==='https:'&&['www.google.com','maps.google.com'].includes(u.hostname)&&u.pathname.startsWith('/maps/embed'))mapEmbedUrl=u.href;}catch{}
  return {
    name:realText(value.name,100)||'VBK',fullName:realText(value.fullName,160)||'Vibe Bug Kontrol',domain:validOrigin(value.domain),
    email:/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)?email:'',phone,
    telephone:phone?phone.replace(/[\s().-]/g,''):'',whatsappNumber,
    whatsappUrl:whatsappNumber?'https://wa.me/'+whatsappNumber:'',
    address:hasAddress?address:null,addressText:hasAddress?Object.values(address).join(', '):'',
    areaServed:[...new Set(['Mumbai',...(value.areaServed||[]).map(area=>realText(area,80)).filter(Boolean)])],
    openingHours,sameAs,mapEmbedUrl,priceRange:realText(value.priceRange),
    startingPrices:Object.fromEntries(Object.entries(value.startingPrices||{}).filter(([,price])=>Number.isFinite(price)&&price>0)),
    licenseNumber:realText(value.licenseNumber),certifications:(value.certifications||[]).map(item=>realText(item)).filter(Boolean),
    yearsExperience:Number.isInteger(value.yearsExperience)&&value.yearsExperience>0?value.yearsExperience:null,
    reviews:(value.reviews||[]).filter(item=>item.approved===true&&realText(item.author)&&realText(item.quote)).map(item=>({author:realText(item.author),quote:realText(item.quote,1200)})),
    clients:(value.clients||[]).filter(item=>item.approved===true&&realText(item.name)).map(item=>realText(item.name)),
  };
}
