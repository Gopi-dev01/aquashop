/* ═══════════════════════════════════════
   home.js — AquaShop Home Page Logic
   ═══════════════════════════════════════ */

/* ── AUTH GUARD: redirect to login if no token ── */
(function () {
  const token = localStorage.getItem('aqua_token');
  const params = new URLSearchParams(window.location.search);
  const googleToken = params.get('token');

  if (googleToken) {
    localStorage.removeItem('aqua_user');
    localStorage.removeItem('aqua_cart');
    localStorage.removeItem('aqua_wishlist');
    localStorage.removeItem('last_order_id');
    localStorage.setItem('aqua_token', googleToken);
    window.history.replaceState({}, '', window.location.pathname);
  } else if (!token) {
    window.location.href = 'login.html';
  }
})();

/* ── LOAD USER ── */
async function loadUser() {
  let raw = localStorage.getItem('aqua_user');
  const token = localStorage.getItem('aqua_token');
  if (!raw && token) {
    try {
      const user = await UserAPI.getProfile();
      localStorage.setItem('aqua_user', JSON.stringify(user));
      raw = JSON.stringify(user);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  }
  if (!raw) return;
  try {
    const user = JSON.parse(raw);
    const el = document.getElementById('user-name');
    if (el) el.textContent = user.first_name || 'Account';
  } catch {}
}

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

/* ── TOAST ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── PERSISTENT TOAST (across reload) ── */
function showPersistentToast(msg) {
  sessionStorage.setItem('aqua_pending_toast', msg);
  window.location.reload();
}

function checkPendingToast() {
  const msg = sessionStorage.getItem('aqua_pending_toast');
  if (msg) {
    showToast(msg);
    sessionStorage.removeItem('aqua_pending_toast');
  }
}

/* ── ADD TO CART ── */
function addToCart(id, name, price, img) {
  let cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  localStorage.setItem('aqua_cart', JSON.stringify(cart));
  updateCounts();
  showToast('🛒 Added to cart!');
}

/* ── ADD TO WISHLIST (TOGGLE) ── */
function addToWishlist(id, name, price, img, btn) {
  let wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const index = wish.findIndex(i => i.id === id);
  const svg = btn ? btn.querySelector('svg') : null;

  if (index > -1) {
    if (window.innerWidth <= 768) {
      window.location.href = 'wishlist.html';
      return;
    }
    wish.splice(index, 1);
    if (svg) {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
    }
    localStorage.setItem('aqua_wishlist', JSON.stringify(wish));
    updateCounts();
    showPersistentToast('💔 Removed from wishlist');
  } else {
    wish.push({ id, name, price, img });
    if (svg) {
      svg.setAttribute('fill', '#FF5A5F');
      svg.setAttribute('stroke', '#FF5A5F');
    }
    localStorage.setItem('aqua_wishlist', JSON.stringify(wish));
    updateCounts();
    showPersistentToast('❤️ Added to wishlist!');
  }
}

/* ── INIT WISHLIST UI ── */
function initWishlistUI() {
  const wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const wishIds = wish.map(i => i.id);
  document.querySelectorAll('.action-btn[data-id]').forEach(btn => {
    if (wishIds.includes(btn.getAttribute('data-id'))) {
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', '#FF5A5F');
        svg.setAttribute('stroke', '#FF5A5F');
      }
    }
  });
}

/* ── NEWSLETTER ── */
function subscribeNewsletter() {
  const input = document.getElementById('newsletter-email');
  const val = input.value.trim().toLowerCase();

  if (!val) {
    showToast('⚠️ Please enter an email address');
    return;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    showToast('⚠️ Enter a valid email');
    return;
  }

  let subscribers = JSON.parse(localStorage.getItem('aqua_subscribers') || '[]');
  
  if (subscribers.includes(val)) {
    showPersistentToast('⚠️ Already subscribed, use another mail');
    return;
  }

  subscribers.push(val);
  localStorage.setItem('aqua_subscribers', JSON.stringify(subscribers));
  
  input.value = '';
  showPersistentToast('✅ Subscribed successfully!');
}

/* ── LOGOUT ── */
function logout() {
  localStorage.removeItem('aqua_token');
  localStorage.removeItem('aqua_user');
  window.location.href = 'login.html';
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  links.classList.toggle('mobile-active');
  btn.classList.toggle('active');
}

/* ── HERO SLIDER ── */
let currentSlide = 0;
let sliderInterval;

function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  function showSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  window.goToSlide = function(n) {
    clearInterval(sliderInterval);
    showSlide(n);
    startAutoSlide();
  };

  function startAutoSlide() {
    sliderInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 3000);
  }

  startAutoSlide();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadUser();
  initNavbar();
  updateCounts();
  initWishlistUI();
  initHeroSlider();
  checkPendingToast();
});