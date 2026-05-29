// ============================================================================
// NOCTURNE — entry point
// Three.js 3D spiral image gallery hero + Lenis smooth scroll + GSAP reveals.
// ============================================================================

import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { vertexShader, fragmentShader } from './shaders.js';

// ----------------------------------------------------------------------------
// CONFIG — single source of truth for the spiral. Tune freely.
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Mutable runtime state (single object, per spec).
// ----------------------------------------------------------------------------
const state = {
  isMobile: window.innerWidth < 768,
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

// ----------------------------------------------------------------------------
// DOM target — the hero section is the WebGL container.
// ----------------------------------------------------------------------------
const hero = document.querySelector('.hero');

// ============================================================================
// SMOOTH SCROLL (Lenis) — the sole scroll source.
// ============================================================================
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  smoothWheel: true,
  smoothTouch: false,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ({ scroll, limit, velocity }) => {
  state.scrollProgress = Math.min(scroll / Math.max(limit, 1), 1);
  state.scrollVelocity = velocity;
  state.spinVelocity +=
    velocity * CONFIG.scrollRotationMultiplier * CONFIG.scrollMultiplier;

  // Keep GSAP triggers in sync with the interpolated scroll position.
  ScrollTrigger.update();
});

// Drive Lenis in its own rAF loop.
function lenisRaf(time) {
  lenis.raf(time);
  requestAnimationFrame(lenisRaf);
}
requestAnimationFrame(lenisRaf);

// ============================================================================
// GSAP SCROLL REVEALS — text below the hero only. Never the hero itself.
// ============================================================================
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
      },
    );
  });
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => ctx.revert());
}

window.addEventListener('load', () => ScrollTrigger.refresh());

