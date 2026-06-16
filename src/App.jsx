import React, { useState, useEffect, useMemo } from 'react'
import FloorPlan from './components/FloorPlan'
import hero from './images/hero.png'
import facade from './images/facade.png'
import facade2 from './images/facade 2.png'
import facade3 from './images/facade 3.png'
import framework from './images/framework.png'
import wall from './images/wall.png'
import byoFurniture from './images/BYO FURNITUURE.png'
import builderFurniture from './images/BUILDER.png'
import browserFurniture from './images/ARCHIVE FURNITURE.png'

// Minimal in-memory data model with localStorage persistence
const STORAGE_KEY = 'fp_demo_state_v1'
const USER_KEY = 'fp_demo_user_v1'

const RESIDENT_TABS = [
  { key: 'modules', label: 'Request Modules' },
  { key: 'booking', label: 'Book Bays' },
  { key: 'connect', label: 'Connect To A Designer' },
]

const MODULE_CATEGORIES = [
  {
    key: 'facade',
    label: 'Facade Modules',
    image: facade,
    description: [
      'Windows, doors, blanks, odd bits, bright bits.',
      'Choose from the co-op kit, work with us on a custom module, or rescue a module from the archive and give it a new home!',
    ],
    options: [
      { label: 'Choose From The Kit', image: facade2, description: 'pick a tested module from the standard co-op set\n\nsimple, quick, and already approved' },
      { label: 'Request A Custom Module', image: facade3, description: 'need something different?\n\ntell us what you are imagining and we will help design a module that fits the frame.' },
      { label: 'Browse The Archive', image: facade, description: 'find reused modules from past homes\n\ncheaper, lower-waste, and already part of the building’s story' },
    ],
  },
  {
    key: 'furniture',
    label: 'Furniture Framework',
    image: framework,
    description: [
      'Start with a frame, then fill it your way.',
      'Book a workshop induction to build your own infill, ask our builder for help, or browse archived furniture pieces ready for a second life.',
    ],
    options: [
      { label: 'Build Yourr Own', image: byoFurniture, description: 'book a workshop induction,\n\nlearn the tools, and make shelves, beds, benches, storage, or whatever your home needs next.' },
      { label: 'Book A Builder', image: builderFurniture, description: 'have an idea but need a hand?\n\nwork with our builder to measure, cut, fit, and finish your furniture infill.' },
      { label: 'Browse The Archive', image: browserFurniture, description: 'find frames and furniture pieces left by past residents.\n\ncheaper, less wasteful, and ready to be used again.' },
    ],
  },
  {
    key: 'wall',
    label: 'Wall Modules',
    image: wall,
    description: [
    ],
    options: [
      { label: 'My Wall Needs Help', image: wall, description: 'wall acting weird?\n\nupload a photo + tell us what happened.\n\nthe workshop will repair, swap, or archive it.' },
    ],
  },
]

const layoutConfig = {
  cellCols: 6,
  cellRows: 2,
  cellW: 200,
  cellH: 140,
  startX: 60,
  startY: 40,
  gapX: 0,
  levelGap: 250,
  subCols: 2,
  subRows: 2,
  subPadding: 0,
  subGap: 0,
  levels: [
    {
      rowGap: 64,
      topHallway: 0,
      bottomHallway: 0,
      middleLabel: 'Hallway / Stairs & Service',
      extraOffset: 0
    },
    {
      rowGap: 64,
      topHallway: 48,
      bottomHallway: 48,
      topLabel: 'Hallway',
      bottomLabel: 'Hallway',
      middleLabel: 'Stairs & Service',
      extraOffset: 250
    }
  ]
}

const cellGroupLabel = (cellRow, cellCol) =>
  String.fromCharCode(65 + cellRow * layoutConfig.cellCols + cellCol)

const getLevelHeight = (levelIndex) => {
  const level = layoutConfig.levels[levelIndex]
  return level.topHallway + layoutConfig.cellH + level.rowGap + layoutConfig.cellH + level.bottomHallway
}

const getLevelBaseY = (levelIndex) => {
  let y = layoutConfig.startY
  for (let i = 0; i < levelIndex; i++) {
    const lvl = layoutConfig.levels[i]
    y += getLevelHeight(i) + layoutConfig.levelGap + (lvl.extraOffset || 0)
  }
  const currentOffset = layoutConfig.levels[levelIndex]?.extraOffset || 0
  return y + currentOffset
}

