var GALLERY_CATEGORIES = [
  { key: 'engineering', label: 'engineering projects' },
  { key: 'graphic-design', label: 'graphic design' },
  { key: 'brand-design', label: 'brand design' },
  { key: 'ui-ux', label: 'ui / ux' },
  { key: 'videography', label: 'videography' },
  { key: 'photography', label: 'photography' },
  { key: 'production', label: 'production' },
  { key: 'motion-graphics', label: 'motion graphics' },
  { key: 'illustration', label: 'illustration' },
  { key: 'urban-architecture', label: 'urban+architecture' },
  { key: 'diy-projects', label: 'diy projects' },
  { key: 'misc', label: 'misc' }
];

var GALLERY_PROJECTS = [
  {
    slug: 'bioboat',
    title: 'bioboat @ sfu see',
    category: 'engineering',
    date: '2026-04',
    description: 'A class project for energy design: making a biomimetic boat with sustainable design in mind.',
    thumb: 'gif/thumbnails/bioboat.png'
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
  {
    slug: 'verdant',
    title: 'Verdant',
    category: 'ui-ux',
    date: '2026-02',
    description: 'Hackathon project for climate resilience planning using AI-integrated urban mapping.',
    thumb: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/004/234/335/datas/medium.jpg'
  },
  {
    slug: 'instagram-moments-ui',
    title: 'Instagram Moments',
    category: 'ui-ux',
    date: '2026-05',
    description: 'Instagram Moments web experience made at SparkJam 2026.',
    thumb: 'gif/thumbnails/moments.png',
    href: 'https://moments-xi-five.vercel.app/'
  },
  {
    slug: 'ascend-ai',
    title: 'ascend.ai',
    category: 'ui-ux',
    date: '2026-01',
    description: 'Personalized financial advisor engine designed to adapt to real user constraints.',
    thumb: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/004/174/899/datas/medium.png'
  },
  {
    slug: 'bussin',
    title: 'Bussin!',
    category: 'ui-ux',
    date: '2026-02',
    description: 'Transit-focused hackathon app for planning commutes and seeing route context.',
    thumb: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/004/260/525/datas/medium.png'
  },
  {
    slug: 'carbon-compass',
    title: 'Carbon Compass',
    category: 'ui-ux',
    date: '2025-10',
    description: 'Sustainability navigation experience to track footprint and compare eco-friendly routes.',
    thumb: 'https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/003/819/016/datas/medium.png'
  },

  {
    slug: 'what-used-to-be',
    title: 'what used to be',
    category: 'videography',
    date: '2024-01',
    description: 'A short film about turning eighteen.',
    thumb: 'gif/thumbnails/whatweusedtobe.png'
  },
  {
    slug: 'memoir-002',
    title: 'memoir [002]',
    category: 'videography',
    date: '2026-01',
    description: 'A short memoir about a fun evening skating @ Robson Square.',
    thumb: 'gif/thumbnails/MEMOIR02.png'
  },
  {
    slug: 'memoir-003',
    title: 'memoir [003]',
    category: 'videography',
    date: '2026-02',
    description: 'A short memoir about a good time w/ friends @ UBC HTC \'26.',
    thumb: 'gif/thumbnails/MEMOIR03 - YT.png'
  },
  {
    slug: 'old-photos',
    title: 'old photos',
    category: 'videography',
    date: '2026-03',
    description: '"old photos", a message lost and found between generations. [IAT 202 Spring 2026]',
    thumb: 'gif/thumbnails/FINAL PHOTO_15.1.2 (1) (1).png'
  },
  {
    slug: 'instagram-moments-film',
    title: 'Instagram Moments',
    category: 'videography',
    date: '2026-05',
    description: '\'Instagram Moments\', a cinematic. Made at SparkJam 2026 (in under 30ish hours...).',
    thumb: 'gif/thumbnails/moments.png'
  },

  {
    slug: 'hobbies',
    title: 'hobbies',
    category: 'misc',
    date: '2026-04',
    description: 'gallery of my everyday objects around me',
    thumb: 'gif/thumbnails/1600.jpg',
    href: 'projects/hobbies'
  },

  {
    slug: 'photography-client',
    title: 'photography',
    category: 'photography',
    date: '2026-04',
    description: 'photo gallery for clients',
    thumb: 'gif/thumbnails/junny.jpg',
    href: 'projects/photography-client'
  },

  {
    slug: 'newjeans-right-now',
    title: 'newjeans — "right now" kinetic typography',
    category: 'motion-graphics',
    date: '2025-01',
    description: '[IAT 100 Summer 2025] Kinetic typography video for NewJeans\' "Right Now".',
    thumb: 'gif/thumbnails/NWJNS-RIGHTNOW.png'
  },

  {
    slug: 'vancouver',
    title: 'project:vancouver',
    category: 'misc',
    date: '2021-01',
    description: 'A set of twelve "projects" set across all different mediums and fields. My dreams and goals.',
    thumb: null,
    href: 'projects/vancouver'
  },
  {
    slug: 'sustainable-food',
    title: 'sustainable food workshops @ fraser basin council',
    category: 'misc',
    date: '2023-08',
    description: 'Led workshops and community events about sustainable food practices in B.C. with the Fraser Basin CCSBC team.',
    thumb: null
  }
];
