/* ══════════════════════════════
   PRODUCT DETAILS LOGIC
══════════════════════════════ */

// ── PRODUCT DATABASE ──
const ALL_PRODUCTS = [
  { id:'p1', name:'Premium Wireless Headphones with Noise Cancellation', category:'audio',       price:149.99, original:199.99, discount:25, rating:4.5, reviews:234,  img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', brand:'Sony' },
  { id:'p2', name:'Smart Watch Series 7 – Fitness & Health Tracker',     category:'wearables',  price:299.99, original:399.99, discount:25, rating:4.0, reviews:512,  img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', brand:'Apple' },
  { id:'p3', name:'4K Ultra HD Monitor 27-Inch Professional Display',    category:'electronics',price:449.99, original:549.99, discount:18, rating:4.7, reviews:189,  img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80', brand:'Dell' },
  { id:'p4', name:'Smartphone Pro Max – 256GB Storage Dual Camera',      category:'mobile',     price:999.99, original:1099.99,discount:9,  rating:4.8, reviews:728,  img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', brand:'Apple', outOfStock: true },
  { id:'p5', name:'Bluetooth Speaker – Portable & Waterproof Audio',      category:'audio',       price:79.99,  original:99.99,  discount:20, rating:4.3, reviews:145,  img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80', brand:'Bose', outOfStock: true },
  { id:'p6', name:'Mechanical Gaming Keyboard – RGB Backlit Switches',  category:'accessories',price:129.99, original:159.99, discount:19, rating:4.6, reviews:298,  img:'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', brand:'Dell' }
];

const PRODUCT_DETAILS_MAP = {
  'p1': {
    description: 'Experience premium audio quality with advanced active noise cancellation technology. These wireless headphones feature superior sound clarity, comfortable over-ear design, and up to 30 hours of battery life. Perfect for music lovers, professionals, and travelers seeking the ultimate listening experience.',
    features: [
      'Active Noise Cancellation Technology',
      '30-Hour Battery Life',
      'Premium Sound Quality',
      'Comfortable Over-Ear Design',
      'Bluetooth 5.0 Connectivity',
      'Built-in Microphone for Calls'
    ],
    specs: {
      'Brand': 'PremiumAudio',
      'Model': 'PA-WH100',
      'Color': 'Matte Black',
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 Hours',
      'Charging Time': '2 Hours',
      'Weight': '250g',
      'Warranty': '2 Years'
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80'
    ]
  },
  'p2': {
    description: 'Stay connected and track your fitness in style with the Smart Watch Series 7. Featuring a larger, always-on Retina display, advanced health indicators like blood oxygen and heart rate tracking, and seamless integration with your phone, this watch is your ultimate wellness partner.',
    features: [
      'Always-On Retina Display',
      'Blood Oxygen & Heart Rate Monitors',
      'Sleek & Durable Water-Resistant Design',
      'Up to 18 Hours of Battery Life',
      'Fast Charging Technology',
      'Dozens of Workout Tracking Modes'
    ],
    specs: {
      'Brand': 'Apple',
      'Model': 'Series 7 H1',
      'Color': 'Midnight Black',
      'Connectivity': 'Bluetooth & Wi-Fi',
      'Battery Life': '18 Hours',
      'Charging Time': '1 Hour',
      'Weight': '38.8g',
      'Warranty': '2 Years'
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'
    ]
  },
  'p3': {
    description: 'Bring stunning detail and vibrant colors to your workspace with this 27-inch professional 4K Ultra HD monitor. Boasting a sleek, near-borderless screen, customizable height adjustment, and multiple input options, it is designed to maximize both productivity and visual entertainment.',
    features: [
      'Stunning 4K Ultra HD Resolution (3840x2160)',
      'IPS Panel for Wide 178° Viewing Angles',
      '99% sRGB Color Gamut for Professional Editing',
      'Ultra-Thin Bezel & Height-Adjustable Stand',
      'HDMI, DisplayPort & USB-C Connectivity',
      'TUV Certified Eye Comfort Filters'
    ],
    specs: {
      'Brand': 'Dell',
      'Model': 'U2720Q Professional',
      'Color': 'Platinum Silver',
      'Connectivity': 'USB-C, HDMI, DP',
      'Screen Size': '27 Inches',
      'Refresh Rate': '60Hz',
      'Weight': '4.1kg',
      'Warranty': '3 Years'
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
      'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80',
      'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=800&q=80'
    ]
  },
  'p4': {
    description: 'Elevate your smartphone experience with the Smartphone Pro Max. Built with a robust titanium frame, super-fast modern chip, an advanced dual-lens camera system designed for stunning night photography, and all-day battery life that keeps up with your busiest schedules.',
    features: [
      'Advanced 48MP Dual Camera System',
      'Vibrant 6.7" Super Retina XDR Screen',
      'Robust Titanium & Ceramic Shield Body',
      'Next-Gen High-Efficiency Processor',
      'Generous 256GB Internal Storage',
      'Outstanding All-Day Battery Endurance'
    ],
    specs: {
      'Brand': 'Apple',
      'Model': 'Pro Max 15',
      'Color': 'Titanium Gray',
      'Connectivity': '5G, Wi-Fi 6E',
      'Battery Life': 'Up to 29 hrs video',
      'Charging Time': '1.5 Hours',
      'Weight': '221g',
      'Warranty': '2 Years'
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
      'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=800&q=80'
    ]
  },
  'p5': {
    description: 'Take deep, powerful bass wherever your adventures lead with this waterproof portable Bluetooth speaker. With its rugged IP67 rating, massive battery life, and crystal-clear stereo sound projection, this compact speaker is the ultimate travel companion for beach trips, campouts, and home parties.',
    features: [
      'Powerful 360-Degree Deep Bass Sound',
      'IP67 Rated 100% Waterproof & Dustproof',
      'Up to 24 Hours of Continuous Playback',
      'Compact & Extremely Durable Travel Loop',
      'Advanced Bluetooth 5.2 Wireless Link',
      'Pair Multiple Speakers for True Stereo'
    ],
    specs: {
      'Brand': 'Bose',
      'Model': 'SoundLink Micro II',
      'Color': 'Carbon Black',
      'Connectivity': 'Bluetooth 5.2',
      'Battery Life': '24 Hours',
      'Charging Time': '3 Hours',
      'Weight': '290g',
      'Warranty': '2 Years'
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80',
      'https://images.unsplash.com/photo-1512446816042-444d641267d4?w=800&q=80'
    ]
  },
  'p6': {
    description: 'Unleash your full typing speed and gaming prowess with this ultra-responsive mechanical gaming keyboard. Featuring customizable dynamic RGB backlighting, durable responsive linear tactile switches, and solid aircraft-grade aluminum alloy build quality, it is built to survive millions of intense keypresses.',
    features: [
      'Dynamic RGB Backlighting with 16.8M Colors',
      'Premium Linear Tactile Switches (Hot-Swappable)',
      'Solid Aircraft-Grade Aluminum Top Case',
      'Full Anti-Ghosting & N-Key Rollover',
      'Ergonomic Magnetic Soft-Touch Wrist Rest',
      'Dedicated Multimedia Scroll Wheels'
    ],
    specs: {
      'Brand': 'Dell',
      'Model': 'Alienware Tactile K1',
      'Color': 'Dark Side of Moon',
      'Connectivity': 'Wired USB-C',
      'Key Switches': 'Linear Tactile',
      'Backlight': 'Per-Key RGB',
      'Weight': '980g',
      'Warranty': '3 Years'
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
      'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80'
    ]
  }
};

// Global productId loaded dynamically from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get('id') || 'p1';

// Dynamic Page Setup
function initProductDetailsPage() {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const productDetails = PRODUCT_DETAILS_MAP[productId];
  if (!productDetails) return;

  // 1. Breadcrumbs
  const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = product.name;
  }

  // 2. Main Image
  const mainImg = document.getElementById('main-product-img');
  if (mainImg) {
    mainImg.src = product.img;
    mainImg.alt = product.name;
  }

  // 3. Thumbnails
  const thumbnailList = document.querySelector('.thumbnail-list');
  if (thumbnailList && productDetails.thumbnails) {
    thumbnailList.innerHTML = productDetails.thumbnails.map((t, idx) => `
      <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="changeMainImage(this, '${t}')">
        <img src="${t}" alt="Thumb ${idx + 1}"/>
      </div>
    `).join('');
  }

  // 4. Product Title
  const titleEl = document.querySelector('.product-title');
  if (titleEl) {
    titleEl.textContent = product.name;
  }

  // 5. Product Rating Counts
  const reviewCountEl = document.querySelector('.review-count');
  if (reviewCountEl) {
    reviewCountEl.textContent = `(${product.reviews} reviews)`;
  }

  // 6. Prices
  const priceNowEl = document.querySelector('.price-now');
  const priceOldEl = document.querySelector('.price-old');
  const discountBadge = document.querySelector('.badge-discount');

  if (priceNowEl) priceNowEl.textContent = `$${product.price.toFixed(2)}`;
  if (priceOldEl) {
    if (product.original) {
      priceOldEl.textContent = `$${product.original.toFixed(2)}`;
      priceOldEl.style.display = 'inline';
    } else {
      priceOldEl.style.display = 'none';
    }
  }
  if (discountBadge) {
    if (product.discount) {
      discountBadge.textContent = `${product.discount}% OFF`;
      discountBadge.style.display = 'inline-block';
    } else {
      discountBadge.style.display = 'none';
    }
  }

  // 7. Description
  const descEl = document.querySelector('.product-description-block p');
  if (descEl) {
    descEl.textContent = productDetails.description;
  }

  // 8. Key Features
  const featuresContainer = document.querySelector('.product-features ul');
  if (featuresContainer && productDetails.features) {
    featuresContainer.innerHTML = productDetails.features.map(f => `<li>${f}</li>`).join('');
  }

  // 9. Specifications Table
  const specTableBody = document.querySelector('.spec-table tbody');
  if (specTableBody && productDetails.specs) {
    const specKeys = Object.keys(productDetails.specs);
    let tableHtml = '';
    for (let i = 0; i < specKeys.length; i += 2) {
      const key1 = specKeys[i];
      const val1 = productDetails.specs[key1];
      const key2 = specKeys[i + 1] || '';
      const val2 = key2 ? productDetails.specs[key2] : '';
      
      tableHtml += `
        <tr>
          <td>${key1}</td>
          <th>${val1}</th>
          ${key2 ? `<td>${key2}</td><th>${val2}</th>` : '<td></td><th></th>'}
        </tr>
      `;
    }
    specTableBody.innerHTML = tableHtml;
  }

  // 10. Update large wishlist button data attribute
  const wishlistBtnLarge = document.querySelector('.btn-wishlist-large');
  if (wishlistBtnLarge) {
    wishlistBtnLarge.setAttribute('data-id', productId);
  }

  // 11. Handle Out of Stock
  if (product.outOfStock) {
    const stockBadge = document.querySelector('.stock-badge');
    if (stockBadge) {
      stockBadge.innerHTML = `<div class="stock-dot" style="background: red;"></div> <span style="color: red; font-weight: bold;">Out of Stock</span>`;
    }
    const buyNowBtn = document.querySelector('.btn-buy-now');
    if (buyNowBtn) {
      buyNowBtn.disabled = true;
      buyNowBtn.style.opacity = '0.5';
      buyNowBtn.style.cursor = 'not-allowed';
      buyNowBtn.textContent = 'Out of Stock';
      buyNowBtn.onclick = function(e) { e.preventDefault(); return false; };
    }
  }
}

// Change Main Image based on thumbnail click
function changeMainImage(element, newSrc) {
  const mainImg = document.getElementById('main-product-img');
  if (mainImg) mainImg.src = newSrc;

  const thumbnails = document.querySelectorAll('.thumb-item');
  thumbnails.forEach(thumb => {
    thumb.classList.remove('active');
  });

  element.classList.add('active');
}

// Quantity Selector
function incrementQty() {
  const qtyInput = document.getElementById('qty-input');
  if (!qtyInput) return;
  let currentVal = parseInt(qtyInput.value);
  if (!isNaN(currentVal)) {
    qtyInput.value = currentVal + 1;
  }
}

// Quantity Selector
function decrementQty() {
  const qtyInput = document.getElementById('qty-input');
  if (!qtyInput) return;
  let currentVal = parseInt(qtyInput.value);
  if (!isNaN(currentVal) && currentVal > 1) {
    qtyInput.value = currentVal - 1;
  }
}

/* ── CART & WISHLIST COUNTS ── */
function updateCounts() {
  const cart     = JSON.parse(localStorage.getItem('aqua_cart')     || '[]');
  const wishlist = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const cartBadge = document.getElementById('cart-count');
  const wishBadge = document.getElementById('wish-count');
  if (cartBadge) cartBadge.textContent = cart.reduce((s, i) => s + i.qty, 0);
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

/* ── ADD TO CART ── */
function addToCart(id, name, price, img, qty = 1) {
  let cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, img, qty });
  }
  localStorage.setItem('aqua_cart', JSON.stringify(cart));
  updateCounts();
  showToast('🛒 Added to cart!');
}

/* ── ADD TO WISHLIST (TOGGLE) ── */
function toggleWishlist(id, name, price, img, btn) {
  let wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const index = wish.findIndex(i => i.id === id);
  if (index > -1) {
    if (window.innerWidth <= 768) {
      window.location.href = 'wishlist.html';
      return;
    }
    wish.splice(index, 1);
    localStorage.setItem('aqua_wishlist', JSON.stringify(wish));
    updateCounts();
    showToast('💔 Removed from wishlist');
    if (btn) btn.classList.remove('active');
  } else {
    wish.push({ id, name, price, img });
    localStorage.setItem('aqua_wishlist', JSON.stringify(wish));
    updateCounts();
    showToast('❤️ Added to wishlist!');
    if (btn) btn.classList.add('active');
  }
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  if (links) links.classList.toggle('mobile-active');
  if (btn) btn.classList.toggle('active');
}

// Add to Cart from Details Page
function addToCartDetailed() {
  const qty = parseInt(document.getElementById('qty-input').value) || 1;
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  addToCart(product.id, product.name, product.price, product.img, qty);
}

function addToWishlistDetailed(btn) {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  toggleWishlist(product.id, product.name, product.price, product.img, btn);
}

function buyNowDetailed() {
  const qtyInput = document.getElementById('qty-input');
  const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  // Overwrite the cart item's quantity to exactly the selected 'qty' to prevent double-quantity bug
  let cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty = qty; 
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: qty });
  }
  localStorage.setItem('aqua_cart', JSON.stringify(cart));
  
  window.location.href = 'checkout.html';
}

