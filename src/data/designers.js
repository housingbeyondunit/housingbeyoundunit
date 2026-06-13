// Designer directory + portfolio snippets for the "Contact the Designer" page.
// All images are Unsplash CDN URLs — swap any `image`/`avatar` to change the photo used.

const unsplash = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const designersIntro = {
  eyebrow: 'Contact the Studio',
  title: 'Meet the Designers',
  description:
    'The team behind the open-frame system. Each designer brings a different lens — architecture, interiors, planning — to how this building keeps evolving. Reach out directly about a unit, a layout idea, or a custom design request.',
}

export const designers = [
  {
    name: 'Arch. Rafael Santos',
    role: 'Principal Architect',
    email: 'rafael.santos@floorplan.com',
    phone: '+63 917 123 4567',
    avatar: unsplash('photo-1519345182560-3f2917c472ef', 300),
    bio: 'Leads the overall open-building concept — the structural frame, the shared services, and the rules that let every unit be reconfigured without touching a load-bearing wall.',
    portfolio: [
      { image: unsplash('photo-1600607687939-ce8a6c25118c', 600), title: 'Open-Frame Living Room' },
      { image: unsplash('photo-1600210492493-0946911123ea', 600), title: 'Structural Shell Concept' },
      { image: unsplash('photo-1600121848594-d8644e57abab', 600), title: 'Duplex Reconfiguration' },
    ],
  },
  {
    name: 'Arch. Lena Cruz',
    role: 'Interior & Modular Systems Lead',
    email: 'lena.cruz@floorplan.com',
    phone: '+63 917 234 5678',
    avatar: unsplash('photo-1580489944761-15a19d654956', 300),
    bio: 'Designs the Open Library modules — the sofas, sleeping platforms, storage walls, and work corners residents mix into their units, and how they snap into the frame.',
    portfolio: [
      { image: unsplash('photo-1600585152915-d208bec867a1', 600), title: 'Modular Storage Wall' },
      { image: unsplash('photo-1600573472550-8090b5e0745e', 600), title: 'Sleeping Platform Module' },
      { image: unsplash('photo-1600047509807-ba8f99d2cdde', 600), title: 'Kitchen Module Kit' },
    ],
  },
  {
    name: 'Arch. Daniel Reyes',
    role: 'Planning & Community Spaces',
    email: 'daniel.reyes@floorplan.com',
    phone: '+63 917 345 6789',
    avatar: unsplash('photo-1573496359142-b8d87734a5a2', 300),
    bio: 'Plans the shared hallways, stairs, and service zones that tie units together — keeping community spaces generous as the floor plan keeps changing around them.',
    portfolio: [
      { image: unsplash('photo-1600210491892-03d54c0aaf87', 600), title: 'Shared Hallway Concept' },
      { image: unsplash('photo-1616137422495-1e9e46e2aa77', 600), title: 'Stairwell & Service Core' },
      { image: unsplash('photo-1618221195710-dd6b41faaea6', 600), title: 'Community Threshold' },
    ],
  },
]
