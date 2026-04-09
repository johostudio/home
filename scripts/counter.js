document.addEventListener('DOMContentLoaded', () => {
    fetch('https://abacus.jasoncameron.dev/hit/johostudio/portfolio')
        .then(response => response.json())
        .then(data => {
            const count = data.value || 0;
            const countStr = String(count).padStart(5, '0');
            
            const counters = document.querySelectorAll('.visitor-count');
            counters.forEach(el => {
                el.textContent = countStr;
            });

            const wraps = document.querySelectorAll('.visitor-counter-wrap');
            wraps.forEach(wrap => {
                wrap.classList.remove('hidden');
            });
        })
        .catch(err => console.error('Counter API failed', err));
});
