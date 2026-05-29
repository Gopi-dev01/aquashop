/**
 * Dashboard interactivity
 */

function isAdminEmail(email) {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    return cleanEmail === '24ucs046@gmail.com' || cleanEmail === '24ucs046@gamil.com';
}

document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const menuItems = document.querySelectorAll('.menu-item[data-tab]');
    const tabs = document.querySelectorAll('.dashboard-tab');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all menu items and tabs
            menuItems.forEach(m => m.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked menu item
            item.classList.add('active');

            // Show corresponding tab
            const tabId = `tab-${item.dataset.tab}`;
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }

            // If notifications tab is clicked, mark customer alerts as read and hide badge
            if (item.dataset.tab === 'notifications') {
                const notifBadge = document.getElementById('sidebar-notif-count');
                if (notifBadge) {
                    notifBadge.style.display = 'none';
                }
                NotificationAPI.readAll(false)
                    .then(() => {
                        loadDashboardData();
                    })
                    .catch(err => console.error("Error marking all read:", err));
            }
        });
    });

    // Logout button placeholder action
    const logoutBtn = document.querySelector('.menu-item.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCustomConfirm({
                title: 'Confirm Logout',
                message: 'Are you sure you want to log out of your account?',
                type: 'warning',
                confirmText: 'Yes, Logout',
                cancelText: 'Cancel',
                onConfirm: () => {
                    if (typeof AuthAPI !== 'undefined' && AuthAPI.logout) {
                        AuthAPI.logout();
                    } else {
                        localStorage.removeItem('aqua_token');
                        localStorage.removeItem('aqua_user');
                        localStorage.removeItem('aqua_cart');
                        localStorage.removeItem('aqua_wishlist');
                        localStorage.removeItem('last_order_id');
                        window.location.href = 'login.html';
                    }
                }
            });
        });
    }
});
/* ── STICKY NAVBAR ── */
function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 10);
        });
    }
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
    const links = document.querySelector('.nav-links');
    const btn = document.querySelector('.hamburger');
    if (links) links.classList.toggle('mobile-active');
    if (btn) btn.classList.toggle('active');
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

// Initialize navbar on load
document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    updateCounts();
    await loadUserProfile();
    await loadDashboardData();
});

