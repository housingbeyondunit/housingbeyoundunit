# Floor Plan Demo (React + Vite)

This is a small frontend-only demo that shows a two-level floor plan and allows selecting units and upgrading to the nearest available unit. All data is kept in-memory and persisted to `localStorage` (no database).

Quick start (Windows PowerShell):

```powershell
# install deps
npm install
# start dev server
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

Features implemented:
- Two levels with grid-based units
- Filled (blocked) units shown visually
- Select a unit, toggle fill, or "Upgrade nearest" (moves occupation)
- State persisted to localStorage

Notes / Next steps:
- Replace generated grid with an SVG overlay of your attached floorplan image for precise placement.
- Add animations and a confirmation modal for upgrades.
- Add user session handling if you want multi-user behavior.

