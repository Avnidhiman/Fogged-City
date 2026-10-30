import React from 'react';

/**
 * FogOverlay Component
 * Ambient multi-layered fog and urban streetlight background canvas.
 */
export default function FogOverlay() {
  return (
    <div className="fog-overlay-container" aria-hidden="true">
      <div className="ambient-lights" />
      <div className="fog-layer fog-layer-1" />
      <div className="fog-layer fog-layer-2" />
    </div>
  );
}
