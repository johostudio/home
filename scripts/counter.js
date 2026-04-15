document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
    }

    const isNewVisitor = !localStorage.getItem('hasVisited');
    
    const endpoint = isNewVisitor 
        ? 'https://api.counterapi.dev/v1/johostudio/portfolio/up'
        : 'https://api.counterapi.dev/v1/johostudio/portfolio';

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (isNewVisitor) {
                localStorage.setItem('hasVisited', 'true');
            }

            const count = data.count || 0;
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
