/* ═══════════════════════════════════════
   checkout.js — AquaShop Checkout Logic
   ═══════════════════════════════════════ */

/* ── AUTH GUARD ── */
(function () {
  if (!localStorage.getItem('aqua_token')) {
    window.location.href = 'login.html';
  }
})();



/* ══════════════════════════════
   STATE & DATA
   ══════════════════════════════ */
function getCart() {
  return JSON.parse(localStorage.getItem('aqua_cart') || '[]');
}

function updateBadges() {
  const cart = getCart();
  const wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('wish-count').textContent = wish.length;
}

/* ══════════════════════════════
   RENDER SUMMARY
   ══════════════════════════════ */
function renderSummary() {
  const cart = getCart();
  const list = document.getElementById('summary-items');
  const subtotalEl = document.getElementById('subtotal-val');
  const totalEl = document.getElementById('total-val');
  const shippingEl = document.getElementById('shipping-val');
  
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  // Render items
  list.innerHTML = cart.map(item => `
    <div class="summary-item">
      <img src="${item.img}" alt="${item.name}">
      <div class="item-info">
        <h4>${item.name}</h4>
        <p>Qty: ${item.qty}</p>
        <div class="item-price-sum">$${(item.price * item.qty).toFixed(2)}</div>
      </div>
    </div>
  `).join('');

  // Calculate totals
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  
  // Automatic Discount: $100 off if subtotal >= 300
  let discount = 0;
  if (subtotal >= 300) {
    discount = 100;
  }
  
  const total = subtotal - discount + shipping;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  shippingEl.className = shipping === 0 ? 'free-text' : '';
  
  const discRow = document.getElementById('discount-row');
  const discVal = document.getElementById('discount-val');
  
  if (discount > 0) {
    if (discRow) discRow.style.display = 'flex';
    if (discVal) discVal.textContent = `-$${discount.toFixed(2)}`;
  } else {
    if (discRow) discRow.style.display = 'none';
  }

  totalEl.textContent = `$${total.toFixed(2)}`;
}

/* ══════════════════════════════
   FORM LOGIC
   ══════════════════════════════ */
function initForm() {
  // Payment Selection UI
  const paymentCards = document.querySelectorAll('.payment-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', (e) => {
      paymentCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const radio = card.querySelector('input[type="radio"]');
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  initCustomDropdown();
  initEmailValidation();
}

function initCustomDropdown() {
  console.log("Initializing Custom Country Dropdown...");
  const dropdown = document.getElementById('country-dropdown');
  if (!dropdown) {
    console.error("Dropdown container not found!");
    return;
  }

  const selected = dropdown.querySelector('.dropdown-selected');
  const options = dropdown.querySelectorAll('.dropdown-option');
  const nativeSelect = document.getElementById('country');
  const selectedText = dropdown.querySelector('.selected-text');

  if (!selected || !options || !nativeSelect || !selectedText) {
    console.error("One or more dropdown elements missing!", { selected, options, nativeSelect, selectedText });
    return;
  }

  // Toggle dropdown
  selected.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = dropdown.classList.toggle('active');
    
    // Boost parent card z-index so dropdown stays on top of other sections
    const parentCard = dropdown.closest('.glass-card');
    if (parentCard) {
      parentCard.style.zIndex = isActive ? "1000" : "";
    }
    
    console.log("Dropdown toggled. Active:", isActive);
  });

  // Handle option selection
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.getAttribute('data-value');
      const text = opt.textContent.trim();

      console.log("Option selected:", val, text);

      // Update UI
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedText.textContent = text;

      // Update Native Select
      nativeSelect.value = val;
      nativeSelect.dispatchEvent(new Event('change'));

      // Close
      dropdown.classList.remove('active');
      const parentCard = dropdown.closest('.glass-card');
      if (parentCard) parentCard.style.zIndex = "";
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      if (dropdown.classList.contains('active')) {
        console.log("Closing dropdown due to outside click");
        dropdown.classList.remove('active');
        const parentCard = dropdown.closest('.glass-card');
        if (parentCard) parentCard.style.zIndex = "";
      }
    }
  });
}

function initEmailValidation() {
  const emailInput = document.getElementById('email');
  const emailWarning = document.getElementById('email-warning');
  if (!emailInput) return;

  const validateEmailField = () => {
    const userJson = localStorage.getItem('aqua_user');
    if (!userJson) return true;
    try {
      const user = JSON.parse(userJson);
      if (user && user.email) {
        const loggedEmail = user.email.toLowerCase().trim();
        const currentEmail = emailInput.value.toLowerCase().trim();
        if (currentEmail !== loggedEmail) {
          if (emailWarning) {
            emailWarning.style.display = 'block';
            emailWarning.textContent = 'Please use your logged-in email.';
          }
          emailInput.setCustomValidity('Please use your logged-in email.');
          return false;
        } else {
          if (emailWarning) emailWarning.style.display = 'none';
          emailInput.setCustomValidity('');
          return true;
        }
      }
    } catch (e) {}
    return true;
  };

  emailInput.addEventListener('input', validateEmailField);
  emailInput.addEventListener('change', validateEmailField);
}



