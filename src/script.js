import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders.js';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  totalImages: 10,
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralOffsetY: -2.0,
};

// ─── STATE ───────────────────────────────────────────────────────────────────
const state = {
  isMobile: false,
  width: 0,
  height: 0,
  scrollProgress: 0,
  scrollVelocity: 0,
  spinVelocity: 0,
  targetCameraY: 0,
  currentCameraY: 0,
  mouseX: 0,
  mouseY: 0,
  targetTiltX: 0,
  targetTiltZ: 0,
  currentTiltX: 0,
  currentTiltZ: 0,
};

// ─── LENIS ───────────────────────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  smoothWheel: true,
  smoothTouch: false,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ({ scroll, limit, velocity }) => {
  state.scrollProgress = Math.min(scroll / Math.max(limit, 1), 1);
  state.scrollVelocity = velocity;
  state.spinVelocity += velocity * CONFIG.scrollRotationMultiplier * CONFIG.scrollMultiplier;
  ScrollTrigger.update();
});

(function lenisRaf(time) {
  lenis.raf(time);
  requestAnimationFrame(lenisRaf);
})(0);

// ─── GSAP SCROLL REVEALS ─────────────────────────────────────────────────────
const ctx = gsap.context(() => {
  gsap.utils.toArray('.reveal-text').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => ctx.revert());
}

window.addEventListener('load', () => ScrollTrigger.refresh());

// ─── CURVED TILE GEOMETRY ────────────────────────────────────────────────────
function createCurvedTileGeometry(radius, arcAngle, tileHeight, segments) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const theta = -arcAngle / 2 + t * arcAngle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    // bottom vertex
    positions.push(x, -tileHeight / 2, z);
    uvs.push(t, 0);

    // top vertex
    positions.push(x, tileHeight / 2, z);
    uvs.push(t, 1);
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b);
    indices.push(b, c, d);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// ─── THREE.JS SETUP (deferred) ───────────────────────────────────────────────
function initWebGL() {
  const heroEl = document.querySelector('.hero');
  state.width = heroEl.clientWidth;
  state.height = heroEl.clientHeight;
  state.isMobile = state.width < 768;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, state.width / state.height, 0.1, 100);
  camera.position.set(0, 0, CONFIG.cameraZ + (state.isMobile ? 3 : 0));

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(state.width, state.height);
  renderer.domElement.classList.add('hero__canvas');
  heroEl.appendChild(renderer.domElement);

  // ─── LOAD TEXTURES ─────────────────────────────────────────────────────────
  const loader = new THREE.TextureLoader();
  const fallback = () => {
    const dt = new THREE.DataTexture(new Uint8Array([22, 22, 24, 255]), 1, 1);
    dt.needsUpdate = true;
    return dt;
  };

  const texturePromises = Array.from({ length: CONFIG.totalImages }, (_, i) => {
    return new Promise((resolve) => {
      loader.load(
        `/images/img${i + 1}.jpg`,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          resolve(tex);
        },
        undefined,
        () => resolve(fallback())
      );
    });
  });

  Promise.all(texturePromises).then((textures) => {
    // ─── BUILD SPIRAL ───────────────────────────────────────────────────────
    const totalTiles = CONFIG.tilesPerRevolution * CONFIG.revolutions;
    const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution;
    const arcAngle = angleStep + CONFIG.tileOverlap;
    const chord = 2 * CONFIG.startRadius * Math.sin(angleStep / 2);
    const tileHeight = chord * CONFIG.tileHeightRatio;
    const startY = ((totalTiles - 1) / 2) * CONFIG.spiralGap;

    const spiral = new THREE.Group();

    for (let i = 0; i < totalTiles; i++) {
      const t = i / (totalTiles - 1);
      const radius = CONFIG.startRadius + (CONFIG.endRadius - CONFIG.startRadius) * t;

      const geometry = createCurvedTileGeometry(radius, arcAngle, tileHeight, CONFIG.tileSegments);

      const texture = textures[i % CONFIG.totalImages];
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uMap: { value: texture },
          uCameraPosition: { value: camera.position },
        },
        side: THREE.DoubleSide,
        transparent: true,
      });

      const tile = new THREE.Mesh(geometry, material);
      tile.position.y = startY - i * CONFIG.spiralGap;
      tile.rotation.y = i * angleStep;
      spiral.add(tile);
    }

    spiral.position.y = CONFIG.spiralOffsetY;
    scene.add(spiral);

    // Fade in canvas once textures are ready
    renderer.domElement.style.opacity = '1';

    // ─── RENDER LOOP ──────────────────────────────────────────────────────
    function tick() {
      requestAnimationFrame(tick);

      spiral.rotation.y += CONFIG.baseRotationSpeed + state.spinVelocity;
      state.spinVelocity *= CONFIG.rotationDecay;

      if (!state.isMobile) {
        state.currentTiltX += (state.targetTiltX - state.currentTiltX) * CONFIG.cameraSmoothing;
        state.currentTiltZ += (state.targetTiltZ - state.currentTiltZ) * CONFIG.cameraSmoothing;
        spiral.rotation.x = state.currentTiltX;
        spiral.rotation.z = state.currentTiltZ;
      }

      state.targetCameraY = -state.scrollProgress * CONFIG.cameraYMultiplier * 10;
      state.currentCameraY += (state.targetCameraY - state.currentCameraY) * CONFIG.cameraSmoothing;
      camera.position.y = state.currentCameraY;
      camera.lookAt(0, state.currentCameraY * 0.4, 0);

      renderer.render(scene, camera);
    }

    tick();
  });

  // ─── MOUSE PARALLAX ──────────────────────────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    if (state.isMobile) return;
    state.mouseX = (e.clientX / innerWidth) * 2 - 1;
    state.mouseY = (e.clientY / innerHeight) * 2 - 1;
    state.targetTiltX = state.mouseY * CONFIG.parallaxStrength;
    state.targetTiltZ = state.mouseX * CONFIG.parallaxStrength * -0.5;
  });

  // ─── RESIZE ──────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    state.isMobile = heroEl.clientWidth < 768;
    state.width = heroEl.clientWidth;
    state.height = heroEl.clientHeight;

    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
    camera.position.z = CONFIG.cameraZ + (state.isMobile ? 3 : 0);

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(state.width, state.height);

    if (state.isMobile) {
      state.targetTiltX = 0;
      state.targetTiltZ = 0;
    }
  });
}

// ─── DEFERRED INIT ───────────────────────────────────────────────────────────
if ('requestIdleCallback' in window) {
  requestIdleCallback(initWebGL, { timeout: 1500 });
} else {
  requestAnimationFrame(() => requestAnimationFrame(initWebGL));
}
