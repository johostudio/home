// Dual Clocks: Vancouver (left) & Nanchang (right)
(function () {
  'use strict';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatTime(date) {
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    return pad(h12) + ':' + pad(m) + ':' + pad(s) + ' ' + ampm;
  }

  // Create clock elements
  function createClock(side, label, parent) {
    var container = document.createElement('div');
    container.className = 'clock-container clock-' + side;

    var labelEl = document.createElement('div');
    labelEl.className = 'clock-label';
    labelEl.textContent = label;

    var timeEl = document.createElement('div');
    timeEl.className = 'clock-time';

    var dateEl = document.createElement('div');
    dateEl.className = 'clock-date';

    container.appendChild(labelEl);
    container.appendChild(timeEl);
    container.appendChild(dateEl);
    parent.appendChild(container);

    return { time: timeEl, date: dateEl };
  }

  // Wrapper div so clocks can be styled as a row on mobile
  var wrapper = document.createElement('div');
  wrapper.className = 'clocks-wrapper';
  document.body.appendChild(wrapper);

  var dragOffsetX = 0;

  function applyHorizontalOffset() {
    wrapper.style.setProperty('--clock-drag-x', dragOffsetX + 'px');
  }

  (function setupHorizontalDrag() {
    if (window.matchMedia && !window.matchMedia('(min-width: 1000px)').matches) {
      return;
    }

    var dragging = false;
    var startClientX = 0;
    var startOffsetX = 0;

    function start(clientX) {
      dragging = true;
      startClientX = clientX;
      startOffsetX = dragOffsetX;
      wrapper.classList.add('clock-dragging');
    }

    function move(clientX) {
      if (!dragging) return;
      var next = startOffsetX + (clientX - startClientX);
      var maxOffset = Math.max(0, Math.floor((window.innerWidth - 820) / 2));
      if (next > maxOffset) next = maxOffset;
      if (next < -maxOffset) next = -maxOffset;
      dragOffsetX = next;
      applyHorizontalOffset();
    }

    function end() {
      if (!dragging) return;
      dragging = false;
      wrapper.classList.remove('clock-dragging');
    }

    wrapper.addEventListener('mousedown', function (event) {
      if (event.button !== 0) return;
      start(event.clientX);
      event.preventDefault();
    });

    window.addEventListener('mousemove', function (event) {
      move(event.clientX);
    });
    window.addEventListener('mouseup', end);

    wrapper.addEventListener('touchstart', function (event) {
      var touch = event.touches && event.touches[0];
      if (!touch) return;
      start(touch.clientX);
    }, { passive: true });

    window.addEventListener('touchmove', function (event) {
      var touch = event.touches && event.touches[0];
      if (!touch) return;
      move(touch.clientX);
    }, { passive: true });
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);

    window.addEventListener('resize', function () {
      var maxOffset = Math.max(0, Math.floor((window.innerWidth - 820) / 2));
      if (dragOffsetX > maxOffset) dragOffsetX = maxOffset;
      if (dragOffsetX < -maxOffset) dragOffsetX = -maxOffset;
      applyHorizontalOffset();
    });
  })();

  applyHorizontalOffset();

  // Apply dark (black) clock text on home page only
  var clockPath = window.location.pathname;
  var clockIsHome = (clockPath === '/' || clockPath.endsWith('/index.html') || clockPath.endsWith('/index') || clockPath === '');
  if (clockIsHome) {
    document.body.classList.add('home-dark-clocks');
  }

  var pstEl = createClock('left', 'vancouver · yvr', wrapper);
  var nanchangEl = createClock('right', 'nanchang · khn', wrapper);

  function formatDate(date) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var y = date.getFullYear();
    return pad(m) + '.' + pad(d) + '.' + y;
  }

  function tick() {
    var now = new Date();

    // Nanchang: UTC+8
    var nanchangOffset = 8 * 60; // minutes
    var utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    var nanchangDate = new Date(utcMs + nanchangOffset * 60000);
    nanchangEl.time.textContent = formatTime(nanchangDate);
    nanchangEl.date.textContent = formatDate(nanchangDate) + ' · cst';

    // PST: UTC-8 (standard) / PDT: UTC-7 (daylight)
    // Use America/Los_Angeles to handle DST automatically
    try {
      var pstStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      pstEl.time.textContent = pstStr;
      var pstDateStr = now.toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      pstEl.date.textContent = pstDateStr.replace(/\//g, '.') + ' · pst';
    } catch (e) {
      // Fallback: assume PST (UTC-8)
      var pstOffset = -8 * 60;
      var pstDate = new Date(utcMs + pstOffset * 60000);
      pstEl.time.textContent = formatTime(pstDate);
      pstEl.date.textContent = formatDate(pstDate) + ' · pst';
    }
  }

  tick();
  setInterval(tick, 1000);
})();
