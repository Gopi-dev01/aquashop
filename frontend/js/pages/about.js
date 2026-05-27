/* ═══════════════════════════════════════
   about.js — AquaShop About Page Logic
   ═══════════════════════════════════════ */

/* ── STICKY NAVBAR ── */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ── CART & WISHLIST COUNTS ── */
function updateCounts() {
  const cart     = JSON.parse(localStorage.getItem('aqua_cart')     || '[]');
  const wishlist = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const cartBadge = document.getElementById('cart-count');
  const wishBadge = document.getElementById('wish-count');
  if (cartBadge) cartBadge.textContent = cart.length;
  if (wishBadge) wishBadge.textContent = wishlist.length;
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  links.classList.toggle('mobile-active');
  btn.classList.toggle('active');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCounts();
});
