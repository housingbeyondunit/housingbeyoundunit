import React, { useState, useEffect, useMemo } from 'react'

const unsplash = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const FURNITURE_ITEMS = [
  { id: 'sofa', label: 'Sofa', image: unsplash('photo-1555041469-a586c61ea9bc') },
  { id: 'bed', label: 'Bed', image: unsplash('photo-1505693416388-ac5ce068fe85') },
  { id: 'wardrobe', label: 'Wardrobe', image: unsplash('photo-1595428774223-ef52624120d2') },
  { id: 'dining-table', label: 'Dining Table', image: unsplash('photo-1617806118233-18e1de247200') },
  { id: 'chair', label: 'Chair', image: unsplash('photo-1592078615290-033ee584e267') },
  { id: 'desk', label: 'Desk', image: unsplash('photo-1518455027359-f3f8164ba6bd') },
  { id: 'bookshelf', label: 'Bookshelf', image: unsplash('photo-1521587760476-6c12a4b040da') },
  { id: 'tv-stand', label: 'TV Stand', image: unsplash('photo-1593359677879-a4bb92f829d1') },
  { id: 'coffee-table', label: 'Coffee Table', image: unsplash('photo-1611967164521-abae8fba4668') },
  { id: 'side-table', label: 'Side Table', image: unsplash('photo-1499933374294-4584851497cc') },
  { id: 'floor-lamp', label: 'Floor Lamp', image: unsplash('photo-1513506003901-1e6a229e2d15') },
  { id: 'rug', label: 'Rug', image: unsplash('photo-1600166898405-da9535204843') },
]

