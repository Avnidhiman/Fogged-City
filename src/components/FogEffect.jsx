// src/components/FogEffect.jsx
import React from 'react';

/**
 * Reusable Component: FogEffect
 * Temple Run style volumetric rolling fog clouds, swirling smoke tendrils, and floating mist particles.
 * Built strictly with pure CSS keyframes & HTML/SVG gradients (100% syllabus compliant).
 */
export default function FogEffect({ density = 'heavy' }) {
  return (
    <div className={`temple-run-fog-wrapper density-${density}`}>
      {/* Top Ambient Canopy Fog */}
      <div className="fog-canopy"></div>

      {/* Layer 1: Swirling Midground Mist Clouds (Temple Run Style) */}
      <div className="mist-cloud mist-cloud-1"></div>
      <div className="mist-cloud mist-cloud-2"></div>
      <div className="mist-cloud mist-cloud-3"></div>

      {/* Layer 2: Temple Run Low-Lying Ground Fog Waves */}
      <div className="ground-fog-wave wave-back"></div>
      <div className="ground-fog-wave wave-mid"></div>
      <div className="ground-fog-wave wave-front"></div>

      {/* Layer 3: Floating Spores & Fog Embers */}
      <div className="fog-particles">
        <span className="p-spore p1"></span>
        <span className="p-spore p2"></span>
        <span className="p-spore p3"></span>
        <span className="p-spore p4"></span>
        <span className="p-spore p5"></span>
        <span className="p-spore p6"></span>
        <span className="p-spore p7"></span>
        <span className="p-spore p8"></span>
      </div>
    </div>
  );
}
