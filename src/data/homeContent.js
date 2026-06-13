// Centralized copy + imagery for the homepage. Swap any `image` URL to change
// the photo used in that spot — all images are Unsplash CDN URLs.

const unsplash = (id, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const hero = {
  eyebrow: 'Housing Beyond Unit',
  title: 'Living, Designed Around You',
  subtitle:
    "An open framework for living — where the structure stays, and the way you inhabit it is yours to shape. Inspired by Superlofts' open-building philosophy, every floor is a canvas for the way you actually live.",
  images: [
    unsplash('photo-1512917774080-9991f1c4c750', 2000),
    unsplash('photo-1600585154363-67eb9e2e2099', 2000),
    unsplash('photo-1600596542815-ffad4c1539a9', 2000),
    unsplash('photo-1600607687920-4e2a09cf159d', 2000),
    unsplash('photo-1600566753190-17f0baa2a6c3', 2000),
  ],
  primaryCta: { label: 'Discover the Concept', target: 'about' },
  secondaryCta: { label: 'Explore Featured Spaces', target: 'spaces' },
}

export const aboutConcept = {
  eyebrow: 'The Concept',
  title: 'A Building That Grows With You',
  paragraphs: [
    'Most buildings are finished the day they are built. This one isn’t. Each level is delivered as an open shell — structure, services, and light — leaving the interior open for residents to configure, combine, and reconfigure as their lives change.',
    'Two units become one. A studio becomes a duplex. A neighbour’s wall becomes your new doorway. The floor plan you choose today is a starting point, not a limit.',
    'It is a model borrowed from the open-building movement and projects like Superlofts: separate what rarely changes (the frame) from what often does (the home), and give residents real authorship over the second.',
  ],
  image: unsplash('photo-1493809842364-78817add7ffb', 1600),
  stats: [
    { value: '2', label: 'Open Levels' },
    { value: '48', label: 'Configurable Units' },
    { value: '∞', label: 'Layout Combinations' },
  ],
}

export const openLibrary = {
  eyebrow: 'Open Library',
  title: 'A Shared Library of Living Modules',
  description:
    'Every reservation includes access to the Open Library — a catalogue of furnishing and layout modules that snap into your unit’s open frame. Mix sofas, sleeping platforms, storage walls, and work corners into a configuration that is entirely yours, then change it again later.',
  cta: { label: 'Browse the full library in your reservation', target: 'reservation-flow' },
}

export const inspirationGallery = {
  eyebrow: 'Home Inspiration',
  title: 'A Gallery of Ways to Live Here',
  description:
    'Every resident configures their unit differently. These are a few of the directions past residents have taken — from quiet studios to open-plan duplexes.',
  items: [
    {
      image: unsplash('photo-1502672260266-1c1ef2d93688'),
      title: 'Loft Living',
      caption: 'Open Living',
    },
    {
      image: unsplash('photo-1556912172-45b7abe8b7e1'),
      title: 'Natural Light',
      caption: 'Full Glazing',
    },
    {
      image: unsplash('photo-1600489000022-c2086d79f9d4'),
      title: 'Modular Kitchens',
      caption: 'Kitchen Module',
    },
    {
      image: unsplash('photo-1505691938895-1758d7feb511'),
      title: 'Open Layouts',
      caption: 'Floor Plan',
    },
    {
      image: unsplash('photo-1560448204-e02f11c3d0e2'),
      title: 'Quiet Corners',
      caption: 'Sleeping Platform',
    },
    {
      image: unsplash('photo-1571508601891-ca5e7a713859'),
      title: 'Shared Threshold',
      caption: 'Community',
    },
  ],
}

export const communityStories = {
  eyebrow: 'Community Stories',
  title: 'Voices From the Building',
  description: 'A few residents on what it means to live in a home you can keep redesigning.',
  stories: [
    {
      avatar: unsplash('photo-1494790108377-be9c29b29330', 200),
      name: 'Alice Romero',
      unit: 'Level 1 · Cell A',
      quote:
        '“We started in a single cell and grew into the corner unit next door without moving out. The building adapted to us instead of the other way around.”',
    },
    {
      avatar: unsplash('photo-1507003211169-0a1dd7228f2d', 200),
      name: 'Marcus Ibarra',
      unit: 'Level 2 · Cell B',
      quote:
        '“The Open Library is the best part — I swapped my layout twice in a year without touching a wall.”',
    },
    {
      avatar: unsplash('photo-1500648767791-00dcc994a43e', 200),
      name: 'Charlie Domingo',
      unit: 'Level 1 · Cell C',
      quote:
        '“It feels less like renting a unit and more like joining a community that’s still being designed.”',
    },
    {
      avatar: unsplash('photo-1438761681033-6461ffad8d80', 200),
      name: 'Priya Nathan',
      unit: 'Level 2 · Cell D',
      quote:
        '“Natural light from both sides of the floor changed how I use every room — even the ones I didn’t plan for.”',
    },
  ],
}

export const featuredSpaces = {
  eyebrow: 'Featured Spaces',
  title: 'Spaces Worth Living In',
  items: [
    {
      image: unsplash('photo-1564078516393-cf04bd966897', 1800),
      title: 'The Double-Height Living Room',
      description:
        'Full-height glazing and a void over the living area let light reach two floors at once — a signature of the open-frame plan.',
    },
    {
      image: unsplash('photo-1766431045668-29cc90215762', 1800),
      title: 'The Mezzanine Workspace',
      description:
        'A flexible upper platform residents have turned into studios, home offices, and guest rooms — built without touching a structural wall.',
    },
  ],
}

export const reservationExperience = {
  eyebrow: 'Reservation Experience',
  title: 'Your Home, On Your Schedule',
  description:
    'Choose the date you want your reservation to begin, see the floor plan update with real availability for that date, then pick your unit and furnish it from the Open Library.',
  steps: [
    { label: 'Choose Date', detail: 'Pick the date your reservation should begin.' },
    { label: 'Select Unit', detail: 'The floor plan updates to show what’s open on that date.' },
    { label: 'Customize', detail: 'Furnish your unit from the Open Library.' },
    { label: 'Confirm', detail: 'Review and confirm your reservation.' },
  ],
  cta: { label: 'Start Your Reservation' },
}
