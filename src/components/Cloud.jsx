// One reusable fluffy cloud: a tinted copy underneath gives it a soft shadow.
export default function Cloud({ className = '', style, tint = '#cfe3f5' }) {
  const puffs = (
    <>
      <circle cx="62" cy="82" r="36" /><circle cx="112" cy="56" r="46" />
      <circle cx="168" cy="76" r="38" /><circle cx="206" cy="92" r="26" />
      <rect x="40" y="84" width="190" height="34" rx="17" />
    </>
  )
  return (
    <svg viewBox="0 0 240 130" className={`cloud ${className}`} style={style} aria-hidden="true">
      <g fill={tint} transform="translate(0,9)">{puffs}</g>
      <g fill="#fff">{puffs}</g>
    </svg>
  )
}
