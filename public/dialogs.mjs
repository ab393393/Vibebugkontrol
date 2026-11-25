import { motionAllowed, MOTION_EASE, trackMotion } from './motion.mjs';
export { motionAllowed } from './motion.mjs';

const active = new Set();
const records = new WeakMap();
let savedScroll = 0;
let previousStyles;

function unlockPage() {
  if(active.size || !previousStyles) return;
  Object.assign(document.body.style,previousStyles);
  previousStyles=null;
  window.scrollTo({top:savedScroll,behavior:'instant'});
}

export function openModal(dialog, trigger) {
  if(dialog.open) return;
  if(!records.has(dialog)) {
    const record={trigger:null,closing:null};
    records.set(dialog,record);
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeModal(dialog);});
    dialog.addEventListener('close',()=>{
      active.delete(dialog);
      unlockPage();
      if(!active.size && record.trigger?.isConnected) record.trigger.focus({preventScroll:true});
    });
    dialog.addEventListener('click',event=>{
      const r=dialog.getBoundingClientRect();
      if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)) closeModal(dialog);
    });
  }
  const record=records.get(dialog);
  record.trigger=trigger||document.activeElement;
  if(!active.size) {
    savedScroll=window.scrollY;
    previousStyles={position:document.body.style.position,top:document.body.style.top,width:document.body.style.width,paddingRight:document.body.style.paddingRight};
    const scrollbar=window.innerWidth-document.documentElement.clientWidth;
    document.body.style.position='fixed';
    document.body.style.top=`-${savedScroll}px`;
    document.body.style.width='100%';
    document.body.style.paddingRight=`${scrollbar}px`;
  }
  active.add(dialog);
  dialog.showModal();
  dialog.scrollTop=0;
  if(motionAllowed() && dialog.animate) trackMotion(dialog.animate([
    {opacity:0,transform:dialog.hasAttribute('data-drawer')?'translateX(35px)':'translateY(18px) scale(.98)'},
    {opacity:1,transform:'translate(0) scale(1)'}
  ],{duration:240,easing:MOTION_EASE}));
}

export function closeModal(dialog) {
  if(!dialog.open) return Promise.resolve();
  const record=records.get(dialog);
  if(record?.closing) return record.closing;
  const closing=(async()=>{
    if(motionAllowed() && dialog.animate) {
      const style=getComputedStyle(dialog);
      const from={opacity:style.opacity,transform:style.transform};
      dialog.getAnimations().forEach(animation=>animation.cancel());
      const animation=trackMotion(dialog.animate([
        from,
        {opacity:0,transform:dialog.hasAttribute('data-drawer')?'translateX(25px)':'translateY(10px) scale(.985)'}
      ],{duration:140,easing:MOTION_EASE,fill:'none'}));
      let deadline;
      await Promise.race([animation.finished.catch(()=>{}),new Promise(resolve=>{deadline=setTimeout(resolve,230);})]);
      clearTimeout(deadline);
      animation.cancel();
    }
    if(dialog.open) await new Promise(resolve=>{dialog.addEventListener('close',resolve,{once:true});dialog.close();});
    if(record) record.closing=null;
  })();
  if(record) record.closing=closing;
  return closing;
}
