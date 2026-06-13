# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```powershell
npm install       # install dependencies
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview production build
```

There are no tests or linting configured.

## Architecture

Frontend-only React + Vite app. No backend, no database. State lives in `localStorage` (`fp_demo_state_v1`) and survives page reloads.

### Data model

Units are the atomic pieces of the floor plan. Each unit is one of 4 sub-units inside a **cell** (2×2 grid). Cells are addressed as `L{level}-CR{cellRow}-CC{cellCol}`, sub-units as `{cellId}-Q{0..3}` where Q0=top-left, Q1=top-right, Q2=bottom-left, Q3=bottom-right.

`App.jsx` owns all state:
- `layoutConfig` — all geometry constants (column count, cell size, gaps, per-level hallway heights).
- `defaultUnits()` — generates the full unit grid from `layoutConfig` with demo ownership seeds.
- `state.levels` — array of `{ level, units[] }` objects passed down to `FloorPlan`.
- `normalizeState()` — migrates the old flat `units[]` format to the per-level format.

### Rendering

`FloorPlan.jsx` is a single component that renders each level into its own `<div>` host element using **svg.js** (`@svgdotjs/svg.js`). It does not use React for SVG drawing — svg.js calls are issued imperatively inside a `useEffect` that re-runs whenever units, selection, or eligible targets change.

Two separate effects:
1. Full redraw effect (lines ~168–370): tears down and rebuilds the entire SVG when layout data changes.
2. Selection animation effect (lines ~373–402): mutates only stroke/fill on already-rendered svg.js elements when selection state changes, without redrawing.

### Upgrade flow

1. User logs in (sets `currentUser` via `sessionStorage`).
2. User clicks any sub-unit → selects its parent cell (`selectedGroupId`).
3. `eligibleTargets` is computed: horizontal pairs in empty same-level cells + vertical pairs in the mirrored cell on the other level. Sorted by Euclidean distance from selected cell.
4. User picks a target (or defaults to nearest) and clicks **Upgrade** → `confirm` modal appears.
5. On confirm, `onUpdateUnit` is called for each of the 2 target unit IDs, assigning `owner = currentUser`.

### Geometry helpers (App.jsx)

- `getLevelHeight(i)` — total pixel height of a level including hallways and row gap.
- `getLevelBaseY(i)` — absolute Y offset of a level, accumulating heights + `levelGap` + per-level `extraOffset`.
- `buildHallways()` — returns hallway rect descriptors for each level, passed directly to `FloorPlan`.

### Styling

`src/styles.css` — plain CSS, no preprocessor. SVG element styling (colors, strokes) is applied inline via svg.js, not CSS classes. The `.floorplan-svg-impl` and `.hallway-rect` classes carry only the CSS animations.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
