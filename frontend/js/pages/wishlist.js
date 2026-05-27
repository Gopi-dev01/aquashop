/* ═══════════════════════════════════════
   wishlist.js — AquaShop Wishlist Logic
   ═══════════════════════════════════════ */

/* ── AUTH GUARD ── */
(function () {
  const token = localStorage.getItem('aqua_token');
  if (!token) window.location.href = '../pages/login.html';
})();

/* ══════════════════════════════
   STATE — loaded from localStorage
   (Replace with API: GET /wishlist)
══════════════════════════════ */
function getWishlist() {
  return JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
}
function saveWishlist(items) {
  localStorage.setItem('aqua_wishlist', JSON.stringify(items));
}

/* ── MOCK stock status (replace with real API data) ── */
const OUT_OF_STOCK_IDS = ['p5']; // Bluetooth speaker out of stock

/* ══════════════════════════════
   RENDER
══════════════════════════════ */
function render() {
  const wish    = getWishlist();
  const wrapper = document.getElementById('wishlist-content');
  const topbar  = document.getElementById('wishlist-topbar');
  const banner  = document.getElementById('checkout-banner');

  // update count text
  document.getElementById('item-count').textContent = wish.length;
  updateBadges();

  if (wish.length === 0) {
    topbar.style.display  = 'none';
    banner.style.display  = 'none';
    wrapper.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h3>Your Wishlist is Empty</h3>
        <p>Save your favorite items and shop them later.</p>
        <button class="btn-browse" onclick="location.href='shop.html'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Browse Products
        </button>
      </div>`;
    return;
  }

  topbar.style.display = 'flex';
  banner.style.display = 'flex';

  wrapper.innerHTML = `<div class="wishlist-grid">${wish.map(item => cardHTML(item)).join('')}</div>`;
}

/* ── CARD HTML ── */
function cardHTML(item) {
  const outOfStock = OUT_OF_STOCK_IDS.includes(item.id);
  const discount   = item.discount || 0;
  const original   = item.original || null;

  return `
    <div class="wish-card" onclick="goToProduct('${item.id}')">
      <div class="card-img">
        <img src="${item.img}" alt="${item.name}" loading="lazy"/>
        ${discount ? `<span class="badge-off">${discount}% OFF</span>` : ''}
        <button class="remove-btn" onclick="event.stopPropagation(); removeItem('${item.id}')" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="card-info">
        <h3>${item.name}</h3>
        <div class="stars">${renderStars(item.rating || 4)} <span class="r-count">(${item.reviews || 0})</span></div>
        <div class="price-row">
          <span class="price-now">$${parseFloat(item.price).toFixed(2)}</span>
          ${original ? `<span class="price-old">$${parseFloat(original).toFixed(2)}</span>` : ''}
        </div>
        <div class="stock-badge ${outOfStock ? 'out-stock' : 'in-stock'}">
          <span class="dot"></span>
          ${outOfStock ? 'Out of Stock' : 'In Stock'}
        </div>
        <button class="btn-add-cart"
          onclick="event.stopPropagation(); addToCart('${item.id}')"
          ${outOfStock ? 'disabled' : ''}>
          ${outOfStock
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
               </svg> Unavailable`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
               </svg> Add to Cart`
          }
        </button>
      </div>
    </div>`;
}

/* ── STARS ── */
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= Math.floor(rating)
      ? `<svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`
      : `<svg class="empty" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
  }
  return html;
}

/* ══════════════════════════════
   ACTIONS
══════════════════════════════ */
function removeItem(id) {
  let wish = getWishlist().filter(i => i.id !== id);
  saveWishlist(wish);

  // API call: DELETE /wishlist/remove
  // WishlistAPI.remove(id);

  render();
  showToast('💔 Removed from wishlist');
}

function clearAll() {
  const modal = document.getElementById('clear-wishlist-modal');
  if (modal) modal.classList.add('show');
}

function closeClearModal() {
  const modal = document.getElementById('clear-wishlist-modal');
  if (modal) modal.classList.remove('show');
}

function confirmClearAll() {
  saveWishlist([]);
  closeClearModal();
  render();
  showToast('🗑️ Wishlist cleared');
}

function addToCart(id) {
  const item = getWishlist().find(i => i.id === id);
  if (!item || OUT_OF_STOCK_IDS.includes(id)) return;

  let cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const ex = cart.find(i => i.id === id);
  if (ex) ex.qty += 1;
  else cart.push({ id, name: item.name, price: item.price, img: item.img, qty: 1 });
  localStorage.setItem('aqua_cart', JSON.stringify(cart));

  // API call: POST /cart/add
  // CartAPI.add(id, 1);

  updateBadges();
  showToast('🛒 Added to cart!');
}

function addAllToCart() {
  const wish      = getWishlist();
  const available = wish.filter(i => !OUT_OF_STOCK_IDS.includes(i.id));
  if (available.length === 0) { showToast('⚠️ No available items to add'); return; }

  let cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  available.forEach(item => {
    const ex = cart.find(i => i.id === item.id);
    if (ex) ex.qty += 1;
    else cart.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
  });
  localStorage.setItem('aqua_cart', JSON.stringify(cart));
  updateBadges();
  showToast(`🛒 ${available.length} items added to cart!`);
}

function goToProduct(id) {
  if (id === 'p7' || id === 'p8') {
    window.location.href = 'shop.html';
  } else {
    window.location.href = `product-details.html?id=${id}`;
  }
}

/* ══════════════════════════════
   BADGES & NAVBAR
══════════════════════════════ */
function updateBadges() {
  const cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const wish = getWishlist();
  const cb = document.getElementById('cart-count');
  const wb = document.getElementById('wish-count');
  if (cb) cb.textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (wb) wb.textContent = wish.length;
}

function initNavbar() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10));
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  if (links) links.classList.toggle('mobile-active');
  if (btn) btn.classList.toggle('active');
}

/* ══════════════════════════════
   TOAST
══════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  render();
});


