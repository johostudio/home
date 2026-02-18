// Dual Clocks: Nanchang (left) & PST (right)
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
  function createClock(side, label) {
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
    document.body.appendChild(container);

    return { time: timeEl, date: dateEl };
  }

  var nanchangEl = createClock('left', 'Nanchang');
  var pstEl = createClock('right', 'Vancouver');

  function formatDate(date) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var y = date.getFullYear();
    return m + '/' + d + '/' + y;
  }

  function tick() {
    var now = new Date();

    // Nanchang: UTC+8
    var nanchangOffset = 8 * 60; // minutes
    var utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    var nanchangDate = new Date(utcMs + nanchangOffset * 60000);
    nanchangEl.time.textContent = formatTime(nanchangDate);
    nanchangEl.date.textContent = formatDate(nanchangDate);

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
      pstEl.date.textContent = pstDateStr;
    } catch (e) {
      // Fallback: assume PST (UTC-8)
      var pstOffset = -8 * 60;
      var pstDate = new Date(utcMs + pstOffset * 60000);
      pstEl.time.textContent = formatTime(pstDate);
      pstEl.date.textContent = formatDate(pstDate);
    }
  }

  tick();
  setInterval(tick, 1000);
})();