// ============================================================================
// CURVED TILE GEOMETRY
// A BufferGeometry that follows an arc of `arcAngle` radians at a given
// radius — NOT a flat plane. Each slice pushes a top + bottom vertex; pairs
// of triangles stitch adjacent slices together.
// ============================================================================
function createCurvedTileGeometry(radius, arcAngle, tileHeight, segments) {
  const positions = [];
  const uvs = [];
  const indices = [];

  const halfH = tileHeight / 2;
  const startAngle = -arcAngle / 2; // centre the arc on the tile's local frame

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const theta = startAngle + t * arcAngle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    // top vertex
    positions.push(x, halfH, z);
    uvs.push(t, 1);

    // bottom vertex
    positions.push(x, -halfH, z);
    uvs.push(t, 0);
  }

  for (let i = 0; i < segments; i++) {
    const topL = i * 2;
    const botL = i * 2 + 1;
    const topR = (i + 1) * 2;
    const botR = (i + 1) * 2 + 1;

    // two triangles per quad
    indices.push(topL, botL, topR);
    indices.push(topR, botL, botR);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// ============================================================================
// WEBGL SCENE
// ============================================================================
let renderer;
let scene;
let camera;
let spiral;

function getHeroSize() {
  return {
    width: hero.clientWidth || window.innerWidth,
    height: hero.clientHeight || window.innerHeight,
  };
}

// Fallback texture: dark grey 1×1 so the spiral always renders.
function createFallbackTexture() {
  const data = new Uint8Array([22, 22, 24, 255]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

function loadTextures() {
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const configure = (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  };

  const promises = [];
  for (let i = 1; i <= CONFIG.totalImages; i++) {
    const url = `/images/img${i}.jpg`;
    promises.push(
      new Promise((resolve) => {
        loader.load(
          url,
          (tex) => resolve(configure(tex)),
          undefined,
          () => resolve(createFallbackTexture()),
        );
      }),
    );
  }
  return Promise.all(promises);
}

function buildSpiral(textures) {
  const {
    tilesPerRevolution,
    revolutions,
    startRadius,
    endRadius,
    tileHeightRatio,
    tileSegments,
    spiralGap,
    tileOverlap,
  } = CONFIG;

  const totalTiles = tilesPerRevolution * revolutions; // 75
  const angleStep = (Math.PI * 2) / tilesPerRevolution;
  const arcAngle = angleStep + tileOverlap;
  const chord = 2 * startRadius * Math.sin(angleStep / 2);
  const tileHeight = chord * tileHeightRatio;

  // Stack tiles vertically, centred around y = 0.
  const startY = ((totalTiles - 1) * spiralGap) / 2;

  spiral = new THREE.Group();

  for (let i = 0; i < totalTiles; i++) {
    // Radius lerps linearly from start → end along the helix (cone-like taper).
    const radiusT = totalTiles > 1 ? i / (totalTiles - 1) : 0;
    const radius = startRadius + (endRadius - startRadius) * radiusT;

    const geometry = createCurvedTileGeometry(
      radius,
      arcAngle,
      tileHeight,
      tileSegments,
    );

    const texture = textures[i % textures.length];
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
    tile.position.y = startY - i * spiralGap;
    tile.rotation.y = i * angleStep;

    spiral.add(tile);
  }

  spiral.position.y = CONFIG.spiralOffsetY;
  scene.add(spiral);
}

function initWebGL() {
  const { width, height } = getHeroSize();
  state.width = width;
  state.height = height;
  state.isMobile = window.innerWidth < 768;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, CONFIG.cameraZ + (state.isMobile ? 3 : 0));

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.classList.add('hero__canvas');
  hero.appendChild(renderer.domElement);

  loadTextures().then((textures) => {
    buildSpiral(textures);
    // Reveal the canvas once the spiral is populated.
    renderer.domElement.classList.add('hero__canvas--ready');
    tick();
  });

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);
}

// ----------------------------------------------------------------------------
// RENDER LOOP
// ----------------------------------------------------------------------------
function tick() {
  requestAnimationFrame(tick);
  if (!spiral) return;

  // Base spin + scroll-driven spin that decays smoothly.
  spiral.rotation.y += CONFIG.baseRotationSpeed + state.spinVelocity;
  state.spinVelocity *= CONFIG.rotationDecay;

  // Mouse parallax tilt (desktop only).
  if (!state.isMobile) {
    state.currentTiltX +=
      (state.targetTiltX - state.currentTiltX) * CONFIG.cameraSmoothing;
    state.currentTiltZ +=
      (state.targetTiltZ - state.currentTiltZ) * CONFIG.cameraSmoothing;
    spiral.rotation.x = state.currentTiltX;
    spiral.rotation.z = state.currentTiltZ;
  }

  // Scroll → camera Y (smoothed).
  state.targetCameraY = -state.scrollProgress * CONFIG.cameraYMultiplier * 10;
  state.currentCameraY +=
    (state.targetCameraY - state.currentCameraY) * CONFIG.cameraSmoothing;
  camera.position.y = state.currentCameraY;
  camera.lookAt(0, state.currentCameraY * 0.4, 0);

  renderer.render(scene, camera);
}

// ----------------------------------------------------------------------------
// MOUSE PARALLAX (desktop only)
// ----------------------------------------------------------------------------
function onMouseMove(e) {
  if (state.isMobile) return;
  state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  state.targetTiltX = state.mouseY * CONFIG.parallaxStrength;
  state.targetTiltZ = state.mouseX * CONFIG.parallaxStrength * -0.5;
}

// ----------------------------------------------------------------------------
// RESIZE
// ----------------------------------------------------------------------------
function onResize() {
  state.isMobile = window.innerWidth < 768;
  const { width, height } = getHeroSize();
  state.width = width;
  state.height = height;

  camera.aspect = width / height;
  camera.position.z = CONFIG.cameraZ + (state.isMobile ? 3 : 0);
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  if (state.isMobile) {
    state.targetTiltX = 0;
    state.targetTiltZ = 0;
  }

  ScrollTrigger.refresh();
}

// ============================================================================
// Defer WebGL behind idle time so the hero headline can register as the LCP
// candidate without WebGL blocking first paint.
// ============================================================================
function deferWebGL() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initWebGL, { timeout: 1500 });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(initWebGL));
  }
}

deferWebGL();
