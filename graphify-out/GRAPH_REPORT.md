# Graph Report - floor-plan-thesis  (2026-06-16)

## Corpus Check
- 14 files · ~219,660 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 24 nodes · 30 edges · 4 communities (2 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `562137b4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
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
9. `avatarColor()` - 2 edges
10. `UserBadge()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (4 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (4): AVATAR_COLORS, layoutConfig, MODULE_CATEGORIES, RESIDENT_TABS

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (6): cellGroupLabel(), defaultUnits(), getLevelBaseY(), getLevelHeight(), migrateUnitId(), normalizeState()

## Knowledge Gaps
- **4 isolated node(s):** `RESIDENT_TABS`, `MODULE_CATEGORIES`, `layoutConfig`, `AVATAR_COLORS`
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `defaultUnits()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `cellGroupLabel()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `getLevelBaseY()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `RESIDENT_TABS`, `MODULE_CATEGORIES`, `layoutConfig` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._