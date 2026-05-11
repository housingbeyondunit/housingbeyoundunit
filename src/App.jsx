import React, { useState, useEffect } from 'react'
import FloorPlan from './components/FloorPlan'

// Minimal in-memory data model with localStorage persistence
const STORAGE_KEY = 'fp_demo_state_v1'
const USER_KEY = 'fp_demo_user_v1'

const defaultUnits = () => {
  // Each big "cell" is composed of 4 sub-units (2x2). Upgrades operate on
  // groups (2 sub-units) and owning a full cell initially (4 sub-units).
  //
  // We'll model an apartment grid as `cellRows` x `cellCols` cells per level.
  // Each cell expands to 2x2 subunits.
  const cellCols = 4
  const cellRows = 2
  const units = []

  const cellW = 220
  const cellH = 160
  const startX = 60
  const gapX = 20
  const gapY = 40
  const levelYOffset = 360

  const subCols = 2
  const subRows = 2
  const subPadding = 6
  const subGap = 6

  for (let level = 0; level < 2; level++) {
    for (let cr = 0; cr < cellRows; cr++) {
      for (let cc = 0; cc < cellCols; cc++) {
        const cellId = `L${level}-CR${cr}-CC${cc}`
        const cellX = startX + cc * (cellW + gapX)
        const cellY = 40 + level * levelYOffset + cr * (cellH + gapY)

        const subW = (cellW - subPadding * 2 - subGap) / subCols
        const subH = (cellH - subPadding * 2 - subGap) / subRows

        for (let sr = 0; sr < subRows; sr++) {
          for (let sc = 0; sc < subCols; sc++) {
            const quadrant = sr * 2 + sc // 0..3
            const id = `${cellId}-Q${quadrant}`
            const x = cellX + subPadding + sc * (subW + subGap)
            const y = cellY + subPadding + sr * (subH + subGap)
            units.push({
              id,
              level,
              cellR: cr,
              cellC: cc,
              groupId: cellId,
              q: quadrant,
              owner: null,
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

  // Demo seed: each "user" owns an entire cell (4 sub-units)
  const seedCellOwner = (level, cellR, cellC, owner) => {
    for (const u of units) {
      if (u.level === level && u.cellR === cellR && u.cellC === cellC) u.owner = owner
    }
  }
  seedCellOwner(0, 0, 0, 'alice')
  seedCellOwner(0, 1, 1, 'bob')
  seedCellOwner(1, 0, 2, 'charlie')

  return units
}

export default function App() {
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    const u = defaultUnits()
    return { units: u }
  })

  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem(USER_KEY) || ''
  })

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
      units: s.units.map(u => (u.id === id ? { ...u, ...patch } : u))
    }))
  }

  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ units: defaultUnits() })
  }

  return (
    <div className="app">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Floor Plan Booking (Demo)</h1>
        <div>
          {currentUser ? (
            <div>
              <span style={{marginRight:8}}>User: <strong>{currentUser}</strong></span>
              <button onClick={() => setCurrentUser('')}>Logout</button>
            </div>
          ) : (
            <UserLogin onSetUser={setCurrentUser} />
          )}
        </div>
      </div>

  <p>Each big cell is 4 small squares. You must own all 4 to start, then you can extend by +2 squares (same level or above/below).</p>
      <FloorPlan units={state.units} onUpdateUnit={updateUnit} currentUser={currentUser} resetApp={resetState} />
    </div>
  )
}

function UserLogin({ onSetUser }) {
  const [name, setName] = useState('')
  return (
    <span>
      <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => name && onSetUser(name)}>Set User</button>
    </span>
  )
}
