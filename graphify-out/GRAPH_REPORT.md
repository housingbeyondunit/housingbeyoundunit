# Graph Report - floor-plan-thesis  (2026-06-13)

## Corpus Check
- 32 files · ~18,858 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 15 nodes · 19 edges · 4 communities (3 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f5041895`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]

## God Nodes (most connected - your core abstractions)
1. `defaultUnits()` - 4 edges
2. `cellGroupLabel()` - 3 edges
3. `getLevelBaseY()` - 3 edges
4. `getLevelHeight()` - 2 edges
5. `buildHallways()` - 2 edges
6. `migrateUnitId()` - 2 edges
7. `normalizeState()` - 2 edges
8. `App()` - 2 edges
9. `layoutConfig` - 1 edges

## Surprising Connections (you probably didn't know these)
- `defaultUnits()` --calls--> `getLevelBaseY()`  [EXTRACTED]
  src/App.jsx → src/App.jsx  _Bridges community 3 → community 1_

## Import Cycles
- None detected.

## Communities (4 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.40
Nodes (3): App(), buildHallways(), layoutConfig

### Community 1 - "Community 1"
Cohesion: 0.50
Nodes (4): cellGroupLabel(), defaultUnits(), migrateUnitId(), normalizeState()

## Knowledge Gaps
- **1 isolated node(s):** `layoutConfig`
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `defaultUnits()` connect `Community 1` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `cellGroupLabel()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `getLevelBaseY()` connect `Community 3` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `layoutConfig` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._