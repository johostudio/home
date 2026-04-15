(function () {
  'use strict';

  var HOLD_MS = 360;
  var TAP_MOVE_PX = 10;
  var DRAG_GUARD_MS = 120;
  var BOUNCE_FRICTION = 0.985;
  var BOUNCE_RESTITUTION = 0.76;
  var MIN_BOUNCE_SPEED = 0.07;
  var MAX_THROW_SPEED_X = 1.6;
  var MAX_THROW_SPEED_Y = 1.45;
  var Z_BASE = 90;

  var layers = document.querySelectorAll('[data-sticker-layer]');
  if (!layers.length || typeof window.interact !== 'function') return;

  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  function toNumber(raw, fallback) {
    var value = parseFloat(raw);
    return Number.isFinite(value) ? value : fallback;
  }

  function playTapAnimation(sticker) {
    var img = sticker.querySelector('img');
    if (!img || typeof window.anime !== 'function') {
      return;
    }
    var offset = (Math.random() * 8) - 4;
    window.anime.remove(img);
    window.anime({
      targets: img,
      keyframes: [
        { scale: 1.12, rotate: offset, duration: 180, easing: 'easeOutQuad' },
        { scale: 0.98, rotate: -offset * 0.45, duration: 150, easing: 'easeOutQuad' },
        { scale: 1, rotate: 0, duration: 240, easing: 'easeOutElastic(1, .6)' }
      ]
    });
  }

  function initLayer(layer) {
    var safeBottom = toNumber(layer.getAttribute('data-safe-bottom'), 230);
    var randomizeSpawn = layer.getAttribute('data-random-spawn') !== 'off';
    var stickers = layer.querySelectorAll('[data-sticker]');
    var occupiedRects = [];

    function getBounds(state) {
      var pad = 8;
      var width = Math.max(64, state.el.offsetWidth || state.size);
      var height = Math.max(64, state.el.offsetHeight || state.size);
      var maxX = Math.max(pad, window.innerWidth - width - pad);
      var bottomExclusion = Math.max(0, safeBottom);
      var maxY = Math.max(pad, window.innerHeight - bottomExclusion - height - pad);
      return {
        minX: pad,
        maxX: maxX,
        minY: pad,
        maxY: maxY
      };
    }

    function applyState(state) {
      state.el.style.setProperty('--drag-x', state.x + 'px');
      state.el.style.setProperty('--drag-y', state.y + 'px');
      state.el.style.setProperty('--rot', state.rotation + 'deg');
    }

    function clampState(state) {
      var bounds = getBounds(state);
      state.x = clamp(state.x, bounds.minX, bounds.maxX);
      state.y = clamp(state.y, bounds.minY, bounds.maxY);
    }

    function intersectsRect(a, b) {
      return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
    }

    function createRect(x, y, w, h, pad) {
      return {
        x: x - pad,
        y: y - pad,
        w: w + (pad * 2),
        h: h + (pad * 2)
      };
    }

    function weightedPick(items) {
      var total = 0;
      items.forEach(function (item) { total += item.weight; });
      var r = Math.random() * total;
      for (var i = 0; i < items.length; i += 1) {
        r -= items[i].weight;
        if (r <= 0) return items[i];
      }
      return items[items.length - 1];
    }

    function zonesForBias(bias) {
      var defaultZones = [
        { weight: 1.1, x0: 0.00, x1: 0.26, y0: 0.00, y1: 0.34 },
        { weight: 1.1, x0: 0.74, x1: 1.00, y0: 0.00, y1: 0.34 },
        { weight: 1.2, x0: 0.00, x1: 0.30, y0: 0.48, y1: 1.00 },
        { weight: 1.2, x0: 0.70, x1: 1.00, y0: 0.48, y1: 1.00 },
        { weight: 0.95, x0: 0.08, x1: 0.38, y0: 0.68, y1: 1.00 },
        { weight: 0.95, x0: 0.62, x1: 0.92, y0: 0.68, y1: 1.00 }
      ];

      var map = {
        'left-top': [
          { weight: 1.6, x0: 0.00, x1: 0.28, y0: 0.00, y1: 0.36 },
          { weight: 1.0, x0: 0.00, x1: 0.24, y0: 0.36, y1: 0.72 },
          { weight: 0.7, x0: 0.08, x1: 0.42, y0: 0.60, y1: 1.00 }
        ],
        'right-top': [
          { weight: 1.6, x0: 0.72, x1: 1.00, y0: 0.00, y1: 0.36 },
          { weight: 1.0, x0: 0.76, x1: 1.00, y0: 0.36, y1: 0.72 },
          { weight: 0.7, x0: 0.58, x1: 0.92, y0: 0.60, y1: 1.00 }
        ],
        'left-bottom': [
          { weight: 1.7, x0: 0.00, x1: 0.30, y0: 0.56, y1: 1.00 },
          { weight: 0.8, x0: 0.00, x1: 0.24, y0: 0.20, y1: 0.56 }
        ],
        'right-bottom': [
          { weight: 1.7, x0: 0.70, x1: 1.00, y0: 0.56, y1: 1.00 },
          { weight: 0.8, x0: 0.76, x1: 1.00, y0: 0.20, y1: 0.56 }
        ],
        left: [
          { weight: 1.7, x0: 0.00, x1: 0.30, y0: 0.00, y1: 1.00 },
          { weight: 0.7, x0: 0.00, x1: 0.24, y0: 0.45, y1: 1.00 }
        ],
        right: [
          { weight: 1.7, x0: 0.70, x1: 1.00, y0: 0.00, y1: 1.00 },
          { weight: 0.7, x0: 0.76, x1: 1.00, y0: 0.45, y1: 1.00 }
        ],
        bottom: [
          { weight: 1.8, x0: 0.00, x1: 1.00, y0: 0.66, y1: 1.00 },
          { weight: 0.8, x0: 0.00, x1: 0.30, y0: 0.50, y1: 0.72 },
          { weight: 0.8, x0: 0.70, x1: 1.00, y0: 0.50, y1: 0.72 }
        ]
      };

      if (map[bias]) {
        return map[bias].concat(defaultZones.map(function (zone) {
          return {
            weight: zone.weight * 0.38,
            x0: zone.x0,
            x1: zone.x1,
            y0: zone.y0,
            y1: zone.y1
          };
        }));
      }

      return defaultZones;
    }

    function minDistanceToRects(candidate, rects) {
      if (!rects.length) return 999999;
      var cx = candidate.x + (candidate.w / 2);
      var cy = candidate.y + (candidate.h / 2);
      var best = Infinity;
      for (var i = 0; i < rects.length; i += 1) {
        var rx = rects[i].x + (rects[i].w / 2);
        var ry = rects[i].y + (rects[i].h / 2);
        var dx = cx - rx;
        var dy = cy - ry;
        var dist = Math.sqrt((dx * dx) + (dy * dy));
        if (dist < best) best = dist;
      }
      return best;
    }

    function shouldAvoidCenter(cx, cy, bounds) {
      var rx = (cx - bounds.minX) / Math.max(1, bounds.maxX - bounds.minX);
      var ry = (cy - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY);
      return rx > 0.34 && rx < 0.66 && ry > 0.2 && ry < 0.72;
    }

    function randomizeInitialSpawn(state) {
      if (!randomizeSpawn) return;
      var bounds = getBounds(state);
      var width = Math.max(64, state.el.offsetWidth || state.size);
      var height = Math.max(64, state.el.offsetHeight || state.size);
      var spanX = Math.max(1, bounds.maxX - bounds.minX);
      var spanY = Math.max(1, bounds.maxY - bounds.minY);

      var bias = (state.el.getAttribute('data-spawn-bias') || '').trim().toLowerCase();
      var zones = zonesForBias(bias);
      var pad = Math.max(14, Math.round(Math.min(width, height) * 0.1));
      var placed = false;
      var best = null;
      var bestScore = -1;

      for (var i = 0; i < 260; i += 1) {
        var zone = weightedPick(zones);
        var minX = bounds.minX + (zone.x0 * spanX);
        var maxX = bounds.minX + (zone.x1 * spanX) - width;
        var minY = bounds.minY + (zone.y0 * spanY);
        var maxY = bounds.minY + (zone.y1 * spanY) - height;

        if (maxX <= minX || maxY <= minY) continue;

        var nx = minX + Math.random() * (maxX - minX);
        var ny = minY + Math.random() * (maxY - minY);
        var cx = nx + (width / 2);
        var cy = ny + (height / 2);
        if (shouldAvoidCenter(cx, cy, bounds)) continue;

        var candidate = createRect(nx, ny, width, height, pad);
        var blocked = occupiedRects.some(function (rect) {
          return intersectsRect(candidate, rect);
        });
        if (!blocked) {
          var spreadScore = minDistanceToRects(candidate, occupiedRects);
          if (spreadScore > bestScore) {
            bestScore = spreadScore;
            best = candidate;
          }
          if (spreadScore > 210) {
            best = candidate;
            break;
          }
        }
      }

      if (best) {
        state.x = best.x + pad;
        state.y = best.y + pad;
        occupiedRects.push(best);
        placed = true;
      }

      if (!placed) {
        occupiedRects.push(createRect(state.x, state.y, width, height, 10));
      }
    }

    function resolveCollision(state, bounds) {
      var hit = false;
      if (state.x <= bounds.minX) {
        state.x = bounds.minX;
        if (state.vx < 0) state.vx = -state.vx * BOUNCE_RESTITUTION;
        hit = true;
      } else if (state.x >= bounds.maxX) {
        state.x = bounds.maxX;
        if (state.vx > 0) state.vx = -state.vx * BOUNCE_RESTITUTION;
        hit = true;
      }

      if (state.y <= bounds.minY) {
        state.y = bounds.minY;
        if (state.vy < 0) state.vy = -state.vy * BOUNCE_RESTITUTION;
        hit = true;
      } else if (state.y >= bounds.maxY) {
        state.y = bounds.maxY;
        if (state.vy > 0) state.vy = -state.vy * BOUNCE_RESTITUTION;
        hit = true;
      }
      return hit;
    }

    function startPhysics(state) {
      if (state.physicsRaf) {
        window.cancelAnimationFrame(state.physicsRaf);
        state.physicsRaf = 0;
      }

      var prev = 0;
      function frame(ts) {
        if (state.dragging) {
          state.physicsRaf = 0;
          return;
        }

        if (!prev) prev = ts;
        var dt = Math.min((ts - prev) / 16.6667, 2.2);
        prev = ts;

        state.x += state.vx * dt;
        state.y += state.vy * dt;
        var bounds = getBounds(state);
        resolveCollision(state, bounds);

        state.vx *= Math.pow(BOUNCE_FRICTION, dt);
        state.vy *= Math.pow(BOUNCE_FRICTION, dt);

        if (Math.abs(state.vx) < MIN_BOUNCE_SPEED) state.vx = 0;
        if (Math.abs(state.vy) < MIN_BOUNCE_SPEED) state.vy = 0;

        applyState(state);

        if (state.vx !== 0 || state.vy !== 0) {
          state.physicsRaf = window.requestAnimationFrame(frame);
        } else {
          state.physicsRaf = 0;
        }
      }

      state.physicsRaf = window.requestAnimationFrame(frame);
    }

    var topZ = Z_BASE + stickers.length + 5;

    function bringToFront(state) {
      topZ += 1;
      state.z = topZ;
      state.el.style.zIndex = String(state.z);
    }

    function applySelection(state, selected) {
      state.selected = selected;
      if (selected) {
        state.el.classList.add('sticker-selected');
      } else {
        state.el.classList.remove('sticker-selected');
      }
    }

    function clearAllSelections() {
      Array.prototype.forEach.call(stickers, function (node) {
        if (node.__stateRef) applySelection(node.__stateRef, false);
      });
    }

    function createRotateHandle(state) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sticker-rotate-handle';
      btn.setAttribute('aria-label', 'rotate sticker');
      btn.innerHTML = '⟳';
      state.el.appendChild(btn);

      var rotating = false;
      var lastPointerAngle = 0;
      var accumulatedDelta = 0;
      var startRotation = 0;

      function pointerAngle(clientX, clientY, center) {
        return Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
      }

      function shortestDelta(nextAngle, prevAngle) {
        var delta = nextAngle - prevAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        return delta;
      }

      function getCenter() {
        var rect = state.el.getBoundingClientRect();
        return {
          x: rect.left + (rect.width / 2),
          y: rect.top + (rect.height / 2)
        };
      }

      function beginRotate(clientX, clientY) {
        rotating = true;
        bringToFront(state);
        applySelection(state, true);
        state.el.classList.add('sticker-rotating');
        state.vx = 0;
        state.vy = 0;
        if (state.physicsRaf) {
          window.cancelAnimationFrame(state.physicsRaf);
          state.physicsRaf = 0;
        }
        startRotation = state.rotation;
        accumulatedDelta = 0;
        lastPointerAngle = pointerAngle(clientX, clientY, getCenter());
      }

      function updateRotate(clientX, clientY) {
        if (!rotating) return;
        var center = getCenter();
        var angle = pointerAngle(clientX, clientY, center);
        accumulatedDelta += shortestDelta(angle, lastPointerAngle);
        lastPointerAngle = angle;
        state.rotation = startRotation + accumulatedDelta;
        applyState(state);
      }

      function endRotate() {
        if (!rotating) return;
        rotating = false;
        state.el.classList.remove('sticker-rotating');
      }

      function pointerClient(event) {
        if (!event) return null;
        if (event.touches && event.touches[0]) {
          return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        if (event.changedTouches && event.changedTouches[0]) {
          return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
        }
        if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
          return { x: event.clientX, y: event.clientY };
        }
        return null;
      }

      function onPointerMove(event) {
        if (!rotating) return;
        var point = pointerClient(event);
        if (!point) return;
        if (event.cancelable) event.preventDefault();
        updateRotate(point.x, point.y);
      }

      btn.addEventListener('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();
        beginRotate(event.clientX, event.clientY);
      });

      btn.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        event.stopPropagation();
        beginRotate(event.clientX, event.clientY);
      });

      btn.addEventListener('touchstart', function (event) {
        var touch = event.touches && event.touches[0];
        if (!touch) return;
        event.preventDefault();
        event.stopPropagation();
        beginRotate(touch.clientX, touch.clientY);
      }, { passive: false });

      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });

      window.addEventListener('mouseup', endRotate);
      window.addEventListener('pointerup', endRotate);
      window.addEventListener('touchend', endRotate);
      window.addEventListener('touchcancel', endRotate);
    }

    Array.prototype.forEach.call(stickers, function (sticker, index) {
      var state = {
        el: sticker,
        x: toNumber(sticker.getAttribute('data-x'), 30),
        y: toNumber(sticker.getAttribute('data-y'), 30),
        size: toNumber(sticker.getAttribute('data-size'), 118),
        rotation: toNumber(sticker.getAttribute('data-rotation'), 0),
        holdTimer: null,
        holdReady: false,
        dragging: false,
        movedBeforeDrag: false,
        justDragged: false,
        downX: 0,
        downY: 0,
        pointerType: 'mouse',
        lastMoveTime: 0,
        lastDx: 0,
        lastDy: 0,
        vx: 0,
        vy: 0,
        physicsRaf: 0,
        z: Z_BASE + index,
        selected: false
      };

      sticker.__stateRef = state;

      sticker.style.setProperty('--sticker-size', state.size + 'px');
      sticker.style.zIndex = String(state.z);
      randomizeInitialSpawn(state);
      clampState(state);
      applyState(state);
      createRotateHandle(state);

      var target = window.interact(sticker);

      target.draggable({
        manualStart: true,
        inertia: {
          resistance: 16,
          minSpeed: 90,
          endSpeed: 22
        },
        listeners: {
          start: function (event) {
            if (state.physicsRaf) {
              window.cancelAnimationFrame(state.physicsRaf);
              state.physicsRaf = 0;
            }
            state.dragging = true;
            state.justDragged = true;
            clearAllSelections();
            applySelection(state, true);
            bringToFront(state);
            state.el.classList.add('sticker-dragging');
            state.el.classList.remove('sticker-hold-ready');
            state.lastMoveTime = Date.now();
            state.lastDx = 0;
            state.lastDy = 0;
            if (event.interaction && event.interaction.pointerType === 'touch') {
              navigator.vibrate && navigator.vibrate(8);
            }
          },
          move: function (event) {
            state.x += event.dx;
            state.y += event.dy;
            var bounds = getBounds(state);
            resolveCollision(state, bounds);
            state.lastDx = event.dx;
            state.lastDy = event.dy;
            state.lastMoveTime = Date.now();
            applyState(state);
          },
          end: function () {
            var now = Date.now();
            var since = Math.max(10, now - state.lastMoveTime);
            var velBoost = 11 / since;
            state.vx = clamp(state.lastDx * velBoost, -MAX_THROW_SPEED_X, MAX_THROW_SPEED_X);
            state.vy = clamp(state.lastDy * velBoost, -MAX_THROW_SPEED_Y, MAX_THROW_SPEED_Y);

            if (Math.abs(state.vx) > 0.02 || Math.abs(state.vy) > 0.02) {
              startPhysics(state);
            }

            state.dragging = false;
            state.holdReady = false;
            state.movedBeforeDrag = false;
            state.el.classList.remove('sticker-dragging');
            state.el.classList.remove('sticker-hold-ready');
            window.setTimeout(function () {
              state.justDragged = false;
            }, DRAG_GUARD_MS);
          }
        }
      });

      target.on('down', function (event) {
        clearAllSelections();
        applySelection(state, true);
        bringToFront(state);
        state.pointerType = event.pointerType || 'mouse';
        state.downX = event.clientX;
        state.downY = event.clientY;
        state.movedBeforeDrag = false;
        state.holdReady = false;
        window.clearTimeout(state.holdTimer);

        state.holdReady = true;
        if (event.interaction && !event.interaction.interacting()) {
          event.interaction.start({ name: 'drag' }, event.interactable, state.el);
        }
      });

      target.on('move', function (event) {
        if (state.dragging || state.pointerType !== 'touch') return;
        var dx = event.clientX - state.downX;
        var dy = event.clientY - state.downY;
        var moved = Math.sqrt(dx * dx + dy * dy) > TAP_MOVE_PX;
        if (moved) {
          state.movedBeforeDrag = true;
          window.clearTimeout(state.holdTimer);
          state.el.classList.remove('sticker-hold-ready');
        }
      });

      function resetPressState() {
        window.clearTimeout(state.holdTimer);
        if (!state.dragging) {
          state.holdReady = false;
        }
        if (!state.dragging) {
          state.el.classList.remove('sticker-hold-ready');
        }
      }

      target.on('up', resetPressState);
      target.on('cancel', resetPressState);

      sticker.addEventListener('click', function (event) {
        if (state.justDragged || state.dragging || state.movedBeforeDrag) {
          event.preventDefault();
          return;
        }
        clearAllSelections();
        applySelection(state, true);
        bringToFront(state);
        playTapAnimation(sticker);
      });

      window.addEventListener('resize', function () {
        if (state.physicsRaf) {
          window.cancelAnimationFrame(state.physicsRaf);
          state.physicsRaf = 0;
        }
        clampState(state);
        applyState(state);
      }, { passive: true });
    });

    document.addEventListener('mousedown', function (event) {
      if (event.target && event.target.closest && event.target.closest('[data-sticker]')) return;
      clearAllSelections();
    });

    document.addEventListener('touchstart', function (event) {
      if (event.target && event.target.closest && event.target.closest('[data-sticker]')) return;
      clearAllSelections();
    }, { passive: true });
  }

  Array.prototype.forEach.call(layers, initLayer);
})();
