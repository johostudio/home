(function () {
  const videoIds = [
    'm25fHW8T_Xg',
    'ycI3Kf99oBw',
    'F9rYDgfECxA',
    '5nAU2YZQn8I',
    'Ue9InrCvprk'
  ];

  let idx = 0;
  const previewBtn = document.getElementById('pc-preview');
  const previewImg = document.getElementById('pc-preview-img');
  const playerWrap = document.getElementById('pc-player');
  const iframe = document.getElementById('pc-iframe');
  const nextImg = document.getElementById('pc-next-img');
  const root = document.getElementById('postcards-carousel');
  const range = document.getElementById('pc-range');

  function ytEmbed(id, autoplay = 0) {
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&showinfo=0&autoplay=${autoplay}`;
  }

  function updatePreviewImages() {
    previewImg.src = `https://img.youtube.com/vi/${videoIds[idx]}/hqdefault.jpg`;
    const nextId = videoIds[(idx + 1) % videoIds.length];
    nextImg.src = `https://img.youtube.com/vi/${nextId}/hqdefault.jpg`;
    nextImg.alt = 'next preview';
    if (range) range.value = idx;
  }

  // show player with CSS animation
  function showPlayer(startAutoplay = false) {
    // hide preview immediately and show player immediately to avoid ghost/fade
    previewBtn.hidden = true;
    playerWrap.hidden = false;
    root.classList.add('pc-active');
    // set iframe src immediately (no delayed assignment)
    iframe.src = ytEmbed(videoIds[idx], startAutoplay ? 1 : 0);
    iframe.focus?.();
  }

  // revert to preview with animation
  function showPreview() {
    // revert immediately: clear iframe and show preview without delay
    iframe.src = '';
    playerWrap.hidden = true;
    previewBtn.hidden = false;
    root.classList.remove('pc-active');
    updatePreviewImages();
  }

  // change index via slider
  function setIndex(n) {
    idx = (n + videoIds.length) % videoIds.length;
    if (root.classList.contains('pc-active')) {
      iframe.src = ytEmbed(videoIds[idx], 0);
    } else {
      updatePreviewImages();
    }
  }

  previewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showPlayer(true);
  });

  // range input change -> update card; dragging adds blur class
  if (range) {
    range.max = videoIds.length - 1;
    range.addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10) || 0;
      setIndex(v);
    });

    let dragging = false;
    const startDrag = () => { dragging = true; root.classList.add('dragging'); };
    const endDrag = () => { dragging = false; root.classList.remove('dragging'); };

    range.addEventListener('pointerdown', startDrag, { passive: true });
    window.addEventListener('pointerup', endDrag);
    range.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchend', endDrag);
  }

  // keyboard navigation still works
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { setIndex(idx + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { setIndex(idx - 1); e.preventDefault(); }
    if (e.key === 'Escape') { showPreview(); }
  });

  // small swipe to change when player active
  let touchStartY = null;
  root.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) touchStartY = e.touches[0].clientY;
  }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (touchStartY == null) return;
    const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : null;
    if (endY == null) { touchStartY = null; return; }
    const dy = touchStartY - endY;
    if (Math.abs(dy) > 40) {
      if (dy > 0) setIndex(idx + 1);
      else setIndex(idx - 1);
    }
    touchStartY = null;
  }, { passive: true });

  // init
  updatePreviewImages();
  if (range) range.value = idx;

  window._pc = { showPlayer, showPreview, setIndex };
})();