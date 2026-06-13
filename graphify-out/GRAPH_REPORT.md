# Graph Report - floor-plan-thesis  (2026-06-13)

## Corpus Check
- 32 files · ~18,858 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 85 nodes · 127 edges · 12 communities (8 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `17fa4632`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `Architecture` - 6 edges
2. `avatarColor()` - 5 edges
3. `defaultUnits()` - 4 edges
4. `cellGroupLabel()` - 3 edges
5. `getLevelBaseY()` - 3 edges
6. `SiteHeader()` - 3 edges
7. `getLevelHeight()` - 2 edges
8. `buildHallways()` - 2 edges
9. `migrateUnitId()` - 2 edges
10. `normalizeState()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `UserSelector()` --calls--> `avatarColor()`  [EXTRACTED]
  src/pages/ReservationPage.jsx → src/utils/avatar.js
- `SiteHeader()` --calls--> `avatarColor()`  [EXTRACTED]
  src/components/SiteHeader.jsx → src/utils/avatar.js

## Import Cycles
- None detected.

## Communities (12 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (10): SiteFooter(), App(), buildHallways(), cellGroupLabel(), defaultUnits(), getLevelBaseY(), getLevelHeight(), layoutConfig (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (8): Architecture, Commands, Data model, Geometry helpers (App.jsx), graphify, Rendering, Styling, Upgrade flow

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (3): STEPS, FloorPlan(), FurnitureGrid()

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (7): BookingWizard(), NAV_ITEMS, SiteHeader(), ReservationPage(), UserSelector(), AVATAR_COLORS, avatarColor()

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (3): FURNITURE_ITEMS, FurnitureIcon(), OpenLibrary()

### Community 5 - "Community 5"
Cohesion: 0.47
Nodes (3): designers, designersIntro, DesignersPage()

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (3): communityStories, openLibrary, CommunityStories()

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (3): aboutConcept, AboutConcept(), HomePage()

## Knowledge Gaps
- **11 isolated node(s):** `Commands`, `Data model`, `Rendering`, `Upgrade flow`, `Geometry helpers (App.jsx)` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SiteHeader()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `Commands`, `Data model`, `Rendering` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._