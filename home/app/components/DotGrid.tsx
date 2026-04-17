'use client';

import {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { gsap, initGsapPlugins } from '@/app/lib/gsap';

type Rgb = { r: number; g: number; b: number };

type Dot = {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
};

type DotGridProps = {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  opacity?: number;
  throttleMs?: number;
  /** Upper bound on dots for main-thread cost (raises effective gap if needed). */
  maxDots?: number;
  className?: string;
  style?: CSSProperties;
};

type CanvasLayout = { cssW: number; cssH: number; dpr: number };

function throttle<T extends (...args: never[]) => void>(fn: T, limitMs: number): T {
  let last = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = performance.now();
    if (now - last >= limitMs) {
      last = now;
      fn.apply(this, args);
    }
  } as T;
}

function hexToRgb(hex: string): Rgb {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function applyInertiaKick(
  dot: Dot,
  pushX: number,
  pushY: number,
  resistance: number,
  returnDuration: number
) {
  dot._inertiaApplied = true;
  gsap.killTweensOf(dot);
  gsap.to(dot, {
    inertia: { xOffset: pushX, yOffset: pushY, resistance },
    onComplete: () => {
      gsap.to(dot, {
        xOffset: 0,
        yOffset: 0,
        duration: returnDuration,
        ease: 'power3.out',
      });
      dot._inertiaApplied = false;
    },
  });
}

function drawDotsFrame(
  ctx: CanvasRenderingContext2D,
  layout: CanvasLayout,
  circlePath: Path2D,
  dots: Dot[],
  px: number,
  py: number,
  proximity: number,
  baseRgb: Rgb,
  activeRgb: Rgb,
  opacity: number
) {
  const { dpr } = layout;
  const proxSq = proximity * proximity;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i];
    const ox = dot.cx + dot.xOffset;
    const oy = dot.cy + dot.yOffset;
    const dx = dot.cx - px;
    const dy = dot.cy - py;
    const dsq = dx * dx + dy * dy;

    let r = baseRgb.r;
    let g = baseRgb.g;
    let b = baseRgb.b;
    let a = opacity;
    if (dsq <= proxSq) {
      const dist = Math.sqrt(dsq);
      const t = 1 - dist / proximity;
      r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
      g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
      b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
      a = opacity + (1 - opacity) * t;
    }

    ctx.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fill(circlePath);
  }
}

const DEFAULT_MAX_DOTS = 4500;
const MAX_DEVICE_PIXEL_RATIO = 2;

const DotGrid = ({
  dotSize = 16,
  gap = 32,
  baseColor = '#5227FF',
  activeColor = '#5227FF',
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  opacity = 1,
  throttleMs = 50,
  maxDots = DEFAULT_MAX_DOTS,
  className = '',
  style,
}: DotGridProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const layoutRef = useRef<CanvasLayout | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });

  const [reducedMotion, setReducedMotion] = useState(false);
  const [gridGen, setGridGen] = useState(0);

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const [pluginsReady, setPluginsReady] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPluginsReady(true);
      return;
    }
    initGsapPlugins();
    setPluginsReady(true);
  }, [reducedMotion]);

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) {
      setTimeout(buildGrid, 100);
      return;
    }

    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(rawDpr, MAX_DEVICE_PIXEL_RATIO);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', { alpha: true });
    ctxRef.current = ctx;
    layoutRef.current = { cssW: width, cssH: height, dpr };

    if (!ctx) return;

    let effectiveGap = gap;
    let cols = 0;
    let rows = 0;
    let cell = dotSize + effectiveGap;

    while (effectiveGap < width + height) {
      cell = dotSize + effectiveGap;
      cols = Math.floor((width + effectiveGap) / cell);
      rows = Math.floor((height + effectiveGap) / cell);
      if (cols * rows <= maxDots) break;
      effectiveGap += 2;
    }

    const gridW = cell * cols - effectiveGap;
    const gridH = cell * rows - effectiveGap;
    const extraX = width - gridW;
    const extraY = height - gridH;
    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          _inertiaApplied: false,
        });
      }
    }
    dotsRef.current = dots;
    setGridGen((g) => g + 1);
  }, [dotSize, gap, maxDots]);

  useEffect(() => {
    buildGrid();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(buildGrid);
      if (wrapperRef.current) ro.observe(wrapperRef.current);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', buildGrid);
    return () => window.removeEventListener('resize', buildGrid);
  }, [buildGrid]);

  useEffect(() => {
    if (!circlePath || reducedMotion) return;
    const ctx = ctxRef.current;
    const layout = layoutRef.current;
    if (!ctx || !layout) return;

    let rafId = 0;

    const draw = () => {
      const liveCtx = ctxRef.current;
      const liveLayout = layoutRef.current;
      if (!liveCtx || !liveLayout) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const { x: px, y: py } = pointerRef.current;
      drawDotsFrame(
        liveCtx,
        liveLayout,
        circlePath,
        dotsRef.current,
        px,
        py,
        proximity,
        baseRgb,
        activeRgb,
        opacity
      );

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [
    proximity,
    baseRgb,
    activeRgb,
    circlePath,
    opacity,
    reducedMotion,
    gridGen,
  ]);

  useEffect(() => {
    if (!circlePath || !reducedMotion) return;
    const ctx = ctxRef.current;
    const layout = layoutRef.current;
    if (!ctx || !layout) return;

    drawDotsFrame(
      ctx,
      layout,
      circlePath,
      dotsRef.current,
      -9999,
      -9999,
      proximity,
      baseRgb,
      activeRgb,
      opacity
    );
  }, [
    reducedMotion,
    gridGen,
    circlePath,
    proximity,
    baseRgb,
    activeRgb,
    opacity,
  ]);

  useEffect(() => {
    if (!pluginsReady || reducedMotion) return;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed > speedTrigger && dist < proximity && !dot._inertiaApplied) {
          const pushX = dot.cx - pr.x + vx * 0.002;
          const pushY = dot.cy - pr.y + vy * 0.002;
          applyInertiaKick(dot, pushX, pushY, resistance, returnDuration);
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && !dot._inertiaApplied) {
          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - cx) * shockStrength * falloff;
          const pushY = (dot.cy - cy) * shockStrength * falloff;
          applyInertiaKick(dot, pushX, pushY, resistance, returnDuration);
        }
      }
    };

    const throttledMove = throttle(onMove, throttleMs);
    window.addEventListener('mousemove', throttledMove, { passive: true });
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', throttledMove);
      window.removeEventListener('click', onClick);
    };
  }, [
    pluginsReady,
    reducedMotion,
    maxSpeed,
    speedTrigger,
    proximity,
    resistance,
    returnDuration,
    shockRadius,
    shockStrength,
    throttleMs,
  ]);

  return (
    <section
      className={`dot-grid ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        position: 'relative',
        ...style,
      }}
    >
      <div
        ref={wrapperRef}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>
    </section>
  );
};

export default DotGrid;
