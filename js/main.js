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

// ── Carrito ──────────────────────────────────────────────────
let cart = [];

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  renderCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');
  const badge     = document.getElementById('cart-badge');
  const totalEl   = document.getElementById('cart-total-price');

  const totalQty  = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Badge
  badge.textContent = totalQty;
  badge.classList.toggle('show', totalQty > 0);

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty"><div class="empty-icon">🛒</div><p>Tu carrito está vacío</p></div>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  totalEl.textContent = '$' + totalPrice;

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} c/u</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">🗑</button>
    </div>
  `).join('');
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

function checkout() {
  if (cart.length === 0) return;
  const lines = cart.map(i => `• ${i.name} x${i.qty} — $${i.price * i.qty}`).join('%0A');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = `Hola!%20Quiero%20hacer%20un%20pedido%3A%0A%0A${lines}%0A%0ATotal%3A%20%24${total}%0A%0A%C2%BFPueden%20coordinar%20la%20entrega%3F`;
  window.open(`https://wa.me/5218119810775?text=${msg}`, '_blank');
}

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
