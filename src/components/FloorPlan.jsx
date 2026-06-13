import React, { useEffect, useRef } from 'react'
import { SVG } from '@svgdotjs/svg.js'

// Hardcoded mirrors of the CSS custom properties defined in :root (src/styles.css).
// svg.js draws imperatively and cannot read CSS variables, so these must be kept in sync.
const COLOR_PRIMARY = '#4F46E5'
const COLOR_PRIMARY_DARK = '#4338CA'
const COLOR_SUCCESS = '#16A34A'
const COLOR_SUCCESS_DARK = '#15803D'
const COLOR_WARNING = '#F59E0B'
const COLOR_DANGER = '#DC2626'
const COLOR_BORDER = '#E2E8F0'
const COLOR_BORDER_STRONG = '#CBD5E1'
const COLOR_TEXT = '#0F172A'
const COLOR_MUTED = '#475569'
const COLOR_SURFACE = '#FFFFFF'
const COLOR_SURFACE_SOFT = '#F1F5F9'
const FONT_FAMILY = 'Plus Jakarta Sans, Segoe UI, Arial'

function drawBadge(draw, cx, cy, { fill, content }) {
  const group = draw.group()
  group.circle(20).center(cx, cy).fill(fill).stroke({ color: '#fff', width: 2 })

  if (typeof content === 'number') {
    group
      .text(String(content))
      .font({ size: 11, family: FONT_FAMILY, anchor: 'middle', weight: 700 })
      .fill('#fff')
      .center(cx, cy)
  } else if (content === 'check') {
    group
      .path(`M ${cx - 5} ${cy} L ${cx - 1.5} ${cy + 4} L ${cx + 5} ${cy - 5}`)
      .stroke({ color: '#fff', width: 2.5, linecap: 'round', linejoin: 'round' })
      .fill('none')
  } else if (content === 'release') {
    group
      .path(`M ${cx - 5} ${cy} H ${cx + 5} M ${cx + 1} ${cy - 4} L ${cx + 5} ${cy} L ${cx + 1} ${cy + 4}`)
      .stroke({ color: '#fff', width: 2, linecap: 'round', linejoin: 'round' })
      .fill('none')
  }

  group.css({ 'pointer-events': 'none' })
  return group
}

