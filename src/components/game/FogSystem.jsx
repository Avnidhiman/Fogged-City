/**
 * FogSystem.jsx — THE FOGGED CITY
 *
 * A game-state-aware atmospheric fog engine rendered on a full-screen canvas
 * that sits above the MapLibre map but below all UI controls.
 *
 * Architecture:
 *   1. A single rAF loop drives all animation — no expensive libraries needed.
 *   2. Fog is built in three composited passes:
 *        A) Base blanket       — semi-opaque dark overlay with soft edges
 *        B) Smoke blobs        — large, slow-drifting organic shapes
 *        C) Fine wisps         — smaller, faster tendrils at different depths
 *   3. Game-state passes (destination-out) punch radial clearances:
 *        • Completed levels   — full reveal, radius eases in smoothly
 *        • Active level       — breathing searchlight peek
 *        • Locked levels      — denser local fog accumulation patch
 *   4. Respects prefers-reduced-motion — static fog, no animation.
 *   5. pointer-events: none throughout — never intercepts map interaction.
 */

import React, { useEffect, useRef } from 'react';
import { delhiChapterData } from '../../data/cities/delhi';
import { useGame } from '../../hooks/useGame';
import '../../styles/fogSystem.css';

// ─── Tuning constants ──────────────────────────────────────────────────────
const BASE_OPACITY        = 0.70;   // overall fog blanket opacity (0–1)
const BLOB_COUNT          = 6;      // large slow drifting blobs
const WISP_COUNT          = 9;      // smaller faster wisps
const CLEAR_RADIUS_DONE   = 260;    // px reveal radius for completed levels
const CLEAR_EASE_SPEED    = 0.04;   // how fast reveal expands (per frame, 0–1)
const ACTIVE_PEEK_BASE    = 85;     // px base radius for active level peek
const ACTIVE_PEEK_PULSE   = 22;     // px additional pulse amplitude
const LOCK_DENSITY_EXTRA  = 0.30;   // extra opacity over locked locations
const LOCK_DENSITY_RADIUS = 130;    // px locked fog patch radius

// ─── Seeded deterministic random (so blobs don't jump on re-render) ────────
const seeded = (seed) => {
  let s = seed * 9301 + 49297;
  return ((s % 233280) / 233280);
};

// Pre-build stable blob descriptors so they don't regenerate on each effect run
const buildBlobs = (count, minR, maxR, speedScale) =>
  Array.from({ length: count }, (_, i) => ({
    rx:    seeded(i * 7 + 1),          // initial x position (0–1)
    ry:    seeded(i * 7 + 2),          // initial y position (0–1)
    radiusBase: minR + seeded(i * 7 + 3) * (maxR - minR),
    radiusVariance: seeded(i * 7 + 4) * 60,
    speedX: (seeded(i * 7 + 5) - 0.5) * speedScale,
    speedY: (seeded(i * 7 + 6) - 0.5) * speedScale * 0.6,
    phaseX: seeded(i * 7 + 7) * Math.PI * 2,
    phaseY: seeded(i * 7 + 8) * Math.PI * 2,
    alphaBase: 0.08 + seeded(i * 7 + 9) * 0.12,
    colorMix: seeded(i * 7 + 10),     // 0 = slate-grey, 1 = navy-blue
  }));

const BLOBS  = buildBlobs(BLOB_COUNT, 280, 520, 0.00018);
const WISPS  = buildBlobs(WISP_COUNT, 90,  200, 0.00042);