const buildServiceElements = (levelIndex, midY, hallH) => {
  const services = []

  const servicePairs = [
    [0, 1],
    [2, 3],
    [4, 5]
  ]

  const serviceHeight = 12
  const serviceWidth = layoutConfig.cellW * 1

  servicePairs.forEach(([leftCol, rightCol]) => {
    const leftCellX =
      layoutConfig.startX +
      leftCol * (layoutConfig.cellW + layoutConfig.gapX)

    const rightCellX =
      layoutConfig.startX +
      rightCol * (layoutConfig.cellW + layoutConfig.gapX)

    // center between 2 cells
    const centerX =
      (leftCellX + layoutConfig.cellW + rightCellX) / 2

    const x =
      centerX - serviceWidth / 2

    // attached to bottom of upper units
    const y =
      midY + 4

    services.push({
      level: levelIndex,
      type: 'service',
      x,
      y: midY - serviceHeight,
      w: serviceWidth,
      h: serviceHeight
    })

    services.push({
      level: levelIndex,
      type: 'service',
      x,
      y: midY + hallH,
      w: serviceWidth,
      h: serviceHeight
    })
  })

  return services
}

const buildHallways = () => {
  const gridW = layoutConfig.cellCols * layoutConfig.cellW + (layoutConfig.cellCols - 1) * layoutConfig.gapX
  const hallways = []

  layoutConfig.levels.forEach((level, levelIndex) => {
    const baseY = getLevelBaseY(levelIndex)
    const row0Y = baseY + level.topHallway
    const row1Y = row0Y + layoutConfig.cellH + level.rowGap
    const midY = row0Y + layoutConfig.cellH

    if (levelIndex === 0) {
      hallways.push({
        level: levelIndex,
        x: layoutConfig.startX,
        y: midY,
        w: gridW,
        h: level.rowGap,
        label: level.middleLabel
      })
      hallways.push(...buildServiceElements(levelIndex, midY, level.rowGap))
    } else {
      hallways.push({
        level: levelIndex,
        x: layoutConfig.startX,
        y: baseY + 32,
        w: gridW,
        h: level.topHallway,
        label: level.topLabel
      })
      hallways.push({
        level: levelIndex,
        x: layoutConfig.startX,
        y: row1Y + layoutConfig.cellH - 32,
        w: gridW,
        h: level.bottomHallway,
        label: level.bottomLabel
      })
      hallways.push(...buildServiceElements(levelIndex, midY, level.rowGap))
    }
  })

  return hallways
}

const defaultUnits = () => {
  // Each big "cell" is composed of 4 sub-units (2x2). Upgrades operate on
  // groups (2 sub-units) and owning a full cell initially (4 sub-units).
  //
  // We'll model an apartment grid as `cellRows` x `cellCols` cells per level.
  // Each cell expands to 2x2 subunits.
  const levels = layoutConfig.levels.map((_, level) => ({ level, units: [] }))

  for (let level = 0; level < layoutConfig.levels.length; level++) {
    const levelCfg = layoutConfig.levels[level]
    const baseY = getLevelBaseY(level)
    for (let cr = 0; cr < layoutConfig.cellRows; cr++) {
      for (let cc = 0; cc < layoutConfig.cellCols; cc++) {
        const letter = cellGroupLabel(cr, cc)
        const cellId = `${letter}${level + 1}`
        const cellX = layoutConfig.startX + cc * (layoutConfig.cellW + layoutConfig.gapX)
        let cellY = baseY + levelCfg.topHallway + cr * (layoutConfig.cellH + levelCfg.rowGap)

        if (level === 1) {
          if (cr === 0) {
            // upper row move down
            cellY += 32
          } else if (cr === 1) {
            // lower row move up
            cellY -= 32
          }
        }

        const subW = (layoutConfig.cellW - layoutConfig.subPadding * 2 - layoutConfig.subGap) / layoutConfig.subCols
        const subH = (layoutConfig.cellH - layoutConfig.subPadding * 2 - layoutConfig.subGap) / layoutConfig.subRows

        for (let sr = 0; sr < layoutConfig.subRows; sr++) {
          for (let sc = 0; sc < layoutConfig.subCols; sc++) {
            const quadrant = sr * 2 + sc // 0..3
            const id = `${cellId}-${quadrant + 1}`
            const x = cellX + layoutConfig.subPadding + sc * (subW + layoutConfig.subGap)
            const y = cellY + layoutConfig.subPadding + sr * (subH + layoutConfig.subGap)
            levels[level].units.push({
              id,
              level,
              cellR: cr,
              cellC: cc,
              groupId: cellId,
              q: quadrant,
              owner: null,
              date: null,
              availableFrom: null,
              releasedBy: null,
              x,
              y,
              w: subW,
              h: subH
            })
          }
        }
      }
    }
  }

  // Demo seed: each "user" owns an entire cell (4 sub-units) with an open-ended period
  const seedCellOwner = (level, cellR, cellC, owner) => {
    const levelUnits = levels[level]?.units || []
    for (const u of levelUnits) {
      if (u.level === level && u.cellR === cellR && u.cellC === cellC) {
        u.owner = owner
        u.date = '2026-01-01'
      }
    }
  }
  seedCellOwner(0, 0, 0, 'alice')
  seedCellOwner(0, 1, 1, 'bob')
  seedCellOwner(1, 0, 2, 'charlie')

  return levels
}

