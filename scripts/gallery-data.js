/**
 * gallery-data.js
 * 
 * Central project data. To add a new project, just push an object here.
 * Each project links to a writeup page at /writeups/<slug>.html
 * 
 * Categories:
 *   engineering, graphic-design, brand-design, ui-ux,
 *   videography, photography, production, motion-graphics,
 *   illustration, misc
 */

var GALLERY_CATEGORIES = [
  { key: 'engineering',      label: 'Engineering Projects' },
  { key: 'graphic-design',   label: 'Graphic Design' },
  { key: 'brand-design',     label: 'Brand Design' },
  { key: 'ui-ux',            label: 'UI / UX' },
  { key: 'videography',      label: 'Videography' },
  { key: 'photography',      label: 'Photography' },
  { key: 'production',       label: 'Production' },
  { key: 'motion-graphics',  label: 'Motion Graphics' },
  { key: 'illustration',     label: 'Illustration' },
  { key: 'misc',             label: 'Miscellaneous' }
];

var GALLERY_PROJECTS = [
  // ─── Engineering Projects ───
  {
    slug: 'bioboat',
    title: 'BioBoat @ SFU SEE',
    category: 'engineering',
    date: '2026-04',
    description: 'A class project for energy design: making a biomimetic boat with sustainable design in mind.',
    thumb: null  // set to an image path like 'gif/images/bioboat.png' when ready
  },
  {
    slug: 'wind-vane',
    title: 'Wind Vane @ EWB Sustain-EE',
    category: 'engineering',
    date: '2026-01',
    description: 'Making a wind vane for our sustainable energy project with EWB.',
    thumb: null
  },
  {
    slug: 'johostudio-site',
    title: 'joho.studio',
    category: 'engineering',
    date: '2025-12',
    description: 'Personal portfolio site built from scratch, learning to make things work (and still look pretty).',
    thumb: null
  },

  // ─── Videography ───
  {
    slug: 'what-used-to-be',
    title: 'what used to be',
    category: 'videography',
    date: '2024-01',
    description: 'A short film about turning eighteen.',
    thumb: 'gif/images/whatweusedtobe.png'
  },
  {
    slug: 'memoir-002',
    title: 'MEMOIR [002]',
    category: 'videography',
    date: '2026-01',
    description: 'A short memoir about a fun evening skating @ Robson Square.',
    thumb: 'gif/archive-png/MEMOIR02.png'
  },
  {
    slug: 'memoir-003',
    title: 'MEMOIR [003]',
    category: 'videography',
    date: '2026-02',
    description: 'A short memoir about a good time w/ friends @ UBC HTC \'26.',
    thumb: 'gif/images/MEMOIR03 - YT.png'
  },
  {
    slug: 'old-photos',
    title: 'old photos',
    category: 'videography',
    date: '2026-03',
    description: '"old photos", a message lost and found between generations. [IAT 202 Spring 2026]',
    thumb: 'gif/archive-png/FINAL PHOTO_15.1.2 (1) (1).png'
  },

  // ─── Motion Graphics ───
  {
    slug: 'newjeans-right-now',
    title: 'NewJeans — "Right Now" Kinetic Typography',
    category: 'motion-graphics',
    date: '2025-01',
    description: '[IAT 100 Summer 2025] Kinetic typography video for NewJeans\' "Right Now".',
    thumb: 'gif/NWJNS-RIGHTNOW.png'
  },

  // ─── Graphic Design ───
  // Add your projects here!
  // {
  //   slug: 'forum-graphics',
  //   title: 'The Forum — Event Graphics',
  //   category: 'graphic-design',
  //   date: '2025-08',
  //   description: 'Event graphics and social media content for The Forum @ SFU.',
  //   thumb: null
  // },

  // ─── UI / UX ───
  // {
  //   slug: 'ukiyo',
  //   title: 'Ukiyo',
  //   category: 'ui-ux',
  //   date: '2026-06',
  //   description: 'An app that lets you lead your own life. TBA.',
  //   thumb: null
  // },

  // ─── Brand Design ───

  // ─── Photography ───

  // ─── Production ───

  // ─── Illustration ───

  // ─── Miscellaneous ───
  {
    slug: 'hackathon-projects',
    title: 'Hackathon Projects @ UBC + SFU',
    category: 'misc',
    date: '2025-10',
    description: 'Four hackathons within a couple months of each other.',
    thumb: null
  },
  {
    slug: 'sustainable-food',
    title: 'Sustainable Food Workshops @ Fraser Basin',
    category: 'misc',
    date: '2023-08',
    description: 'Led workshops and community events about sustainable food practices in B.C. with the Fraser Basin CCSBC team.',
    thumb: null
  }
];
