// GSAP entry for this app — register only plugins that are used to keep bundle and parse cost down.
// Usage: import { gsap, initGsapPlugins } from '@/app/lib/gsap';

'use client';

import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

let _registered = false;

/** Call once from a client-side useEffect to register plugins. */
function initGsapPlugins() {
  if (_registered) return;
  _registered = true;
  gsap.registerPlugin(InertiaPlugin);
}

export { gsap, initGsapPlugins, InertiaPlugin };
