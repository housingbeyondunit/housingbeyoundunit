# Graph Report - floor-plan-thesis  (2026-06-14)

## Corpus Check
- 14 files · ~150,632 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 21 nodes · 27 edges · 5 communities (2 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `28e7341e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `defaultUnits()` - 4 edges
2. `cellGroupLabel()` - 3 edges
3. `getLevelBaseY()` - 3 edges
4. `getLevelHeight()` - 2 edges
5. `buildHallways()` - 2 edges
6. `migrateUnitId()` - 2 edges
7. `normalizeState()` - 2 edges
8. `App()` - 2 edges
9. `avatarColor()` - 2 edges
10. `UserBadge()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `defaultUnits()` --calls--> `getLevelBaseY()`  [EXTRACTED]
  src/App.jsx → src/App.jsx  _Bridges community 4 → community 1_

## Import Cycles
- None detected.

## Communities (5 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (3): AVATAR_COLORS, layoutConfig, RESIDENT_TABS

### Community 1 - "Community 1"
Cohesion: 0.50
Nodes (4): cellGroupLabel(), defaultUnits(), migrateUnitId(), normalizeState()

## Knowledge Gaps
- **3 isolated node(s):** `RESIDENT_TABS`, `layoutConfig`, `AVATAR_COLORS`
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `defaultUnits()` connect `Community 1` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `cellGroupLabel()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `getLevelBaseY()` connect `Community 4` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `RESIDENT_TABS`, `layoutConfig`, `AVATAR_COLORS` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._