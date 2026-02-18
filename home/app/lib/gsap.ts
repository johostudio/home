// Centralized GSAP setup — imports and registers all available plugins.
// Usage: import { gsap, ScrollTrigger, SplitText, ... } from '@/app/lib/gsap';

import { gsap } from 'gsap';

// --- Free plugins ---
import { CSSPlugin } from 'gsap/CSSPlugin';
import { CSSRulePlugin } from 'gsap/CSSRulePlugin';
import { CustomEase } from 'gsap/CustomEase';
import { Draggable } from 'gsap/Draggable';
import { EasePack } from 'gsap/EasePack';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// --- Club / premium plugins ---
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { GSDevTools } from 'gsap/GSDevTools';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { MotionPathHelper } from 'gsap/MotionPathHelper';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

// Register everything once
gsap.registerPlugin(
  // Free
  CSSPlugin,
  CSSRulePlugin,
  CustomEase,
  Draggable,
  EasePack,
  Flip,
  MotionPathPlugin,
  Observer,
  ScrollToPlugin,
  ScrollTrigger,
  TextPlugin,
  // Club
  CustomBounce,
  CustomWiggle,
  DrawSVGPlugin,
  GSDevTools,
  InertiaPlugin,
  MorphSVGPlugin,
  MotionPathHelper,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  ScrambleTextPlugin,
  ScrollSmoother,
  SplitText,
);

// Re-export everything for convenient imports
export {
  gsap,
  // Free
  CSSPlugin,
  CSSRulePlugin,
  CustomEase,
  Draggable,
  EasePack,
  Flip,
  MotionPathPlugin,
  Observer,
  ScrollToPlugin,
  ScrollTrigger,
  TextPlugin,
  // Club
  CustomBounce,
  CustomWiggle,
  DrawSVGPlugin,
  GSDevTools,
  InertiaPlugin,
  MorphSVGPlugin,
  MotionPathHelper,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  ScrambleTextPlugin,
  ScrollSmoother,
  SplitText,
};
