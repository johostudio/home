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
  { key: 'engineering',      label: 'engineering projects' },
  { key: 'graphic-design',   label: 'graphic design' },
  { key: 'brand-design',     label: 'brand design' },
  { key: 'ui-ux',            label: 'ui / ux' },
  { key: 'videography',      label: 'videography' },
  { key: 'photography',      label: 'photography' },
  { key: 'production',       label: 'production' },
  { key: 'motion-graphics',  label: 'motion graphics' },
  { key: 'illustration',     label: 'illustration' },
  { key: 'urban-architecture', label: 'urban+architecture' },
  { key: 'diy-projects',      label: 'diy projects' },
  { key: 'misc',             label: 'misc' }
];

var GALLERY_PROJECTS = [
  // ─── Engineering Projects ───
  {
    slug: 'bioboat',
    title: 'bioboat @ sfu see',
    category: 'engineering',
    date: '2026-04',
    description: 'A class project for energy design: making a biomimetic boat with sustainable design in mind.',
    thumb: null  // set to an image path like 'gif/images/bioboat.png' when ready
  },
  {
    slug: 'wind-vane',
    title: 'wind vane @ ewb sustain-ee',
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
    title: 'memoir [002]',
    category: 'videography',
    date: '2026-01',
    description: 'A short memoir about a fun evening skating @ Robson Square.',
    thumb: 'gif/archive-png/MEMOIR02.png'
  },
  {
    slug: 'memoir-003',
    title: 'memoir [003]',
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

  // ─── Photography ───
  {
    slug: 'hobbies',
    title: 'hobbies',
    category: 'misc',
    date: '2026-04',
    description: 'A living gallery of selected photos and everyday hobby snapshots.',
    thumb: 'gif/1600.jpg',
    href: 'projects/photography'
  },

  {
    slug: 'photography-client',
    title: 'photography',
    category: 'photography',
    date: '2026-04',
    description: 'Client-facing photo gallery in polaroid format.',
    thumb: 'gif/1600.jpg',
    href: 'projects/photography-client'
  },

  // ─── Motion Graphics ───
  {
    slug: 'newjeans-right-now',
    title: 'newjeans — "right now" kinetic typography',
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

  // ─── Production ───

  // ─── Illustration ───

  // ─── Miscellaneous ───
  {
    slug: 'vancouver',
    title: 'project:vancouver',
    category: 'misc',
    date: '2021-01',
    description: 'A set of twelve "projects" set across all different mediums and fields. My dreams and goals.',
    thumb: null,
    href: 'projects/vancouver'  // external page override
  },
  {
    slug: 'hackathon-projects',
    title: 'hackathon projects @ ubc + sfu',
    category: 'misc',
    date: '2025-10',
    description: 'Four hackathons within a couple months of each other.',
    thumb: null
  },
  {
    slug: 'sustainable-food',
    title: 'sustainable food workshops @ fraser basin',
    category: 'misc',
    date: '2023-08',
    description: 'Led workshops and community events about sustainable food practices in B.C. with the Fraser Basin CCSBC team.',
    thumb: null
  }
];
