document.addEventListener('DOMContentLoaded', () => {
    const isNewVisitor = !localStorage.getItem('hasVisited');
    
    const endpoint = isNewVisitor 
        ? 'https://abacus.jasoncameron.dev/hit/johostudio/portfolio'
        : 'https://abacus.jasoncameron.dev/get/johostudio/portfolio';

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (isNewVisitor) {
                localStorage.setItem('hasVisited', 'true');
            }

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
