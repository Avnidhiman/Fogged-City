import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { audioSystem } from '../../utils/audioSystem';
import '../../styles/cloudWorld.css';

/**
 * Creates an organic procedural volumetric cloud puff texture
 * using HTML Canvas radial gradients and layered fractal noise.
 */
function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.25, 'rgba(240, 246, 255, 0.82)');
  gradient.addColorStop(0.55, 'rgba(195, 215, 240, 0.48)');
  gradient.addColorStop(0.75, 'rgba(148, 175, 210, 0.18)');
  gradient.addColorStop(1, 'rgba(100, 130, 175, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // Add subtle fractal cloud billow noise
  for (let i = 0; i < 28; i++) {
    const rx = 256 + (Math.random() - 0.5) * 200;
    const ry = 256 + (Math.random() - 0.5) * 200;
    const rad = 60 + Math.random() * 110;
    const pGrad = ctx.createRadialGradient(rx, ry, 10, rx, ry, rad);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    pGrad.addColorStop(1, 'rgba(220, 235, 255, 0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

export default function CinematicCloudWorld({ onStartExploring }) {
  const mountRef = useRef(null);
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080d1a, 0.0011);

    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      1,
      4000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- 2. Atmospheric Volumetric Lighting ---
    const ambientLight = new THREE.AmbientLight(0x45607e, 1.9);
    scene.add(ambientLight);

    const keySunLight = new THREE.DirectionalLight(0xffedd5, 2.6);
    keySunLight.position.set(200, 600, 800);
    scene.add(keySunLight);

    const softFillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    softFillLight.position.set(-400, -200, 400);
    scene.add(softFillLight);

    // --- 3. Multi-Layer Cloud Geometry & Meshes ---
    const cloudTexture = createCloudTexture();
    const cloudGeo = new THREE.PlaneGeometry(540, 540);

    const cloudsLeft = [];
    const cloudsRight = [];

    const numClouds = 95;
    for (let i = 0; i < numClouds; i++) {
      const cloudMat = new THREE.MeshLambertMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.35 + Math.random() * 0.45,
        depthWrite: false,
        blending: THREE.NormalBlending
      });

      const mesh = new THREE.Mesh(cloudGeo, cloudMat);

      const zPos = 800 - (i * 18);
      mesh.position.z = zPos;

      const isLeft = i % 2 === 0;
      const xSpread = isLeft
        ? -220 - Math.random() * 550
        : 220 + Math.random() * 550;

      mesh.position.x = xSpread;
      mesh.position.y = (Math.random() - 0.5) * 550;
      mesh.rotation.z = Math.random() * Math.PI * 2;

      const scale = 1.2 + Math.random() * 1.6;
      mesh.scale.set(scale, scale, 1);

      mesh.userData = {
        origX: mesh.position.x,
        origY: mesh.position.y,
        origZ: mesh.position.z,
        rotSpeed: (Math.random() - 0.5) * 0.0012,
        driftSpeedX: (Math.random() - 0.5) * 0.12,
        driftSpeedY: (Math.random() - 0.5) * 0.08,
        isLeft: isLeft
      };

      if (isLeft) {
        cloudsLeft.push(mesh);
      } else {
        cloudsRight.push(mesh);
      }

      scene.add(mesh);
    }

    // --- 4. Mouse Parallax Tracking ---
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.12;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.12;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- 5. Resize Handling ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 6. Animation Loop ---
    let animFrameId;
    let lastTime = performance.now();

    const animate = (currentTime = performance.now()) => {
      animFrameId = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Smooth mouse follow
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      if (!isTransitioning) {
        camera.position.x = currentMouseX;
        camera.position.y = -currentMouseY;
      }

      // Gentle continuous drifting
      const allClouds = [...cloudsLeft, ...cloudsRight];
      for (let i = 0; i < allClouds.length; i++) {
        const c = allClouds[i];
        c.rotation.z += c.userData.rotSpeed;
        if (!isTransitioning) {
          c.position.x += c.userData.driftSpeedX;
          c.position.y += c.userData.driftSpeedY;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    mountRef.current._three = {
      scene,
      camera,
      cloudsLeft,
      cloudsRight,
      renderer
    };

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      cloudTexture.dispose();
      cloudGeo.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // --- 7. Cloud-Reveal Cinematic Transition ---
  const handleStartExploringClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    audioSystem.startAmbientWind();
    audioSystem.playMistParting();

    const threeData = mountRef.current?._three;
    if (!threeData) {
      if (onStartExploring) onStartExploring();
      return;
    }

    const { camera, cloudsLeft, cloudsRight } = threeData;

    const tl = gsap.timeline({
      onComplete: () => {
        if (onStartExploring) onStartExploring();
      }
    });

    // 1. Dissolve and push interface forward
    tl.to(titleRef.current, {
      opacity: 0,
      scale: 1.15,
      y: -40,
      duration: 1.1,
      ease: 'power2.inOut'
    }, 0);

    tl.to(buttonRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      ease: 'power2.in'
    }, 0);

    // 2. Camera pushes forward through the center
    tl.to(camera.position, {
      z: -300,
      duration: 2.6,
      ease: 'power3.inOut'
    }, 0.2);

    // 3. Left clouds billow and part to the left
    cloudsLeft.forEach((cloud, idx) => {
      tl.to(cloud.position, {
        x: cloud.userData.origX - 1100 - (idx * 15),
        duration: 2.4,
        ease: 'power2.inOut'
      }, 0.1 + idx * 0.01);

      tl.to(cloud.material, {
        opacity: 0,
        duration: 2.2,
        ease: 'power1.in'
      }, 0.5);
    });

    // 4. Right clouds billow and part to the right
    cloudsRight.forEach((cloud, idx) => {
      tl.to(cloud.position, {
        x: cloud.userData.origX + 1100 + (idx * 15),
        duration: 2.4,
        ease: 'power2.inOut'
      }, 0.1 + idx * 0.01);

      tl.to(cloud.material, {
        opacity: 0,
        duration: 2.2,
        ease: 'power1.in'
      }, 0.5);
    });

    // 5. Parting mist curtains
    if (curtainLeftRef.current && curtainRightRef.current) {
      tl.to(curtainLeftRef.current, {
        x: '-100%',
        duration: 2.0,
        ease: 'power2.inOut'
      }, 0.3);
      tl.to(curtainRightRef.current, {
        x: '100%',
        duration: 2.0,
        ease: 'power2.inOut'
      }, 0.3);
    }
  };

  return (
    <div className="cloud-world-container" ref={mountRef}>
      {/* Vignette & Soft Volumetric Lighting */}
      <div className="cloud-world-vignette" />

      {/* Parting Mist Curtains */}
      <div className="mist-parting-curtains">
        <div className="mist-curtain mist-curtain-left" ref={curtainLeftRef} />
        <div className="mist-curtain mist-curtain-right" ref={curtainRightRef} />
      </div>

      {/* Cinematic Center Game Title & CTA */}
      <div className="cloud-world-interface">
        <div className="title-container" ref={titleRef}>
          <div className="cloud-world-badge">
            <span>MYSTERY EXPLORATION ADVENTURE</span>
          </div>

          <h1 className="cloud-world-title">THE FOGGED CITY</h1>

          <p className="cloud-world-subtitle">
            "Every city has secrets. Some are just ridiculous."
          </p>
        </div>

        <button
          ref={buttonRef}
          type="button"
          className="btn-enter-mist"
          onClick={handleStartExploringClick}
          aria-label="Start Exploring The Fogged City"
        >
          <span>START EXPLORING</span>
        </button>
      </div>
    </div>
  );
}
