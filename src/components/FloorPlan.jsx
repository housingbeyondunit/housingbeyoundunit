import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SVG } from '@svgdotjs/svg.js'
import {
  validateUpgrade,
  validateDowngrade,
  isUpgradeTargetEligible,
  areUnitsAdjacent,
  validateActionDate,
} from '../utils/reservationRules'

export default function FloorPlan({ levels, hallways, onUpdateUnit, currentUser, resetApp }) {
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [selectedTargetKey, setSelectedTargetKey] = useState(null)
  const [selectedOwnUnitId, setSelectedOwnUnitId] = useState(null)
  const [confirm, setConfirm] = useState(null)

  // Single action date — written into every reserve / release action.
  const todayISO = new Date().toISOString().split('T')[0]
  const [actionDate, setActionDate] = useState(todayISO)

  const levelHostRefs = useRef(new Map())
  const drawRefs = useRef([])
  const unitElsRef = useRef(new Map()) // id -> { rect, label }
  const targetElsRef = useRef(new Map()) // key -> svg.js element
  const cellElsRef = useRef(new Map()) // groupId -> svg.js element

  const flatUnits = useMemo(() => levels.flatMap(level => level.units), [levels])
  const unitsById = useMemo(() => new Map(flatUnits.map(u => [u.id, u])), [flatUnits])
  const levelUnitsMap = useMemo(() => new Map(levels.map(level => [level.level, level.units])), [levels])

  // Units the current user currently owns
  const currentUserAllUnits = useMemo(
    () => flatUnits.filter(u => u.owner === currentUser),
    [flatUnits, currentUser]
  )

  // Rows that already have at least one tenant — keyed as "level-cellR"
  const registeredRows = useMemo(() => {
    const s = new Set()
    for (const u of flatUnits) if (u.owner) s.add(`${u.level}-${u.cellR}`)
    return s
  }, [flatUnits])

  const selectUnit = u => {
    setSelectedGroupId(u.groupId || null)
    setSelectedTargetKey(null)
    setSelectedOwnUnitId(null)
  }

  const groupUnits = useMemo(() => {
    const m = new Map()
    for (const u of flatUnits) {
      const key = u.groupId
      if (!m.has(key)) m.set(key, [])
      m.get(key).push(u)
    }
    return m
  }, [flatUnits])

  const getGroupOwner = (groupId) => {
    const g = groupUnits.get(groupId) || []
    // group is owned only if *all 4* subunits have the same owner
    const owners = new Set(g.map(x => x.owner).filter(Boolean))
    if (owners.size !== 1) return null
    const owner = [...owners][0]
    if (g.every(x => x.owner === owner)) return owner
    return null
  }

  const isFullCellOwnedByUser = (groupId) => getGroupOwner(groupId) === currentUser

  const eligibleTargets = useMemo(() => {
    if (!currentUser) return []

    // ── PHASE 1: INITIAL RESERVATION (user has no units yet) ─────────────────
    // Rules:
    //  • Only allow starting in a row that already has at least one tenant.
    //  • Only offer the pair that faces AWAY from the hallway/service area:
    //      CR0 → top pair (Q0+Q1)   — bottom (Q2+Q3) overlaps the service bar
    //      CR1 → bottom pair (Q2+Q3) — top (Q0+Q1) overlaps the service bar
    if (currentUserAllUnits.length === 0) {
      if (!selectedGroupId) return []
      const g = groupUnits.get(selectedGroupId) || []
      if (!g.length) return []

      const cellLevel = g[0].level
      const cellRow   = g[0].cellR // 0 = top-row cells, 1 = bottom-row cells

      // Row must have at least one existing tenant before new users can register there
      const rowIsRegistered = flatUnits.some(
        u => u.owner && u.level === cellLevel && u.cellR === cellRow
      )
      if (!rowIsRegistered) return []

      // Offer only the outward-facing pair (away from the hallway)
      if (cellRow === 0) {
        // Top-row cell → top pair (Q0+Q1) faces outward; Q2+Q3 would face the hallway
        const topPair = [g.find(u => u.q === 0), g.find(u => u.q === 1)].filter(Boolean)
        if (topPair.length === 2 && topPair.every(u => !u.owner)) {
          return [{
            key: `INIT:${selectedGroupId}:top`,
            kind: 'initial-pair',
            label: `${selectedGroupId} — top pair`,
            unitIds: topPair.map(u => u.id),
            distance: 0,
            pairRow: 'top'
          }]
        }
      } else {
        // Bottom-row cell → bottom pair (Q2+Q3) faces outward; Q0+Q1 would face the hallway
        const botPair = [g.find(u => u.q === 2), g.find(u => u.q === 3)].filter(Boolean)
        if (botPair.length === 2 && botPair.every(u => !u.owner)) {
          return [{
            key: `INIT:${selectedGroupId}:bot`,
            kind: 'initial-pair',
            label: `${selectedGroupId} — bottom pair`,
            unitIds: botPair.map(u => u.id),
            distance: 0,
            pairRow: 'bottom'
          }]
        }
      }
      return []
    }

    // ── PHASE 2: EXTENSION ───────────────────────────────────────────────────
    // Below 4 units total → must add 2 at a time (enumerate adjacent empty pairs).
    // At 4 or more units → add 1 at a time.
    const userLevels = new Set(currentUserAllUnits.map(u => u.level))
    const userCx = currentUserAllUnits.reduce((s, u) => s + u.x + u.w / 2, 0) / currentUserAllUnits.length
    const userCy = currentUserAllUnits.reduce((s, u) => s + u.y + u.h / 2, 0) / currentUserAllUnits.length

    const targets = []

    if (currentUserAllUnits.length < 4) {
      // ── Pair mode: add 2 adjacent empty units (registered rows only) ────────
      const emptyUnits = flatUnits.filter(u => !u.owner && registeredRows.has(`${u.level}-${u.cellR}`))
      for (let i = 0; i < emptyUnits.length; i++) {
        for (let j = i + 1; j < emptyUnits.length; j++) {
          const a = emptyUnits[i]
          const b = emptyUnits[j]
          if (!areUnitsAdjacent(a, b)) continue
          if (!isUpgradeTargetEligible(currentUserAllUnits, [a, b])) continue

          const cx = (a.x + a.w / 2 + b.x + b.w / 2) / 2
          const cy = (a.y + a.h / 2 + b.y + b.h / 2) / 2

          let label, pairRow
          if (a.groupId === b.groupId) {
            pairRow = [0, 1].includes(a.q) && [0, 1].includes(b.q) ? 'top' : 'bottom'
            label = `${a.groupId} — ${pairRow}`
          } else {
            pairRow = null
            label = `${a.id} + ${b.id}`
          }

          targets.push({
            key: `PAIR:${[a.id, b.id].sort().join('|')}`,
            kind: userLevels.has(a.level) && userLevels.has(b.level) ? 'same-level' : 'cross-floor',
            label,
            unitIds: [a.id, b.id],
            distance: Math.round(Math.hypot(cx - userCx, cy - userCy)),
            pairRow
          })
        }
      }
    } else {
      // ── Single-unit mode: add 1 empty adjacent unit (registered rows only) ─
      for (const u of flatUnits) {
        if (u.owner) continue
        if (!registeredRows.has(`${u.level}-${u.cellR}`)) continue
        if (!isUpgradeTargetEligible(currentUserAllUnits, [u])) continue
        const cx = u.x + u.w / 2
        const cy = u.y + u.h / 2
        targets.push({
          key: `U:${u.id}`,
          kind: userLevels.has(u.level) ? 'same-level' : 'cross-floor',
          label: u.id,
          unitIds: [u.id],
          distance: Math.round(Math.hypot(cx - userCx, cy - userCy))
        })
      }
    }

    return targets.sort((a, b) => a.distance - b.distance)
  }, [currentUser, currentUserAllUnits, selectedGroupId, flatUnits, groupUnits, registeredRows])

  const submitAction = () => {
    if (!currentUser) return alert('Please set your user name first')
    const dateErrors = validateActionDate(actionDate)
    if (dateErrors.length) return alert('Invalid date:\n\n• ' + dateErrors.join('\n• '))

    if (currentUserAllUnits.length === 0) {
      // Phase 1: initial pair reservation (top or bottom pair of the selected cell)
      if (!selectedGroupId) return alert('Click any cell on the floor plan to select your starting location')
      if (!eligibleTargets.length) return alert('No available pairs in this cell. Pick another one.')
      const pairTarget = eligibleTargets.find(t => t.key === selectedTargetKey && t.kind === 'initial-pair')
        || eligibleTargets.find(t => t.kind === 'initial-pair')
      if (!pairTarget) return alert('No available pairs in this cell. Pick another one.')
      setSelectedTargetKey(pairTarget.key)
      setConfirm({ isInitial: true, target: pairTarget })
    } else {
      // Phase 2: pair addition (< 4 units) or single-unit addition (≥ 4 units)
      const isPairMode = currentUserAllUnits.length < 4
      if (!eligibleTargets.length) return alert(
        isPairMode ? 'No adjacent pair available to add.' : 'No adjacent empty units available to add.'
      )
      const target = eligibleTargets.find(t => t.key === selectedTargetKey) || eligibleTargets[0]
      const targetUnits = target.unitIds.map(id => unitsById.get(id)).filter(Boolean)
      const errors = validateUpgrade(currentUserAllUnits, targetUnits)
      if (errors.length) return alert(
        `Cannot add ${targetUnits.length > 1 ? 'pair' : 'unit'}:\n\n• ` + errors.join('\n• ')
      )
      setSelectedTargetKey(target.key)
      setConfirm({ isInitial: false, target })
    }
  }

  const submitRelease = () => {
    if (!selectedOwnUnitId) return
    const errors = validateDowngrade(currentUserAllUnits, selectedOwnUnitId)
    if (errors.length) return alert('Release not allowed:\n\n• ' + errors.join('\n• '))
    setConfirm({ isRelease: true, unitId: selectedOwnUnitId, label: selectedOwnUnitId })
  }

  const toggleClaim = u => {
    if (!currentUser) return alert('Set your user name to claim a unit')
    if (!u.owner) {
      // Debug claim: enforce registered-row check and connectivity rules.
      if (!registeredRows.has(`${u.level}-${u.cellR}`)) {
        return alert('Cannot claim: this row has no existing reservations.')
      }
      if (currentUserAllUnits.length > 0) {
        const errors = validateUpgrade(currentUserAllUnits, [u])
        if (errors.length) return alert('Cannot claim:\n\n• ' + errors.join('\n• '))
      }
      onUpdateUnit(u.id, { owner: currentUser, date: actionDate })
    } else if (u.owner === currentUser) {
      // Releasing (downgrade): validate all rules before allowing the release
      const errors = validateDowngrade(currentUserAllUnits, u.id)
      if (errors.length) return alert('Release not allowed:\n\n• ' + errors.join('\n• '))
      onUpdateUnit(u.id, { owner: null })
    } else {
      alert('This unit is owned by ' + u.owner)
    }
  }

  // Calculate viewBox size based on units extents
  const levelViewBoxes = useMemo(() => {
    const map = new Map()
    levels.forEach(level => {
      const padding = level.level === 0 ? 120 : 80
      const units = level.units
      const levelHalls = (hallways || []).filter(h => h.level === level.level)
      if (!units.length && !levelHalls.length) return

      const xs = []
      const ys = []
      units.forEach(u => {
        xs.push(u.x, u.x + u.w)
        ys.push(u.y, u.y + u.h)
      })
      levelHalls.forEach(h => {
        xs.push(h.x, h.x + h.w)
        ys.push(h.y, h.y + h.h)
      })

      const minX = Math.max(0, Math.min(...xs) - padding)
      const minY = Math.max(0,Math.min(...ys) - padding)
      const maxX = Math.max(...xs) + padding
      const maxY = Math.max(...ys) + padding
      map.set(level.level, `${minX} ${minY} ${maxX - minX} ${maxY - minY}`)
    })
    return map
  }, [levels, hallways])

  // (Re)draw using svg.js
  useEffect(() => {
    const drawLevel = (levelIndex, hostEl) => {
      const viewBox = levelViewBoxes.get(levelIndex)
      if (!viewBox) return

      hostEl.innerHTML = ''
      const levelUnits = levelUnitsMap.get(levelIndex) || []
      const draw = SVG().addTo(hostEl).viewbox(viewBox).addClass('floorplan-svg-impl')
      drawRefs.current.push(draw)

      // level header band — drawn first so hallways render on top of it
      if (levelUnits.length) {
        const xs = levelUnits.map(u => [u.x, u.x + u.w]).flat()
        const ys = levelUnits.map(u => [u.y, u.y + u.h]).flat()
        // include hallways so minY reaches the top hallway on levels that have one
        ;(hallways || []).filter(h => h.level === levelIndex).forEach(h => {
          xs.push(h.x, h.x + h.w)
          ys.push(h.y, h.y + h.h)
        })
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        const maxX = Math.max(...xs)
        const maxY = Math.max(...ys)
        const padX = 30
        const padY = 50
        const topSpacing = levelIndex === 0 ? 28 : 0
        const bandY = minY - 44
        const bandW = (maxX - minX) + padX * 2
        const bandH = (maxY - minY) + padY * 2
        const bandX = minX - padX
        const labelText = levelIndex === 0 ? 'Level 1 (Ground Floor)' : 'Level 2'

        draw
          .rect(bandW, bandH)
          .move(bandX, minY - padY)
          .radius(20)
          // .fill(levelIndex === 0 ? 'rgba(220,235,250,0.65)' : 'rgba(230,235,245,0.7)')
          .fill('rgba(230,235,245,0.7)')
          .stroke({ color: 'rgba(30,40,60,0.35)', width: 1 })

        draw
          .rect(bandW, 30)
          .move(bandX, bandY)
          .radius(10)
          .fill('rgba(40,120,200,0.32)')
          .stroke({ color: 'rgba(40,60,80,0.55)', width: 1 })

        draw
          .text(labelText)
          .move(bandX + 14, bandY + 6)
          .font({ size: 14, family: 'Inter, Segoe UI, Arial', anchor: 'start' })
          .fill('rgba(25,35,55,0.9)')
      }

      // hallway/service zones (drawn after band so they appear on top of it)
      if (hallways?.length) {
        const levelHalls = hallways.filter(h => h.level === levelIndex)

        // Draw hallway backgrounds first, then service elements on top
        const backgrounds = levelHalls.filter(h => !h.type)
        const elements = levelHalls.filter(h => h.type === 'service')

        backgrounds.forEach(h => {
          const zone = draw
            .rect(h.w, h.h)
            .move(h.x, h.y)
            // .radius(14)
            .fill('#DCDCDC')
            .stroke({ color: '#DCDCDC', width: 2, dasharray: [8, 6] })
          zone.addClass('hallway-rect')
          if (h.label) {
            draw
              .text(h.label)
              .move(h.x + 12, h.y + 10)
              .font({ size: 13, family: 'Inter, Segoe UI, Arial', anchor: 'start' })
              .fill('rgba(0, 0, 0, 0.9)')
          }
        })

        elements.forEach(h => {
          draw
            .rect(h.w, h.h)
            .move(h.x, h.y)
            .radius(2)
            .fill('#00a878')
            .stroke({ color: '#007a56', width: 2 })
        })
      }

      // cell boundaries (show users the 4-unit cell grouping)
      for (const [gid, g] of groupUnits.entries()) {
        if (!g.length || g[0].level !== levelIndex) continue
        const minX = Math.min(...g.map(i => i.x))
        const minY = Math.min(...g.map(i => i.y))
        const maxX = Math.max(...g.map(i => i.x + i.w))
        const maxY = Math.max(...g.map(i => i.y + i.h))
        const pad = 0
        const isSelected = gid === selectedGroupId

        const boundary = draw
          .rect((maxX - minX) + pad * 2, (maxY - minY) + pad * 2)
          .move(minX - pad, minY - pad)
          // .radius(14)
          .fill('transparent')
          .stroke({
            color: isSelected ? '#ff8a00' : 'rgba(0,0,0,0.15)',
            width: isSelected ? 3 : 1,
            dasharray: []
          })

        cellElsRef.current.set(gid, boundary)
      }

      // units
      levelUnits.forEach(u => {
        const occupied = !!u.owner
        const ownedByMe = u.owner === currentUser
        const rect = draw
          .rect(u.w, u.h)
          .move(u.x, u.y)
          .radius(0)
          .fill(occupied ? 'rgba(30, 30, 30, 0.58)' : 'rgba(255, 255, 255, 0.35)')
          .stroke({ color: '#0000003b', width: 1 })

        // Tooltip: show who reserved it and when
        if (occupied) {
          rect.element('title').words(`${u.owner}  •  reserved ${u.date ?? '—'}`)
        }

        rect.attr({ 'data-id': u.id })
        rect.css({ cursor: (occupied && !ownedByMe) ? 'not-allowed' : 'pointer' })

        // const label = draw
        //   .text(u.id)
        //   .move(u.x + 10, u.y + 10)
        //   .font({ size: 14, family: 'Inter, Segoe UI, Arial', anchor: 'start' })
        //   .fill(occupied ? '#fff' : '#222')
        const label = null

        // hover animations
        // rect.on('mouseenter', () => {
        //   rect.stroke({ width: 3, color: occupied ? '#111' : '#ff8a00' })
        // })
        // rect.on('mouseleave', () => {
        //   const isInSelCell = selectedGroupId && u.groupId === selectedGroupId
        //   rect.stroke({ width: isInSelCell ? 2 : 1, color: occupied ? '#000' : '#000000' })
        // })

        // click handlers
        rect.on('click', () => {
          // Units reserved by other users are fully non-interactive
          if (u.owner && u.owner !== currentUser) return

          if (currentUserAllUnits.length === 0) {
            // Phase 1: toggle group selection — click again to deselect
            if (u.groupId === selectedGroupId) {
              setSelectedGroupId(null)
              setSelectedTargetKey(null)
            } else {
              selectUnit(u)
            }
          } else if (!u.owner) {
            // Phase 2: toggle the eligible target containing this unit
            if (currentUserAllUnits.length >= 4) {
              const key = `U:${u.id}`
              if (eligibleTargets.some(t => t.key === key)) {
                setSelectedTargetKey(prev => prev === key ? null : key)
              }
            } else {
              const pair = eligibleTargets.find(t => t.unitIds.includes(u.id))
              if (pair) {
                setSelectedTargetKey(prev => prev === pair.key ? null : pair.key)
              }
            }
            setSelectedGroupId(u.groupId || null)
            setSelectedOwnUnitId(null)
          } else {
            // Own unit → toggle release selection; click again to deselect
            if (u.id === selectedOwnUnitId) {
              setSelectedOwnUnitId(null)
              setSelectedGroupId(null)
            } else {
              setSelectedOwnUnitId(u.id)
              setSelectedGroupId(u.groupId || null)
              setSelectedTargetKey(null)
            }
          }
        })
        rect.on('dblclick', e => {
          e.preventDefault()
          if (u.owner && u.owner !== currentUser) return
          toggleClaim(u)
        })

        unitElsRef.current.set(u.id, { rect, label })
      })

      // draw target highlights — clipped to the target's own cell row so the box
      // never bleeds into the hallway / service zone on either floor.
      if (eligibleTargets.length) {
        eligibleTargets.forEach(t => {
          const items = t.unitIds.map(id => unitsById.get(id)).filter(Boolean)
          if (!items.length) return
          if (items[0].level !== levelIndex) return

          const pad = 3
          let hlX  = Math.min(...items.map(i => i.x)) - pad
          let hlY  = Math.min(...items.map(i => i.y)) - pad
          let hlX2 = Math.max(...items.map(i => i.x + i.w)) + pad
          let hlY2 = Math.max(...items.map(i => i.y + i.h)) + pad

          // Clip Y to the actual cell-row bounds (derived from unit positions).
          // This is level-structure-agnostic — works the same for Level 0 and Level 1.
          const rowCellR = items[0].cellR
          const rowUnits = (levelUnitsMap.get(levelIndex) || []).filter(u => u.cellR === rowCellR)
          if (rowUnits.length) {
            const rowMinY = Math.min(...rowUnits.map(u => u.y))
            const rowMaxY = Math.max(...rowUnits.map(u => u.y + u.h))
            hlY  = Math.max(hlY,  rowMinY)
            hlY2 = Math.min(hlY2, rowMaxY)
          }

          if (hlY2 <= hlY) return // clipped to nothing — skip

          const hl = draw
            .rect(hlX2 - hlX, hlY2 - hlY)
            .move(hlX, hlY)
            .fill('rgba(245,158,11,0.10)')
            .stroke({ color: '#f59e0b', width: 2, dasharray: [5, 4] })

          hl.css({ cursor: 'pointer' })
          hl.on('mouseenter', () => hl.stroke({ width: 4 }))
          hl.on('mouseleave', () => hl.stroke({ width: selectedTargetKey === t.key ? 5 : 2 }))
          hl.on('click', () => {
            setSelectedTargetKey(prev => prev === t.key ? null : t.key)
          })

          targetElsRef.current.set(t.key, hl)
        })
      }

      // initial selected cell styling: highlight all 4 subunits if owned
      if (selectedGroupId) {
        const g = groupUnits.get(selectedGroupId) || []
        if (g.length && g[0].level === levelIndex) {
          g.forEach(x => {
            const el = unitElsRef.current.get(x.id)
            if (el) el.rect.stroke({ width: 4, color: '#ff8a00' })
          })
        }
      }
    }

    unitElsRef.current = new Map()
    targetElsRef.current = new Map()
    cellElsRef.current = new Map()
    drawRefs.current = []

    levels.forEach(level => {
      const hostEl = levelHostRefs.current.get(level.level)
      if (hostEl) drawLevel(level.level, hostEl)
    })

    return () => {
      drawRefs.current.forEach(d => {
        try { d.clear() } catch { /* ignore */ }
      })
      drawRefs.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, flatUnits, levelViewBoxes, eligibleTargets, selectedTargetKey, selectedGroupId, groupUnits, unitsById, hallways, levelUnitsMap])

  // Animate selection changes (cell selection + target selection + release selection)
  useEffect(() => {
    const map = unitElsRef.current
    const selectedUnits = new Set((groupUnits.get(selectedGroupId) || []).map(u => u.id))

    for (const [id, obj] of map.entries()) {
      const u = unitsById.get(id)
      const occupied = !!u?.owner
      const isInSelCell = selectedUnits.has(id)
      const isSelectedForRelease = id === selectedOwnUnitId

      let strokeColor = occupied ? '#0000003b' : '#0000003b'
      let strokeWidth = 1
      if (isSelectedForRelease) {
        strokeColor = '#e74c3c'
        strokeWidth = 4
      } else if (isInSelCell) {
        strokeColor = '#ff8a00'
        strokeWidth = 4
      }
      obj.rect.stroke({ width: strokeWidth, color: strokeColor })
    }

    // highlight chosen target
    for (const [key, hl] of targetElsRef.current.entries()) {
      const isSelTarget = key === selectedTargetKey
      hl.stroke({ width: isSelTarget ? 5 : 2 })
      hl.fill({ opacity: isSelTarget ? 0.22 : 0.10 })
    }

    // highlight selected cell boundary
    for (const [gid, boundary] of cellElsRef.current.entries()) {
      const isSelected = gid === selectedGroupId
      boundary.stroke({
        color: isSelected ? '#ff8a00' : 'rgba(0,0,0,0.15)',
        width: isSelected ? 3 : 1
      })
    }
  }, [selectedGroupId, selectedTargetKey, selectedOwnUnitId, groupUnits, unitsById])

  return (
    <div className="floorplan-wrap">
      <div className="layout">
        <div className="floorplan-levels">
          {levels.map(level => (
            <div key={level.level} className="floorplan-level">
              <div
                ref={el => {
                  if (el) levelHostRefs.current.set(level.level, el)
                }}
                className="floorplan-svg"
              />
            </div>
          ))}
        </div>

        <aside className="sidepanel">
          {/* ── Action date ───────────────────────────────────────── */}
          <div className="sidepanel-title">Action date</div>
          <div className="date-picker-row">
            <label className="date-field">
              <span>Date</span>
              <input type="date" value={actionDate} min={todayISO}
                onChange={e => setActionDate(e.target.value)} />
            </label>
          </div>

          {/* ── Action section ────────────────────────────────────── */}
          <div className="sidepanel-title" style={{marginTop: 14}}>
            {currentUserAllUnits.length === 0
              ? 'New reservation'
              : currentUserAllUnits.length < 4
              ? 'Extend reservation (+2 units)'
              : 'Add a unit'}
          </div>

          {!currentUser && (
            <div className="sidepanel-hint">Set your user name to make a reservation.</div>
          )}
          {currentUser && currentUserAllUnits.length === 0 && !selectedGroupId && (
            <div className="sidepanel-hint">Click any cell to pick your starting location (minimum 2 units).</div>
          )}
          {currentUser && currentUserAllUnits.length === 0 && selectedGroupId && eligibleTargets.length === 0 && (() => {
            const g = groupUnits.get(selectedGroupId) || []
            const cellLevel = g[0]?.level
            const cellRow   = g[0]?.cellR
            const rowRegistered = flatUnits.some(u => u.owner && u.level === cellLevel && u.cellR === cellRow)
            return rowRegistered
              ? <div className="sidepanel-hint">The available pair in this cell is occupied. Pick another cell in the same row.</div>
              : <div className="sidepanel-hint">This row has no existing reservations yet — new registrations are not permitted here. Choose a cell in a registered row.</div>
          })()}
          {currentUser && currentUserAllUnits.length === 0 && selectedGroupId && eligibleTargets.length > 0 && (
            <div className="sidepanel-hint">Choose top or bottom pair, then click <strong>Reserve Pair</strong>.</div>
          )}
          {currentUser && currentUserAllUnits.length > 0 && currentUserAllUnits.length < 4 && eligibleTargets.length === 0 && (
            <div className="sidepanel-hint">No adjacent pairs available. Check a different direction.</div>
          )}
          {currentUser && currentUserAllUnits.length > 0 && currentUserAllUnits.length < 4 && eligibleTargets.length > 0 && (
            <div className="sidepanel-hint">
              Pick a pair below to reach {currentUserAllUnits.length + 2} units, then you can add one at a time.
            </div>
          )}
          {currentUser && currentUserAllUnits.length >= 4 && eligibleTargets.length === 0 && (
            <div className="sidepanel-hint">No adjacent empty units available.</div>
          )}

          {eligibleTargets.length > 0 && (
            <div className="target-list">
              {eligibleTargets.map(t => (
                <button
                  key={t.key}
                  className={`target-item ${t.key === selectedTargetKey ? 'active' : ''}`}
                  onClick={() => setSelectedTargetKey(t.key)}
                >
                  <div className="target-main">
                    <div className="target-label">{t.label}</div>
                    <div className="target-meta">
                      {t.unitIds.length > 1 && (
                        <span className="pill">
                          {t.pairRow ? `2 units · ${t.pairRow}` : '2 units'}
                        </span>
                      )}
                      <span className="pill">
                        {t.kind === 'cross-floor' ? 'cross-floor' : 'same level'}
                      </span>
                      <span className="pill">dist {t.distance}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Release section — shown when user has clicked one of their own units */}
          {currentUser && selectedOwnUnitId && currentUserAllUnits.some(u => u.id === selectedOwnUnitId) && (
            <div className="release-section">
              <div className="sidepanel-title" style={{color:'#c0392b', marginTop: 12}}>Release unit</div>
              <div className="sidepanel-hint">
                Selected: <strong>{selectedOwnUnitId}</strong>
              </div>
              {(() => {
                const errors = validateDowngrade(currentUserAllUnits, selectedOwnUnitId)
                return errors.length > 0
                  ? errors.map((e, i) => (
                      <div key={i} className="sidepanel-hint" style={{color:'#c0392b'}}>⚠ {e}</div>
                    ))
                  : <button className="release-btn" onClick={submitRelease}>Release This Unit</button>
              })()}
            </div>
          )}
        </aside>
      </div>

      <div className="controls">
        <button
          onClick={submitAction}
          disabled={!currentUser || (currentUserAllUnits.length === 0 ? !selectedGroupId : !eligibleTargets.length)}
        >
          {currentUserAllUnits.length === 0
            ? 'Reserve Pair'
            : currentUserAllUnits.length < 4
            ? 'Add Pair'
            : 'Add Unit'}
        </button>
        <button
          onClick={submitRelease}
          disabled={!selectedOwnUnitId || !currentUserAllUnits.some(u => u.id === selectedOwnUnitId)}
          style={selectedOwnUnitId && currentUserAllUnits.some(u => u.id === selectedOwnUnitId) ? {background:'#c0392b', color:'#fff', borderColor:'#a93226'} : {}}
        >
          Release Unit
        </button>
        <button onClick={() => { resetApp() }}>Reset</button>
      </div>

      <div className="legend">
        <div><span className="box filled"/> Occupied</div>
        <div><span className="box"/> Available</div>
        <div><span className="box selected"/> Selected</div>
        <div style={{marginLeft:12}}>
          {currentUserAllUnits.length === 0
            ? 'Tip: click a cell, choose top or bottom pair from the panel, then click "Reserve Pair".'
            : 'Tip: click an adjacent empty unit (any registered row) to add it. Click your own unit then "Release Unit" to remove it.'}
        </div>
      </div>

      {confirm && (
        <div className="modal-overlay">
          <div className="modal">
            {(() => {
              const addCount = confirm.target?.unitIds?.length ?? 1
              return (<>
                <h3>
                  {confirm.isRelease ? 'Confirm release'
                    : confirm.isInitial ? 'Confirm reservation'
                    : `Confirm add ${addCount > 1 ? addCount + ' units' : 'unit'}`}
                </h3>
                <p>
                  {confirm.isRelease
                    ? <>Release unit <strong>{confirm.label}</strong> on <strong>{actionDate}</strong>?</>
                    : confirm.isInitial
                      ? <>Reserve <strong>{confirm.target.label}</strong> (2 units) on <strong>{actionDate}</strong>?</>
                      : <>Add <strong>{confirm.target.label}</strong>{addCount > 1 ? ` (${addCount} units)` : ''} on <strong>{actionDate}</strong>?</>
                  }
                </p>
              </>)
            })()}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={() => setConfirm(null)}>Cancel</button>
              <button onClick={() => {
                if (confirm.isRelease) {
                  const errors = validateDowngrade(currentUserAllUnits, confirm.unitId)
                  if (errors.length) {
                    setConfirm(null)
                    return alert('No longer valid:\n\n• ' + errors.join('\n• '))
                  }
                  onUpdateUnit(confirm.unitId, { owner: null, date: null })
                  setSelectedOwnUnitId(null)
                } else if (confirm.isInitial) {
                  confirm.target.unitIds.forEach(id => onUpdateUnit(id, { owner: currentUser, date: actionDate }))
                } else {
                  const targetUnits = confirm.target.unitIds.map(id => unitsById.get(id)).filter(Boolean)
                  const errors = validateUpgrade(currentUserAllUnits, targetUnits)
                  if (errors.length) {
                    setConfirm(null)
                    return alert('No longer valid:\n\n• ' + errors.join('\n• '))
                  }
                  confirm.target.unitIds.forEach(id => onUpdateUnit(id, { owner: currentUser, date: actionDate }))
                }
                setConfirm(null)
                setSelectedGroupId(null)
                setSelectedTargetKey(null)
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
