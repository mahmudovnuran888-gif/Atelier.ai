export const vertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const fragmentShader = /* glsl */`
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // Subtle per-tile edge vignette
    vec2 centered = vUv - 0.5;
    float edge = 1.0 - smoothstep(0.34, 0.86, length(centered));
    edge = mix(0.78, 1.0, edge);

    // Depth fade based on distance from camera
    float dist = distance(vWorldPosition, uCameraPosition);
    float depth = 1.0 - smoothstep(8.0, 22.0, dist);
    depth = mix(0.5, 1.0, depth);

    // Slight desaturation for far tiles
    float luma = dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 desaturated = mix(vec3(luma), tex.rgb, depth);

    vec3 color = desaturated * edge * depth;
    gl_FragColor = vec4(color, tex.a);
  }
`;
