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

  function ytEmbed(id, autoplay = 0) {
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&showinfo=0&autoplay=${autoplay}`;
  }

  function updatePreviewImages() {
    previewImg.src = `https://img.youtube.com/vi/${videoIds[idx]}/hqdefault.jpg`;
    const nextId = videoIds[(idx + 1) % videoIds.length];
    nextImg.src = `https://img.youtube.com/vi/${nextId}/hqdefault.jpg`;
    nextImg.alt = 'next preview';
  }

  // show player with CSS animation
  function showPlayer(startAutoplay = false) {
    // add active class to trigger CSS transitions
    root.classList.add('pc-active');
    // ensure player exists and will be visible after transition
    playerWrap.hidden = false;
    // after a short delay (match CSS transition ~280ms), set iframe src and hide the preview element
    setTimeout(() => {
      iframe.src = ytEmbed(videoIds[idx], startAutoplay ? 1 : 0);
      previewBtn.hidden = true;
    }, 300);
  }

  // revert to preview with animation
  function showPreview() {
    // un-hide preview for transition
    previewBtn.hidden = false;
    // remove active class to animate back
    root.classList.remove('pc-active');
    // clear iframe after transition completes
    setTimeout(() => {
      iframe.src = '';
      playerWrap.hidden = true;
    }, 300);
    updatePreviewImages();
  }

  function advance(n = 1) {
    idx = (idx + n + videoIds.length) % videoIds.length;
    // if player is active, update iframe immediately; else update preview image
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

  playerWrap.addEventListener('click', () => advance(1));

  root.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 10) return;
    e.preventDefault();
    if (e.deltaY > 0) advance(1);
    else advance(-1);
  }, { passive: false });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { advance(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { advance(-1); e.preventDefault(); }
    if (e.key === 'Escape') { showPreview(); }
  });

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
      if (dy > 0) advance(1);
      else advance(-1);
    }
    touchStartY = null;
  }, { passive: true });

  // init
  updatePreviewImages();
  // expose small API for debugging if needed
  window._pc = { showPlayer, showPreview, advance };
})();