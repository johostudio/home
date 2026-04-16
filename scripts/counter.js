document.addEventListener('DOMContentLoaded', () => {
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const VISITOR_KEY = 'homeVisitorCountedV1';
    const LAST_COUNT_KEY = 'homeVisitorCountLastV1';
    let isNewVisitor = false;

    function renderCount(value) {
        const count = Number.isFinite(value) ? value : Number(value) || 0;
        const countStr = String(Math.max(0, count)).padStart(6, '0');

        const counters = document.querySelectorAll('.visitor-count');
        counters.forEach(el => {
            el.textContent = countStr;
        });

        const wraps = document.querySelectorAll('.visitor-counter-wrap');
        wraps.forEach(wrap => {
            wrap.classList.remove('hidden');
        });
    }

    renderCount(0);

    async function fetchCount() {
        const primaryEndpoint = isNewVisitor
            ? 'https://api.counterapi.dev/v1/johostudio/portfolio/up'
            : 'https://api.counterapi.dev/v1/johostudio/portfolio/';
        const fallbackEndpoint = isNewVisitor
            ? 'https://api.counterapi.dev/v1/johostudio/portfolio/up/'
            : 'https://api.counterapi.dev/v1/johostudio/portfolio';

        try {
            const response = await fetch(primaryEndpoint, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('counter request failed: ' + response.status);
            }
            return response.json();
        } catch (_) {
            const response = await fetch(fallbackEndpoint, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('counter fallback failed: ' + response.status);
            }
            return response.json();
        }
    }

    try {
        isNewVisitor = !localStorage.getItem(VISITOR_KEY);

        const savedCountRaw = localStorage.getItem(LAST_COUNT_KEY);
        if (savedCountRaw !== null) {
            renderCount(Number(savedCountRaw));
        }
    } catch (_) {
        isNewVisitor = false;
    }

    if (isLocalHost) {
        return;
    }

    fetchCount()
        .then(data => {
            if (isNewVisitor) {
                try {
                    localStorage.setItem(VISITOR_KEY, 'true');
                } catch (_) {
                    // ignore storage write errors (private mode, restricted storage)
                }
            }

            const count = data.count || 0;

            renderCount(count);

            try {
                localStorage.setItem(LAST_COUNT_KEY, String(count));
            } catch (_) {
                // ignore storage write errors
            }
        })
        .catch(err => {
            console.error('Counter API failed', err);
            try {
                const savedCountRaw = localStorage.getItem(LAST_COUNT_KEY);
                if (savedCountRaw !== null) {
                    renderCount(Number(savedCountRaw));
                }
            } catch (_) {
                renderCount(0);
            }
        });
});
