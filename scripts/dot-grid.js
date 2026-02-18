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

  // Cached content rects (viewport-relative) — refreshed on resize/scroll
  var contentRects = [];
  var contentPadding = 40; // extra px around content areas for soft fade
  var contentFadeRange = 60; // distance over which dots fade from full to dimmed

  var config = {
    dotSize: 8,
    gap: 32,
    baseColor: '#ffffff',
    activeColor: '#a855f7',
    baseAlpha: 0.15,       // lowered — more transparent overall
    activeAlpha: 0.7,
    proximity: 150,
    speedTrigger: 50,
    shockRadius: 170,
    shockStrength: 3,
    maxSpeed: 5000,
    maxDots: 2000,
    overflow: 60,           // px the grid extends past viewport edges
    contentDim: 0.15,       // opacity multiplier for dots inside content areas (0 = invisible, 1 = no change)
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

  /* ---- content-area detection ---- */
  function refreshContentRects() {
    var els = document.querySelectorAll('.z-10');
    contentRects = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      contentRects.push({
        left: r.left - contentPadding,
        top: r.top - contentPadding,
        right: r.right + contentPadding,
        bottom: r.bottom + contentPadding
      });
    }
  }

  // Returns a 0-1 multiplier: 0 = fully inside content area, 1 = fully outside
  function contentFade(x, y) {
    if (contentRects.length === 0) return 1;
    var minDist = Infinity;
    for (var i = 0; i < contentRects.length; i++) {
      var cr = contentRects[i];
      // signed distance to rect interior (negative = inside)
      var dx = Math.max(cr.left - x, 0, x - cr.right);
      var dy = Math.max(cr.top - y, 0, y - cr.bottom);
      if (dx === 0 && dy === 0) {
        // inside the rect — compute distance to nearest edge (negative)
        var toEdge = Math.min(x - cr.left, cr.right - x, y - cr.top, cr.bottom - y);
        minDist = Math.min(minDist, -toEdge);
      } else {
        var dist = Math.sqrt(dx * dx + dy * dy);
        minDist = Math.min(minDist, dist);
      }
    }
    // minDist < 0 means inside a rect
    if (minDist <= 0) return config.contentDim;
    if (minDist >= contentFadeRange) return 1;
    // smooth fade from contentDim to 1
    var t = minDist / contentFadeRange;
    return config.contentDim + (1 - config.contentDim) * t;
  }

  /* ---- sizing & grid build ---- */
  function sizeCanvas() {
    var w = wrapper.offsetWidth;
    var h = wrapper.offsetHeight;
    if (w === 0 || h === 0) return;
    if (w === logicalW && h === logicalH && ctx) return;

    var ov = config.overflow;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    logicalW = w;
    logicalH = h;

    // Canvas is larger than viewport by overflow on each side
    var cw = w + ov * 2;
    var ch = h + ov * 2;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    // Offset canvas so it extends past the wrapper on all sides
    canvas.style.position = 'absolute';
    canvas.style.left = -ov + 'px';
    canvas.style.top = -ov + 'px';
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Dot coordinates are in canvas-local space (0,0 = top-left of canvas, which is -ov,-ov in viewport)
    var baseCell = config.dotSize + config.gap;
    var cols = Math.max(1, Math.floor(cw / baseCell));
    var rows = Math.max(1, Math.floor(ch / baseCell));
    var total = cols * rows;
    var cell = baseCell;

    if (total > config.maxDots) {
      cell = Math.max(baseCell, Math.sqrt((cw * ch) / config.maxDots));
      cols = Math.max(1, Math.floor(cw / cell));
      rows = Math.max(1, Math.floor(ch / cell));
    }

    var usedW = cell * cols;
    var usedH = cell * rows;
    var startX = (cw - usedW) / 2 + cell / 2;
    var startY = (ch - usedH) / 2 + cell / 2;
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

    refreshContentRects();
  }

  /* ---- render loop ---- */
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!ctx || dots.length === 0) return;

    var ov = config.overflow;
    var dt = Math.min(0.033, (now - (lastFrame || now)) / 1000);
    lastFrame = now;

    var cw = logicalW + ov * 2;
    var ch = logicalH + ov * 2;
    ctx.clearRect(0, 0, cw, ch);

    var proxSq = config.proximity * config.proximity;
    // pointer is in viewport space; dot coords are in canvas space (offset by ov)
    var px = pointer.x + ov;
    var py = pointer.y + ov;
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

      // proximity glow
      var dx = dot.cx - px;
      var dy = dot.cy - py;
      var dsq = dx * dx + dy * dy;
      var t = dsq <= proxSq ? clamp01(1 - Math.sqrt(dsq) / config.proximity) : 0;

      // content-area fade — convert dot canvas coords to viewport coords for comparison
      var viewX = (dot.cx + dot.x) - ov;
      var viewY = (dot.cy + dot.y) - ov;
      var cFade = contentFade(viewX, viewY);

      var r = (baseRgb.r + (activeRgb.r - baseRgb.r) * t) | 0;
      var g = (baseRgb.g + (activeRgb.g - baseRgb.g) * t) | 0;
      var b = (baseRgb.b + (activeRgb.b - baseRgb.b) * t) | 0;
      var a = (config.baseAlpha + (config.activeAlpha - config.baseAlpha) * t) * cFade;

      if (a < 0.003) continue;

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

    // Store pointer in viewport space (frame() converts to canvas space)
    var rect = wrapper.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;

    if (speed < config.speedTrigger) return;

    // For push physics, convert pointer to canvas space
    var ov = config.overflow;
    var proxSq = config.proximity * config.proximity;
    var px = pointer.x + ov;
    var py = pointer.y + ov;

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
    var ov = config.overflow;
    var cx = e.clientX - rect.left + ov;
    var cy = e.clientY - rect.top + ov;
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

  // Refresh content rects on scroll (content positions change)
  window.addEventListener('scroll', refreshContentRects, { passive: true });

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
