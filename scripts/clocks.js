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

  function syncHeaderClearance() {
    var header = document.querySelector('.jh-header');
    var headerBottom = 130;
    if (header) {
      var rect = header.getBoundingClientRect();
      if (rect && Number.isFinite(rect.bottom)) {
        headerBottom = Math.max(0, Math.round(rect.bottom));
      }
    }

    var path = window.location.pathname || '';
    var laneGap = 16;
    var isAbout = /about(?:\.html)?$/.test(path);
    var isGallery = /gallery(?:\.html)?$/.test(path) || /projects(?:\.html)?$/.test(path);
    var isArchives = /archives(?:\.html)?$/.test(path);

    if (isAbout) laneGap = 24;
    if (isGallery) laneGap = 26;
    if (isArchives) laneGap = 30;

    var desktopTop = headerBottom + laneGap;
    var mobileTop = headerBottom + laneGap + 4;

    document.documentElement.style.setProperty('--clocks-top', desktopTop + 'px');
    document.documentElement.style.setProperty('--clocks-top-mobile', mobileTop + 'px');
  }

  window.addEventListener('resize', syncHeaderClearance, { passive: true });
  var headerSyncRaf = 0;
  function scheduleHeaderSync() {
    if (headerSyncRaf) return;
    headerSyncRaf = window.requestAnimationFrame(function () {
      headerSyncRaf = 0;
      syncHeaderClearance();
    });
  }
  window.addEventListener('load', scheduleHeaderSync, { passive: true });
  window.setTimeout(scheduleHeaderSync, 0);
  window.setTimeout(scheduleHeaderSync, 220);

  function updateClockVisibility() {
    var y = window.scrollY || 0;
    wrapper.classList.toggle('clocks-faded', y > 8);
    wrapper.classList.toggle('clocks-hidden', y > 54);
  }

  var scrollRaf = 0;
  window.addEventListener('scroll', function () {
    if (scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(function () {
      scrollRaf = 0;
      updateClockVisibility();
    });
  }, { passive: true });
  updateClockVisibility();

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

  var tickTimer = 0;
  function startClockTimer() {
    if (tickTimer) return;
    tickTimer = window.setInterval(tick, 1000);
  }

  function stopClockTimer() {
    if (!tickTimer) return;
    window.clearInterval(tickTimer);
    tickTimer = 0;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopClockTimer();
      return;
    }
    tick();
    startClockTimer();
  });

  startClockTimer();
})();