// Ensure every unit has a date field — migrate from old startDate/endDate or bare owner format.
const migrateUnit = u => {
  const { startDate, endDate, ...rest } = u
  return {
    ...rest,
    date: u.date ?? startDate ?? (u.owner ? '2026-01-01' : null),
    availableFrom: u.availableFrom ?? null,
    releasedBy: u.releasedBy ?? null,
  }
}

const migrateUnitId = u => {
  const m = /^L(\d+)-CR(\d+)-CC(\d+)-Q(\d+)$/.exec(u.id)
  if (!m) return u
  const [, lv, cr, cc, q] = m.map(Number)
  const letter = cellGroupLabel(cr, cc)
  return { ...u, id: `${letter}${lv + 1}-${q + 1}`, groupId: `${letter}${lv + 1}` }
}

const normalizeState = (data) => {
  if (data?.levels) {
    return {
      ...data,
      levels: data.levels.map(lvl => ({ ...lvl, units: lvl.units.map(u => migrateUnit(migrateUnitId(u))) }))
    }
  }
  if (Array.isArray(data?.units)) {
    const levels = layoutConfig.levels.map((_, level) => ({
      level,
      units: data.units.filter(u => u.level === level).map(u => migrateUnit(migrateUnitId(u)))
    }))
    return { levels }
  }
  return { levels: defaultUnits() }
}

