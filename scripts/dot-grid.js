// Dot Grid Background - Vanilla JS (no dependencies)
(function () {
  'use strict';

  var wrapper = document.querySelector('.dot-grid-wrapper');
  if (!wrapper) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'dot-grid-canvas';
  wrapper.appendChild(canvas);

  var ctx = null;
  var dots = [];
  var pointer = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 };
  var lastFrame = 0;
  var logicalW = 0, logicalH = 0;
  var dpr = 1, circleR = 4, halfDiag = 1;
  var rafId = 0;

  var config = {
    dotSize: 8,
    gap: 32,
    baseColor: '#ffffff',
    activeColor: '#a855f7',
    baseAlpha: 0.4,
    activeAlpha: 0.9,
    proximity: 150,
    speedTrigger: 50,
    shockRadius: 170,
    shockStrength: 3,
    maxSpeed: 5000,
    maxDots: 1500,
    vignetteRadius: 0.15,
    vignetteSmooth: 0.35,
    spring: 70,
    damping: 16
  };

  function hexToRgb(hex) {
    var m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }

  var baseRgb = hexToRgb(config.baseColor);
  var activeRgb = hexToRgb(config.activeColor);

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* ---- sizing & grid build ---- */
  function sizeCanvas() {
    var w = wrapper.offsetWidth;
    var h = wrapper.offsetHeight;
    if (w === 0 || h === 0) return;
    if (w === logicalW && h === logicalH && ctx) return;

    dpr = Math.min(2, window.devicePixelRatio || 1);
    logicalW = w;
    logicalH = h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var baseCell = config.dotSize + config.gap;
    var cols = Math.floor((w + config.gap) / baseCell);
    var rows = Math.floor((h + config.gap) / baseCell);
    var total = cols * rows;
    var cell = baseCell;

    if (total > config.maxDots) {
      cell = Math.max(baseCell, Math.sqrt((w * h) / config.maxDots));
      cols = Math.max(1, Math.floor(w / cell));
      rows = Math.max(1, Math.floor(h / cell));
    }

    var gridW = cell * cols;
    var gridH = cell * rows;
    var startX = (w - gridW) / 2 + cell / 2;
    var startY = (h - gridH) / 2 + cell / 2;
    circleR = config.dotSize / 2;

    dots = [];
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        dots.push({
          cx: startX + col * cell,
          cy: startY + row * cell,
          x: 0, y: 0, vx: 0, vy: 0
        });
      }
    }

    halfDiag = Math.sqrt(w * w + h * h) * 0.5;
  }

  /* ---- render loop ---- */
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!ctx || dots.length === 0) return;

    var dt = Math.min(0.033, (now - (lastFrame || now)) / 1000);
    lastFrame = now;

    ctx.clearRect(0, 0, logicalW, logicalH);

    var proxSq = config.proximity * config.proximity;
    var px = pointer.x;
    var py = pointer.y;
    var k = config.spring;
    var c = config.damping;
    var halfW = logicalW * 0.5;
    var halfH = logicalH * 0.5;
    var vStart = config.vignetteRadius;
    var vRange = config.vignetteSmooth;

    for (var i = 0, len = dots.length; i < len; i++) {
      var dot = dots[i];

      // spring physics — return displaced dot to home
      var ax = -k * dot.x - c * dot.vx;
      var ay = -k * dot.y - c * dot.vy;
      dot.vx += ax * dt;
      dot.vy += ay * dt;
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;

      if (Math.abs(dot.x) < 0.01 && Math.abs(dot.y) < 0.01 &&
          Math.abs(dot.vx) < 0.01 && Math.abs(dot.vy) < 0.01) {
        dot.x = 0; dot.y = 0; dot.vx = 0; dot.vy = 0;
      }

      // proximity glow — compare dot home position to pointer
      var dx = dot.cx - px;
      var dy = dot.cy - py;
      var dsq = dx * dx + dy * dy;
      var t = dsq <= proxSq ? clamp01(1 - Math.sqrt(dsq) / config.proximity) : 0;

      // vignette fade — dots near center are transparent
      var vcx = (dot.cx + dot.x) - halfW;
      var vcy = (dot.cy + dot.y) - halfH;
      var vDist = Math.sqrt(vcx * vcx + vcy * vcy) / halfDiag;
      var vFade = clamp01((vDist - vStart) / vRange);

      var r = (baseRgb.r + (activeRgb.r - baseRgb.r) * t) | 0;
      var g = (baseRgb.g + (activeRgb.g - baseRgb.g) * t) | 0;
      var b = (baseRgb.b + (activeRgb.b - baseRgb.b) * t) | 0;
      var a = (config.baseAlpha + (config.activeAlpha - config.baseAlpha) * t) * vFade;

      if (a < 0.005) continue; // skip invisible dots

      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      ctx.beginPath();
      ctx.arc(dot.cx + dot.x, dot.cy + dot.y, circleR, 0, 6.2832);
      ctx.fill();
    }
  }

  /* ---- pointer tracking ---- */
  function onMove(e) {
    var now = performance.now();
    var dtMs = pointer.lastTime ? now - pointer.lastTime : 16;
    var dx = e.clientX - pointer.lastX;
    var dy = e.clientY - pointer.lastY;
    var vx = (dx / dtMs) * 1000;
    var vy = (dy / dtMs) * 1000;
    var speed = Math.hypot(vx, vy);

    if (speed > config.maxSpeed) {
      var scale = config.maxSpeed / speed;
      vx *= scale; vy *= scale; speed = config.maxSpeed;
    }

    pointer.lastTime = now;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    pointer.vx = vx;
    pointer.vy = vy;
    pointer.speed = speed;

    // Convert clientX/Y to canvas-local coords.
    // Wrapper is position:fixed at 0,0 so rect.left/top should be 0,
    // but we compute it properly for safety.
    var rect = wrapper.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;

    // push dots if moving fast enough
    if (speed < config.speedTrigger) return;

    var proxSq = config.proximity * config.proximity;
    var px = pointer.x;
    var py = pointer.y;

    for (var i = 0, len = dots.length; i < len; i++) {
      var dot = dots[i];
      var ddx = dot.cx - px;
      var ddy = dot.cy - py;
      var dsq = ddx * ddx + ddy * ddy;
      if (dsq > proxSq) continue;
      var inv = 1 / Math.max(1, Math.sqrt(dsq));
      var push = (1 - dsq / proxSq) * 35;
      dot.vx += (ddx * inv) * push + vx * 0.002;
      dot.vy += (ddy * inv) * push + vy * 0.002;
    }
  }

  function onClick(e) {
    var rect = wrapper.getBoundingClientRect();
    var cx = e.clientX - rect.left;
    var cy = e.clientY - rect.top;
    var rSq = config.shockRadius * config.shockRadius;

    for (var i = 0, len = dots.length; i < len; i++) {
      var dot = dots[i];
      var dx = dot.cx - cx;
      var dy = dot.cy - cy;
      var dsq = dx * dx + dy * dy;
      if (dsq > rSq) continue;
      var inv = 1 / Math.max(1, Math.sqrt(dsq));
      var falloff = 1 - dsq / rSq;
      var push = config.shockStrength * 80 * falloff;
      dot.vx += (dx * inv) * push;
      dot.vy += (dy * inv) * push;
    }
  }

  /* ---- init ---- */
  sizeCanvas();

  window.addEventListener('resize', function () {
    logicalW = 0; logicalH = 0;
    sizeCanvas();
  });

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('click', onClick);

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    lastFrame = performance.now();
    frame(lastFrame);
    cancelAnimationFrame(rafId);
  } else {
    rafId = requestAnimationFrame(frame);
  }
})();