function initWishlistButtons() {
  let wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const ids = wish.map(i => i.id);
  
  document.querySelectorAll('[data-id]').forEach(btn => {
    if (ids.includes(btn.getAttribute('data-id'))) {
      btn.classList.add('active');
    }
  });
}

/* ── REVIEW LOGIC ── */
function openReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.add('active');
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.remove('active');
}

// Close modal when clicking outside the content
window.addEventListener('click', (e) => {
  const modal = document.getElementById('review-modal');
  if (e.target === modal) {
    closeReviewModal();
  }
});

async function renderReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  let reviews = [];
  
  // 1. Try to fetch from backend
  try {
    const data = await ReviewAPI.get(productId);
    if (data && Array.isArray(data.reviews)) {
      reviews = data.reviews;
      // Sync to localStorage
      localStorage.setItem(`aqua_reviews_${productId}`, JSON.stringify(reviews));
    }
  } catch (err) {
    console.warn("Backend API unavailable, falling back to localStorage reviews:", err);
    try {
      reviews = JSON.parse(localStorage.getItem(`aqua_reviews_${productId}`)) || [];
    } catch(e) {
      reviews = [];
    }
  }

  // Clean up old cached reviews if they exist
  if (reviews && Array.isArray(reviews)) {
    const originalLength = reviews.length;
    reviews = reviews.filter(r => r.name !== "John Doe" && r.name !== "Jane Smith");
    if (reviews.length !== originalLength) {
      localStorage.setItem(`aqua_reviews_${productId}`, JSON.stringify(reviews));
    }
  }

  // Fallback to default reviewer if empty
  if (reviews.length === 0) {
    const product = ALL_PRODUCTS.find(p => p.id === productId);
    const prodName = product ? product.name : 'product';
    reviews = [
      { name: "Mike Johnson", date: "April 25, 2026", rating: 5, text: `Best ${prodName} I've ever owned! Worth every penny. Highly recommended!`, avatarBg: "#00BFCF" }
    ];
    localStorage.setItem(`aqua_reviews_${productId}`, JSON.stringify(reviews));
  }

  container.innerHTML = '';
  reviews.forEach(rev => {
    let starsHtml = '';
    for(let i=0; i<5; i++) {
      if (i < rev.rating) {
        starsHtml += '<svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>';
      } else {
        starsHtml += '<svg class="empty" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>';
      }
    }

    const html = `
      <div class="review-item">
        <div class="review-avatar" style="background: ${rev.avatarBg}">${rev.name.charAt(0).toUpperCase()}</div>
        <div class="review-content">
          <div class="review-meta">
            <strong>${rev.name}</strong>
            <span class="review-date">${rev.date}</span>
          </div>
          <div class="review-stars">
            ${starsHtml}
          </div>
          <p class="review-text" title="${rev.text.replace(/"/g, '&quot;')}">${rev.text}</p>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

async function submitReview() {
  const nameInput = document.getElementById('review-name');
  const ratingInput = document.getElementById('review-rating');
  const textInput = document.getElementById('review-text-input');

  const name = nameInput.value.trim() || 'Anonymous';
  const rating = parseInt(ratingInput.value) || 5;
  const text = textInput.value.trim();

  if (!text) {
    showToast('⚠️ Please write a comment');
    return;
  }

  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const newReview = { name, date, rating, text, avatarBg: "var(--aqua-dark)" };

  // 1. Try to post to backend
  try {
    await ReviewAPI.add(productId, newReview);
  } catch (err) {
    console.warn("Backend API unavailable for posting review, saving only to localStorage:", err);
  }

  // 2. Sync to local storage
  let reviews = [];
  try {
    reviews = JSON.parse(localStorage.getItem(`aqua_reviews_${productId}`)) || [];
  } catch(e) {}
  
  if (!Array.isArray(reviews)) reviews = [];
  reviews.unshift(newReview);
  localStorage.setItem(`aqua_reviews_${productId}`, JSON.stringify(reviews));

  nameInput.value = '';
  ratingInput.value = '5';
  textInput.value = '';
  closeReviewModal();
  showToast('✅ Review submitted!');

  await renderReviews();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initProductDetailsPage();
  updateCounts();
  initWishlistButtons();
  renderReviews();
});
