# NOCTURNE

A premium dark editorial landing page for an (imagined) independent creative
studio in Lisbon. The centerpiece is a full-screen **Three.js 3D spiral image
gallery hero** — a cone of curved image tiles that spins on its own, reacts to
scroll velocity, and tilts with the mouse. Below it, an editorial page stack
reveals itself with GSAP as you scroll through Lenis-smoothed motion.

Built from scratch with vanilla JavaScript — no framework, no TypeScript.

> Interaction style inspired by hero treatments like studiodialect.com. All
> design, copy, layout and visual direction are original.

---

## Features

- **3D spiral gallery hero** — 75 curved `BufferGeometry` tiles arranged on a
  tapering helix, each drawn with a custom `ShaderMaterial`.
- **Custom GLSL shaders** — per-tile edge vignette + camera-distance depth fade
  with subtle desaturation of far tiles. No postprocessing libraries.
- **Lenis smooth scroll** as the single scroll source; GSAP `ScrollTrigger`
  reads from it so triggers stay perfectly in sync.
- **Scroll-velocity spin** — flicking the wheel spins the spiral; the spin
  decays smoothly back to its idle rotation.
- **Scroll → camera** — the camera glides down its Y axis as you scroll,
  re-aiming at the spiral.
- **Mouse parallax** — desktop-only tilt of the whole spiral group.
- **GSAP reveals** — every block of text below the hero fades + rises once.
- **LCP-friendly** — all WebGL setup is deferred behind `requestIdleCallback`
  so the hero headline paints first.
- **Editorial detailing** — film-grain overlay (inline SVG, no asset),
  difference-blend nav, availability pulse dot, hairline list hovers, animated
  contact arrow, fluid `clamp()` type.

---

## Install & run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Requires Node 18+.

---

## Project structure

```
.
├── index.html            # semantic markup, Google Fonts, no inline JS/CSS
├── package.json
├── vite.config.js
├── .gitignore
├── public/
│   └── images/
│       └── img1.jpg … img10.jpg   # gallery textures (replaceable)
└── src/
    ├── script.js         # entry: Three.js + Lenis + GSAP
    ├── shaders.js        # named exports: vertexShader, fragmentShader
    └── styles.css        # all styling
```

Each concern lives in its own file. There is no JavaScript inside the HTML and
no inline styles in markup.

---

## The CONFIG object

Everything about the spiral is driven by one object at the top of
`src/script.js`:

| Key | Default | What it does |
| --- | --- | --- |
| `totalImages` | `10` | How many textures to load (`img1…imgN.jpg`). |
| `tilesPerRevolution` | `15` | Tiles in one full 360° turn → sets each tile's arc width. |
| `revolutions` | `5` | How many turns the helix makes. `total = perRev × revolutions = 75`. |
| `startRadius` | `5` | Helix radius at the top. |
| `endRadius` | `3.5` | Helix radius at the bottom (taper → cone). |
| `tileHeightRatio` | `1.1` | Tile height as a multiple of its chord width. |
| `tileSegments` | `24` | Slices per tile arc — higher = smoother curve. |
| `spiralGap` | `0.35` | Vertical gap between stacked tiles. |
| `tileOverlap` | `0.005` | Tiny extra arc to hide seams between tiles. |
| `cameraZ` | `12` | Camera distance from the spiral. |
| `cameraSmoothing` | `0.075` | Lerp factor for camera Y and tilt (lower = floatier). |
| `baseRotationSpeed` | `0.001` | Idle spin per frame. |
| `scrollRotationMultiplier` | `0.0035` | How strongly scroll velocity feeds the spin. |
| `rotationDecay` | `0.9` | Per-frame decay of scroll-spin (closer to 1 = longer glide). |
| `scrollMultiplier` | `1.25` | Extra gain on scroll → spin. |
| `cameraYMultiplier` | `0.2` | How far the camera travels down on full scroll. |
| `parallaxStrength` | `0.1` | Mouse-tilt magnitude (desktop). |
| `spiralOffsetY` | `-2.0` | Vertical offset of the whole spiral group. |

---

## How it works

### Geometry
Each tile is a **curved `BufferGeometry`**, not a flat plane.
`createCurvedTileGeometry()` walks `tileSegments + 1` slices along an arc of
`arcAngle` radians. At each slice it pushes two vertices — a top
(`y = +tileHeight/2`) and a bottom (`y = −tileHeight/2`) — placed on a circle
via `x = sin(θ)·radius`, `z = cos(θ)·radius`. UVs run `u = t` across the arc and
`v = 1/0` top/bottom. Pairs of triangles stitch adjacent slices, then
`computeVertexNormals()` finishes it.

The build loop creates `tilesPerRevolution × revolutions = 75` tiles. Tile `i`
is rotated `i × angleStep` around Y and dropped `spiralGap` lower than the last,
while its radius lerps linearly from `startRadius` to `endRadius` — producing
the gentle cone. All tiles join a single `THREE.Group` (`spiral`) offset by
`spiralOffsetY`.

### Scroll → camera
Lenis reports `scroll / limit` as `state.scrollProgress` (0→1). Each frame the
target camera Y is `-scrollProgress × cameraYMultiplier × 10`, eased toward by
`cameraSmoothing`. The camera then `lookAt(0, currentCameraY × 0.4, 0)`, so it
descends and re-aims as you read down the page.

### Lenis velocity → rotation
On every Lenis scroll event, `velocity × scrollRotationMultiplier ×
scrollMultiplier` is **added** to `state.spinVelocity`. The render loop applies
`baseRotationSpeed + spinVelocity` to `spiral.rotation.y`, then multiplies
`spinVelocity` by `rotationDecay` (0.9). Fast scrolling whips the spiral; it
coasts back to the idle spin.

### Mouse parallax
On `mousemove` (desktop only), the pointer is mapped to `[-1, 1]` and stored as
`targetTiltX/targetTiltZ` scaled by `parallaxStrength`. The render loop lerps
`currentTilt*` toward the targets and applies them to `spiral.rotation.x/z`, so
the whole cone leans toward the cursor. Disabled and zeroed on mobile/resize.

### Replacing the images
Drop your own files into **`public/images/`** named `img1.jpg … img10.jpg`
(portrait/4:5 works best). Change the count with `CONFIG.totalImages`. Textures
are loaded with correct color space, anisotropy and mipmapping; if one fails to
load it falls back to a 1×1 dark-grey texture so the spiral always renders.

### Tuning the look
- **Tighter / looser cone:** `startRadius`, `endRadius`, `spiralGap`.
- **Denser / sparser wrap:** `tilesPerRevolution`, `revolutions`.
- **Lazier / snappier spin:** `baseRotationSpeed`, `rotationDecay`,
  `scrollRotationMultiplier`, `scrollMultiplier`.
- **Camera framing:** `cameraZ`, `cameraYMultiplier`, `cameraSmoothing`,
  `spiralOffsetY`.
- **Parallax feel:** `parallaxStrength`.
- **Shader mood:** edit the vignette / depth-fade constants in
  `src/shaders.js`.

---

## Tech stack

Vite 5 · Three.js · Lenis · GSAP + ScrollTrigger · custom GLSL · plain CSS ·
vanilla JS modules.
