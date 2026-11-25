import type { MetadataRoute } from 'next';
export default function manifest():MetadataRoute.Manifest {
  return {name:'VBK — Vibe Bug Kontrol',short_name:'VBK',description:'Pest control in Mumbai for homes and businesses.',start_url:'/',scope:'/',display:'standalone',background_color:'#f6f5ed',theme_color:'#183d32',icons:[{src:'/assets/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/assets/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]};
}
