// ============================================================================
// GLSL shaders for the spiral gallery tiles.
// Named exports consumed by the ShaderMaterial in src/script.js.
// Kept deliberately minimal: edge vignette + depth fade, nothing more.
// ============================================================================

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // --- Subtle per-tile edge vignette ---------------------------------
    vec2 centered = vUv - 0.5;
    float edge = 1.0 - smoothstep(0.34, 0.86, length(centered));
    edge = mix(0.78, 1.0, edge);

    // --- Depth fade based on distance from the camera ------------------
    float dist = distance(vWorldPosition, uCameraPosition);
    float depth = 1.0 - smoothstep(8.0, 22.0, dist);
    depth = mix(0.5, 1.0, depth);

    // --- Cinematic touch: gently desaturate the far tiles --------------
    vec3 color = tex.rgb;
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, mix(0.7, 1.0, depth));

    // --- Compose -------------------------------------------------------
    color = color * edge * depth;

    gl_FragColor = vec4(color, tex.a);
  }
`;
