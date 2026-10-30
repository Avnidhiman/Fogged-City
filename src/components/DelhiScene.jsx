import { useState } from 'react'
import { ZONES } from '../data/zones'
import SoundToggle from './SoundToggle'
import './DelhiScene.css'

const RIVER = 'M628 -10 C612 70 640 150 656 230 C672 300 705 370 752 440 C790 500 800 570 812 640'
const ROUTE = 'M561 79 C520 100 500 130 491 160 S520 205 529 230 S580 270 594 298 S612 380 619 438 S480 500 394 540'
const NAV = ['Map', 'Team', 'Leaderboard', 'About']

export default function DelhiScene({ revealed, audio }) {
  const [active, setActive] = useState(null) // hovered/focused zone id, shared by list + map

  return (
    <div className={`shell${revealed ? ' is-revealed' : ''}`}>
      <header className="nav glass">
        <div className="brand">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /></svg>
          <span>The Fogged City</span>
        </div>
        <nav aria-label="Primary">
          {NAV.map((n, i) => (
            <button key={n} type="button" className={`nav__item${i === 0 ? ' is-current' : ''}`} aria-current={i === 0 ? 'page' : undefined} aria-disabled={i !== 0} title={i === 0 ? undefined : 'Coming soon'}>{n}</button>
          ))}
        </nav>
        <div className="nav__right"><span className="chip chip--live"><i />New Delhi, IN</span><SoundToggle audio={audio} /></div>
      </header>

      <main className="layout">
        <aside className="side glass">
          <p className="eyebrow">Chapter 01 · Delhi</p>
          <h1>The city is waiting beneath the fog.</h1>
          <p className="lede">Six landmarks, one hidden story. Uncover each zone to lift the fog and reveal what lies beneath.</p>
          <div className="progress" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="0" aria-label="Zones uncovered">
            <div className="progress__row"><span>Uncovered</span><b>0 / 6</b></div>
            <div className="progress__track"><i /></div>
          </div>
          <ul className="zones">
            {ZONES.map((z) => (
              <li key={z.id}>
                <button type="button" className={`zone${active === z.id ? ' is-active' : ''}${z.open ? ' is-open' : ''}`}
                  onMouseEnter={() => setActive(z.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(z.id)} onBlur={() => setActive(null)}>
                  <span className="zone__n">{String(z.id).padStart(2, '0')}</span>
                  <span className="zone__t"><b>{z.name}</b><small>{z.tag}</small></span>
                  <span className={`chip${z.open ? ' chip--gold' : ''}`}>{z.open ? 'Ready' : 'Fogged'}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="mapPanel glass" aria-label="Map of central Delhi">
          <span className="hud hud--tl">28.61° N · 77.21° E</span>
          <span className="hud hud--tr">Central Delhi</span>
          <span className="hud hud--bl"><i className="dot dot--gold" /> Ready <i className="dot" /> Fogged</span>
          <svg className="map" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Stylised map with six landmarks and the Yamuna river">
            <defs>
              <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c1b2e" stopOpacity=".78" /><stop offset="1" stopColor="#14304c" stopOpacity=".6" /></linearGradient>
              <radialGradient id="glow"><stop offset="0" stopColor="#d8b98a" stopOpacity=".55" /><stop offset="1" stopColor="#d8b98a" stopOpacity="0" /></radialGradient>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#fff" strokeOpacity=".045" /></pattern>
              <filter id="soft"><feGaussianBlur stdDeviation="9" /></filter>
            </defs>
            <rect width="1000" height="620" fill="url(#plate)" />
            <rect width="1000" height="620" fill="url(#grid)" />
            <ellipse cx="300" cy="190" rx="130" ry="170" fill="#4aa58c" opacity=".09" />
            <ellipse cx="545" cy="372" rx="42" ry="22" fill="#4aa58c" opacity=".12" />
            <ellipse cx="520" cy="330" rx="255" ry="300" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="1.5" />
            <ellipse cx="520" cy="320" rx="150" ry="190" fill="none" stroke="#fff" strokeOpacity=".05" strokeWidth="1" />
            {['M491 160 L300 60', 'M529 230 L330 330', 'M529 230 L760 150', 'M394 540 L250 600', 'M594 298 L420 420'].map((d) => <path key={d} d={d} stroke="#fff" strokeOpacity=".07" />)}
            <path d={RIVER} fill="none" stroke="#5fa8d3" strokeOpacity=".4" strokeWidth="46" filter="url(#soft)" />
            <path d={RIVER} fill="none" stroke="#9fd0ee" strokeOpacity=".55" strokeWidth="7" strokeLinecap="round" />
            <text x="700" y="372" fill="#9fd0ee" fillOpacity=".7" fontSize="12" fontStyle="italic" letterSpacing="3" transform="rotate(48 700 372)">YAMUNA</text>
            <path d={ROUTE} fill="none" stroke="#d8b98a" strokeOpacity=".45" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" className="route" />

            {ZONES.map((z, i) => (
              <g key={z.id} transform={`translate(${z.x},${z.y})`}>
                <g className={`marker${z.open ? ' is-open' : ''}${active === z.id ? ' is-active' : ''}`} style={{ '--i': i }} tabIndex={0} role="button" aria-label={`Zone ${z.id}: ${z.name}, ${z.open ? 'ready' : 'fogged'}`}
                  onMouseEnter={() => setActive(z.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(z.id)} onBlur={() => setActive(null)}>
                  <circle r="34" fill="url(#glow)" className="marker__glow" />
                  {z.open && <circle r="12" className="marker__pulse" />}
                  <rect className="marker__pill" x="18" y="-14" width={z.name.length * 7.4 + 26} height="28" rx="14" />
                  <circle r="12" className="marker__core" />
                  <text className="marker__n" textAnchor="middle" y="4">{z.id}</text>
                  <text className="marker__label" x="31" y="4.5">{z.name}</text>
                </g>
              </g>
            ))}
          </svg>
        </section>
      </main>
    </div>
  )
}
