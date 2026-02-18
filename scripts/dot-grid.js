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
  var dpr = 1, circleR = 4, rafId = 0;

  // Cached text element rects (viewport-relative, refreshed on resize/scroll)
  var textRects = [];
  var textFadeRadius = 15;  // px radius around each text rect where dots dim
  var textDim = 0.25;       // opacity multiplier for dots right on top of text (0 = invisible, 1 = no change)

  var config = {
    dotSize: 8,
    gap: 32,
    baseColor: '#ffffff',
    activeColor: '#a855f7',
    baseAlpha: 0.12,        // subtle base opacity
    activeAlpha: 0.6,
    proximity: 150,
    speedTrigger: 50,
    shockRadius: 170,
    shockStrength: 3,
    maxSpeed: 5000,
    maxDots: 2000,
    overflow: 60,           // dots start this far outside viewport (clipped, gives edge bleed)
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

  /* ---- text element detection ---- */
  function refreshTextRects() {
    // Query actual text-bearing elements inside content areas
    var selectors = '.z-10 h1, .z-10 h2, .z-10 h3, .z-10 p, .z-10 li, .z-10 a, .z-10 small, .z-10 span, .z-10 div[contenteditable]';
    var els = document.querySelectorAll(selectors);
    textRects = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Small padding around each text element
      textRects.push({
        left: r.left - 8,
        top: r.top - 4,
        right: r.right + 8,
        bottom: r.bottom + 4
      });
    }
  }

  // Returns 0-1: textDim when inside text, 1 when far from text, smooth fade between
  function textFade(x, y) {
    if (textRects.length === 0) return 1;
    var closest = Infinity;
    for (var i = 0; i < textRects.length; i++) {
      var cr = textRects[i];
      var dx = Math.max(cr.left - x, 0, x - cr.right);
      var dy = Math.max(cr.top - y, 0, y - cr.bottom);
      if (dx === 0 && dy === 0) {
        // inside rect — return textDim immediately
        return textDim;
      }
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closest) closest = dist;
    }
    if (closest >= textFadeRadius) return 1;
    // smooth fade
    var t = closest / textFadeRadius;
    return textDim + (1 - textDim) * t;
  }

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
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var ov = config.overflow;
    var baseCell = config.dotSize + config.gap;
    // Grid extends past viewport on all sides (dots outside get clipped = edge bleed)
    var totalW = w + ov * 2;
    var totalH = h + ov * 2;
    var cols = Math.max(1, Math.floor(totalW / baseCell));
    var rows = Math.max(1, Math.floor(totalH / baseCell));
    var cell = baseCell;

    if (cols * rows > config.maxDots) {
      cell = Math.max(baseCell, Math.sqrt((totalW * totalH) / config.maxDots));
      cols = Math.max(1, Math.floor(totalW / cell));
      rows = Math.max(1, Math.floor(totalH / cell));
    }

    var usedW = cell * cols;
    var usedH = cell * rows;
    // Start grid offset so it's centered but extends past edges
    var startX = -ov + (totalW - usedW) / 2 + cell / 2;
    var startY = -ov + (totalH - usedH) / 2 + cell / 2;
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

    refreshTextRects();
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

    for (var i = 0, len = dots.length; i < len; i++) {
      var dot = dots[i];

      // spring physics
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

      var drawX = dot.cx + dot.x;
      var drawY = dot.cy + dot.y;

      // skip dots entirely outside canvas (from overflow)
      if (drawX < -circleR || drawX > logicalW + circleR ||
          drawY < -circleR || drawY > logicalH + circleR) continue;

      // proximity glow
      var dx = dot.cx - px;
      var dy = dot.cy - py;
      var dsq = dx * dx + dy * dy;
      var t = dsq <= proxSq ? clamp01(1 - Math.sqrt(dsq) / config.proximity) : 0;

      // text-area fade — small radius around text elements
      var tFade = textFade(drawX, drawY);

      var r = (baseRgb.r + (activeRgb.r - baseRgb.r) * t) | 0;
      var g = (baseRgb.g + (activeRgb.g - baseRgb.g) * t) | 0;
      var b = (baseRgb.b + (activeRgb.b - baseRgb.b) * t) | 0;
      var a = (config.baseAlpha + (config.activeAlpha - config.baseAlpha) * t) * tFade;

      if (a < 0.003) continue;

      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      ctx.beginPath();
      ctx.arc(drawX, drawY, circleR, 0, 6.2832);
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

    var rect = wrapper.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;

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

  // Refresh text rects on scroll (positions shift)
  window.addEventListener('scroll', refreshTextRects, { passive: true });

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
