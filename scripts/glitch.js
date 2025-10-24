// quick JS-based "random chars then show final word" hover effect
(function () {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>/\\|';
  const links = document.querySelectorAll('.project-link');

  links.forEach(link => {
    const origEl = link.querySelector('.orig');
    const finalText = (link.dataset.final || (link.querySelector('.final') && link.querySelector('.final').textContent)).trim();
    let intervalId = null;
    let timeoutId = null;
    const duration = 700; // total animation duration in ms
    const step = 40; // ms between random char updates

    function randomString(len) {
      let out = '';
      for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
      return out;
    }

    function start() {
      clear();
      const len = Math.max(1, finalText.length);
      intervalId = setInterval(() => {
        // show quickly-changing random chars of same length as final
        origEl.textContent = randomString(len);
      }, step);

      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        intervalId = null;
        // final reveal: show the final word
        origEl.textContent = finalText;
      }, duration);
    }

    function clear() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    }

    link.addEventListener('mouseenter', start);
    link.addEventListener('focus', start); // keyboard accessibility

    link.addEventListener('mouseleave', () => {
      // if animation still running, stop and set final immediately
      if (intervalId || timeoutId) {
        clear();
        origEl.textContent = finalText;
      }
    });
    link.addEventListener('blur', () => {
      if (intervalId || timeoutId) {
        clear();
        origEl.textContent = finalText;
      }
    });
  });
})();