// Dot Grid Background - Optimized Vanilla JS (single RAF + capped dot count)
(function () {
  'use strict';

  let canvas, ctx, wrapper;
  let dots = [];
  let pointer = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 };
  let lastFrame = 0;
  let logicalW = 0;
  let logicalH = 0;
  let dpr = 1;
  let circleR = 2;
  let rafId = 0;

  const config = {
    // requested feel
    // TEMP: make dots very visible so we can confirm everything works;
    // once you see them, we can dial these values back down.
    dotSize: 8,
    gap: 32,
    baseColor: '#ffffff',
    activeColor: '#a855f7',
    baseAlpha: 0.4,
    activeAlpha: 0.9,
    proximity: 100,
    speedTrigger: 100,
    shockRadius: 170,
    shockStrength: 3,
    maxSpeed: 5000,
    resistance: 600,
    returnDuration: 0.3,

    // performance guardrails (the key to fixing lag)
    maxDots: 1000, // cap total dots so we don't draw 10k+ per frame

    // physics tuning
    spring: 70, // higher = faster return
    damping: 16 // higher = less oscillation
  };

  function hexToRgb(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    };
  }

  const baseRgb = hexToRgb(config.baseColor);
  const activeRgb = hexToRgb(config.activeColor);

  function clamp01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  }

  function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = performance.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  function buildGrid() {
    if (!wrapper || !canvas) return;

    const rect = wrapper.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) {
      setTimeout(buildGrid, 100);
      return;
    }

    dpr = Math.min(2, window.devicePixelRatio || 1); // cap DPR to avoid huge canvases
    logicalW = Math.floor(width);
    logicalH = Math.floor(height);

    canvas.width = Math.floor(logicalW * dpr);
    canvas.height = Math.floor(logicalH * dpr);
    canvas.style.width = logicalW + 'px';
    canvas.style.height = logicalH + 'px';

    ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // If the requested density would create too many dots, increase effective gap automatically.
    const baseCell = config.dotSize + config.gap;
    let cols = Math.floor((logicalW + config.gap) / baseCell);
    let rows = Math.floor((logicalH + config.gap) / baseCell);
    let total = cols * rows;

    let cell = baseCell;
    if (total > config.maxDots) {
      // choose a cell size that yields about maxDots on this viewport
      cell = Math.max(baseCell, Math.sqrt((logicalW * logicalH) / config.maxDots));
      cols = Math.max(1, Math.floor(logicalW / cell));
      rows = Math.max(1, Math.floor(logicalH / cell));
      total = cols * rows;
    }

    const gridW = cell * cols;
    const gridH = cell * rows;
    const startX = (logicalW - gridW) / 2 + cell / 2;
    const startY = (logicalH - gridH) / 2 + cell / 2;

    circleR = config.dotSize / 2;

    dots = new Array(total);
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        dots[i++] = { cx, cy, x: 0, y: 0, vx: 0, vy: 0 };
      }
    }
  }

  function applyImpulse(dot, ix, iy) {
    dot.vx += ix;
    dot.vy += iy;
  }

  function onMove(e) {
    const now = performance.now();
    const dtMs = pointer.lastTime ? now - pointer.lastTime : 16;
    const dx = e.clientX - pointer.lastX;
    const dy = e.clientY - pointer.lastY;
    let vx = (dx / dtMs) * 1000;
    let vy = (dy / dtMs) * 1000;
    let speed = Math.hypot(vx, vy);

    if (speed > config.maxSpeed) {
      const scale = config.maxSpeed / speed;
      vx *= scale;
      vy *= scale;
      speed = config.maxSpeed;
    }

    pointer.lastTime = now;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    pointer.vx = vx;
    pointer.vy = vy;
    pointer.speed = speed;

    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;

    // Apply impulse only when user is moving fast (keeps things light)
    if (speed < config.speedTrigger) return;

    const proxSq = config.proximity * config.proximity;
    const px = pointer.x;
    const py = pointer.y;
    const svx = pointer.vx;
    const svy = pointer.vy;

    // dots count is capped, so scanning is fine
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const ddx = dot.cx - px;
      const ddy = dot.cy - py;
      const dsq = ddx * ddx + ddy * ddy;
      if (dsq > proxSq) continue;

      // push away + inherit some mouse velocity, scaled down (subtle + fast)
      const inv = 1 / Math.max(1, Math.sqrt(dsq));
      const push = (1 - dsq / proxSq) * 35;
      applyImpulse(dot, (ddx * inv) * push + svx * 0.002, (ddy * inv) * push + svy * 0.002);
    }
  }

  function onClick(e) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const r = config.shockRadius;
    const rSq = r * r;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const dx = dot.cx - cx;
      const dy = dot.cy - cy;
      const dsq = dx * dx + dy * dy;
      if (dsq > rSq) continue;

      const inv = 1 / Math.max(1, Math.sqrt(dsq));
      const falloff = 1 - dsq / rSq;
      const push = config.shockStrength * 80 * falloff;
      applyImpulse(dot, (dx * inv) * push, (dy * inv) * push);
    }
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);

    if (!ctx || !canvas || logicalW === 0 || logicalH === 0) return;

    const dt = Math.min(0.033, (now - (lastFrame || now)) / 1000);
    lastFrame = now;

    // clear in logical space (we keep transform set to DPR)
    ctx.clearRect(0, 0, logicalW, logicalH);

    const prox = config.proximity;
    const proxSq = prox * prox;
    const px = pointer.x;
    const py = pointer.y;

    // physics integration + draw
    const k = config.spring;
    const c = config.damping;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      // spring back to 0 offset
      const ax = -k * dot.x - c * dot.vx;
      const ay = -k * dot.y - c * dot.vy;
      dot.vx += ax * dt;
      dot.vy += ay * dt;
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;

      // snap tiny motion to 0 (prevents endless micro-jitter)
      if (Math.abs(dot.x) < 0.01 && Math.abs(dot.y) < 0.01 && Math.abs(dot.vx) < 0.01 && Math.abs(dot.vy) < 0.01) {
        dot.x = 0;
        dot.y = 0;
        dot.vx = 0;
        dot.vy = 0;
      }

      // color based on proximity (no sqrt; much cheaper)
      const dx = dot.cx - px;
      const dy = dot.cy - py;
      const dsq = dx * dx + dy * dy;
      const t = dsq <= proxSq ? clamp01(1 - dsq / proxSq) : 0;

      const r = (baseRgb.r + (activeRgb.r - baseRgb.r) * t) | 0;
      const g = (baseRgb.g + (activeRgb.g - baseRgb.g) * t) | 0;
      const b = (baseRgb.b + (activeRgb.b - baseRgb.b) * t) | 0;
      const a = (config.baseAlpha + (config.activeAlpha - config.baseAlpha) * t);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';

      ctx.beginPath();
      ctx.arc(dot.cx + dot.x, dot.cy + dot.y, circleR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    wrapper = document.querySelector('.dot-grid-wrapper');
    if (!wrapper) return;

    // Respect reduced motion: render once, no animation loop.
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    canvas = document.createElement('canvas');
    canvas.className = 'dot-grid-canvas';
    canvas.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none;';
    wrapper.appendChild(canvas);

    buildGrid();

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(buildGrid);
      ro.observe(wrapper);
    } else {
      window.addEventListener('resize', buildGrid);
    }

    const throttledMove = throttle(onMove, 30);
    window.addEventListener('mousemove', throttledMove, { passive: true });
    window.addEventListener('click', onClick);

    if (reduceMotion) {
      // one frame only
      lastFrame = performance.now();
      frame(lastFrame);
      cancelAnimationFrame(rafId);
      return;
    }

    rafId = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
