// This small observer is in the existing React client chunk. Fiber and Three
// are imported only when the single decorative shield comes into view.
import { canRenderShield } from './shield-capability';
export function initShieldIslands() {
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  const saveData=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;
  if(saveData||!('IntersectionObserver' in window))return ()=>{};
  const cleanups:Array<()=>void>=[];
  let webgl:boolean|undefined;
  document.querySelectorAll<HTMLElement>('[data-vbk-shield]').forEach(host=>{
    let active=true,visible=false,loading=false,dispose:(()=>void)|undefined;
    const sync=async()=>{
      if(!active||!visible||reduced.matches||document.hidden||saveData){dispose?.();dispose=undefined;return;}
      if(webgl===undefined)webgl=canRenderShield();
      if(!webgl)return;
      if(dispose||loading)return;
      loading=true;
      try{
        const {mountShield}=await import('./VBKShieldScene');
        if(active&&visible&&!reduced.matches&&!document.hidden)dispose=mountShield(host);
      }catch(error){console.warn('VBK decorative shield unavailable; illustration retained.',error);}
      finally{loading=false;}
    };
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;void sync();},{rootMargin:'0px'});
    observer.observe(host);reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    cleanups.push(()=>{active=false;observer.disconnect();reduced.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);dispose?.();});
  });
  return ()=>cleanups.forEach(cleanup=>cleanup());
}
