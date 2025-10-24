// Wait for DOM before attaching handlers
document.addEventListener('DOMContentLoaded', () => {
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
      clearTimers();
      const len = Math.max(1, finalText.length);
      intervalId = setInterval(() => {
        origEl.textContent = randomString(len);
      }, step);

      timeoutId = setTimeout(() => {
        clearTimers();
        origEl.textContent = finalText;
      }, duration);
    }

    function clearTimers() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    }

    link.addEventListener('mouseenter', start);
    link.addEventListener('focus', start);

    link.addEventListener('mouseleave', () => {
      clearTimers();
      origEl.textContent = finalText;
    });
    link.addEventListener('blur', () => {
      clearTimers();
      origEl.textContent = finalText;
    });
  });
});