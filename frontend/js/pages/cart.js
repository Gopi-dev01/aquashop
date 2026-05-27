/* ═══════════════════════════════════════
   cart.js — AquaShop Cart Page Logic
   ═══════════════════════════════════════ */

/* ── AUTH GUARD ── */
(function () {
  if (!localStorage.getItem('aqua_token')) window.location.href = '../pages/login.html';
})();

/* ══════════════════════════════
   CART STATE
══════════════════════════════ */
function getCart() {
  return JSON.parse(localStorage.getItem('aqua_cart') || '[]');
}
function saveCart(items) {
  localStorage.setItem('aqua_cart', JSON.stringify(items));
}

/* ══════════════════════════════
   RENDER CART
══════════════════════════════ */
function render() {
  const cart = getCart();
  const wrapper = document.getElementById('cart-content');
  updateBadges();

  if (cart.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h3>Your Cart is Empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <button class="btn-shop" onclick="location.href='shop.html'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Browse Products
        </button>
      </div>`;
    return;
  }

  // Items card
  const itemsHTML = cart.map(item => itemRowHTML(item)).join('');

  wrapper.innerHTML = `
    <div class="cart-card">
      <h2>Cart Items (${cart.length})</h2>
      ${itemsHTML}
      <a class="continue-link" href="shop.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Continue Shopping
      </a>
    </div>
    <div class="summary-card">
      <h2>Order Summary</h2>
      <div id="summary-rows"></div>
      <div class="offer-banner" id="offer-banner">
        <div class="offer-icon">🎁</div>
        <div class="offer-text">
          <strong>Mega Purchase Offer!</strong><br/>
          Order totaling $300 or more and get <span>$100 OFF</span> automatically!
        </div>
      </div>
      <button class="btn-checkout" onclick="proceedCheckout()" ${cart.some(i => ['p4', 'p5'].includes(i.id)) ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>Proceed to Checkout</button>
      <button class="btn-continue-summary" onclick="location.href='shop.html'">Continue Shopping</button>
    </div>`;

  renderSummary();
}

/* ── ITEM ROW HTML ── */
function itemRowHTML(item) {
  const lineTotal = (item.price * item.qty).toFixed(2);
  const isOutOfStock = ['p4', 'p5'].includes(item.id);
  return `
    <div class="cart-item" id="item-${item.id}">
      <img class="item-img" src="${item.img}" alt="${item.name}"
           style="width:88px;height:88px;border-radius:12px;object-fit:cover;flex-shrink:0;background:#f5f5f5;cursor:pointer"
           onclick="location.href='${(item.id === 'p7' || item.id === 'p8') ? 'shop.html' : `product-details.html?id=${item.id}`}'"/>
      <div class="item-details">
        <h3>${item.name} ${isOutOfStock ? '<span style="color: red; font-size: 0.8rem; border: 1px solid red; padding: 2px 6px; border-radius: 4px; margin-left: 10px; vertical-align: middle;">Out of Stock</span>' : ''}</h3>
        <div class="qty-row">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
            <span class="qty-num" id="qty-${item.id}">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
          <div class="item-price">
            <div class="line-total">$${lineTotal}</div>
            <div class="unit-price">$${parseFloat(item.price).toFixed(2)} each</div>
          </div>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem('${item.id}')" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`;
}

/* ── SUMMARY ── */
function renderSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * parseInt(i.qty), 0);
  const totalQty = cart.reduce((s, i) => s + parseInt(i.qty), 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;

  // Automatic Discount Logic: $300 or above, get $100 off
  const discount = (subtotal >= 300) ? 100 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const el = document.getElementById('summary-rows');
  if (!el) return;

  el.innerHTML = `
    <div class="summary-row">
      <span class="label">Subtotal</span>
      <span class="value">$${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span class="label">Shipping</span>
      <span class="value ${shipping === 0 ? 'free' : ''}">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
    </div>
    ${discount > 0 ? `
    <div class="summary-row">
      <span class="label">Discount 100</span>
      <span class="value discount">−$${discount.toFixed(2)}</span>
    </div>` : ''}

    <div class="summary-divider"></div>
    <div class="summary-total">
      <span class="t-label">Total</span>
      <span class="t-value">$${total.toFixed(2)}</span>
    </div>`;

  // Highlight offer banner if discount is active
  const banner = document.getElementById('offer-banner');
  if (banner) {
    if (discount > 0) banner.classList.add('active');
    else banner.classList.remove('active');
  }
}

/* ══════════════════════════════
   ACTIONS
══════════════════════════════ */
function changeQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);

  // update qty display & line total without full re-render
  const qtyEl = document.getElementById('qty-' + id);
  const row = document.getElementById('item-' + id);
  if (qtyEl) qtyEl.textContent = item.qty;
  if (row) {
    const lt = row.querySelector('.line-total');
    if (lt) lt.textContent = '$' + (item.price * item.qty).toFixed(2);
  }

  // API call: PUT /cart/update
  // CartAPI.update(id, item.qty);

  renderSummary();
  updateBadges();
}

function removeItem(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);

  // API call: DELETE /cart/remove
  // CartAPI.remove(id);

  render();
  showToast('🗑️ Item removed from cart');
}

/* ── CHECKOUT ── */
function proceedCheckout() {
  const cart = getCart();
  if (cart.length === 0) { showToast('⚠️ Your cart is empty'); return; }
  if (cart.some(i => ['p4', 'p5'].includes(i.id))) {
    showToast('⚠️ Remove out-of-stock items to checkout');
    return;
  }
  window.location.href = 'checkout.html';
}

/* ══════════════════════════════
   BADGES & NAVBAR
══════════════════════════════ */
function updateBadges() {
  const cart = getCart();
  const wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
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