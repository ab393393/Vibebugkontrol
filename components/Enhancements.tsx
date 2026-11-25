'use client';
import { useEffect } from 'react';

export function Enhancements() {
  useEffect(() => {
    if(document.getElementById('shield-interactions')) return;
    const script=document.createElement('script');
    script.id='shield-interactions';script.type='module';script.src='/app.js';
    document.body.appendChild(script);
  },[]);
  return null;
}
