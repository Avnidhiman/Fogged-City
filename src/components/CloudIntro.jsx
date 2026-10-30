import './CloudIntro.css'

// Title card that sits on top of the clouds. Clicking skips the hold.
export default function CloudIntro({ parting, onSkip }) {
  return (
    <div className={`intro${parting ? ' is-parting' : ''}`} onClick={onSkip}>
      <div className="intro__title">
        <span className="intro__eyebrow">Chapter One</span>
        <h1>The Fogged City</h1>
        <i className="intro__rule" />
        <p>Delhi</p>
      </div>
      <small className="intro__hint">Click to skip</small>
    </div>
  )
}
