document.addEventListener('DOMContentLoaded', () => {
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const workerBase = String(window.CLOUDFLARE_WORKER_URL || '').trim().replace(/\/$/, '');

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

    async function fetchCloudflareCount(shouldIncrement) {
        if (!workerBase) return null;

        const endpoint = shouldIncrement
            ? workerBase + '/visitor-count/increment'
            : workerBase + '/visitor-count';
        const method = shouldIncrement ? 'POST' : 'GET';

        const response = await fetch(endpoint, { method, cache: 'no-store' });
        if (!response.ok) {
            throw new Error('cloudflare counter failed: ' + response.status);
        }

        return response.json();
    }

    async function fetchLegacyCount(shouldIncrement) {
        const primaryEndpoint = shouldIncrement
            ? 'https://api.counterapi.dev/v1/johostudio/portfolio/up'
            : 'https://api.counterapi.dev/v1/johostudio/portfolio/';
        const fallbackEndpoint = shouldIncrement
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

    async function fetchCount(shouldIncrement) {
        if (workerBase) {
            try {
                const data = await fetchCloudflareCount(shouldIncrement);
                if (data) return data;
            } catch (err) {
                console.error('Cloudflare visitor counter failed', err);
            }
        }

        return fetchLegacyCount(shouldIncrement);
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

    const shouldIncrement = isNewVisitor && !isLocalHost;

    fetchCount(shouldIncrement)
        .then(data => {
            if (shouldIncrement) {
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