// ─── Component ────────────────────────────────────────────────────────────
export default function FogSystem({ mapInstance }) {
  const canvasRef = useRef(null);
  const { isLevelCompleted, isLevelUnlocked, completedLevels } = useGame();

  // Per-level eased clear radius — lives in a ref so it persists across frames
  // without causing React re-renders.
  const clearRadiusRef = useRef({});

  // Check reduced-motion preference once at mount
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    // ── resize handler ──
    const syncSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(document.documentElement);

    // ── static fog render (reduced-motion) ──
    const renderStatic = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(9, 13, 22, ${BASE_OPACITY * 0.85})`;
      ctx.fillRect(0, 0, w, h);
    };

    if (prefersReducedMotion.current) {
      renderStatic();
      return () => { ro.disconnect(); };
    }

    // ── animated fog render ──
    const render = () => {
      time++;
      const t  = time * 0.001;
      const w  = canvas.width;
      const h  = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ═══════════════════════════════════════════════════════
      // PASS A — Base fog blanket
      // A flat semi-transparent layer that unifies everything.
      // It has a soft radial gradient so the centre is slightly
      // lighter, giving the impression of a distant light source.
      // ═══════════════════════════════════════════════════════
      ctx.globalCompositeOperation = 'source-over';

      const blanketGrad = ctx.createRadialGradient(
        w * 0.5, h * 0.45, 0,
        w * 0.5, h * 0.45, Math.max(w, h) * 0.72
      );
      blanketGrad.addColorStop(0,   `rgba(9, 13, 22, ${BASE_OPACITY * 0.78})`);
      blanketGrad.addColorStop(0.5, `rgba(6, 10, 18, ${BASE_OPACITY * 0.88})`);
      blanketGrad.addColorStop(1,   `rgba(4,  7, 15, ${BASE_OPACITY})`);
      ctx.fillStyle = blanketGrad;
      ctx.fillRect(0, 0, w, h);

      // ═══════════════════════════════════════════════════════
      // PASS B — Large slow-drifting smoke blobs
      // Each blob is an elliptical radial gradient that moves
      // along a sine/cosine Lissajous path at its own speed.
      // Using ellipses (scale x≠y) prevents circular regularity.
      // ═══════════════════════════════════════════════════════
      BLOBS.forEach((blob, i) => {
        const cx = (blob.rx * w + Math.sin(t * blob.speedX * w + blob.phaseX) * w * 0.18 + w) % w;
        const cy = (blob.ry * h + Math.cos(t * blob.speedY * h + blob.phaseY) * h * 0.14 + h) % h;
        const r  = blob.radiusBase + Math.sin(t * 0.3 + i) * blob.radiusVariance;

        // Organic ellipse: scale context asymmetrically
        const scaleX = 1 + 0.35 * Math.sin(t * 0.17 + i * 1.3);
        const scaleY = 1 + 0.25 * Math.cos(t * 0.21 + i * 0.9);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);

        // Colour: mix between cool slate-grey and deep navy
        const r_ = Math.round(60  + blob.colorMix * 20);
        const g_ = Math.round(70  + blob.colorMix * 15);
        const b_ = Math.round(100 + blob.colorMix * 50);
        const alpha = blob.alphaBase + 0.04 * Math.sin(t * 0.4 + i * 2.1);

        const grad = ctx.createRadialGradient(0, 0, r * 0.05, 0, 0, r / scaleX);
        grad.addColorStop(0,   `rgba(${r_}, ${g_}, ${b_}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${r_}, ${g_}, ${b_}, ${alpha * 0.55})`);
        grad.addColorStop(1,   `rgba(${r_}, ${g_}, ${b_}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r / scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ═══════════════════════════════════════════════════════
      // PASS C — Finer wisps (smaller, faster)
      // These sit "above" the blobs and add fine detail without
      // making the pattern feel mechanical.
      // ═══════════════════════════════════════════════════════
      WISPS.forEach((blob, i) => {
        const cx = (blob.rx * w + Math.sin(t * blob.speedX * w * 1.6 + blob.phaseX) * w * 0.11 + w) % w;
        const cy = (blob.ry * h + Math.cos(t * blob.speedY * h * 1.6 + blob.phaseY) * h * 0.09 + h) % h;
        const r  = blob.radiusBase + Math.sin(t * 0.55 + i * 1.7) * 30;
        const alpha = (blob.alphaBase * 0.65) * (0.7 + 0.3 * Math.sin(t * 0.6 + i));

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0,   `rgba(110, 125, 165, ${alpha})`);
        grad.addColorStop(0.6, `rgba(70,  85, 120, ${alpha * 0.4})`);
        grad.addColorStop(1,   `rgba(20,  28,  55, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ═══════════════════════════════════════════════════════
      // PASS D — Locked-level density patches
      // Before punching holes, add extra fog concentration
      // directly over locked (and not-yet-unlocked) locations.
      // Uses source-over to thicken the fog locally.
      // ═══════════════════════════════════════════════════════
      if (mapInstance) {
        ctx.globalCompositeOperation = 'source-over';

        delhiChapterData.levels.forEach((lvl, idx) => {
          const isDone     = isLevelCompleted(lvl.id);
          const isUnlocked = isLevelUnlocked(lvl.id);
          if (isDone || isUnlocked) return; // only truly locked levels

          try {
            const pos = mapInstance.project(lvl.coordinates);
            const pulse = 1 + 0.06 * Math.sin(t * 0.8 + idx * 1.5);
            const pr = LOCK_DENSITY_RADIUS * pulse;

            const lockGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pr);
            lockGrad.addColorStop(0,   `rgba(4, 7, 18, ${LOCK_DENSITY_EXTRA})`);
            lockGrad.addColorStop(0.6, `rgba(4, 7, 18, ${LOCK_DENSITY_EXTRA * 0.5})`);
            lockGrad.addColorStop(1,    'rgba(4, 7, 18, 0)');
            ctx.fillStyle = lockGrad;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, pr, 0, Math.PI * 2);
            ctx.fill();
          } catch (_) { /* map not ready or off-screen — silently skip */ }
        });
      }

      // ═══════════════════════════════════════════════════════
      // PASS E — Punch holes for completed + active levels
      // destination-out erases the fog pixels that were drawn
      // in the passes above, revealing the map below.
      // ═══════════════════════════════════════════════════════
      if (mapInstance) {
        ctx.globalCompositeOperation = 'destination-out';

        delhiChapterData.levels.forEach((lvl, idx) => {
          const isDone     = isLevelCompleted(lvl.id);
          const isNextTarget = isLevelUnlocked(lvl.id) && !isDone;

          try {
            const pos = mapInstance.project(lvl.coordinates);

            if (isDone) {
              // Ease clear radius toward target
              const current = clearRadiusRef.current[lvl.id] ?? 0;
              const target  = CLEAR_RADIUS_DONE;
              const next    = current + (target - current) * CLEAR_EASE_SPEED;
              clearRadiusRef.current[lvl.id] = next;
              const r = next;

              // Soft feathered edge — two nested gradients blend the boundary
              const clearGrad = ctx.createRadialGradient(
                pos.x, pos.y, r * 0.15,
                pos.x, pos.y, r
              );
              clearGrad.addColorStop(0,    'rgba(0,0,0, 0.98)');
              clearGrad.addColorStop(0.55, 'rgba(0,0,0, 0.90)');
              clearGrad.addColorStop(0.82, 'rgba(0,0,0, 0.50)');
              clearGrad.addColorStop(1,    'rgba(0,0,0, 0)');

              ctx.fillStyle = clearGrad;
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
              ctx.fill();

            } else if (isNextTarget) {
              // Breathing searchlight — gentle peek through the fog
              const breathe = ACTIVE_PEEK_BASE + Math.sin(t * 1.4) * ACTIVE_PEEK_PULSE;

              const peekGrad = ctx.createRadialGradient(
                pos.x, pos.y, 0,
                pos.x, pos.y, breathe
              );
              peekGrad.addColorStop(0,    'rgba(0,0,0, 0.55)');
              peekGrad.addColorStop(0.5,  'rgba(0,0,0, 0.25)');
              peekGrad.addColorStop(1,    'rgba(0,0,0, 0)');

              ctx.fillStyle = peekGrad;
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, breathe, 0, Math.PI * 2);
              ctx.fill();
            }
          } catch (_) { /* silently skip */ }
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
    // Re-run this effect when game state changes so clearRadiusRef
    // initialises correctly for newly completed levels.
  }, [completedLevels, isLevelCompleted, isLevelUnlocked, mapInstance]);

  return (
    <canvas
      ref={canvasRef}
      className="fog-system-canvas"
      aria-hidden="true"
    />
  );
}
