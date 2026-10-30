import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ArrowRight, Compass } from 'lucide-react';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/cloudWorld.css';

// Textured cloud billboards: layered noise gives detailed edges rather than smooth circles.
// This is a performant 2.5D cloudscape, not true volumetric ray marching.
function createCloudTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const hash = (x, y) => {
    let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u;
    const b = hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u;
    return a * (1 - v) + b * v;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - size / 2) / (size / 2);
      const ny = (y - size / 2) / (size / 2);
      const n = noise(x / 62, y / 62) * 0.48 +
                noise(x / 25, y / 25) * 0.30 +
                noise(x / 9, y / 9) * 0.15 +
                noise(x / 3.5, y / 3.5) * 0.07;
      const distortedRadius = Math.sqrt(nx * nx + ny * ny) + (0.48 - n) * 0.68;
      const shape = Math.max(0, Math.min(1, (0.94 - distortedRadius) * 4.2));
      const density = Math.max(0, Math.min(1, (n - 0.28) * 2.2));
      const alpha = Math.pow(shape * density, 1.25);
      const light = Math.round(167 + n * 80);
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, light + 8);
      img.data[i + 1] = Math.min(255, light + 14);
      img.data[i + 2] = Math.min(255, light + 24);
      img.data[i + 3] = Math.round(alpha * 245);
    }
  }
  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function IntroScreen({ onEnterUnknown }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const timelineRef = useRef(null);
  const phaseRef = useRef('intro');
  const [phase, setPhase] = useState('intro');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080e1c, 0.00042);
    const camera = new THREE.PerspectiveCamera(58, 1, 1, 4000);
    camera.position.set(0, 0, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'cloud-webgl-canvas';
    container.prepend(renderer.domElement);

    const texture = createCloudTexture();
    const geometry = new THREE.PlaneGeometry(600, 600);
    const clouds = [];
    // Three distinct depth bands create foreground, midground and background parallax.
    for (let i = 0; i < 125; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const band = Math.floor(i / 42);
      const depth = 780 - band * 430 - Math.random() * 290;
      const x = side * (185 + Math.random() * 750);
      const y = (Math.random() - 0.5) * 950;
      const scale = 0.85 + Math.random() * 1.7 + (band === 0 ? 0.4 : 0);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 0.34 + Math.random() * 0.38,
        color: new THREE.Color().setHSL(0.59, 0.23, 0.66 + Math.random() * 0.2),
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, depth);
      mesh.scale.set(scale * 1.3, scale * (0.65 + Math.random() * 0.3), 1);
      mesh.rotation.z = (Math.random() - 0.5) * 0.45;
      mesh.userData = {
        originalX: x,
        side,
        drift: (Math.random() - 0.5) * 0.17,
        float: Math.random() * Math.PI * 2,
        baseY: y
      };
      clouds.push(mesh);
      scene.add(mesh);
    }

    let mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;
    let frameId = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onMouseMove = (e) => {
      if (reducedMotion) return;
      const r = container.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 70;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 45;
    };
    const resize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    container.addEventListener('pointermove', onMouseMove);

    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (phaseRef.current === 'intro') {
        smoothX += (mouseX - smoothX) * Math.min(1, dt * 2.3);
        smoothY += (mouseY - smoothY) * Math.min(1, dt * 2.3);
        camera.position.x = smoothX;
        camera.position.y = -smoothY;
      }
      if (!reducedMotion && phaseRef.current === 'intro') {
        clouds.forEach((cloud) => {
          cloud.position.x += cloud.userData.drift * dt * 18;
          cloud.position.y = cloud.userData.baseY + Math.sin(t * 0.12 + cloud.userData.float) * 12;
        });
      }
      renderer.render(scene, camera);
    };
    animate();
    sceneRef.current = { camera, clouds, reducedMotion };

    return () => {
      timelineRef.current?.kill();
      cancelAnimationFrame(frameId);
      observer.disconnect();
      container.removeEventListener('pointermove', onMouseMove);
      clouds.forEach((cloud) => cloud.material.dispose());
      geometry.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, []);

  const handleEnterClick = () => {
    if (phaseRef.current !== 'intro') return;
    phaseRef.current = 'transition';
    try {
      audioSystem.startAmbientWind();
      audioSystem.playMistParting();
    } catch (error) {
      console.warn('Intro audio unavailable:', error);
    }
    const data = sceneRef.current;
    if (!data || data.reducedMotion) {
      phaseRef.current = 'chapter-reveal';
      setPhase('chapter-reveal');
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        phaseRef.current = 'chapter-reveal';
        setPhase('chapter-reveal');
      }
    });
    timelineRef.current = tl;
    tl.to('.cloud-world-interface--intro', { autoAlpha: 0, y: -35, scale: 1.05, duration: 0.8, ease: 'power2.inOut' }, 0);
    tl.to(data.camera.position, { z: 350, duration: 2.5, ease: 'power3.inOut' }, 0.1);
    data.clouds.forEach((cloud, i) => {
      tl.to(cloud.position, {
        x: cloud.userData.originalX + cloud.userData.side * (1000 + i * 3),
        duration: 2.3,
        ease: 'power2.inOut'
      }, 0.15);
    });
  };

  const handleProceed = () => {
    try { audioSystem.playClick(); } catch (error) { console.warn('Click audio unavailable:', error); }
    onEnterUnknown?.();
  };

  return (
    <main className="cloud-world-container" ref={mountRef}>
      <div className="cloud-world-stars" aria-hidden="true" />
      <div className="cloud-world-moonlight" aria-hidden="true" />
      <div className="cloud-world-vignette" aria-hidden="true" />
      {phase === 'intro' && (
        <div className="cloud-world-interface cloud-world-interface--intro">
          <div className="cloud-world-badge"><span className="badge-line" />AN INTERACTIVE MYSTERY<span className="badge-line" /></div>
          <p className="cloud-world-eyebrow">SOME SECRETS ARE BETTER LEFT IN THE MIST</p>
          <h1 className="cloud-world-title">FOGGED <span>CITY</span></h1>
          <p className="cloud-world-subtitle">Follow the clues. Uncover the unseen.</p>
          <button type="button" className="btn-enter-mist" onClick={handleEnterClick}>
            <span>ENTER THE UNKNOWN</span><ArrowRight size={19} aria-hidden="true" />
          </button>
          <p className="cloud-world-footnote">YOUR STORY BEGINS BEYOND THE CLOUDS</p>
        </div>
      )}
      {phase === 'chapter-reveal' && (
        <div className="cloud-world-interface cloud-world-interface--chapter">
          <section className="cloud-world-chapter-card" aria-label="Chapter one">
            <div className="cloud-world-badge"><Compass size={15} /> THE FIRST CHAPTER</div>
            <p className="cloud-world-eyebrow">THE CITY IS WAITING</p>
            <h2>DELHI <span>AFTER DARK</span></h2>
            <p>Every street has a story. Every clue brings you closer.</p>
            <button type="button" className="btn-enter-mist" onClick={handleProceed}>
              <span>BEGIN CHAPTER 01</span><ArrowRight size={19} aria-hidden="true" />
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
