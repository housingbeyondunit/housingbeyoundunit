import React, { useMemo, useState } from 'react'
import FloorPlan from './FloorPlan'
import FurnitureGrid from './FurnitureGrid'
import {
  validateUpgrade,
  validateDowngrade,
  isUpgradeTargetEligible,
  validateActionDate,
} from '../utils/reservationRules'

const STEPS = [
  { id: 1, label: 'Choose Date & Unit' },
  { id: 2, label: 'Add Furniture' },
  { id: 3, label: 'Confirm Reservation' },
]

export default function BookingWizard({ levels, hallways, onUpdateUnit, currentUser, resetApp }) {
  const todayISO = new Date().toISOString().split('T')[0]

  const [actionDate, setActionDate] = useState(todayISO)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [selectedTargetKeys, setSelectedTargetKeys] = useState(new Set())
  const [selectedOwnUnitId, setSelectedOwnUnitId] = useState(null)
  const [pendingFurniture, setPendingFurniture] = useState([])
  const [notification, setNotification] = useState(null)
  const [releaseConfirm, setReleaseConfirm] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)

  const flatUnits = useMemo(() => levels.flatMap(level => level.units), [levels])
  const unitsById = useMemo(() => new Map(flatUnits.map(u => [u.id, u])), [flatUnits])
  const levelUnitsMap = useMemo(() => new Map(levels.map(level => [level.level, level.units])), [levels])

  const planStats = useMemo(() => {
    const occupied = flatUnits.filter(u => u.owner).length
    const ownedByCurrentUser = currentUser
      ? flatUnits.filter(u => u.owner === currentUser).length
      : 0

    return {
      total: flatUnits.length,
      available: flatUnits.length - occupied,
      occupied,
      ownedByCurrentUser,
    }
  }, [flatUnits, currentUser])

  const currentUserAllUnits = useMemo(
    () => flatUnits.filter(u => u.owner === currentUser),
    [flatUnits, currentUser]
  )

  const registeredRows = useMemo(() => {
    const s = new Set()
    for (const u of flatUnits) if (u.owner || u.availableFrom) s.add(`${u.level}-${u.cellR}`)
    return s
  }, [flatUnits])

  const pendingActions = useMemo(() => {
    const groups = new Map()
    flatUnits.forEach(u => {
      if (u.owner && u.date && u.date > todayISO) {
        const key = `reserve:${u.owner}:${u.date}:${u.groupId}`
        if (!groups.has(key)) groups.set(key, { type: 'reserve', user: u.owner, date: u.date, groupId: u.groupId, qs: [] })
        groups.get(key).qs.push(u.q)
      }
      if (!u.owner && u.availableFrom && u.availableFrom > todayISO) {
        const key = `release:${u.releasedBy ?? ''}:${u.availableFrom}:${u.groupId}`
        if (!groups.has(key)) groups.set(key, { type: 'release', user: u.releasedBy || '—', date: u.availableFrom, groupId: u.groupId, qs: [] })
        groups.get(key).qs.push(u.q)
      }
    })
    return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type))
  }, [flatUnits, todayISO])

  const groupUnits = useMemo(() => {
    const m = new Map()
    for (const u of flatUnits) {
      const key = u.groupId
      if (!m.has(key)) m.set(key, [])
      m.get(key).push(u)
    }
    return m
  }, [flatUnits])

  const [activeLevel, setActiveLevel] = useState(() => {
    const flat = levels.flatMap(l => l.units)
    const ownUnit = flat.find(u => u.owner === currentUser)
    return ownUnit ? ownUnit.level : 0
  })

  const eligibleTargets = useMemo(() => {
    if (!currentUser) return []

    // ── PHASE 1: INITIAL RESERVATION (user has no units yet) ─────────────────
    if (currentUserAllUnits.length === 0) {
      if (!selectedGroupId) return []
      const g = groupUnits.get(selectedGroupId) || []
      if (!g.length) return []

      const cellLevel = g[0].level
      const cellRow = g[0].cellR

      const rowIsRegistered = flatUnits.some(
        u => u.owner && u.level === cellLevel && u.cellR === cellRow
      )
      if (!rowIsRegistered) return []

      if (g.length === 4 && g.every(u => !u.owner && (!u.availableFrom || actionDate >= u.availableFrom))) {
        return [{
          key: `INIT:${selectedGroupId}:full`,
          kind: 'initial-cell',
          label: selectedGroupId,
          unitIds: g.map(u => u.id),
          distance: 0,
        }]
      }
      return []
    }

    // ── PHASE 2: EXTENSION ───────────────────────────────────────────────────
    const userLevels = new Set(currentUserAllUnits.map(u => u.level))
    const userCx = currentUserAllUnits.reduce((s, u) => s + u.x + u.w / 2, 0) / currentUserAllUnits.length
    const userCy = currentUserAllUnits.reduce((s, u) => s + u.y + u.h / 2, 0) / currentUserAllUnits.length

    const targets = []
    for (const u of flatUnits) {
      if (u.owner) continue
      if (u.availableFrom && actionDate < u.availableFrom) continue
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

    return targets.sort((a, b) => a.distance - b.distance)
  }, [currentUser, currentUserAllUnits, selectedGroupId, flatUnits, groupUnits, registeredRows, actionDate])

  const selectedTargetUnitIds = useMemo(
    () => eligibleTargets.filter(t => selectedTargetKeys.has(t.key)).flatMap(t => t.unitIds),
    [eligibleTargets, selectedTargetKeys]
  )

  const selectionDetails = useMemo(() => {
    if (currentUserAllUnits.length === 0) {
      if (!selectedGroupId) return null
      const g = groupUnits.get(selectedGroupId) || []
      if (!g.length) return null
      return {
        title: selectedGroupId,
        subtitle: `Full cell · 4 units · Level ${g[0].level + 1}`,
        unitIds: g.map(u => u.id),
      }
    }
    if (selectedTargetUnitIds.length === 0) return null
    const units = selectedTargetUnitIds.map(id => unitsById.get(id)).filter(Boolean)
    const levelsSet = new Set(units.map(u => u.level))
    return {
      title: selectedTargetUnitIds.join(', '),
      subtitle: `${selectedTargetUnitIds.length} unit${selectedTargetUnitIds.length > 1 ? 's' : ''} · ${
        levelsSet.size > 1 ? 'Cross-floor' : `Level ${units[0]?.level + 1}`
      }`,
      unitIds: selectedTargetUnitIds,
    }
  }, [currentUserAllUnits, selectedGroupId, groupUnits, selectedTargetUnitIds, unitsById])

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
      const minY = Math.max(0, Math.min(...ys) - padding)
      const maxX = Math.max(...xs) + padding
      const maxY = Math.max(...ys) + padding
      map.set(level.level, `${minX} ${minY} ${maxX - minX} ${maxY - minY}`)
    })
    return map
  }, [levels, hallways])

  const showAlert = (title, body, variant = 'error') =>
    setNotification({ title, lines: Array.isArray(body) ? body : [body], variant })

  const onToggleTarget = key => {
    setSelectedTargetKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    const target = eligibleTargets.find(t => t.key === key)
    if (target) {
      const unit = unitsById.get(target.unitIds[0])
      if (unit) setActiveLevel(unit.level)
    }
  }

  const onUnitClick = u => {
    if (!currentUser) return showAlert('Login required', 'Please log in before making a reservation.')
    // Units reserved by other users are fully non-interactive
    if (u.owner && u.owner !== currentUser) return

    if (currentUserAllUnits.length === 0) {
      // Phase 1: toggle group selection — click again to deselect
      if (u.groupId === selectedGroupId) {
        setSelectedGroupId(null)
        setSelectedTargetKeys(new Set())
      } else {
        setSelectedGroupId(u.groupId || null)
        setSelectedTargetKeys(new Set())
        setSelectedOwnUnitId(null)
        setPendingFurniture([])
      }
    } else if (!u.owner) {
      // Phase 2: toggle the single-unit eligible target
      const key = `U:${u.id}`
      if (eligibleTargets.some(t => t.key === key)) {
        onToggleTarget(key)
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
        setSelectedTargetKeys(new Set())
      }
    }
  }

  const toggleFurniture = id => {
    setPendingFurniture(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const requestRelease = unitId => {
    const errors = validateDowngrade(currentUserAllUnits, unitId)
    if (errors.length) return showAlert('Release not allowed', errors)
    setReleaseConfirm({ unitId })
  }

  const confirmRelease = () => {
    const { unitId } = releaseConfirm
    const errors = validateDowngrade(currentUserAllUnits, unitId)
    if (errors.length) {
      setReleaseConfirm(null)
      return showAlert('No longer valid', errors)
    }
    onUpdateUnit(unitId, { owner: null, date: null, availableFrom: actionDate, releasedBy: currentUser })
    if (selectedOwnUnitId === unitId) setSelectedOwnUnitId(null)
    setReleaseConfirm(null)
    showAlert('Unit released', `${unitId} will be released on ${actionDate}.`, 'success')
  }

  const handleConfirmReservation = () => {
    if (!currentUser) return showAlert('Login required', 'Please log in before making a reservation.')
    const dErrors = validateActionDate(actionDate)
    if (dErrors.length) return showAlert('Invalid date', dErrors)

    if (currentUserAllUnits.length === 0) {
      if (!selectedGroupId) return showAlert('No cell selected', 'Go back to Step 1 and select a cell on the floor plan.')
      const cellTarget = eligibleTargets.find(t => t.kind === 'initial-cell')
      if (!cellTarget) return showAlert('Cell unavailable', 'This cell is no longer available. Go back and pick another one.')
      cellTarget.unitIds.forEach(id => onUpdateUnit(id, { owner: currentUser, date: actionDate, availableFrom: null, releasedBy: null, furniture: pendingFurniture }))
      showAlert('Reservation confirmed', `You've reserved ${cellTarget.label} (${cellTarget.unitIds.length} units).`, 'success')
    } else {
      if (selectedTargetUnitIds.length < 2) return showAlert('Select at least 2 units', 'Go back to Step 1 and select at least 2 adjacent units.')
      const targetUnits = selectedTargetUnitIds.map(id => unitsById.get(id)).filter(Boolean)
      const errors = validateUpgrade(currentUserAllUnits, targetUnits)
      if (errors.length) return showAlert('No longer valid', errors)
      selectedTargetUnitIds.forEach(id => onUpdateUnit(id, { owner: currentUser, date: actionDate, availableFrom: null, releasedBy: null, furniture: pendingFurniture }))
      showAlert('Reservation confirmed', `You've added ${selectedTargetUnitIds.length} units to your reservation.`, 'success')
    }

    setSelectedGroupId(null)
    setSelectedTargetKeys(new Set())
    setSelectedOwnUnitId(null)
    setPendingFurniture([])
    setCurrentStep(1)
  }

  const dateErrors = validateActionDate(actionDate)

  const isStep1Valid = currentUserAllUnits.length === 0
    ? !!selectedGroupId && eligibleTargets.some(t => t.kind === 'initial-cell')
    : selectedTargetUnitIds.length >= 2

  const stepValid = {
    1: dateErrors.length === 0 && isStep1Valid,
    2: true,
    3: true,
  }

  const goNext = () => setCurrentStep(s => Math.min(3, s + 1))
  const goBack = () => setCurrentStep(s => Math.max(1, s - 1))

  return (
    <div className="wizard-shell">
      <section className="stats-strip" aria-label="Floor plan summary">
        <div className="overview-card overview-card--total">
          <span className="overview-label">Total units</span>
          <strong>{planStats.total}</strong>
        </div>
        <div className="overview-card overview-card--available">
          <span className="overview-label">Available</span>
          <strong>{planStats.available}</strong>
        </div>
        <div className="overview-card overview-card--occupied">
          <span className="overview-label">Occupied</span>
          <strong>{planStats.occupied}</strong>
        </div>
        <div className="overview-card overview-card--accent">
          <span className="overview-label">Your units</span>
          <strong>{planStats.ownedByCurrentUser}</strong>
        </div>
      </section>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <div className="step-panel">
        {currentStep === 1 && (
          <>
            <div className="step-panel-header">
              <h2>Choose your date and unit</h2>
              <p>
                Pick the date your reservation should begin — the floor plan updates automatically to show what's available then. {currentUserAllUnits.length === 0
                  ? 'Click any cell on the floor plan to select your starting location.'
                  : 'Select at least 2 adjacent empty units to add to your reservation.'}
              </p>
            </div>
            <div className="date-field">
              <label htmlFor="action-date">Reservation date</label>
              <input
                id="action-date"
                type="date"
                value={actionDate}
                min={todayISO}
                onChange={e => setActionDate(e.target.value)}
              />
              {dateErrors.map((e, i) => (
                <div key={i} className="sidepanel-hint sidepanel-hint--danger">{e}</div>
              ))}
            </div>
            <div className="step1-layout">
              <div className="step1-main">
                <FloorPlan
                  levels={levels}
                  hallways={hallways}
                  currentUser={currentUser}
                  todayISO={todayISO}
                  actionDate={actionDate}
                  flatUnits={flatUnits}
                  unitsById={unitsById}
                  levelUnitsMap={levelUnitsMap}
                  levelViewBoxes={levelViewBoxes}
                  groupUnits={groupUnits}
                  eligibleTargets={eligibleTargets}
                  currentUserAllUnits={currentUserAllUnits}
                  selectedGroupId={selectedGroupId}
                  selectedTargetKeys={selectedTargetKeys}
                  selectedOwnUnitId={selectedOwnUnitId}
                  activeLevel={activeLevel}
                  onActiveLevelChange={setActiveLevel}
                  onUnitClick={onUnitClick}
                  onToggleTarget={onToggleTarget}
                />
              </div>
              <aside className="step1-side">
                {!currentUser && (
                  <div className="sidepanel-hint sidepanel-hint--info">Set your user name to make a reservation.</div>
                )}
                {currentUser && currentUserAllUnits.length === 0 && !selectedGroupId && (
                  <div className="sidepanel-hint">Click any cell on the floor plan to select your starting location.</div>
                )}
                {currentUser && currentUserAllUnits.length === 0 && selectedGroupId && eligibleTargets.length === 0 && (() => {
                  const g = groupUnits.get(selectedGroupId) || []
                  const cellLevel = g[0]?.level
                  const cellRow = g[0]?.cellR
                  const rowRegistered = flatUnits.some(u => u.owner && u.level === cellLevel && u.cellR === cellRow)
                  return rowRegistered
                    ? <div className="sidepanel-hint sidepanel-hint--warn">This cell is already partially or fully occupied. Pick another cell in the same row.</div>
                    : <div className="sidepanel-hint sidepanel-hint--warn">This row has no existing reservations yet. New registrations are not permitted here. Choose a cell in a registered row.</div>
                })()}
                {currentUser && currentUserAllUnits.length === 0 && selectedGroupId && eligibleTargets.length > 0 && (
                  <div className="sidepanel-hint sidepanel-hint--success">This cell is available. Continue to add furniture.</div>
                )}
                {currentUser && currentUserAllUnits.length > 0 && eligibleTargets.length === 0 && (
                  <div className="sidepanel-hint">No adjacent empty units available.</div>
                )}
                {currentUser && currentUserAllUnits.length > 0 && eligibleTargets.length > 0 && (
                  <div className="sidepanel-hint">
                    Select at least <strong>2 adjacent empty units</strong> on the floor plan.
                    {selectedTargetKeys.size > 0 && ` (${selectedTargetUnitIds.length} selected)`}
                  </div>
                )}

                {currentUser && currentUserAllUnits.length > 0 && eligibleTargets.length > 0 && (
                  <div className="target-list">
                    {eligibleTargets.map(t => (
                      <button
                        key={t.key}
                        className={`target-item ${selectedTargetKeys.has(t.key) ? 'active' : ''}`}
                        onClick={() => onToggleTarget(t.key)}
                      >
                        <div className="target-main">
                          <div className="target-label">{t.label}</div>
                          <div className="target-meta">
                            <span className="pill pill--kind">
                              {t.kind === 'cross-floor' ? 'cross-floor' : 'same level'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {currentUser && currentUserAllUnits.length > 0 && (
                  <div className="release-panel">
                    <div className="sidepanel-title">
                      <span className="sidepanel-title-icon"><ReleaseIcon /></span>
                      Your reservation
                    </div>
                    <div className="release-unit-list">
                      {currentUserAllUnits.map(u => (
                        <div
                          key={u.id}
                          className={`release-unit-row ${u.id === selectedOwnUnitId ? 'release-unit-row--active' : ''}`}
                        >
                          <span className="release-unit-code">{u.id}</span>
                          <button className="release-btn release-btn--inline" onClick={() => requestRelease(u.id)}>
                            Release
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="step-panel-header">
              <h2>Furnish your space</h2>
              <p>Browse the Open Library and add pieces to your new unit(s).</p>
            </div>
            <div className="summary-cards-grid">
              <SummaryCard icon={<UnitIcon />} title="Selected unit(s)">
                {selectionDetails ? (
                  <div className="summary-card-row">
                    <span className="summary-card-value">{selectionDetails.title}</span>
                  </div>
                ) : (
                  <p className="summary-card-empty">No units selected yet.</p>
                )}
              </SummaryCard>
              <SummaryCard icon={<CalendarIcon />} title="Reservation date">
                <div className="summary-card-row">
                  <span className="summary-card-value">{actionDate}</span>
                </div>
              </SummaryCard>
            </div>
            <FurnitureGrid selectedIds={pendingFurniture} onToggle={toggleFurniture} />
          </>
        )}

        {currentStep === 3 && (
          <>
            <div className="step-panel-header">
              <h2>Review and confirm</h2>
              <p>Double-check the details below before confirming your reservation.</p>
            </div>
            <div className="summary-cards-grid">
              <SummaryCard icon={<UnitIcon />} title="Selected unit(s)">
                {selectionDetails ? (
                  <>
                    <div className="summary-card-row">
                      <span className="summary-card-label">Units</span>
                      <span className="summary-card-value">{selectionDetails.title}</span>
                    </div>
                    <div className="summary-card-row">
                      <span className="summary-card-label">Details</span>
                      <span className="summary-card-value">{selectionDetails.subtitle}</span>
                    </div>
                  </>
                ) : (
                  <p className="summary-card-empty">No units selected yet.</p>
                )}
              </SummaryCard>
              <SummaryCard icon={<CalendarIcon />} title="Reservation date">
                <div className="summary-card-row">
                  <span className="summary-card-value">{actionDate}</span>
                </div>
              </SummaryCard>
              <SummaryCard icon={<FurnitureSectionIcon />} title="Furniture">
                {pendingFurniture.length > 0 ? (
                  <div className="summary-card-row">
                    <span className="summary-card-value">{pendingFurniture.length} item{pendingFurniture.length > 1 ? 's' : ''} selected</span>
                  </div>
                ) : (
                  <p className="summary-card-empty">No furniture selected.</p>
                )}
              </SummaryCard>
            </div>
            <button className="primary-btn confirm-btn" onClick={handleConfirmReservation}>
              Confirm Reservation
            </button>
          </>
        )}
      </div>

      <div className="wizard-nav">
        <button onClick={goBack} disabled={currentStep === 1}>Back</button>
        {currentStep < 3 && (
          <button className="primary-btn" onClick={goNext} disabled={!stepValid[currentStep]}>Continue</button>
        )}
      </div>

      <section className="scheduled-requests">
        <h2 className="sr-heading">
          <span className="sr-heading-dot" />
          Scheduled Requests
        </h2>
        {pendingActions.length === 0 ? (
          <p className="sr-empty">No upcoming scheduled actions.</p>
        ) : (
          <div className="sr-table-wrap">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Cell / Units</th>
                  <th>User</th>
                  <th>Action Date</th>
                </tr>
              </thead>
              <tbody>
                {pendingActions.map((a, i) => {
                  const label = a.qs.length === 4
                    ? a.groupId
                    : a.qs.sort().map(q => `${a.groupId}-${q + 1}`).join(', ')
                  return (
                    <tr key={i}>
                      <td>
                        <span className={`sr-badge sr-badge--${a.type}`}>
                          {a.type === 'reserve' ? 'Reserve' : 'Release'}
                        </span>
                      </td>
                      <td className="sr-label">{label}</td>
                      <td className="sr-user">{a.user}</td>
                      <td className="sr-date">{a.date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="wizard-footer">
        <button className="reset-btn" onClick={resetApp}>Reset data</button>
      </div>

      {notification && (
        <div className="modal-overlay" onClick={() => setNotification(null)}>
          <div className={`modal notification-modal notification-modal--${notification.variant || 'error'}`} onClick={e => e.stopPropagation()}>
            <h3 className={`notification-title notification-title--${notification.variant || 'error'}`}>{notification.title}</h3>
            <div className="notification-body">
              {notification.lines.length === 1
                ? <p>{notification.lines[0]}</p>
                : <ul>{notification.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
              }
            </div>
            <div className="modal-actions">
              <button className="primary-btn" onClick={() => setNotification(null)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {releaseConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm release</h3>
            <p>Release unit <strong>{releaseConfirm.unitId}</strong> on <strong>{actionDate}</strong>?</p>
            <div className="modal-actions">
              <button onClick={() => setReleaseConfirm(null)}>Cancel</button>
              <button className="danger-btn" onClick={confirmRelease}>Release</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Stepper ──────────────────────────────────────────────────────────────
function Stepper({ steps, currentStep }) {
  const activeLabel = steps.find(s => s.id === currentStep)?.label ?? ''
  return (
    <>
      <div className="stepper" role="list" aria-label="Booking steps">
        {steps.map((step, i) => {
          const state = step.id < currentStep ? 'complete' : step.id === currentStep ? 'active' : 'pending'
          return (
            <React.Fragment key={step.id}>
              <div className={`stepper-step stepper-step--${state}`} role="listitem" aria-current={state === 'active' ? 'step' : undefined}>
                <span className="stepper-step-circle">
                  {state === 'complete' ? <CheckIcon /> : step.id}
                </span>
                <span className="stepper-step-label">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`stepper-connector ${step.id < currentStep ? 'stepper-connector--complete' : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div className="stepper-mobile-label">Step {currentStep} of {steps.length}: {activeLabel}</div>
    </>
  )
}

// ── Summary card ─────────────────────────────────────────────────────────
function SummaryCard({ icon, title, children }) {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <span className="summary-card-icon">{icon}</span>
        <span className="summary-card-title">{title}</span>
      </div>
      <div className="summary-card-body">{children}</div>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.4" />
      <line x1="5" y1="1.5" x2="5" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11" y1="1.5" x2="11" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function UnitIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function ReleaseIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FurnitureSectionIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="7" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="5" width="2" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="5" width="2" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="4" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 12v1M10 12v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
