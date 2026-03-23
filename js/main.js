// ── Carruseles ──────────────────────────────────────────────
const carousels = {};

function initCarousel(id, total) {
  carousels[id] = { index: 0, total };
  const dotsEl = document.getElementById('dots-' + id);
  dotsEl.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('span');
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', (e) => { e.stopPropagation(); goTo(id, i); });
    dotsEl.appendChild(d);
  }
}

function goTo(id, index) {
  const c = carousels[id];
  c.index = (index + c.total) % c.total;
  document.getElementById('track-' + id).style.transform = `translateX(-${c.index * 100}%)`;
  document.querySelectorAll('#dots-' + id + ' span').forEach((d, i) => {
    d.classList.toggle('active', i === c.index);
  });
}

function slideCarousel(id, dir, e) {
  if (e) e.stopPropagation();
  goTo(id, carousels[id].index + dir);
}

function enableSwipe(id) {
  const el = document.getElementById('carousel-' + id);
  let startX = 0;
  el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) slideCarousel(id, diff > 0 ? 1 : -1, null);
  });
}

// ── Zoom modal ───────────────────────────────────────────────
let zoomImages = [];
let zoomIndex  = 0;

function openZoom(id, e) {
  if (e) e.stopPropagation();
  const imgs = document.querySelectorAll('#carousel-' + id + ' .carousel-track img');
  zoomImages = Array.from(imgs).map(img => img.src);
  zoomIndex  = carousels[id] ? carousels[id].index : 0;
  document.getElementById('zoom-img').src = zoomImages[zoomIndex];
  document.getElementById('zoom-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeZoom() {
  document.getElementById('zoom-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function zoomNav(dir, e) {
  e.stopPropagation();
  zoomIndex = (zoomIndex + dir + zoomImages.length) % zoomImages.length;
  document.getElementById('zoom-img').src = zoomImages[zoomIndex];
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('zoom-overlay').classList.contains('open')) return;
  if (e.key === 'Escape')      closeZoom();
  if (e.key === 'ArrowRight')  zoomNav( 1, e);
  if (e.key === 'ArrowLeft')   zoomNav(-1, e);
});

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCarousel('ps', 9);
  enableSwipe('ps');
  initCarousel('cb', 6);
  enableSwipe('cb');
  initCarousel('vaso', 6);
  enableSwipe('vaso');
  initCarousel('bowl', 7);
  enableSwipe('bowl');
});