// Simple line-art "image" for each furniture item, drawn in a shared 64x64 frame.
// Used by the homepage Open Library section.
export function FurnitureIcon({ id, className }) {
  const svgProps = {
    className,
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    xmlns: 'http://www.w3.org/2000/svg',
  }

  switch (id) {
    case 'sofa':
      return (
        <svg {...svgProps}>
          <rect x="6" y="22" width="8" height="24" rx="2" />
          <rect x="50" y="22" width="8" height="24" rx="2" />
          <rect x="10" y="20" width="44" height="14" rx="3" />
          <rect x="8" y="32" width="48" height="14" rx="3" />
          <line x1="14" y1="46" x2="14" y2="52" />
          <line x1="50" y1="46" x2="50" y2="52" />
        </svg>
      )
    case 'bed':
      return (
        <svg {...svgProps}>
          <rect x="8" y="10" width="48" height="44" rx="4" />
          <rect x="14" y="14" width="36" height="12" rx="2" />
          <line x1="8" y1="34" x2="56" y2="34" />
          <line x1="12" y1="54" x2="12" y2="58" />
          <line x1="52" y1="54" x2="52" y2="58" />
        </svg>
      )
    case 'wardrobe':
      return (
        <svg {...svgProps}>
          <rect x="12" y="8" width="40" height="48" rx="2" />
          <line x1="32" y1="8" x2="32" y2="56" />
          <line x1="27" y1="30" x2="27" y2="36" />
          <line x1="37" y1="30" x2="37" y2="36" />
          <line x1="16" y1="56" x2="16" y2="60" />
          <line x1="48" y1="56" x2="48" y2="60" />
        </svg>
      )
    case 'dining-table':
      return (
        <svg {...svgProps}>
          <rect x="8" y="22" width="48" height="6" rx="2" />
          <line x1="14" y1="28" x2="14" y2="54" />
          <line x1="50" y1="28" x2="50" y2="54" />
          <circle cx="22" cy="15" r="4" />
          <circle cx="42" cy="15" r="4" />
        </svg>
      )
    case 'chair':
      return (
        <svg {...svgProps}>
          <rect x="14" y="8" width="36" height="6" rx="2" />
          <line x1="17" y1="14" x2="17" y2="34" />
          <line x1="47" y1="14" x2="47" y2="34" />
          <rect x="14" y="34" width="36" height="6" rx="2" />
          <line x1="17" y1="40" x2="17" y2="58" />
          <line x1="47" y1="40" x2="47" y2="58" />
        </svg>
      )
    case 'desk':
      return (
        <svg {...svgProps}>
          <rect x="6" y="18" width="52" height="6" rx="2" />
          <rect x="10" y="24" width="14" height="30" rx="1" />
          <line x1="13" y1="33" x2="21" y2="33" />
          <line x1="13" y1="42" x2="21" y2="42" />
          <line x1="48" y1="24" x2="48" y2="54" />
        </svg>
      )
    case 'bookshelf':
      return (
        <svg {...svgProps}>
          <rect x="10" y="8" width="44" height="48" rx="2" />
          <line x1="10" y1="22" x2="54" y2="22" />
          <line x1="10" y1="36" x2="54" y2="36" />
          <line x1="10" y1="50" x2="54" y2="50" />
          <line x1="16" y1="10" x2="16" y2="20" />
          <line x1="22" y1="10" x2="22" y2="20" />
          <line x1="28" y1="10" x2="28" y2="20" />
          <line x1="40" y1="24" x2="40" y2="34" />
          <line x1="46" y1="24" x2="46" y2="34" />
          <line x1="18" y1="38" x2="18" y2="48" />
          <line x1="24" y1="38" x2="24" y2="48" />
        </svg>
      )
    case 'tv-stand':
      return (
        <svg {...svgProps}>
          <rect x="14" y="12" width="36" height="22" rx="2" />
          <line x1="32" y1="34" x2="32" y2="40" />
          <rect x="10" y="40" width="44" height="14" rx="2" />
          <line x1="16" y1="54" x2="16" y2="58" />
          <line x1="48" y1="54" x2="48" y2="58" />
        </svg>
      )
    case 'coffee-table':
      return (
        <svg {...svgProps}>
          <rect x="24" y="14" width="16" height="8" rx="1" />
          <rect x="8" y="24" width="48" height="6" rx="2" />
          <line x1="14" y1="30" x2="14" y2="50" />
          <line x1="50" y1="30" x2="50" y2="50" />
        </svg>
      )
    case 'side-table':
      return (
        <svg {...svgProps}>
          <rect x="18" y="20" width="28" height="6" rx="2" />
          <line x1="22" y1="26" x2="22" y2="50" />
          <line x1="42" y1="26" x2="42" y2="50" />
          <line x1="22" y1="38" x2="42" y2="38" />
        </svg>
      )
    case 'floor-lamp':
      return (
        <svg {...svgProps}>
          <path d="M22 10 L42 10 L48 24 L16 24 Z" />
          <line x1="32" y1="24" x2="32" y2="56" />
          <line x1="20" y1="56" x2="44" y2="56" />
        </svg>
      )
    case 'rug':
      return (
        <svg {...svgProps}>
          <rect x="8" y="14" width="48" height="36" rx="6" />
          <rect x="16" y="22" width="32" height="20" rx="3" />
          <line x1="8" y1="20" x2="4" y2="20" />
          <line x1="8" y1="28" x2="4" y2="28" />
          <line x1="8" y1="36" x2="4" y2="36" />
          <line x1="8" y1="44" x2="4" y2="44" />
          <line x1="56" y1="20" x2="60" y2="20" />
          <line x1="56" y1="28" x2="60" y2="28" />
          <line x1="56" y1="36" x2="60" y2="36" />
          <line x1="56" y1="44" x2="60" y2="44" />
        </svg>
      )
    default:
      return (
        <svg {...svgProps}>
          <rect x="10" y="10" width="44" height="44" rx="4" />
        </svg>
      )
  }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon({ direction }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d={direction === 'left' ? 'M10 3l-5 5 5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 5
  if (window.innerWidth <= 768) return 2
  if (window.innerWidth <= 1024) return 3
  return 5
}

// Open Library carousel — browse and add furniture pieces to a reservation.
// Furnishing is entirely optional; selections are reflected in a persistent
// summary panel below the carousel.
export default function FurnitureGrid({ items = FURNITURE_ITEMS, selectedIds = [], onToggle }) {
  const [page, setPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage)

  useEffect(() => {
    const onResize = () => setItemsPerPage(getItemsPerPage())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const pages = useMemo(() => {
    const chunks = []
    for (let i = 0; i < items.length; i += itemsPerPage) {
      chunks.push(items.slice(i, i + itemsPerPage))
    }
    return chunks.length ? chunks : [[]]
  }, [items, itemsPerPage])

  const safePage = Math.min(page, pages.length - 1)
  const selectedItems = items.filter(it => selectedIds.includes(it.id))

  return (
    <div className="furniture-library">
      <div className="furniture-library-header">
        <div className="furniture-library-heading">
          <h3>Open Library</h3>
          <p>Add modular pieces to your unit. Furnishing is optional — you can continue without selecting anything.</p>
        </div>
        {pages.length > 1 && (
          <div className="furniture-carousel-nav">
            <button
              type="button"
              className="furniture-carousel-arrow"
              aria-label="Previous items"
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={safePage === 0}
            >
              <ArrowIcon direction="left" />
            </button>
            <span className="furniture-carousel-indicator">{safePage + 1} / {pages.length}</span>
            <button
              type="button"
              className="furniture-carousel-arrow"
              aria-label="Next items"
              onClick={() => setPage(p => Math.min(p + 1, pages.length - 1))}
              disabled={safePage === pages.length - 1}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        )}
      </div>

      <div className="furniture-carousel-viewport">
        <div className="furniture-carousel-track" style={{ transform: `translateX(-${safePage * 100}%)` }}>
          {pages.map((pageItems, pi) => (
            <div className="furniture-carousel-slide" key={pi}>
              {pageItems.map(it => {
                const active = selectedIds.includes(it.id)
                return (
                  <button
                    key={it.id}
                    type="button"
                    className={`furniture-card${active ? ' furniture-card--active' : ''}`}
                    onClick={() => onToggle(it.id)}
                    aria-pressed={active}
                  >
                    <span className="furniture-card-media" style={{ backgroundImage: `url(${it.image})` }}>
                      {active && (
                        <span className="furniture-card-check" aria-hidden="true">
                          <CheckIcon />
                        </span>
                      )}
                    </span>
                    <span className="furniture-card-body">
                      <span className="furniture-card-label">{it.label}</span>
                      <span className={`furniture-card-action${active ? ' furniture-card-action--active' : ''}`}>
                        {active ? 'Added' : 'Add'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="furniture-selection">
        <div className="furniture-selection-header">
          <span className="furniture-selection-title">Your selection</span>
          <span className="furniture-selection-count">
            {selectedItems.length} item{selectedItems.length === 1 ? '' : 's'}
          </span>
        </div>
        {selectedItems.length === 0 ? (
          <p className="furniture-selection-empty">
            Nothing added yet — furnishing is optional, so feel free to continue without it.
          </p>
        ) : (
          <ul className="furniture-selection-list">
            {selectedItems.map(it => (
              <li key={it.id} className="furniture-selection-chip">
                <span className="furniture-selection-thumb" style={{ backgroundImage: `url(${it.image})` }} />
                <span className="furniture-selection-name">{it.label}</span>
                <button
                  type="button"
                  className="furniture-selection-remove"
                  onClick={() => onToggle(it.id)}
                  aria-label={`Remove ${it.label}`}
                >
                    <svg viewBox="0 0 24 24" width="10" height="10">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
