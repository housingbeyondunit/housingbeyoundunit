# Graph Report - floor-plan-thesis  (2026-06-16)

## Corpus Check
- 14 files · ~219,629 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 45 nodes · 49 edges · 8 communities (6 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b08d8b21`
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

## God Nodes (most connected - your core abstractions)
1. `scripts` - 7 edges
2. `defaultUnits()` - 4 edges
3. `cellGroupLabel()` - 3 edges
4. `getLevelBaseY()` - 3 edges
5. `getLevelHeight()` - 2 edges
6. `buildHallways()` - 2 edges
7. `migrateUnitId()` - 2 edges
8. `normalizeState()` - 2 edges
9. `App()` - 2 edges
10. `avatarColor()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (8 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (4): AVATAR_COLORS, layoutConfig, MODULE_CATEGORIES, RESIDENT_TABS

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (6): cellGroupLabel(), defaultUnits(), getLevelBaseY(), getLevelHeight(), migrateUnitId(), normalizeState()

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (7): dependencies, react, react-dom, @svgdotjs/svg.js, name, private, version

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (7): scripts, build, deploy, deploy-origin2, dev, predeploy, preview

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (4): devDependencies, gh-pages, playwright, vite

## Knowledge Gaps
- **19 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 6` to `Community 4`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._