/* ── LOAD USER PROFILE ── */
async function loadUserProfile() {
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
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            const nameEl = document.querySelector('.profile-name');
            const emailEl = document.querySelector('.profile-email');
            const phoneEl = document.querySelector('.profile-phone');
            const imgEl = document.querySelector('.profile-image-wrap img');

            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';

            if (nameEl) nameEl.textContent = fullName;
            if (emailEl) emailEl.textContent = user.email || '';
            if (phoneEl) {
                if (user.phone) {
                    phoneEl.textContent = user.phone;
                    phoneEl.style.display = 'block';
                } else {
                    phoneEl.style.display = 'none';
                }
            }

            if (imgEl) {
                if (user.avatar) {
                    imgEl.src = user.avatar;
                    imgEl.onerror = null;
                } else {
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00BFCF&color=fff`;
                    imgEl.src = avatarUrl;
                    imgEl.onerror = function() { this.src = 'https://ui-avatars.com/api/?name=User&background=00BFCF&color=fff'; };
                }
            }

            const adminBtn = document.getElementById('admin-panel-btn');
            if (adminBtn && isAdminEmail(user.email)) {
                adminBtn.style.display = 'flex';
            }
        } catch (e) {
            console.error('Error parsing user data', e);
        }
    }
}

/* ── SEED DEFAULT ORDERS ── */
function seedDefaultOrders(email) {
    // One-time seed flag: if already seeded once (even if orders were later deleted),
    // never re-seed again. This prevents deleted orders from reappearing.
    const seedFlag = `aqua_seeded_${email.replace(/[^a-z0-9]/gi, '_')}`;
    if (localStorage.getItem(seedFlag)) return;

    let orders = JSON.parse(localStorage.getItem('aqua_orders') || '[]');
    const hasUserOrders = orders.some(o => o.userEmail === email || o.address?.email === email);
    if (!hasUserOrders) {
        const defaultOrders = [
            {
                id: '#ORD-8761',
                userEmail: email,
                date: 'May 18, 2026',
                status: 'Delivered',
                paymentMethod: 'stripe',
                total: '$229.98',
                deliveryDate: 'May 20, 2026',
                address: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: email,
                    phone: '1234567890',
                    street: '123 Aqua Way',
                    city: 'Metro City',
                    state: 'NY',
                    zip: '10001',
                    country: 'US'
                },
                items: [
                    { id: 'p1', name: 'Premium Wireless Headphones with Noise Cancellation', price: 149.99, qty: 1, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
                    { id: 'p5', name: 'Bluetooth Speaker Portable Waterproof', price: 79.99, qty: 1, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80' }
                ]
            },
            {
                id: '#ORD-8762',
                userEmail: email,
                date: 'May 20, 2026',
                status: 'In Transit',
                paymentMethod: 'cod',
                total: '$299.99',
                deliveryDate: 'May 27, 2026',
                address: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: email,
                    phone: '1234567890',
                    street: '123 Aqua Way',
                    city: 'Metro City',
                    state: 'NY',
                    zip: '10001',
                    country: 'US'
                },
                items: [
                    { id: 'p2', name: 'Smart Watch Series 7 – Fitness & Health Tracker', price: 299.99, qty: 1, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' }
                ]
            }
        ];
        orders = [...orders, ...defaultOrders];
        localStorage.setItem('aqua_orders', JSON.stringify(orders));
    }

    // Mark as seeded so this never runs again for this account
    localStorage.setItem(seedFlag, '1');
}

/* ── LOAD DASHBOARD DATA ── */
async function loadDashboardData() {
    const userJson = localStorage.getItem('aqua_user');
    let loggedInEmail = '';
    if (userJson) {
        try {
            loggedInEmail = JSON.parse(userJson).email;
        } catch(e) {}
    }

    // 1. Load Orders
    const ordersList = document.querySelector('.orders-list');
    let orders = [];
    try {
        const res = await OrderAPI.getAll();
        orders = res.orders || [];
    } catch (err) {
        console.error("Failed to load orders from API:", err);
    }
    
    if (ordersList) {
        const visibleOrders = orders.filter(o => !o.hidden);
        if (visibleOrders.length > 0) {
            ordersList.innerHTML = visibleOrders.map(order => {
                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                const itemImg = firstItem ? firstItem.img : '../assets/images/about/our-story.png';
                const itemName = firstItem ? firstItem.name : 'Unknown Product';
                const itemDetails = firstItem ? `Qty: ${firstItem.qty} | $${firstItem.price}` : '';
                const extraItems = order.items && order.items.length > 1 ? ` + ${order.items.length - 1} more item(s)` : '';
                
                let paymentLabel = 'Paid';
                let badgeClass = 'success';
                let paymentMethodName = 'Cash on Delivery';
                if (order.paymentMethod === 'stripe') {
                    paymentMethodName = 'Credit/Debit Card';
                    paymentLabel = 'Card (Paid)';
                } else if (order.paymentMethod === 'razorpay') {
                    paymentMethodName = 'Razorpay';
                    paymentLabel = 'Razorpay';
                } else if (order.paymentMethod === 'cod') {
                    paymentMethodName = 'Cash on Delivery';
                    paymentLabel = 'COD';
                    badgeClass = 'pending';
                }

                if (order.status === 'Cancelled') {
                    paymentLabel = 'Cancelled';
                    badgeClass = 'cancelled';
                }

                let deliveryBadgeClass = 'pending';
                if (order.status === 'Delivered') {
                    deliveryBadgeClass = 'success';
                } else if (order.status === 'Cancelled') {
                    deliveryBadgeClass = 'cancelled';
                }

                let actionsHtml = '';
                if (order.status === 'Cancelled') {
                    actionsHtml = `
                      <div class="order-header-payment">Payment: <strong>${paymentMethodName}</strong></div>
                      <button class="btn-delete-order" title="Delete Order Record" onclick="deleteOrder('${order.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    `;
                } else if (order.status === 'Delivered') {
                    actionsHtml = `
                      <button class="btn-track" onclick="window.location.href='order-tracking.html?orderId=' + encodeURIComponent('${order.id}')">Track Order</button>
                      <button class="btn-delete-order" title="Delete Order Record" onclick="deleteOrder('${order.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    `;
                } else {
                    actionsHtml = `
                      <button class="btn-track" onclick="window.location.href='order-tracking.html?orderId=' + encodeURIComponent('${order.id}')">Track Order</button>
                      <button class="btn-cancel-order" onclick="cancelOrder('${order.id}')">Cancel Order</button>
                    `;
                }

                return `
                <div class="order-card">
                  <div class="order-header">
                    <div>
                      <span class="order-id">Order ${order.id}</span>
                      <span class="order-date">${order.date}</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                      ${actionsHtml}
                    </div>
                  </div>
                  <div class="order-body">
                    <div class="order-product">
                      <div class="product-img-wrap">
                        <img src="${itemImg}" alt="${itemName}">
                      </div>
                      <div class="product-details">
                        <h3>${itemName}${extraItems}</h3>
                        <p>${itemDetails}</p>
                      </div>
                    </div>
                    <div class="order-status-group">
                      <div class="status-item">
                        <span class="status-label">Payment</span>
                        <span class="status-badge ${badgeClass}">${paymentLabel}</span>
                      </div>
                      <div class="status-item">
                        <span class="status-label">Delivery</span>
                        <span class="status-badge ${deliveryBadgeClass}">${order.status || 'In Transit'}</span>
                      </div>
                    </div>
                  </div>
                </div>`;
            }).join('');
        } else {
            ordersList.innerHTML = `
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" width="64" height="64"><path d="M20 16.08V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8.08a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 20 16.08z"></path><polyline points="12 22 12 12"></polyline><polyline points="12 12 21.5 6.5"></polyline><polyline points="2.5 6.5 12 12"></polyline></svg>
              <p>You have no recent orders.</p>
            </div>`;
        }
    }



    const notificationsList = document.querySelector('.notifications-list');
    let userNotifications = [];
    try {
        const res = await NotificationAPI.getAll();
        userNotifications = res.notifications || [];
    } catch (e) {
        console.error("Failed to load notifications from DB:", e);
    }

    // Update badge in sidebar for unread notifications
    const notifBadge = document.getElementById('sidebar-notif-count');
    const unreadCount = userNotifications.filter(n => !n.read).length;
    if (notifBadge) {
        if (unreadCount > 0) {
            notifBadge.textContent = unreadCount;
            notifBadge.style.display = 'inline-block';
        } else {
            notifBadge.style.display = 'none';
        }
    }

    if (notificationsList) {
        if (userNotifications.length > 0) {
            notificationsList.innerHTML = userNotifications.map((notif, index) => {
                const isSuccess = notif.message.toLowerCase().includes('successfully') || notif.message.toLowerCase().includes('success');
                const isCancelled = notif.message.toLowerCase().includes('cancelled') || notif.message.toLowerCase().includes('cancel');

                let itemClass = 'notification-item';
                let iconStyle = 'background: #e6f7ff; color: #000000;';
                let msgStyle = 'color: #2c3e50;';
                let dateClass = '';
                let iconContent = `${index + 1}`;

                if (isSuccess) {
                    itemClass += ' success-notification';
                    iconStyle = 'background: #e8f8f5; color: #000000;';
                    msgStyle = 'color: #1e8449;';
                    dateClass = 'notif-date-ok';
                } else if (isCancelled) {
                    itemClass += ' cancelled-notification';
                    iconStyle = 'background: #fdedec; color: #000000;';
                    msgStyle = 'color: #922b21;';
                    dateClass = 'notif-date-bad';
                }

                // Format the message with styled Order ID and styled status words
                let formattedMessage = notif.message;
                const orderId = notif.id || '';

                if (orderId) {
                    const escapedOrderId = orderId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const orderIdRegex = new RegExp(escapedOrderId, 'g');
                    if (isSuccess) {
                        if (formattedMessage.includes(orderId)) {
                            formattedMessage = formattedMessage.replace(orderIdRegex, `<span class="notif-order-ok">${orderId}</span>`);
                        } else {
                            formattedMessage = formattedMessage.replace(/Your order placed successfully/i, 
                                `Your order <span class="notif-order-ok">${orderId}</span> was placed <span class="notif-status-ok">successfully</span>`
                            );
                            if (!formattedMessage.includes(orderId)) {
                                formattedMessage = `Order <span class="notif-order-ok">${orderId}</span>: ${formattedMessage}`;
                            }
                        }
                    } else if (isCancelled) {
                        formattedMessage = formattedMessage.replace(orderIdRegex, `<span class="notif-order-bad">${orderId}</span>`);
                    }
                }

                // Replace status keywords
                if (isSuccess) {
                    formattedMessage = formattedMessage.replace(/successfully/i, `<span class="notif-status-ok">successfully</span>`);
                    formattedMessage = formattedMessage.replace(/success/i, `<span class="notif-status-ok">success</span>`);
                } else if (isCancelled) {
                    formattedMessage = formattedMessage.replace(/cancelled/i, `<span class="notif-status-bad">cancelled</span>`);
                    formattedMessage = formattedMessage.replace(/cancel/i, `<span class="notif-status-bad">cancel</span>`);
                }

                 return `
                    <div class="${itemClass}" data-id="${notif.notifId}" style="position: relative; backdrop-filter: blur(10px); padding: 15px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px; transition: all 0.3s ease;">
                        <div style="${iconStyle} border-radius: 50%; width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            ${iconContent}
                        </div>
                        <div style="padding-right: 55px;">
                            <p style="margin: 0 0 5px 0; font-weight: 600; ${msgStyle} line-height: 1.4;">${formattedMessage}</p>
                            <small class="${dateClass}" style="color: #888; display: block; font-size: 0.8rem; font-weight: 500;">${notif.date}</small>
                        </div>
                        <button onclick="deleteNotification('${notif.notifId}')" title="Delete Notification" style="background: #ffe6e6; border: none; cursor: pointer; color: #ff4d4f; font-weight: bold; font-size: 1.4rem; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; position: absolute; top: 15px; right: 20px; transition: background 0.2s;" onmouseover="this.style.background='#ffcccc'" onmouseout="this.style.background='#ffe6e6'">&times;</button>
                    </div>
                `;
            }).join('');
        } else {
            notificationsList.innerHTML = `
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" width="64" height="64"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <p>You have no new notifications.</p>
            </div>`;
        }
    }

    // 4. Load Address Details
    const addressContainer = document.getElementById('address-container');
    if (addressContainer) {
        const ordersWithAddress = orders.filter(o => o.address && !o.hiddenAddress);
        if (ordersWithAddress.length > 0) {
            addressContainer.innerHTML = ordersWithAddress.map((order, index) => {
                const addr = order.address;
                return `
                <div class="info-card" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 15px; position: relative; display: flex; gap: 20px; align-items: flex-start;">
                    <div style="font-weight: bold; color: black; font-size: 1.5rem; width: 40px; text-align: center; flex-shrink: 0;">${index + 1}</div>
                    <div style="flex-grow: 1; padding-right: 45px;">
                        <h3 style="color: #00BFCF; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">Shipping Address for <span style="color: #00A859;">${order.id}</span></h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95rem; color: #2c3e50;">
                            <div>
                                <p style="margin: 5px 0;"><strong>Name:</strong> ${addr.firstName} ${addr.lastName}</p>
                                <p style="margin: 5px 0;"><strong>Street:</strong> ${addr.street}</p>
                                <p style="margin: 5px 0;"><strong>City/State:</strong> ${addr.city}, ${addr.state} ${addr.zip}</p>
                            </div>
                            <div>
                                <p style="margin: 5px 0;"><strong>Country:</strong> ${addr.country}</p>
                                <p style="margin: 5px 0;"><strong>Phone:</strong> ${addr.phone}</p>
                                <p style="margin: 5px 0;"><strong>Email:</strong> ${addr.email}</p>
                            </div>
                        </div>
                    </div>
                    <button onclick="deleteAddress('${order.id}')" title="Remove Address" style="background: #ffe6e6; border: none; cursor: pointer; color: #ff4d4f; font-weight: bold; font-size: 1.4rem; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; position: absolute; top: 15px; right: 20px; transition: background 0.2s;" onmouseover="this.style.background='#ffcccc'" onmouseout="this.style.background='#ffe6e6'">&times;</button>
                </div>
                `;
            }).join('');
        } else {
            addressContainer.innerHTML = `
            <div class="empty-state">
              <p>No address details found. Place an order to save your address.</p>
            </div>`;
        }
    }

    // 5. Load Payment Methods
    const paymentContainer = document.getElementById('payment-container');
    if (paymentContainer) {
        const ordersWithPayment = orders.filter(o => o.paymentMethod && !o.hiddenPayment);
        if (ordersWithPayment.length > 0) {
            paymentContainer.innerHTML = ordersWithPayment.map((order, index) => {
                let pMethodName = 'Cash on Delivery';
                let pMethodColor = '#f39c12'; // Yellow/Orange for COD
                if (order.paymentMethod === 'stripe') {
                    pMethodName = 'Credit/Debit Card (Stripe)';
                    pMethodColor = '#27ae60'; // Green for Stripe
                }
                if (order.paymentMethod === 'razorpay') {
                    pMethodName = 'Razorpay';
                    pMethodColor = '#2980b9'; // Blue for Razorpay
                }
                
                return `
                <div class="info-card" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 15px; display: flex; align-items: center; gap: 20px; position: relative;">
                    <div style="font-weight: bold; color: black; font-size: 1.5rem; width: 40px; text-align: center; flex-shrink: 0;">${index + 1}</div>
                    <div style="background: #f5f5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; flex-shrink: 0;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="${pMethodColor}" stroke-width="2" width="24" height="24">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                    </div>
                    <div style="flex-grow: 1; padding-right: 45px;">
                        <h3 style="margin: 0 0 5px 0; color: ${pMethodColor};">${pMethodName}</h3>
                        <p style="margin: 0; color: #666; font-size: 0.9em;">Used for ${order.id}</p>
                    </div>
                    <button onclick="deletePayment('${order.id}')" title="Remove Payment Method" style="background: #ffe6e6; border: none; cursor: pointer; color: #ff4d4f; font-weight: bold; font-size: 1.4rem; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; position: absolute; top: 15px; right: 20px; transition: background 0.2s;" onmouseover="this.style.background='#ffcccc'" onmouseout="this.style.background='#ffe6e6'">&times;</button>
                </div>
                `;
            }).join('');
        } else {
            paymentContainer.innerHTML = `
            <div class="empty-state">
              <p>No payment methods found. Place an order to save your payment method.</p>
            </div>`;
        }
    }
}function showCustomConfirm({ title, message, type, confirmText, cancelText, onConfirm }) {
    // Remove any existing confirm overlays first
    const existing = document.querySelector('.custom-confirm-overlay');
    if (existing) existing.remove();

    // Icon SVGs
    const icons = {
        warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    };

    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    overlay.innerHTML = `
        <div class="custom-confirm-card">
            <div class="custom-confirm-icon ${type || 'warning'}">
                ${icons[type] || icons.warning}
            </div>
            <div class="custom-confirm-title">${title || 'Are you sure?'}</div>
            <div class="custom-confirm-msg">${message || 'Please confirm this action.'}</div>
            <div class="custom-confirm-buttons">
                <button class="custom-confirm-btn btn-no">${cancelText || 'Cancel'}</button>
                <button class="custom-confirm-btn btn-yes ${type || 'warning'}">${confirmText || 'Confirm'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Trigger reflow & animate in
    overlay.offsetHeight;
    overlay.classList.add('active');

    // Button event listeners
    const btnNo = overlay.querySelector('.btn-no');
    const btnYes = overlay.querySelector('.btn-yes');

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    btnNo.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    btnYes.addEventListener('click', () => {
        closeModal();
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });
}

window.cancelOrder = function(orderId) {
    showCustomConfirm({
        title: 'Cancel Order?',
        message: `Are you sure you want to cancel order <strong>${orderId}</strong>? This action will set your status to Cancelled.`,
        type: 'warning',
        confirmText: 'Yes, Cancel Order',
        cancelText: 'Go Back',
        onConfirm: async () => {
            try {
                await OrderAPI.cancel(orderId);
                await loadDashboardData();
            } catch (err) {
                console.error("Failed to cancel order:", err);
                alert("Failed to cancel order: " + err.message);
            }
        }
    });
};

window.deleteOrder = function(orderId) {
    showCustomConfirm({
        title: 'Delete Order Record?',
        message: `Are you sure you want to delete order <strong>${orderId}</strong> from your history? This action will remove it from the Orders list.`,
        type: 'danger',
        confirmText: 'Yes, Delete',
        cancelText: 'Keep It',
        onConfirm: () => {
            const cards = document.querySelectorAll('.order-card');
            cards.forEach(card => {
                const idEl = card.querySelector('.order-id');
                if (idEl && idEl.textContent.trim() === 'Order ' + orderId) {
                    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateX(30px)';
                    setTimeout(async () => {
                        try {
                            await OrderAPI.update(orderId, { hidden: true });
                            await loadDashboardData();
                        } catch (err) {
                            console.error("Failed to delete order:", err);
                            alert("Failed to delete order: " + err.message);
                        }
                    }, 350);
                }
            });
        }
    });
};

window.deletePayment = function(orderId) {
    showCustomConfirm({
        title: 'Remove Payment Method?',
        message: `Are you sure you want to remove the payment method record for order <strong>${orderId}</strong>?`,
        type: 'danger',
        confirmText: 'Yes, Remove',
        cancelText: 'Cancel',
        onConfirm: async () => {
            try {
                await OrderAPI.update(orderId, { hiddenPayment: true });
                await loadDashboardData();
            } catch (err) {
                console.error("Failed to remove payment method:", err);
                alert("Failed to remove payment method: " + err.message);
            }
        }
    });
};

window.deleteAddress = function(orderId) {
    showCustomConfirm({
        title: 'Remove Address?',
        message: `Are you sure you want to remove the address record for order <strong>${orderId}</strong>?`,
        type: 'danger',
        confirmText: 'Yes, Remove',
        cancelText: 'Cancel',
        onConfirm: async () => {
            try {
                await OrderAPI.update(orderId, { hiddenAddress: true });
                await loadDashboardData();
            } catch (err) {
                console.error("Failed to remove address:", err);
                alert("Failed to remove address: " + err.message);
            }
        }
    });
};

window.resetSessionData = function() {
    showCustomConfirm({
        title: 'Reset Session Data?',
        message: 'This will permanently wipe your shopping cart, all active order logs, wishlist, and notification logs. Do you want to proceed?',
        type: 'danger',
        confirmText: 'Reset Everything',
        cancelText: 'No, Keep Data',
        onConfirm: () => {
            localStorage.removeItem('aqua_cart');
            localStorage.removeItem('aqua_orders');
            localStorage.removeItem('last_order_id');
            localStorage.removeItem('aqua_notifications');
            localStorage.removeItem('aqua_wishlist');
            
            // Show a success message overlay briefly or reload immediately
            alert('Session data cleared successfully!');
            window.location.reload();
        }
    });
};

window.deleteNotification = function(notifId) {
    showCustomConfirm({
        title: 'Delete Notification?',
        message: 'Are you sure you want to remove this notification?',
        type: 'warning',
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        onConfirm: () => {
            const card = document.querySelector(`.notifications-list .notification-item[data-id="${notifId}"]`);
            if (card) {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateX(30px)';
                setTimeout(async () => {
                    try {
                        await NotificationAPI.delete(notifId);
                        await loadDashboardData();
                    } catch (err) {
                        console.error("Failed to delete notification:", err);
                        alert("Failed to delete notification: " + err.message);
                    }
                }, 300);
            }
        }
    });
};

/* ── EDIT PROFILE MODAL ── */
window.openEditProfile = function() {
    const userJson = localStorage.getItem('aqua_user');
    if (userJson) {
        const user = JSON.parse(userJson);
        document.getElementById('edit-fname').value = user.first_name || '';
        document.getElementById('edit-lname').value = user.last_name || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';
        
        const previewCont = document.querySelector('.img-preview-container');
        const previewImg = document.getElementById('edit-img-preview');
        if (user.avatar) {
            previewImg.src = user.avatar;
            previewCont.style.display = 'block';
        } else {
            previewImg.src = '#';
            previewCont.style.display = 'none';
        }
        
        document.getElementById('editProfileModal').classList.add('active');
    }
};

window.closeEditProfile = function() {
    document.getElementById('editProfileModal').classList.remove('active');
};

window.previewImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewCont = document.querySelector('.img-preview-container');
            const previewImg = document.getElementById('edit-img-preview');
            previewImg.src = e.target.result;
            previewCont.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
};

window.saveProfile = async function(event) {
    event.preventDefault();
    const userJson = localStorage.getItem('aqua_user');
    if (userJson) {
        const user = JSON.parse(userJson);
        const originalEmail = user.email;
        const first_name = document.getElementById('edit-fname').value.trim();
        const last_name = document.getElementById('edit-lname').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        
        const previewImg = document.getElementById('edit-img-preview');
        const src = previewImg.src;
        const pageUrl = window.location.href.split('#')[0].split('?')[0];
        const isPageUrl = src && (src === pageUrl || src.startsWith(pageUrl + '#') || src.endsWith('#') || src === '#');
        const isValid = src && !isPageUrl && (src.startsWith('data:') || src.startsWith('http:') || src.startsWith('https:'));
        
        let avatar = null;
        if (isValid) {
            avatar = src;
        }
        
        // Call backend API to persist details in database (including avatar)
        try {
            if (typeof AuthAPI !== 'undefined' && AuthAPI.updateUser) {
                await AuthAPI.updateUser(originalEmail, { first_name, last_name, email, phone, avatar });
            }
        } catch (err) {
            console.error('Failed to update user profile in backend database:', err);
        }
        
        user.first_name = first_name;
        user.last_name = last_name;
        user.email = email;
        user.phone = phone;
        
        if (isValid) {
            user.avatar = src;
        } else {
            delete user.avatar;
        }
        
        localStorage.setItem('aqua_user', JSON.stringify(user));
        closeEditProfile();
        loadUserProfile(); // refresh dashboard UI
        
        if (typeof showCustomConfirm === 'function') {
            showCustomConfirm({
                title: 'Success',
                message: 'Your profile has been successfully updated!',
                type: 'success',
                confirmText: 'OK',
                cancelText: 'Close',
                onConfirm: () => {}
            });
            // Hide cancel button if possible for a pure info dialog
            const overlay = document.querySelector('.custom-confirm-overlay');
            if (overlay) {
                const btnNo = overlay.querySelector('.btn-no');
                if (btnNo) btnNo.style.display = 'none';
            }
        } else {
            alert('Profile updated successfully!');
        }
    }
};
