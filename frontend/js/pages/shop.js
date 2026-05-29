/* ═══════════════════════════════════════
   shop.js — AquaShop Shop Page Logic
   ═══════════════════════════════════════ */

/* ── AUTH GUARD ── */
(function () {
  const token = localStorage.getItem('aqua_token');
  if (!token) window.location.href = '../pages/login.html';
})();

/* ══════════════════════════════
   DEFAULT PRODUCTS
   (Fallback if admin hasn't modified yet)
══════════════════════════════ */
const DEFAULT_PRODUCTS = [
  { id:'p1',  name:'Premium Wireless Headphones with Noise Cancellation', category:'audio',       price:107.00, original:149.99, discount:28, rating:4.5, reviews:234,  img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', brand:'Sony' },
  { id:'p2',  name:'Smart Watch Series 7 – Fitness & Health Tracker',     category:'wearables',  price:299.99, original:399.99, discount:25, rating:4.0, reviews:512,  img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', brand:'Apple' },
  { id:'p3',  name:'4K Ultra HD Monitor 27 Inch Professional Display',    category:'electronics',price:449.99, original:null,   discount:0,  rating:4.5, reviews:189,  img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80', brand:'Dell' },
  { id:'p4',  name:'Smartphone Pro Max 256GB Latest Model',                category:'mobile',     price:999.99, original:1199.99,discount:17, rating:4.0, reviews:823,  img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', brand:'Apple', outOfStock: true },
  { id:'p5',  name:'Bluetooth Speaker Portable Waterproof',               category:'audio',       price:79.99,  original:null,   discount:0,  rating:4.0, reviews:145,  img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80', brand:'Bose', outOfStock: true },
  { id:'p6',  name:'Mechanical Gaming Keyboard RGB Backlit',              category:'electronics', price:129.99, original:159.99, discount:19, rating:4.0, reviews:298,  img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80', brand:'LG' },
  { id:'p7',  name:'Wireless Mouse Ergonomic Design',                     category:'electronics', price:49.99,  original:null,   discount:0,  rating:3.5, reviews:176,  img:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80', brand:'LG' },
  { id:'p8',  name:'USB-C Hub Multiport Adapter',                        category:'accessories', price:39.99,  original:null,   discount:0,  rating:4.0, reviews:89,   img:'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&q=80', brand:'Samsung' },
  { id:'p9',  name:'True Wireless Earbuds ANC Pro',                      category:'audio',       price:79.99,  original:99.99,  discount:20, rating:4.5, reviews:308,  img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', brand:'Sony' },
  { id:'p10', name:'Laptop Stand Adjustable Aluminium',                  category:'accessories', price:34.99,  original:44.99,  discount:22, rating:4.0, reviews:211,  img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&q=80', brand:'Dell' },
  { id:'p11', name:'Samsung Galaxy Tab S9 Ultra 14.6"',                  category:'electronics', price:899.99, original:1099.99,discount:18, rating:4.5, reviews:542,  img:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80', brand:'Samsung' },
  { id:'p12', name:'Fitness Smart Band Activity Tracker',                category:'wearables',   price:59.99,  original:79.99,  discount:25, rating:3.5, reviews:421,  img:'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80', brand:'Apple' },
];

/* ── Load from localStorage (admin-synced) ── */
function loadProductCatalog() {
  const stored = localStorage.getItem('aqua_products');
  if (stored) {
    try {
      let parsed = JSON.parse(stored);
      let updated = false;
      parsed = parsed.map(p => {
        if (p.id === 'p1' && p.price === 149.99) {
          p.price = 107.00;
          p.original = 149.99;
          p.discount = 28;
          updated = true;
        }
        return p;
      });
      if (updated) {
        localStorage.setItem('aqua_products', JSON.stringify(parsed));
      }
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch(e) {}
  }
  // Seed localStorage with defaults on first visit
  localStorage.setItem('aqua_products', JSON.stringify(DEFAULT_PRODUCTS));
  return [...DEFAULT_PRODUCTS];
}

/* Live product list — admin changes reflect here on reload */
let ALL_PRODUCTS = loadProductCatalog();

/* ══════════════════════════════
   STATE
══════════════════════════════ */
const ITEMS_PER_PAGE = 8;
let state = {
  products:   [...ALL_PRODUCTS],
  filtered:   [...ALL_PRODUCTS],
  page:       1,
  sort:       'featured',
  maxPrice:   1500,
  categories: [],
  brands:     [],
  minRating:  0,
};

/* ══════════════════════════════
   RENDER PRODUCTS
══════════════════════════════ */
function renderProducts() {
  const grid   = document.getElementById('products-grid');
  const start  = (state.page - 1) * ITEMS_PER_PAGE;
  const paged  = state.filtered.slice(start, start + ITEMS_PER_PAGE);

  document.getElementById('result-count').textContent = state.filtered.length;

  if (paged.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>`;
    renderPagination();
    return;
  }

  const wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const wishIds = wish.map(w => w.id);

  grid.innerHTML = paged.map(p => `
    <div class="product-card" onclick="goToProduct('${p.id}')">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy"/>
        ${p.discount ? `<span class="badge-off">${p.discount}% OFF</span>` : ''}
        <button class="wish-btn ${wishIds.includes(p.id) ? 'active' : ''}"
          onclick="event.stopPropagation(); toggleWishlist('${p.id}')"
          id="wb-${p.id}" title="Wishlist">
          <svg viewBox="0 0 24 24" fill="${wishIds.includes(p.id) ? '#FF5A5F' : 'none'}" stroke="${wishIds.includes(p.id) ? '#FF5A5F' : 'currentColor'}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="stars">${renderStars(p.rating)} <span class="r-count">(${p.reviews})</span></div>
        <div class="price-row">
          <span class="price-now">$${p.price.toFixed(2)}</span>
          ${p.original ? `<span class="price-old">$${p.original.toFixed(2)}</span>` : ''}
          ${p.outOfStock ? `<span style="color: red; font-size: 0.85rem; font-weight: bold; margin-left: auto;">Out of Stock</span>` : ''}
        </div>
        <button class="btn-cart" onclick="event.stopPropagation(); addToCart('${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  `).join('');

  renderPagination();
}

/* ── STARS ── */
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += `<svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
    } else if (i - 0.5 <= rating) {
      html += `<svg viewBox="0 0 24 24" style="fill:url(#halfG)"><defs><linearGradient id="halfG"><stop offset="50%" stop-color="#FFC107"/><stop offset="50%" stop-color="#DDD"/></linearGradient></defs><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
    } else {
      html += `<svg class="empty" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
    }
  }
  return html;
}

/* ══════════════════════════════
   PAGINATION
══════════════════════════════ */
function renderPagination() {
  const total  = Math.ceil(state.filtered.length / ITEMS_PER_PAGE);
  const wrap   = document.getElementById('pagination');
  if (total <= 1) { wrap.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="changePage(${state.page - 1})" ${state.page === 1 ? 'disabled' : ''}>Previous</button>`;
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === state.page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="changePage(${state.page + 1})" ${state.page === total ? 'disabled' : ''}>Next</button>`;
  wrap.innerHTML = html;
}

function changePage(p) {
  const total = Math.ceil(state.filtered.length / ITEMS_PER_PAGE);
  if (p < 1 || p > total) return;
  state.page = p;
  renderProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════
   FILTER & SORT
══════════════════════════════ */
function applyFilters() {
  let result = [...ALL_PRODUCTS];

  // categories
  if (state.categories.length > 0) {
    result = result.filter(p => state.categories.includes(p.category));
  }
  // price
  result = result.filter(p => p.price <= state.maxPrice);
  // brands
  if (state.brands.length > 0) {
    result = result.filter(p => state.brands.includes(p.brand));
  }
  // rating
  if (state.minRating > 0) {
    result = result.filter(p => p.rating >= state.minRating);
  }

  // sort
  switch (state.sort) {
    case 'price-low':  result.sort((a,b) => a.price - b.price); break;
    case 'price-high': result.sort((a,b) => b.price - a.price); break;
    case 'rating':     result.sort((a,b) => b.rating - a.rating); break;
    case 'newest':     result.reverse(); break;
    default: break; // featured — keep original order
  }

  state.filtered = result;
  state.page     = 1;
  renderProducts();
}

/* filter handlers */
function onCategoryChange(el, cat) {
  const allCheck = document.getElementById('cat-all');
  if (cat === 'all') {
    state.categories = [];
    document.querySelectorAll('.cat-check').forEach(c => c.checked = false);
    allCheck.checked = true;
  } else {
    allCheck.checked = false;
    if (el.checked) {
      state.categories.push(cat);
    } else {
      state.categories = state.categories.filter(c => c !== cat);
    }
    if (state.categories.length === 0) allCheck.checked = true;
  }
}

function onPriceChange(val) {
  state.maxPrice = parseFloat(val);
  document.getElementById('price-max-label').textContent = '$' + parseFloat(val).toLocaleString();
}

function onBrandChange(el, brand) {
  if (el.checked) { state.brands.push(brand); }
  else { state.brands = state.brands.filter(b => b !== brand); }
}

function onRatingChange(el, rating) {
  state.minRating = el.checked ? parseFloat(rating) : 0;
  document.querySelectorAll('.rating-check').forEach(c => {
    if (c !== el) c.checked = false;
  });
}

function onSortChange(val) {
  state.sort = val;
  applyFilters();
}

function resetFilters() {
  state.categories = []; state.brands = []; state.minRating = 0; state.maxPrice = 1500;
  document.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
  document.getElementById('cat-all').checked = true;
  document.getElementById('price-slider').value = 1500;
  document.getElementById('price-max-label').textContent = '$1500';
  state.sort = 'featured';
  document.getElementById('sort-select').value = 'featured';
  
  // Reset Custom Sort Dropdown UI
  const sortDropdown = document.getElementById('sort-dropdown');
  if (sortDropdown) {
    const selectedText = sortDropdown.querySelector('.selected-text');
    if (selectedText) selectedText.textContent = 'Sort by: Featured';
    const options = sortDropdown.querySelectorAll('.dropdown-option');
    options.forEach(o => {
      if (o.getAttribute('data-value') === 'featured') o.classList.add('selected');
      else o.classList.remove('selected');
    });
  }
  
  applyFilters();
}

/* search */
function onSearch(val) {
  const q = val.trim().toLowerCase();
  if (!q) {
    state.filtered = [...ALL_PRODUCTS];
  } else {
    state.filtered = ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  }
  state.page = 1;
  document.getElementById('result-count').textContent = state.filtered.length;
  renderProducts();
}

/* ══════════════════════════════
   CART & WISHLIST
══════════════════════════════ */
function addToCart(id) {
  const product = ALL_PRODUCTS.find(p => p.id === id);
  if (!product) return;
  let cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const ex = cart.find(i => i.id === id);
  if (ex) ex.qty += 1;
  else cart.push({ id, name: product.name, price: product.price, img: product.img, qty: 1 });
  localStorage.setItem('aqua_cart', JSON.stringify(cart));
  updateBadges();
  showToast('🛒 Added to cart!');
}

function toggleWishlist(id) {
  const product = ALL_PRODUCTS.find(p => p.id === id);
  if (!product) return;
  let wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const idx = wish.findIndex(w => w.id === id);
  const btn = document.getElementById('wb-' + id);

  if (idx > -1) {
    if (window.innerWidth <= 768) {
      window.location.href = 'wishlist.html';
      return;
    }
    wish.splice(idx, 1);
    if (btn) {
      btn.classList.remove('active');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
    showToast('💔 Removed from wishlist');
  } else {
    wish.push({ id, name: product.name, price: product.price, img: product.img });
    if (btn) {
      btn.classList.add('active');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', '#FF5A5F');
        svg.setAttribute('stroke', '#FF5A5F');
      }
    }
    showToast('❤️ Added to wishlist!');
  }
  localStorage.setItem('aqua_wishlist', JSON.stringify(wish));
  updateBadges();
}

function goToProduct(id) {
  window.location.href = `product-details.html?id=${id}`;
}

function updateBadges() {
  const cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const cb = document.getElementById('cart-count');
  const wb = document.getElementById('wish-count');
  if (cb) cb.textContent = cart.reduce((s,i) => s + i.qty, 0);
  if (wb) wb.textContent = wish.length;
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
   NAVBAR
══════════════════════════════ */
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

/* ── CUSTOM SORT DROPDOWN ── */
function initCustomSortDropdown() {
  const dropdown = document.getElementById('sort-dropdown');
  if (!dropdown) return;
  const selected = dropdown.querySelector('.dropdown-selected');
  const options = dropdown.querySelectorAll('.dropdown-option');
  const nativeSelect = document.getElementById('sort-select');
  const selectedText = dropdown.querySelector('.selected-text');

  selected.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });

  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.getAttribute('data-value');
      const text = opt.textContent.trim();
      
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedText.textContent = text;
      
      nativeSelect.value = val;
      nativeSelect.dispatchEvent(new Event('change'));
      
      dropdown.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

/* ══════════════════════════════
   URL PARAMS (category filter from home page)
══════════════════════════════ */
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cat    = params.get('cat');
  const sale   = params.get('sale');
  const q      = params.get('search');

  if (cat) {
    const el = document.querySelector(`.cat-check[data-cat="${cat}"]`);
    if (el) { el.checked = true; state.categories = [cat]; document.getElementById('cat-all').checked = false; }
    else { state.categories = [cat]; } // dynamic category from admin
  }
  if (sale === 'true') {
    state.filtered = ALL_PRODUCTS.filter(p => p.discount > 0);
  }
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateBadges();
  handleUrlParams();
  initCustomSortDropdown();
  renderProducts();
});

window.resetSessionData = function() {
  if (confirm('Are you sure you want to reset all session data? This will clear your cart, active orders, and wishlist.')) {
    localStorage.removeItem('aqua_cart');
    localStorage.removeItem('aqua_orders');
    localStorage.removeItem('last_order_id');
    localStorage.removeItem('aqua_wishlist');
    alert('Session data cleared successfully!');
    window.location.reload();
  }
};