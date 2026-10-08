"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/*
 * Только свет: отражения натриевых фонарей в мокром асфальте и круги от капель.
 * Канвас ложится поверх статичной фактуры в режиме screen — без WebGL остаётся та же картинка, только неподвижная.
 */
const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime;

  vec2 q = p + 0.02 * vec2(fbm(p * 5.0 + t * 0.12), fbm(p * 5.0 - t * 0.1));
  float ground = smoothstep(0.75, 0.0, uv.y);

  float refl = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float x = fract(0.11 + fi * 0.23);
    float w = 0.012 + 0.006 * fi;
    float dx = q.x / aspect - x;
    float broken = 0.35 + 0.65 * fbm(vec2(q.x * 26.0, q.y * 4.0 - t * (0.5 + 0.1 * fi)));
    refl += exp(-dx * dx / (w * w)) * broken * (0.75 + 0.25 * sin(t * 0.4 + fi * 1.7));
  }
  vec3 sodium = vec3(1.0, 0.69, 0.0);
  vec3 col = sodium * refl * ground * 0.22;

  vec2 g = p * vec2(7.0, 9.0);
  vec2 cell = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(cell);
  float life = fract(t * 0.3 + h);
  vec2 c = (vec2(hash(cell + 1.3), hash(cell + 2.7)) - 0.5) * 0.6;
  float r = length(f - c);
  float ring = smoothstep(0.025, 0.0, abs(r - life * 0.42)) * (1.0 - life) * step(0.55, h);
  col += vec3(0.9, 0.8, 0.6) * ring * 0.07 * ground;

  col += sodium * 0.05 * smoothstep(0.55, 0.0, length(vec2((uv.x - 0.5) * aspect, (uv.y - 1.05) * 2.2)));
  gl_FragColor = vec4(col, 1.0);
}
`;

export function WetAsphalt() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1), alpha: false, antialias: false, powerPreference: "low-power" });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen;opacity:0;transition:opacity 1.2s ease";
    el.appendChild(canvas);

    const program = new Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] } } });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    let raf = 0;
    let first = true;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      program.uniforms.uTime.value = time * 0.001;
      renderer.render({ scene: mesh });
      if (first) {
        first = false;
        canvas.style.opacity = "1";
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={host} className="absolute inset-0" />;
}