export default function FloorPlan({
  levels,
  hallways,
  currentUser,
  todayISO,
  actionDate,
  flatUnits,
  unitsById,
  levelUnitsMap,
  levelViewBoxes,
  groupUnits,
  eligibleTargets,
  currentUserAllUnits,
  selectedGroupId,
  selectedTargetKeys,
  selectedOwnUnitId,
  activeLevel,
  onActiveLevelChange,
  onUnitClick,
  onToggleTarget,
}) {
  const levelHostRefs = useRef(new Map())
  const drawRefs = useRef([])
  const drawByLevelRef = useRef(new Map())
  const unitElsRef = useRef(new Map()) // id -> { rect, label }
  const targetElsRef = useRef(new Map()) // key -> svg.js element
  const cellElsRef = useRef(new Map()) // groupId -> svg.js element
  const releaseBadgeRef = useRef(null)

  // (Re)draw using svg.js
  useEffect(() => {
    const drawLevel = (levelIndex, hostEl) => {
      const viewBox = levelViewBoxes.get(levelIndex)
      if (!viewBox) return

      hostEl.innerHTML = ''
      const levelUnits = levelUnitsMap.get(levelIndex) || []
      const draw = SVG().addTo(hostEl).viewbox(viewBox).addClass('floorplan-svg-impl')
      drawRefs.current.push(draw)
      drawByLevelRef.current.set(levelIndex, draw)

      // level header band — drawn first so hallways render on top of it
      if (levelUnits.length) {
        const xs = levelUnits.map(u => [u.x, u.x + u.w]).flat()
        const ys = levelUnits.map(u => [u.y, u.y + u.h]).flat()
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
        const bandY = minY - 44
        const bandW = (maxX - minX) + padX * 2
        const bandH = (maxY - minY) + padY * 2
        const bandX = minX - padX
        const labelText = levelIndex === 0 ? 'Level 1 (Ground Floor)' : 'Level 2'

        draw
          .rect(bandW, bandH)
          .move(bandX, minY - padY)
          .radius(20)
          .fill(COLOR_SURFACE_SOFT)
          .stroke({ color: COLOR_BORDER, width: 1.5 })

        draw
          .rect(bandW, 30)
          .move(bandX, bandY)
          .radius(10)
          .fill('rgba(79, 70, 229, 0.10)')
          .stroke({ color: 'rgba(79, 70, 229, 0.25)', width: 1 })

        draw
          .text(labelText)
          .move(bandX + 14, bandY + 6)
          .font({ size: 14, family: FONT_FAMILY, anchor: 'start' })
          .fill(COLOR_TEXT)
      }

      // hallway/service zones (drawn after band so they appear on top of it)
      let serviceElements = []
      if (hallways?.length) {
        const levelHalls = hallways.filter(h => h.level === levelIndex)

        const backgrounds = levelHalls.filter(h => !h.type)
        serviceElements = levelHalls.filter(h => h.type === 'service')

        backgrounds.forEach(h => {
          const zone = draw
            .rect(h.w, h.h)
            .move(h.x, h.y)
            .fill(COLOR_SURFACE_SOFT)
            .stroke({ color: COLOR_BORDER_STRONG, width: 2, dasharray: [8, 6] })
          zone.addClass('hallway-rect')
          if (h.label) {
            draw
              .text(h.label)
              .move(h.x + 12, h.y + 10)
              .font({ size: 13, family: FONT_FAMILY, anchor: 'start' })
              .fill(COLOR_MUTED)
          }
        })
      }

      // cell boundaries (show users the 4-unit cell grouping)
      for (const [gid, g] of groupUnits.entries()) {
        if (!g.length || g[0].level !== levelIndex) continue
        const minX = Math.min(...g.map(i => i.x))
        const minY = Math.min(...g.map(i => i.y))
        const maxX = Math.max(...g.map(i => i.x + i.w))
        const maxY = Math.max(...g.map(i => i.y + i.h))
        const isSelected = gid === selectedGroupId

        const boundary = draw
          .rect(maxX - minX, maxY - minY)
          .move(minX, minY)
          .fill('transparent')
          .stroke({
            color: isSelected ? COLOR_PRIMARY : COLOR_BORDER_STRONG,
            width: isSelected ? 3 : 1.25,
            dasharray: []
          })

        cellElsRef.current.set(gid, boundary)

        // Phase 1: checkmark badge on the selected cell
        if (isSelected && currentUserAllUnits.length === 0 && eligibleTargets.some(t => t.kind === 'initial-cell')) {
          drawBadge(draw, maxX, minY, { fill: COLOR_PRIMARY, content: 'check' })
        }
      }

      // units
      levelUnits.forEach(u => {
        const occupied = !!u.owner
        const ownedByMe = u.owner === currentUser
        const pendingAvailable = !occupied && !!u.availableFrom && u.availableFrom > todayISO
        const fillColor = occupied
          ? (ownedByMe ? COLOR_PRIMARY : COLOR_MUTED)
          : pendingAvailable
            ? 'rgba(245, 158, 11, 0.35)'
            : COLOR_SURFACE
        const strokeColor = occupied
          ? COLOR_PRIMARY_DARK
          : pendingAvailable
            ? COLOR_WARNING
            : COLOR_BORDER_STRONG
        const rect = draw
          .rect(u.w, u.h)
          .move(u.x, u.y)
          .radius(4)
          .fill(fillColor)
          .stroke({ color: strokeColor, width: 1 })

        // Tooltip: show who reserved it and when, or when it becomes available
        if (occupied) {
          rect.element('title').words(`${u.owner} - reserved ${u.date ?? '-'}`)
        } else if (pendingAvailable) {
          rect.element('title').words(`Available from ${u.availableFrom}`)
        }

        rect.attr({ 'data-id': u.id })
        rect.css({ cursor: (occupied && !ownedByMe) || pendingAvailable ? 'not-allowed' : 'pointer' })

        const label = draw
          .text(u.id)
          .move(u.x + u.w / 2, u.y + u.h / 2 - 5)
          .font({ size: 10, family: FONT_FAMILY, anchor: 'middle' })
          .fill(occupied ? '#fff' : COLOR_MUTED)
          .attr({ 'pointer-events': 'none' })

        rect.on('click', () => onUnitClick(u))

        unitElsRef.current.set(u.id, { rect, label })
      })

      // draw target highlights — clipped to the target's own cell row so the box
      // never bleeds into the hallway / service zone on either floor.
      if (eligibleTargets.length) {
        const selectedOrder = [...selectedTargetKeys]
        eligibleTargets.forEach(t => {
          const items = t.unitIds.map(id => unitsById.get(id)).filter(Boolean)
          if (!items.length) return
          if (items[0].level !== levelIndex) return

          const pad = 3
          let hlX = Math.min(...items.map(i => i.x)) - pad
          let hlY = Math.min(...items.map(i => i.y)) - pad
          let hlX2 = Math.max(...items.map(i => i.x + i.w)) + pad
          let hlY2 = Math.max(...items.map(i => i.y + i.h)) + pad

          // Clip Y to the actual cell-row bounds (derived from unit positions).
          const rowCellR = items[0].cellR
          const rowUnits = (levelUnitsMap.get(levelIndex) || []).filter(u => u.cellR === rowCellR)
          if (rowUnits.length) {
            const rowMinY = Math.min(...rowUnits.map(u => u.y))
            const rowMaxY = Math.max(...rowUnits.map(u => u.y + u.h))
            hlY = Math.max(hlY, rowMinY)
            hlY2 = Math.min(hlY2, rowMaxY)
          }

          if (hlY2 <= hlY) return // clipped to nothing — skip

          const isSelTarget = selectedTargetKeys.has(t.key)

          const hl = draw
            .rect(hlX2 - hlX, hlY2 - hlY)
            .move(hlX, hlY)
            .fill(isSelTarget ? 'rgba(79, 70, 229, 0.18)' : 'rgba(79, 70, 229, 0.08)')
            .stroke({ color: COLOR_PRIMARY, width: isSelTarget ? 3 : 2, dasharray: isSelTarget ? [] : [5, 4] })

          hl.css({ cursor: 'pointer' })
          if (!isSelTarget) hl.addClass('target-pulse')

          hl.on('mouseenter', () => hl.stroke({ width: isSelTarget ? 3 : 3 }))
          hl.on('mouseleave', () => hl.stroke({ width: isSelTarget ? 3 : 2 }))
          hl.on('click', () => onToggleTarget(t.key))

          targetElsRef.current.set(t.key, hl)

          // Phase 2: numbered badge for each selected target, in selection order
          if (isSelTarget && t.kind !== 'initial-cell') {
            const order = selectedOrder.indexOf(t.key) + 1
            drawBadge(draw, hlX2, hlY, { fill: COLOR_PRIMARY, content: order })
          }
        })
      }

      // initial selected cell styling: highlight all 4 subunits if owned
      if (selectedGroupId) {
        const g = groupUnits.get(selectedGroupId) || []
        if (g.length && g[0].level === levelIndex) {
          g.forEach(x => {
            const el = unitElsRef.current.get(x.id)
            if (el) el.rect.stroke({ width: 4, color: COLOR_PRIMARY })
          })
        }
      }

      // service zones drawn last so they sit above units and highlights
      serviceElements.forEach(h => {
        const zone = draw
          .rect(h.w, h.h)
          .move(h.x, h.y)
          .radius(2)
          .fill(COLOR_SUCCESS)
          .stroke({ color: COLOR_SUCCESS_DARK, width: 2 })
          .opacity(0.4)
        zone.element('title').words('Service point')
      })
    }

    unitElsRef.current = new Map()
    targetElsRef.current = new Map()
    cellElsRef.current = new Map()
    drawByLevelRef.current = new Map()
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
      releaseBadgeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, flatUnits, levelViewBoxes, eligibleTargets, selectedTargetKeys, selectedGroupId, groupUnits, unitsById, hallways, levelUnitsMap])

  // Animate selection changes (cell selection + target selection + release selection)
  useEffect(() => {
    const map = unitElsRef.current
    const selectedUnits = new Set((groupUnits.get(selectedGroupId) || []).map(u => u.id))

    for (const [id, obj] of map.entries()) {
      const u = unitsById.get(id)
      const occupied = !!u?.owner
      const isInSelCell = selectedUnits.has(id)
      const isSelectedForRelease = id === selectedOwnUnitId

      let strokeColor = occupied ? COLOR_PRIMARY_DARK : COLOR_BORDER_STRONG
      let strokeWidth = 1
      if (isSelectedForRelease) {
        strokeColor = COLOR_DANGER
        strokeWidth = 4
      } else if (isInSelCell) {
        strokeColor = COLOR_PRIMARY
        strokeWidth = 4
      }
      obj.rect.stroke({ width: strokeWidth, color: strokeColor })
    }

    // highlight chosen targets
    for (const [key, hl] of targetElsRef.current.entries()) {
      const isSelTarget = selectedTargetKeys.has(key)
      hl.stroke({ width: isSelTarget ? 3 : 2, color: COLOR_PRIMARY })
      hl.fill(isSelTarget ? 'rgba(79, 70, 229, 0.18)' : 'rgba(79, 70, 229, 0.08)')
    }

    // highlight selected cell boundary
    for (const [gid, boundary] of cellElsRef.current.entries()) {
      const isSelected = gid === selectedGroupId
      boundary.stroke({
        color: isSelected ? COLOR_PRIMARY : COLOR_BORDER_STRONG,
        width: isSelected ? 3 : 1.25
      })
    }

    // release badge on the unit selected for release
    if (releaseBadgeRef.current) {
      try { releaseBadgeRef.current.remove() } catch { /* ignore */ }
      releaseBadgeRef.current = null
    }
    if (selectedOwnUnitId) {
      const u = unitsById.get(selectedOwnUnitId)
      const draw = u && drawByLevelRef.current.get(u.level)
      if (u && draw) {
        releaseBadgeRef.current = drawBadge(draw, u.x + u.w, u.y, { fill: COLOR_DANGER, content: 'release' })
      }
    }
  }, [selectedGroupId, selectedTargetKeys, selectedOwnUnitId, groupUnits, unitsById])

  return (
    <div className="floorplan-card">
      <div className="floor-tabs" role="tablist" aria-label="Floor levels">
        {levels.map(level => (
          <button
            key={level.level}
            role="tab"
            aria-selected={activeLevel === level.level}
            className={`floor-tab ${activeLevel === level.level ? 'floor-tab--active' : ''}`}
            onClick={() => onActiveLevelChange(level.level)}
          >
            <span className={`floorplan-level-dot floorplan-level-dot--${level.level}`} />
            {level.level === 0 ? 'Level 1 — Ground Floor' : 'Level 2 — Upper Floor'}
          </button>
        ))}
      </div>

      <div className="floorplan-levels">
        {levels.map(level => (
          <div
            key={level.level}
            className={`floorplan-level ${activeLevel === level.level ? '' : 'floorplan-level--hidden'}`}
          >
            <div
              ref={el => {
                if (el) levelHostRefs.current.set(level.level, el)
              }}
              className="floorplan-svg"
            />
          </div>
        ))}
      </div>

      <div className="legend">
        <span className="legend-item"><span className="legend-dot legend-dot--occupied" /> Occupied</span>
        <span className="legend-item"><span className="legend-dot legend-dot--available" /> Available</span>
        <span className="legend-item"><span className="legend-dot legend-dot--pending" /> Releasing soon</span>
        <span className="legend-item"><span className="legend-dot legend-dot--selected" /> Selected</span>
        <span className="legend-item"><span className="legend-dot legend-dot--service" /> Service point</span>
        <span className="legend-tip">
          {currentUserAllUnits.length === 0
            ? 'Click any cell to select it as your starting reservation.'
            : 'Click highlighted units to add them, or click your own unit to release it.'}
        </span>
      </div>
    </div>
  )
}
