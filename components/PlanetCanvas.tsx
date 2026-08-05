"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

interface IRenderer {
  setSize(w: number, h: number, updateStyle: boolean): void;
  setAnimationLoop(cb: ((time: number) => void) | null): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  dispose(): void;
  setPixelRatio?(dpr: number): void;
}

const CORE_VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vPos = normalize(position);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uLine;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float lat = asin(clamp(vPos.y, -1.0, 1.0)) / 3.14159265 + 0.5;
    float lon = atan(vPos.z, vPos.x) / 6.2831853 + 0.5;
    float m = abs(fract(lon * 36.0) - 0.5) * 2.0;
    float p = abs(fract(lat * 24.0) - 0.5) * 2.0;
    float grid = smoothstep(0.9, 1.0, min(m, p));
    float lambert = max(dot(vNormal, normalize(vec3(0.45, 0.7, 1.0))), 0.12);
    float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
    vec3 col = mix(uCore, uLine, grid);
    col += uLine * fresnel * 0.4;
    col *= lambert;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const GLOW_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(vNormal, vView)), uPower);
    gl_FragColor = vec4(uColor, f);
  }
`;

function buildRing(THREE: typeof import("three")) {
  const count = 900;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const mint = new THREE.Color("#7fe8df");
  const pale = new THREE.Color("#fad1ff");
  const deep = new THREE.Color("#39c7bd");
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 1.85 + Math.random() * 0.45;
    pos[i * 3] = Math.cos(angle) * rad;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    pos[i * 3 + 2] = Math.sin(angle) * rad;
    const c = Math.random() < 0.08 ? pale : Math.random() < 0.5 ? mint : deep;
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.028,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

function createRenderer(canvas: HTMLCanvasElement): IRenderer {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  return r as unknown as IRenderer;
}

export default function PlanetCanvas({
  className,
  size = 1,
  offsetY = -0.95,
}: {
  className?: string;
  size?: number;
  offsetY?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef(size);
  const offsetYRef = useRef(offsetY);
  useEffect(() => {
    sizeRef.current = size;
    offsetYRef.current = offsetY;
  }, [size, offsetY]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let disposed = false;
    let renderer: IRenderer | null = null;
    let planet: THREE.Mesh | null = null;
    let ring: THREE.Points | null = null;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dispose = () => {
      disposed = true;
      renderer?.setAnimationLoop(null);
      renderer?.dispose();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };

    const targetX = { v: 0 };
    const targetY = { v: 0 };
    const onPointerMove = (e: PointerEvent) => {
      targetX.v = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY.v = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const W = parent?.clientWidth || window.innerWidth;
      const H = parent?.clientHeight || window.innerHeight;
      renderer?.setSize(W, H, false);
    };

    const init = async () => {
      const W0 = canvas.parentElement?.clientWidth || window.innerWidth;
      const H0 = canvas.parentElement?.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, W0 / H0, 0.1, 60);
      camera.position.set(0, 0, 5.4);

      const planetGroup = new THREE.Group();
      planetGroup.position.y = offsetYRef.current;
      planetGroup.scale.setScalar(sizeRef.current);

      const coreMat = new THREE.ShaderMaterial({
        vertexShader: CORE_VERT,
        fragmentShader: CORE_FRAG,
        uniforms: {
          uCore: { value: new THREE.Color("#02201e") },
          uLine: { value: new THREE.Color("#3fc4b8") },
        },
      });
      planet = new THREE.Mesh(new THREE.SphereGeometry(1.55, 96, 96), coreMat);

      const glowOuter = new THREE.Mesh(
        new THREE.SphereGeometry(1.74, 64, 64),
        new THREE.ShaderMaterial({
          vertexShader: GLOW_VERT,
          fragmentShader: GLOW_FRAG,
          uniforms: {
            uColor: { value: new THREE.Color("#39c7bd") },
            uPower: { value: 2.8 },
          },
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
        })
      );

      const glowInner = new THREE.Mesh(
        new THREE.SphereGeometry(1.66, 64, 64),
        new THREE.ShaderMaterial({
          vertexShader: GLOW_VERT,
          fragmentShader: GLOW_FRAG,
          uniforms: {
            uColor: { value: new THREE.Color("#cffdf8") },
            uPower: { value: 4.5 },
          },
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
        })
      );

      ring = buildRing(THREE);
      ring.rotation.x = -0.35;

      planetGroup.add(planet, glowOuter, glowInner, ring);
      scene.add(planetGroup);

      renderer = createRenderer(canvas);
      renderer?.setSize(W0, H0, false);

      let spin = 0;
      let curX = 0;
      let curY = 0;
      let last = performance.now();

      const frame = (now: number) => {
        if (disposed) return;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        spin += dt * 0.16;
        curX += (targetX.v - curX) * Math.min(1, dt * 2.5);
        curY += (targetY.v - curY) * Math.min(1, dt * 2.5);
        planet!.rotation.y = spin + curX * 0.35;
        planet!.rotation.x = -curY * 0.22;
        if (ring) ring.rotation.y = -spin * 0.45;
        if (renderer) renderer.render(scene, camera);
      };

      if (reduce) {
        if (renderer) renderer.render(scene, camera);
      } else {
        renderer?.setAnimationLoop(frame);
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
      }
    };

    init().catch(() => dispose());
    return dispose;
  }, []);

  return (
    <canvas
      ref={ref}
      className={className ?? "planet-canvas"}
      aria-hidden="true"
    />
  );
}
