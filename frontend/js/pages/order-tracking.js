/* ═══════════════════════════════════════
   order-tracking.js — AquaShop Order Tracker
   ═══════════════════════════════════════ */

function isAdminEmail(email) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail === '24ucs046@gmail.com' || cleanEmail === '24ucs046@gamil.com';
}

/* ── Update nav badges from localStorage ── */
function updateBadges() {
  const cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const cartEl = document.getElementById('cart-count');
  const wishEl = document.getElementById('wish-count');
  if (cartEl) cartEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (wishEl) wishEl.textContent = wish.length;
}

/* ── Navbar scroll shadow ── */
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  if (links) links.classList.toggle('mobile-active');
  if (btn) btn.classList.toggle('active');
}

/* ── Animate timeline steps on scroll ── */
function initTimelineAnimation() {
  const steps = document.querySelectorAll('.step');
  if (!steps.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  steps.forEach((step, i) => {
    step.style.transitionDelay = `${i * 0.1}s`;
    observer.observe(step);
  });
}

/* ── Load order data from API ── */
async function loadOrderData() {
  let order = null;
  let orderId = null;

  const urlParams = new URLSearchParams(window.location.search);
  const rawParam = urlParams.get('orderId');

  if (rawParam) {
    orderId = decodeURIComponent(rawParam);
  } else {
    const lastId = localStorage.getItem('last_order_id');
    if (lastId) {
      orderId = lastId;
      localStorage.removeItem('last_order_id');
    }
  }

  // Fetch all orders for the current user
  let userOrders = [];
  try {
    const res = await OrderAPI.getAll();
    userOrders = res.orders || [];
  } catch (err) {
    console.error("Failed to load user orders list:", err);
  }

  if (orderId) {
    const cleanId = orderId.trim();
    order = userOrders.find(o =>
      o.id === cleanId ||
      o.id === '#' + cleanId ||
      o.id === cleanId.replace(/^#/, '')
    );

    if (!order) {
      try {
        order = await OrderAPI.getById(orderId);
      } catch (err) {
        console.error("Failed to fetch specific order by ID:", err);
      }
    }
  } else if (userOrders.length > 0) {
    order = userOrders[0];
  }

  if (!order) {
    console.log("No orders found. Setting default mockup dates to today and today + 7 days.");
    
    // Placed Date (Today)
    const baseDate = new Date();
    const todayShort = baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const orderDateEl = document.getElementById('track-order-date');
    if (orderDateEl) {
      orderDateEl.textContent = todayShort;
    }

    const formatDateWithTime = (date, timeStr) => {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${dateStr} &ndash; ${timeStr}`;
    };

    const placedDateEl = document.getElementById('track-step-placed');
    if (placedDateEl) {
      placedDateEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDateWithTime(baseDate, '10:30 AM')}
      `;
    }

    const packedDate = new Date(baseDate);
    packedDate.setDate(packedDate.getDate() + 1);
    const packedDateEl = document.getElementById('track-step-packed');
    if (packedDateEl) {
      packedDateEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDateWithTime(packedDate, '02:15 PM')}
      `;
    }

    const shippedDate = new Date(baseDate);
    shippedDate.setDate(shippedDate.getDate() + 2);
    const shippedDateEl = document.getElementById('track-step-shipped');
    if (shippedDateEl) {
      shippedDateEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDateWithTime(shippedDate, '09:45 AM')}
      `;
    }

    // Set delivery date to 7 days from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const deliveryDateString = deliveryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const estDateEl = document.getElementById('track-est-date');
    if (estDateEl) {
      estDateEl.textContent = deliveryDateString;
    }

    const timelineExpectedEl = document.getElementById('track-timeline-expected');
    if (timelineExpectedEl) {
      timelineExpectedEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Expected: ${deliveryDateString}
      `;
    }
    return;
  }

  orderId = order.id;

  // 1. Populate Order ID
  const orderIdEl = document.querySelector('.order-id');
  if (orderIdEl) {
    orderIdEl.textContent = `Order ${orderId}`;
  }

  // 2. Populate Placed Date
  const orderDateEl = document.getElementById('track-order-date');
  if (orderDateEl && order.date) {
    orderDateEl.textContent = order.date;
  }

  // 2b. Dynamic timeline steps calculation based on placement date
  const baseDate = new Date(order.date || new Date());
  const formatDateWithTime = (date, timeStr) => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${dateStr} &ndash; ${timeStr}`;
  };

  const placedDateEl = document.getElementById('track-step-placed');
  if (placedDateEl) {
    placedDateEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${formatDateWithTime(baseDate, '10:30 AM')}
    `;
  }

  const packedDate = new Date(baseDate);
  packedDate.setDate(packedDate.getDate() + 1);
  const packedDateEl = document.getElementById('track-step-packed');
  if (packedDateEl) {
    packedDateEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${formatDateWithTime(packedDate, '02:15 PM')}
    `;
  }

  const shippedDate = new Date(baseDate);
  shippedDate.setDate(shippedDate.getDate() + 2);
  const shippedDateEl = document.getElementById('track-step-shipped');
  if (shippedDateEl) {
    shippedDateEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${formatDateWithTime(shippedDate, '09:45 AM')}
    `;
  }

  // 3. Populate Status
  const statusBadgeEl = document.getElementById('track-status-badge');
  if (statusBadgeEl && order.status) {
    statusBadgeEl.textContent = order.status;
    statusBadgeEl.className = 'status-badge'; // reset
    if (order.status === 'Delivered') {
      statusBadgeEl.classList.add('success');
    } else if (order.status === 'Cancelled') {
      statusBadgeEl.classList.add('cancelled');
    }
  }

  // 3b. Update timeline steps dynamically based on order status
  const steps = document.querySelectorAll('.timeline .step');
  if (steps.length >= 5) {
    if (order.status === 'Delivered') {
      // Set all steps to completed
      steps.forEach((step, idx) => {
        step.classList.remove('pending');
        step.classList.add('completed');
        const stepStatus = step.querySelector('.step-status');
        if (stepStatus && !stepStatus.querySelector('.check-done')) {
          stepStatus.innerHTML = `
            <svg class="check-done" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11 14 15 10" />
            </svg>`;
        }
      });
      // Update delivered step time label
      const deliveredTimeEl = steps[4].querySelector('.step-time');
      if (deliveredTimeEl) {
        deliveredTimeEl.classList.remove('pending-label');
        const delDate = new Date(baseDate);
        delDate.setDate(delDate.getDate() + 5);
        deliveredTimeEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          ${formatDateWithTime(delDate, '04:30 PM')}
        `;
      }
    } else {
      // Revert step 4 and 5 to pending
      steps[3].classList.remove('completed');
      steps[3].classList.add('pending');
      const step4Status = steps[3].querySelector('.step-status');
      if (step4Status) step4Status.innerHTML = '';

      steps[4].classList.remove('completed');
      steps[4].classList.add('pending');
      const step5Status = steps[4].querySelector('.step-status');
      if (step5Status) step5Status.innerHTML = '';

      const deliveredTimeEl = steps[4].querySelector('.step-time');
      if (deliveredTimeEl) {
        deliveredTimeEl.classList.add('pending-label');
        deliveredTimeEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Pending
        `;
      }
    }
  }

  // 4. Populate Delivery Address
  if (order.address) {
    const addr = order.address;
    const nameEl = document.getElementById('track-addr-name');
    const streetEl = document.getElementById('track-addr-street');
    const cityStateZipEl = document.getElementById('track-addr-city-state-zip');
    const phoneEl = document.getElementById('track-addr-phone');

    if (nameEl) {
      nameEl.textContent = `${addr.firstName} ${addr.lastName}`;
    }
    if (streetEl) {
      streetEl.textContent = addr.street;
    }
    if (cityStateZipEl) {
      const countryMapping = {
        'US': 'United States',
        'IN': 'India',
        'UK': 'United Kingdom',
        'CA': 'Canada'
      };
      const countryFullName = countryMapping[addr.country] || addr.country || '';
      cityStateZipEl.textContent = `${addr.city}, ${addr.state} ${addr.zip}${countryFullName ? ', ' + countryFullName : ''}`;
    }
    if (phoneEl) {
      phoneEl.textContent = addr.phone;
    }
  }

  // 5. Populate Payment Method
  const paymentMethodEl = document.getElementById('track-payment-method');
  if (paymentMethodEl && order.paymentMethod) {
    const methodMapping = {
      'cod': 'Cash on Delivery',
      'stripe': 'Credit/Debit Card (Stripe)',
      'razorpay': 'Razorpay'
    };
    paymentMethodEl.textContent = methodMapping[order.paymentMethod] || order.paymentMethod;
  }

  // 5b. Calculate and populate Price Summary
  if (order.items && order.items.length > 0) {
    const subtotal = order.items.reduce((s, i) => s + parseFloat(i.price) * parseInt(i.qty), 0);
    const shipping = subtotal >= 50 ? 0 : 9.99;
    
    // Automatic Discount: $100 off if subtotal >= 300
    let discount = 0;
    if (subtotal >= 300) {
      discount = 100;
    }
    
    const total = subtotal - discount + shipping;
    
    const subtotalEl = document.getElementById('track-subtotal');
    const shippingEl = document.getElementById('track-shipping');
    const discountEl = document.getElementById('track-discount');
    const discountRow = document.getElementById('track-discount-row');
    const totalEl = document.getElementById('track-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    
    if (discount > 0) {
      if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
      if (discountRow) discountRow.style.display = 'flex';
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }
  }

  // 6. Populate Estimated Delivery Date (Recalculate dynamically to ensure 7-day offset)
  const calcDeliveryDate = new Date(baseDate);
  calcDeliveryDate.setDate(calcDeliveryDate.getDate() + 7);
  const calcDeliveryDateString = calcDeliveryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const estDateEl = document.getElementById('track-est-date');
  if (estDateEl) {
    estDateEl.textContent = calcDeliveryDateString;
  }

  // 7. Update timeline expected date if exists
  const timelineExpectedEl = document.getElementById('track-timeline-expected');
  if (timelineExpectedEl) {
    timelineExpectedEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Expected: ${calcDeliveryDateString}
    `;
  }

  // 8. Populate Products List
  const productsContainer = document.getElementById('track-products-container');
  if (productsContainer && order.items && order.items.length > 0) {
    productsContainer.innerHTML = order.items.map(item => `
      <div class="order-product">
        <div class="prod-img-wrap">
          <img src="${item.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&crop=center'}" alt="${item.name}"/>
        </div>
        <div class="prod-details">
          <h3>${item.name}</h3>
          <p class="prod-qty">Quantity: ${item.qty}</p>
          <p class="prod-price">$${(item.price * item.qty).toFixed(2)}${item.qty > 1 ? ` <span style="font-size:0.9rem; font-weight:normal; opacity:0.75;">($${item.price.toFixed(2)} each)</span>` : ''}</p>
        </div>
      </div>
    `).join('');
  }

  // 9. Check if different products share the same image, and add hover effect if so
  let hasSameImageDifferentProduct = false;
  if (order.items && order.items.length > 1) {
    const seenImages = {};
    for (const item of order.items) {
      if (item.img) {
        if (seenImages[item.img]) {
          if (seenImages[item.img].id !== item.id || seenImages[item.img].name !== item.name) {
            hasSameImageDifferentProduct = true;
            break;
          }
        } else {
          seenImages[item.img] = item;
        }
      }
    }
  }

  if (hasSameImageDifferentProduct) {
    console.log("Detected different products sharing the same image. Activating right sidebar hover effects.");
    const rightSidebar = document.querySelector('.track-right');
    if (rightSidebar) {
      rightSidebar.classList.add('special-hover-effect');
    }
  }
}

/* ── Toast helper ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── Contact Support button ── */
function initSupportBtn() {
  const btn = document.querySelector('.btn-support');
  if (!btn) return;
  btn.addEventListener('click', () => {
    showToast('📞 Connecting you to support...');
    setTimeout(() => window.location.href = 'contact.html', 1200);
  });
}

/* ══════════════════════════════
   INIT
   ══════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  updateBadges();
  initNavScroll();
  initTimelineAnimation();
  await loadOrderData();
  initSupportBtn();
});
