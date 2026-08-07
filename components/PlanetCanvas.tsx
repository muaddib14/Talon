"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect, useRef } from "react";

interface IRenderer {
  setSize(w: number, h: number, updateStyle: boolean): void;
  setAnimationLoop(cb: ((time: number) => void) | null): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  dispose(): void;
  setPixelRatio?(dpr: number): void;
}

function loadModel(src: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      src,
      (gltf) => resolve(gltf.scene),
      undefined,
      reject
    );
  });
}

function frameModel(model: THREE.Group, targetRadius: number) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const radius = Math.max(size.x, size.y, size.z) / 2 || 1;
  const scale = targetRadius / radius;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
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
    let modelRig: THREE.Group | null = null;

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
      const model = await loadModel("/logo3d.glb");
      if (disposed) return;
      frameModel(model, 1.55);

      const W0 = canvas.parentElement?.clientWidth || window.innerWidth;
      const H0 = canvas.parentElement?.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, W0 / H0, 0.1, 60);
      camera.position.set(0, 0, 5.4);

      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
      dirLight.position.set(1.2, 1.8, 2.6);
      scene.add(dirLight);
      const rimLight = new THREE.DirectionalLight(0x7fe8df, 0.6);
      rimLight.position.set(-1.5, -0.5, -1.8);
      scene.add(rimLight);

      const planetGroup = new THREE.Group();
      planetGroup.position.y = offsetYRef.current;
      planetGroup.scale.setScalar(sizeRef.current);

      modelRig = new THREE.Group();
      modelRig.add(model);

      planetGroup.add(modelRig);
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
        modelRig!.rotation.y = spin + curX * 0.35;
        modelRig!.rotation.x = -curY * 0.22;
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
