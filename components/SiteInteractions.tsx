'use client';

import { useEffect } from 'react';
import { initShieldIslands } from './shield-islands';

declare global {
  interface Window { vbkInteractionsReady?: boolean; }
}

// The enhancement module is also advertised in the server HTML. Its setup
// waits for React's commit so it cannot rewrite the DOM during hydration.
export function SiteInteractions() {
  useEffect(() => {
    window.vbkInteractionsReady = true;
    window.dispatchEvent(new Event('vbk:interactions-ready'));
    return initShieldIslands();
  }, []);
  return null;
}