export default function App() {
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeState(JSON.parse(raw))
    const u = defaultUnits()
    return { levels: u }
  })

  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem(USER_KEY) || ''
  })

  const [heroVisible, setHeroVisible] = useState(true)
  const [expandedSection, setExpandedSection] = useState(null)
  const [residentTab, setResidentTab] = useState('booking')
  const [moduleCategory, setModuleCategory] = useState(null)

  const toggleSection = (key) => {
    setHeroVisible(false)
    setExpandedSection(prev => (prev === key ? null : key))
  }

  const [showSplash, setShowSplash] = useState(true)
  const [splashClosing, setSplashClosing] = useState(false)

  const dismissSplash = () => {
    if (splashClosing) return
    setSplashClosing(true)
    setTimeout(() => setShowSplash(false), 350)
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (currentUser) sessionStorage.setItem(USER_KEY, currentUser)
    else sessionStorage.removeItem(USER_KEY)
  }, [currentUser])

  const updateUnit = (id, patch) => {
    setState(s => ({
      ...s,
      levels: s.levels.map(level => ({
        ...level,
        units: level.units.map(u => (u.id === id ? { ...u, ...patch } : u))
      }))
    }))
  }

  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ levels: defaultUnits() })
  }

  const hallways = buildHallways()

  // Derive all current owners with unit counts from live state
  const existingUsers = useMemo(() => {
    const counts = new Map()
    state.levels.forEach(lvl => lvl.units.forEach(u => {
      if (u.owner) counts.set(u.owner, (counts.get(u.owner) || 0) + 1)
    }))
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [state])

  const currentUserUnitCount = existingUsers.find(u => u.name === currentUser)?.count ?? 0

  return (
    <div className="studio">
      {showSplash && <SplashScreen onClose={dismissSplash} closing={splashClosing} />}

      {heroVisible && (
        <section className="studio-hero">
          <img
            className="studio-hero-img"
            src={hero}
            alt="Building facade"
          />
        </section>
      )}

      <nav className={`accordion${expandedSection ? ' accordion--expanded' : ''}`} aria-label="Site sections">
        <AccordionItem
          index="01"
          label="Residents"
          expanded={expandedSection === 'residents'}
          onToggle={() => toggleSection('residents')}
        >
          <div className="resident-tabs" role="tablist" aria-label="Resident sections">
            {RESIDENT_TABS.map(tab => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={residentTab === tab.key}
                className={`resident-tab${residentTab === tab.key ? ' resident-tab--active' : ''}`}
                onClick={() => {
                  setResidentTab(tab.key)
                  if (tab.key === 'modules') setModuleCategory(null)
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {residentTab === 'booking' && (
            <>
              <div className="app-header">
                {!currentUser ? (
                  <UserSelector existingUsers={existingUsers} onSetUser={setCurrentUser} />
                ) : (
                  <UserBadge name={currentUser} unitCount={currentUserUnitCount} onLogout={() => setCurrentUser('')} />
                )}
              </div>
              <FloorPlan levels={state.levels} hallways={hallways} onUpdateUnit={updateUnit} currentUser={currentUser} resetApp={resetState} />
            </>
          )}

          {residentTab === 'modules' && (
            <ModulesSection activeCategory={moduleCategory} setActiveCategory={setModuleCategory} />
          )}
          {residentTab === 'connect' && <ResidentPlaceholder title="Connect" />}
        </AccordionItem>

        <AccordionItem
          index="02"
          label="About The Project"
          expanded={expandedSection === 'about'}
          onToggle={() => toggleSection('about')}
        >
          <AboutSection />
        </AccordionItem>
      </nav>
    </div>
  )
}

// ── Full-screen splash overlay shown on first load ──────────────────────────
function SplashScreen({ onClose, closing }) {
  return (
    <section
      className={`splash-screen ${closing ? 'splash-screen--closing' : ''}`}
      onClick={onClose}
    >
      <button className="splash-close" aria-label="Close" onClick={onClose}>
        &times;
      </button>
      <h1 className="splash-line splash-line--main">a home that can change with you</h1>
      <p className="splash-line splash-line--sub">
        nighthingale <span className="splash-line--sub-alt">beyond units</span>
      </p>
    </section>
  )
}

// ── Vertical accordion section: only one open at a time, thin dividers ─────
function AccordionItem({ index, label, expanded, onToggle, children }) {
  return (
    <section className={`accordion-item${expanded ? ' accordion-item--expanded' : ''}`}>
      <button className="accordion-header" onClick={onToggle} aria-expanded={expanded}>
        <span className="accordion-icon" aria-hidden="true">{expanded ? '−' : '+'}</span>
        <span className="accordion-label">{label}</span>
      </button>
      <div className="accordion-panel">
        <div className="accordion-panel-inner">
          <div className="accordion-content">{children}</div>
        </div>
      </div>
    </section>
  )
}

// ── Editorial "About" content ───────────────────────────────────────────────
function AboutSection() {
  return (
    <div className="about">
      <h2 className="about-title">
        nighthingale <strong>beyond units</strong>
      </h2>
      <div className="about-columns">
        <div className="about-block about-block--intro">
          <p className="about-lede">a home that keeps up with you.</p><br />
          <p>
            most apartments are decided once, by someone who'll never live there, for a life
            you haven't lived yet. Then your life changes — and the apartment doesn't. this is
            the other way round: the plan follows the people, not the people the plan.
          </p>
        </div>
        <div className="about-block">
          <h3>The Idea</h3>
          <p>
            <strong>there are no fixed apartments here.</strong> each floor is a grid of
            serviced bays — light, services, and access already in place — and you hold as
            many as you need. partner moves in? claim another bay. kids leave? release one,
            and pay less. your neighbour's spare becomes your studio. the walls move; you don't.
          </p>
        </div>
        <div className="about-block">
          <h3>What Stays Put</h3>
          <p>
            <strong>stairs, services, and circulation</strong> run through the core of each
            floor — fixed, so everything around them is free. that's the whole trick: hold a
            few things still, and the rest can change as often as life does.
          </p>
        </div>
        <div className="about-block">
          <h3>Why</h3>
          <p>
            <strong>i don't think housing is a finished product.</strong> a building is handed
            over complete, then asked to hold lives that keep changing — and it can't. so this
            proposes the opposite: housing as something never quite finished, produced and
            re-produced through occupation, for as long as people live in it. the architect
            sets the conditions; the people make the home, again and again.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Request Modules: category cards that open into a detail page ───────────
function ModulesSection({ activeCategory, setActiveCategory }) {
  const active = MODULE_CATEGORIES.find(c => c.key === activeCategory)

  if (active?.key === 'wall') {
    const opt = active.options[0]
    return (
      <div className="modules">
        <h2 className="modules-detail-title">{active.label}</h2>
        <div className="wall-detail">
          <div className="module-card module-card--static wall-detail-card">
            <span className="module-card-frame">
              <img className="module-card-img" src={opt.image} alt={opt.label} />
              <span className="module-card-overlay">{opt.description}</span>
            </span>
            <span className="module-card-label">{opt.label}</span>
          </div>
          <div className="wall-detail-copy">
            <p>If your wall is scratched, stuck, wobbly, tired, or just not doing its job anymore, <strong>tell us here</strong>.</p>
            <p>We can repair it, swap it, or send it back to the archive for its next life.</p>
            <p className="wall-detail-copy--muted">
              Want to move walls or change your room layout?<br />
              Head to <strong>BOOK BAYS</strong> — that is where the bigger home-shifting happens.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (active) {
    return (
      <div className="modules">
        <h2 className="modules-detail-title">{active.label}</h2>
        <div className="modules-detail-desc">
          {active.description.map(line => <p key={line}>{line}</p>)}
        </div>
        <div className="modules-grid">
          {active.options.map(opt => (
            <div key={opt.label} className="module-card module-card--static">
              <span className="module-card-frame">
                <img className="module-card-img" src={opt.image} alt={opt.label} />
                <span className="module-card-overlay">{opt.description}</span>
              </span>
              <span className="module-card-label">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="modules">
      <div className="modules-grid">
        {MODULE_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className="module-card"
            onClick={() => setActiveCategory(cat.key)}
          >
            <span className="module-card-frame">
              <img className="module-card-img" src={cat.image} alt={cat.label} />
            </span>
            <span className="module-card-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Placeholder content for upcoming resident tabs ─────────────────────────
function ResidentPlaceholder({ title }) {
  return (
    <div className="resident-placeholder">
      <p className="resident-placeholder-text">{title} is coming soon.</p>
    </div>
  )
}

// ── Deterministic avatar colour based on name ──────────────────────────────
const AVATAR_COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777']
const avatarColor = name => AVATAR_COLORS[(name.charCodeAt(0) + name.length) % AVATAR_COLORS.length]

// ── Compact badge shown in the header when a user is logged in ─────────────
function UserBadge({ name, unitCount, onLogout }) {
  return (
    <div className="user-badge">
      <span className="user-avatar" style={{ background: avatarColor(name) }}>
        {name[0].toUpperCase()}
      </span>
      <div className="user-badge-info">
        <span className="user-badge-name">{name}</span>
        <span className="user-badge-meta">{unitCount} unit{unitCount !== 1 ? 's' : ''} reserved</span>
      </div>
      <button className="user-logout-btn" onClick={onLogout}>Logout</button>
    </div>
  )
}

// ── Full selector shown below the header when no user is logged in ─────────
function UserSelector({ existingUsers, onSetUser }) {
  const [newName, setNewName] = useState('')

  const handleJoin = () => {
    const name = newName.trim()
    if (name) { onSetUser(name); setNewName('') }
  }

  return (
    <div className="user-selector">
      {existingUsers.length > 0 && (
        <div className="user-selector-section">
          <span className="user-selector-label">Login as existing user</span>
          <div className="user-card-list">
            {existingUsers.map(u => (
              <button key={u.name} className="user-card" onClick={() => onSetUser(u.name)}>
                <span className="user-avatar user-avatar--sm" style={{ background: avatarColor(u.name) }}>
                  {u.name[0].toUpperCase()}
                </span>
                <span className="user-card-name">{u.name}</span>
                <span className="user-card-count">{u.count} unit{u.count !== 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="user-selector-divider">or join as new user</div>
      <div className="user-new-form">
        <input
          className="user-new-input"
          placeholder="Enter your name..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          autoFocus
        />
        <button onClick={handleJoin} disabled={!newName.trim()}>Join</button>
      </div>
    </div>
  )
}
