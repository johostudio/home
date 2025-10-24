// Wait for DOM before attaching handlers
document.addEventListener('DOMContentLoaded', () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>/\\|';
  const links = document.querySelectorAll('.project-link');

  links.forEach(link => {
    const origEl = link.querySelector('.orig');
    if (!origEl) return;

    // compute final text from data-final or .final span
    const finalText = (link.dataset.final || (link.querySelector('.final') && link.querySelector('.final').textContent) || '').trim();
    const origText = origEl.textContent.trim();

    // set a stable width based on the longest text (use ch unit)
    const maxLen = Math.max(origText.length, finalText.length || 1);
    origEl.style.minWidth = `${maxLen}ch`;
    origEl.style.display = 'inline-block';
    origEl.style.textAlign = 'center';

    let intervalId = null;
    let timeoutId = null;
    const duration = 700; // total animation duration in ms
    const step = 35; // ms between random char updates

    function randomString(len) {
      let out = '';
      for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
      return out;
    }

    function start() {
      clearTimers();
      const len = Math.max(1, finalText.length || maxLen);
      intervalId = setInterval(() => {
        origEl.textContent = randomString(len);
      }, step);

      timeoutId = setTimeout(() => {
        clearTimers();
        // reveal final word (the spelled-out number like "one", "two", etc.)
        origEl.textContent = finalText || origText;
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
      // ensure final text is shown on leave as required
      origEl.textContent = finalText || origText;
    });
    link.addEventListener('blur', () => {
      clearTimers();
      origEl.textContent = finalText || origText;
    });
  });
});