/* ══════════════════════════════
   PLACE ORDER
   ══════════════════════════════ */
async function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  const btnText = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  
  // Basic Validation
  const form = document.getElementById('shipping-form');
  
  // Explicitly validate that the email is the logged-in email
  const emailInput = document.getElementById('email');
  const userJson = localStorage.getItem('aqua_user');
  if (emailInput && userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user && user.email) {
        const loggedEmail = user.email.toLowerCase().trim();
        const currentEmail = emailInput.value.toLowerCase().trim();
        if (currentEmail !== loggedEmail) {
          emailInput.setCustomValidity('Please use your logged-in email.');
          const emailWarning = document.getElementById('email-warning');
          if (emailWarning) {
            emailWarning.style.display = 'block';
            emailWarning.textContent = 'Please use your logged-in email.';
          }
        } else {
          emailInput.setCustomValidity('');
        }
      }
    } catch (e) {}
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Show Loading
  btn.disabled = true;
  btnText.style.opacity = '0.5';
  loader.style.display = 'block';

  try {
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, you'd call:
    // const response = await API.post('/orders', orderData);
    
    // Success
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('order-id').textContent = `#${orderId}`;

    // Save order ID so order-tracking page can read it
    localStorage.setItem('last_order_id', `#${orderId}`);

    // Capture Address Details
    const address = {
      firstName: document.getElementById('first-name').value,
      lastName: document.getElementById('last-name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      street: document.getElementById('street').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value,
      country: document.getElementById('country').value
    };

    // Capture Payment Method
    const paymentMethodEl = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'cod';

    // Set delivery date (7 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const deliveryDateString = deliveryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Get logged-in user email
    const userJson = localStorage.getItem('aqua_user');
    let userEmail = '';
    if (userJson) {
      try {
        userEmail = JSON.parse(userJson).email;
      } catch(e) {}
    }

    // Save full order details for the dashboard
    const currentCart = getCart();
    
    // Calculate total
    const subtotal = currentCart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= 50 ? 0 : 9.99;
    let discount = subtotal >= 300 ? 100 : 0;
    const totalVal = Math.max(0, subtotal - discount + shipping);
    const formattedTotal = `$${totalVal.toFixed(2)}`;

    let orders = JSON.parse(localStorage.getItem('aqua_orders') || '[]');
    orders.unshift({
      id: `#${orderId}`,
      userEmail: userEmail,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: currentCart,
      status: 'In Transit',
      paymentMethod: paymentMethod,
      address: address,
      deliveryDate: deliveryDateString,
      total: formattedTotal
    });
    localStorage.setItem('aqua_orders', JSON.stringify(orders));

    // Save a notification
    let notifications = JSON.parse(localStorage.getItem('aqua_notifications') || '[]');
    
    // Customer notification
    notifications.unshift({
      notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      id: `#${orderId}`,
      userEmail: userEmail,
      message: `Your order #${orderId} was placed successfully! It will be delivered on ${deliveryDateString}.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
      read: false
    });

    // Admin alert notification
    notifications.unshift({
      notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      id: `#${orderId}`,
      userEmail: 'admin',
      message: `New Order placed: #${orderId} by ${address.firstName} ${address.lastName} (Customer email: ${userEmail || 'Guest'}). Total: ${formattedTotal}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
      read: false
    });

    localStorage.setItem('aqua_notifications', JSON.stringify(notifications));

    // Clear Cart
    localStorage.removeItem('aqua_cart');
    
    // Show Modal
    const modal = document.getElementById('order-modal');
    modal.classList.add('show');

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btnText.style.opacity = '1';
    loader.style.display = 'none';
  }
}

/* ── POPULATE SHIPPING FORM ── */
async function populateShippingForm() {
  let userJson = localStorage.getItem('aqua_user');
  const token = localStorage.getItem('aqua_token');
  if (!userJson && token) {
    try {
      const user = await UserAPI.getProfile();
      localStorage.setItem('aqua_user', JSON.stringify(user));
      userJson = JSON.stringify(user);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  }

  // Pre-populate email with logged-in user's email
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const emailInput = document.getElementById('email');
      if (emailInput && user && user.email) {
        emailInput.value = user.email;
      }
    } catch (e) {}
  }
}

/* ── STICKY NAVBAR ── */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  links.classList.toggle('mobile-active');
  btn.classList.toggle('active');
}

/* ══════════════════════════════
   INIT
   ══════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  updateBadges();
  renderSummary();
  initForm();
  await populateShippingForm();
  
  document.getElementById('place-order-btn').addEventListener('click', placeOrder);
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('order-modal');
    if (e.target === modal) {
      // modal.classList.remove('show');
    }
  });
});
