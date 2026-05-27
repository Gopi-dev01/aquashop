/* ═══════════════════════════════════════
   admin-dashboard.js — AquaShop Admin
   Full product management with localStorage sync
   ═══════════════════════════════════════ */

function isAdminEmail(email) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail === '24ucs046@gmail.com' || cleanEmail === '24ucs046@gamil.com';
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
  const sidebar = document.querySelector('.admin-sidebar');
  const btn = document.querySelector('.hamburger');
  if (sidebar) {
    sidebar.classList.toggle('mobile-active');
    document.body.classList.toggle('sidebar-open');
  }
  if (btn) btn.classList.toggle('active');
}

function closeMobileMenu() {
  const sidebar = document.querySelector('.admin-sidebar');
  const btn = document.querySelector('.hamburger');
  if (sidebar) {
    sidebar.classList.remove('mobile-active');
    document.body.classList.remove('sidebar-open');
  }
  if (btn) btn.classList.remove('active');
}

/* ── DEFAULT PRODUCTS (mirrors shop.js ALL_PRODUCTS) ── */
const DEFAULT_PRODUCTS = [
  { id:'p1',  name:'Premium Wireless Headphones with Noise Cancellation', category:'audio',       price:107.00, original:149.99, discount:28, rating:4.5, reviews:234,  img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', brand:'Sony' },
  { id:'p2',  name:'Smart Watch Series 7 – Fitness & Health Tracker',     category:'wearables',  price:299.99, original:399.99, discount:25, rating:4.0, reviews:512,  img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', brand:'Apple' },
  { id:'p3',  name:'4K Ultra HD Monitor 27 Inch Professional Display',    category:'electronics',price:449.99, original:null,   discount:0,  rating:4.5, reviews:189,  img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80', brand:'Dell' },
  { id:'p4',  name:'Smartphone Pro Max 256GB Latest Model',                category:'mobile',     price:999.99, original:1199.99,discount:17, rating:4.0, reviews:823,  img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', brand:'Apple', outOfStock:true },
  { id:'p5',  name:'Bluetooth Speaker Portable Waterproof',               category:'audio',       price:79.99,  original:null,   discount:0,  rating:4.0, reviews:145,  img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80', brand:'Bose', outOfStock:true },
  { id:'p6',  name:'Mechanical Gaming Keyboard RGB Backlit',              category:'electronics', price:129.99, original:159.99, discount:19, rating:4.0, reviews:298,  img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80', brand:'LG' },
  { id:'p7',  name:'Wireless Mouse Ergonomic Design',                     category:'electronics', price:49.99,  original:null,   discount:0,  rating:3.5, reviews:176,  img:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80', brand:'LG' },
  { id:'p8',  name:'USB-C Hub Multiport Adapter',                        category:'accessories', price:39.99,  original:null,   discount:0,  rating:4.0, reviews:89,   img:'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&q=80', brand:'Samsung' },
  { id:'p9',  name:'True Wireless Earbuds ANC Pro',                      category:'audio',       price:79.99,  original:99.99,  discount:20, rating:4.5, reviews:308,  img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80', brand:'Sony' },
  { id:'p10', name:'Laptop Stand Adjustable Aluminium',                  category:'accessories', price:34.99,  original:44.99,  discount:22, rating:4.0, reviews:211,  img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&q=80', brand:'Dell' },
  { id:'p11', name:'Samsung Galaxy Tab S9 Ultra 14.6"',                  category:'electronics', price:899.99, original:1099.99,discount:18, rating:4.5, reviews:542,  img:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80', brand:'Samsung' },
  { id:'p12', name:'Fitness Smart Band Activity Tracker',                category:'wearables',   price:59.99,  original:79.99,  discount:25, rating:3.5, reviews:421,  img:'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80', brand:'Apple' },
];

/* ── PRODUCT STORE ── */
function getProducts() {
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
      return parsed;
    } catch(e) {}
  }
  // First time: seed with defaults and save
  localStorage.setItem('aqua_products', JSON.stringify(DEFAULT_PRODUCTS));
  return [...DEFAULT_PRODUCTS];
}

function saveProducts(products) {
  localStorage.setItem('aqua_products', JSON.stringify(products));
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initAdminTabs();
  loadAdminData();
  initDeleteConfirmModal();
  initCustomOrderDropdown();
});

function initCustomOrderDropdown() {
  const dropdown = document.getElementById('order-status-dropdown');
  if (!dropdown) return;
  const selected = dropdown.querySelector('.dropdown-selected');
  const options = dropdown.querySelectorAll('.dropdown-option');
  const nativeSelect = document.getElementById('order-filter-status');
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
      
      if (nativeSelect) {
        nativeSelect.value = val;
        // Trigger filterOrdersAdmin directly to update orders list
        filterOrdersAdmin();
      }
      
      dropdown.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

function initAdminTabs() {
  const menuItems = document.querySelectorAll('.admin-menu-item[data-tab]');
  const tabs = document.querySelectorAll('.admin-tab');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(m => m.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      item.classList.add('active');
      const targetTab = document.getElementById(`tab-${item.dataset.tab}`);
      if (targetTab) targetTab.classList.add('active');

      // Scroll page back to top to align header and sidebar perfectly
      window.scrollTo({ top: 0, behavior: 'instant' });

      // If notifications tab is clicked, mark admin alerts as read and hide badge
      if (item.dataset.tab === 'notifications') {
        const badge = document.getElementById('sidebar-admin-notif-count');
        if (badge) badge.style.display = 'none';

        let notifications = JSON.parse(localStorage.getItem('aqua_notifications') || '[]');
        notifications = notifications.map(n => n.userEmail === 'admin' ? { ...n, read: true } : n);
        localStorage.setItem('aqua_notifications', JSON.stringify(notifications));
        populateNotificationsTable();
      }

      // If subscribers tab is clicked, populate table
      if (item.dataset.tab === 'subscribers') {
        populateSubscribersTable();
      }

      // Close sidebar drawer on mobile after selecting a tab
      closeMobileMenu();
    });
  });
}

function loadAdminData() {
  const userJson = localStorage.getItem('aqua_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (isAdminEmail(user.email)) {
        const avatarImg = document.getElementById('admin-top-avatar');
        if (avatarImg) {
          if (user.avatar) {
            avatarImg.src = user.avatar;
          } else {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin';
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00BFCF&color=fff`;
          }
        }
      }
    } catch(e) {}
  }

  let orders = JSON.parse(localStorage.getItem('aqua_orders') || '[]');
  
  // Programmatically update any order having total $149.99 to $107.00
  let ordersUpdated = false;
  orders = orders.map(o => {
    if (o.total === '$149.99' || o.total === 149.99) {
      o.total = '$107.00';
      ordersUpdated = true;
    }
    if (o.items) {
      o.items = o.items.map(item => {
        if (item.id === 'p1' && item.price === 149.99) {
          item.price = 107.00;
          ordersUpdated = true;
        }
        return item;
      });
    }
    return o;
  });
  if (ordersUpdated) {
    localStorage.setItem('aqua_orders', JSON.stringify(orders));
  }

  const adminVisibleOrders = orders.filter(o => !o.hiddenAdmin);
  const activeOrders = adminVisibleOrders.filter(o => o.status !== 'Cancelled');
  const totalOrders = activeOrders.length;
  document.getElementById('dash-total-orders').textContent = totalOrders.toLocaleString();

  // Get current date string formatted as e.g. "May 26, 2026" to match order date format
  const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // 1. Dynamic Total Revenue
  const baseRevenue = 0;
  const ordersRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => {
      let val = 0;
      if (typeof o.total === 'string') {
        val = parseFloat(o.total.replace('$', '').replace(/,/g, '')) || 0;
      } else if (typeof o.total === 'number') {
        val = o.total;
      }
      return sum + val;
    }, 0);
  const totalRevenue = baseRevenue + ordersRevenue;
  const revenueEl = document.getElementById('dash-total-revenue');
  if (revenueEl) {
    revenueEl.textContent = `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Today's Earned Revenue
  const todayRevenue = orders
    .filter(o => o.status !== 'Cancelled' && o.date === todayFormatted)
    .reduce((sum, o) => {
      let val = 0;
      if (typeof o.total === 'string') {
        val = parseFloat(o.total.replace('$', '').replace(/,/g, '')) || 0;
      } else if (typeof o.total === 'number') {
        val = o.total;
      }
      return sum + val;
    }, 0);
  const revenueTrendEl = document.getElementById('dash-revenue-trend');
  if (revenueTrendEl) {
    if (todayRevenue > 0) {
      revenueTrendEl.textContent = `+$${todayRevenue.toFixed(2)} earned today`;
      revenueTrendEl.className = 'stat-trend positive';
    } else {
      revenueTrendEl.textContent = '$0.00 earned today';
      revenueTrendEl.className = 'stat-trend neutral';
    }
  }

  // 2. Today's Placed Orders (only count active/non-cancelled ones)
  const ordersTodayCount = activeOrders.filter(o => o.date === todayFormatted).length;
  const ordersTrendEl = document.getElementById('dash-orders-trend');
  if (ordersTrendEl) {
    if (ordersTodayCount > 0) {
      ordersTrendEl.textContent = `+${ordersTodayCount} placed today`;
      ordersTrendEl.className = 'stat-trend positive';
    } else {
      ordersTrendEl.textContent = '0 placed today';
      ordersTrendEl.className = 'stat-trend neutral';
    }
  }

  // 3. Products count & stock calculations
  const products = getProducts();
  const totalProducts = products.length;
  const outOfStockProducts = products.filter(p => p.stock === 0 || p.outOfStock).length;
  
  const productsEl = document.getElementById('dash-total-products');
  if (productsEl) {
    productsEl.textContent = totalProducts.toLocaleString();
  }
  const productsOutOfStockEl = document.getElementById('dash-products-out-of-stock');
  if (productsOutOfStockEl) {
    if (outOfStockProducts > 0) {
      productsOutOfStockEl.textContent = `${outOfStockProducts} out of stock`;
      productsOutOfStockEl.className = 'stat-trend negative';
    } else {
      productsOutOfStockEl.textContent = 'All in stock';
      productsOutOfStockEl.className = 'stat-trend positive';
    }
  }

  populateOrdersTable(orders);
  populateUsersTable();
  populateProductsTable();
  populateNotificationsTable();
  populateSubscribersTable();
}

/* ══════════════════════════════
   PRODUCTS TABLE
══════════════════════════════ */
function populateProductsTable() {
  const productsBody = document.getElementById('products-body');
  if (!productsBody) return;

  const products = getProducts();

  // Update count badge
  const badge = document.getElementById('products-count-badge');
  if (badge) badge.textContent = `(${products.length})`;

  if (products.length === 0) {
    productsBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:40px; color:#95a5a6;">
          No products yet. Click <strong>Add Product</strong> to get started.
        </td>
      </tr>`;
    return;
  }

  productsBody.innerHTML = products.map(p => {
    const stockCount = p.stock !== undefined ? p.stock : (p.outOfStock ? 0 : 100);
    let stockBadge = stockCount > 10 ? 'success' : (stockCount === 0 ? 'cancelled' : 'pending');
    let stockLabel = stockCount === 0 ? 'Out of Stock' : `${stockCount} in stock`;
    const price = typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : `$${p.price}`;

    return `
    <tr data-id="${p.id}">
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${p.img}" alt="${p.name}" 
               style="width:44px; height:44px; object-fit:cover; border-radius:10px; border:1px solid #e8f0f2; flex-shrink:0;"
               onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=60'">
          <span style="font-weight:600; color:#1A2E35; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${p.name}">${p.name}</span>
        </div>
      </td>
      <td><span style="text-transform:capitalize;">${p.category}</span></td>
      <td style="font-weight:600; color:#00BFCF;">${price}</td>
      <td><span class="status-badge ${stockBadge}">${stockLabel}</span></td>
      <td>
        <button class="action-btn" title="Edit Product" onclick="openEditProductModal('${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="action-btn delete" title="Delete Product" onclick="deleteProduct('${p.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

/* ── DELETE FLOW ── */
let productToDeleteId = null;
let orderToDeleteId = null;
let userToDeleteEmail = null;
let subscriberToDeleteEmail = null;

window.deleteProduct = function(id) {
  const products = getProducts();
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  productToDeleteId = id;
  orderToDeleteId = null;
  userToDeleteEmail = null;

  // Set modal texts for product
  const titleEl = document.getElementById('delete-modal-title');
  const descEl = document.getElementById('delete-modal-desc');
  const confirmBtn = document.getElementById('btn-confirm-delete');
  if (titleEl) titleEl.textContent = 'Delete Product?';
  if (descEl) descEl.textContent = 'You are about to delete this product. It will also be removed from the shop catalog. This action cannot be undone.';
  if (confirmBtn) confirmBtn.textContent = 'Delete Product';

  // Populate preview card inside the custom delete confirmation modal
  const nameEl = document.getElementById('delete-confirm-item-name');
  const priceEl = document.getElementById('delete-confirm-item-price');
  const imgEl = document.getElementById('delete-confirm-img');
  
  if (nameEl) nameEl.textContent = p.name;
  if (priceEl) {
    const priceVal = typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : `$${p.price}`;
    priceEl.textContent = priceVal;
  }
  if (imgEl) {
    imgEl.src = p.img || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80';
    imgEl.alt = p.name;
  }

  openModal('delete-confirm-modal');
};

function initDeleteConfirmModal() {
  const confirmBtn = document.getElementById('btn-confirm-delete');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (productToDeleteId) {
        let products = getProducts();
        products = products.filter(p => p.id !== productToDeleteId);
        saveProducts(products);
        loadAdminData();
        closeModal('delete-confirm-modal');
        showAdminToast('🗑️ Product deleted successfully!', 'error');
        productToDeleteId = null;
      } else if (orderToDeleteId) {
        let orders = JSON.parse(localStorage.getItem('aqua_orders') || '[]');
        const matchedOrder = orders.find(o => o.id === orderToDeleteId);
        const wasAlreadyCancelled = matchedOrder && matchedOrder.status === 'Cancelled';
        const isDelivered = matchedOrder && matchedOrder.status === 'Delivered';

        orders = orders.map(o => {
          if (o.id === orderToDeleteId) {
            // Hide it from admin view, but keep it in database for the customer
            o.hiddenAdmin = true;

            // Only mark as Cancelled if the order is not already Delivered
            if (o.status !== 'Delivered') {
              o.status = 'Cancelled';
            }

            // Only log cancellation notifications/alerts if the order was not already cancelled and not delivered!
            if (!wasAlreadyCancelled && !isDelivered) {
              const customerEmail = o.userEmail || (o.address && o.address.email) || "";
              let notifications = JSON.parse(localStorage.getItem('aqua_notifications') || '[]');
              
              if (customerEmail) {
                notifications.unshift({
                  notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
                  id: orderToDeleteId,
                  userEmail: customerEmail,
                  message: `Your order ${orderToDeleteId} has been cancelled by Admin.`,
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' })
                });
              }

              notifications.unshift({
                notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
                id: orderToDeleteId,
                userEmail: 'admin',
                message: `Order ${orderToDeleteId} cancelled by Admin (Customer: ${customerEmail || 'Guest'}).`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
                read: false
              });

              localStorage.setItem('aqua_notifications', JSON.stringify(notifications));
            }
          }
          return o;
        });
        localStorage.setItem('aqua_orders', JSON.stringify(orders));
        loadAdminData();
        closeModal('delete-confirm-modal');
        if (wasAlreadyCancelled) {
          showAdminToast('🗑️ Order record deleted successfully!', 'error');
        } else {
          showAdminToast('🗑️ Order deleted and cancelled successfully!', 'error');
        }
        orderToDeleteId = null;
      } else if (userToDeleteEmail) {
        deleteUserAdminConfirmed(userToDeleteEmail);
      } else if (subscriberToDeleteEmail) {
        let subscribers = JSON.parse(localStorage.getItem('aqua_subscribers') || '[]');
        subscribers = subscribers.filter(s => s.toLowerCase().trim() !== subscriberToDeleteEmail.toLowerCase().trim());
        localStorage.setItem('aqua_subscribers', JSON.stringify(subscribers));
        populateSubscribersTable();
        closeModal('delete-confirm-modal');
        showAdminToast('🗑️ Subscriber deleted successfully!', 'error');
        subscriberToDeleteEmail = null;
      }
    });
  }
}

/* ── OPEN ADD MODAL ── */
window.openAddProductModal = function() {
  document.getElementById('product-modal-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('product-modal-id').value = '';
  document.getElementById('img-preview').style.display = 'none';
  const wrap = document.querySelector('.img-preview-wrap');
  if (wrap) wrap.classList.remove('has-image');
  document.getElementById('modal-submit-btn').textContent = 'Add Product';
  openModal('product-modal');
};

/* ── OPEN EDIT MODAL ── */
window.openEditProductModal = function(id) {
  const products = getProducts();
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-modal-id').value = p.id;
  document.getElementById('field-name').value = p.name;
  document.getElementById('field-category').value = p.category;
  document.getElementById('field-brand').value = p.brand || '';
  document.getElementById('field-price').value = p.price;
  document.getElementById('field-original').value = p.original || '';
  document.getElementById('field-discount').value = p.discount || 0;
  document.getElementById('field-stock').value = p.stock !== undefined ? p.stock : (p.outOfStock ? 0 : 100);
  document.getElementById('field-img').value = p.img || '';
  document.getElementById('field-rating').value = p.rating || 4.0;
  document.getElementById('field-reviews').value = p.reviews || 0;

  const preview = document.getElementById('img-preview');
  const wrap = document.querySelector('.img-preview-wrap');
  if (p.img) {
    preview.src = p.img;
    preview.style.display = 'block';
    if (wrap) wrap.classList.add('has-image');
  } else {
    preview.style.display = 'none';
    if (wrap) wrap.classList.remove('has-image');
  }

  document.getElementById('modal-submit-btn').textContent = 'Save Changes';
  openModal('product-modal');
};

/* ── SAVE PRODUCT (Add or Edit) ── */
window.saveProduct = function(e) {
  e.preventDefault();

  const id = document.getElementById('product-modal-id').value;
  const name = document.getElementById('field-name').value.trim();
  const category = document.getElementById('field-category').value;
  const brand = document.getElementById('field-brand').value.trim();
  const price = parseFloat(document.getElementById('field-price').value);
  const original = parseFloat(document.getElementById('field-original').value) || null;
  const discount = parseInt(document.getElementById('field-discount').value) || 0;
  const stock = parseInt(document.getElementById('field-stock').value) || 0;
  const img = document.getElementById('field-img').value.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  const rating = parseFloat(document.getElementById('field-rating').value) || 4.0;
  const reviews = parseInt(document.getElementById('field-reviews').value) || 0;

  if (!name || !category || isNaN(price)) {
    showAdminToast('⚠️ Please fill all required fields.', 'warn');
    return;
  }

  let products = getProducts();

  if (id) {
    // Edit existing
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products[idx] = { ...products[idx], name, category, brand, price, original, discount, stock, img, rating, reviews, outOfStock: stock === 0 };
    }
    showAdminToast('✅ Product updated successfully!');
  } else {
    // Add new
    const newId = 'p' + Date.now();
    products.push({ id: newId, name, category, brand, price, original, discount, stock, img, rating, reviews, outOfStock: stock === 0 });
    showAdminToast('✅ Product added successfully!');
  }

  saveProducts(products);
  closeModal('product-modal');
  loadAdminData();
};

/* ── IMG PREVIEW ── */
window.previewImage = function(url) {
  const preview = document.getElementById('img-preview');
  const wrap = document.querySelector('.img-preview-wrap');
  if (url.trim()) {
    preview.src = url.trim();
    preview.style.display = 'block';
    if (wrap) wrap.classList.add('has-image');
    preview.onerror = () => {
      preview.style.display = 'none';
      if (wrap) wrap.classList.remove('has-image');
    };
  } else {
    preview.style.display = 'none';
    if (wrap) wrap.classList.remove('has-image');
  }
};

/* ── MODAL HELPERS ── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Close on backdrop click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ══════════════════════════════
   ORDERS TABLE
══════════════════════════════ */
function populateOrdersTable(orders) {
  const recentBody = document.getElementById('recent-orders-body');
  const allBody = document.getElementById('all-orders-body');

  const visibleOrders = orders ? orders.filter(o => !o.hiddenAdmin) : [];

  if (!visibleOrders || visibleOrders.length === 0) {
    if (recentBody) {
      recentBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:40px; color:#95a5a6; font-weight:500;">
            No orders placed yet.
          </td>
        </tr>`;
    }
    if (allBody) {
      allBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:40px; color:#95a5a6; font-weight:500;">
            No orders placed yet.
          </td>
        </tr>`;
    }
    return;
  }

  const displayOrders = visibleOrders.map(o => {
    let customerName = 'Guest';
    if (o.address && o.address.firstName) {
      customerName = `${o.address.firstName} ${o.address.lastName}`.trim();
    } else if (o.customer) {
      customerName = o.customer;
    } else if (o.userEmail) {
      customerName = o.userEmail;
    }

    let totalFormatted = '$0.00';
    if (o.total) {
      totalFormatted = o.total;
    } else if (o.items && o.items.length > 0) {
      const subtotal = o.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
      const shipping = subtotal >= 50 ? 0 : 9.99;
      const discount = subtotal >= 300 ? 100 : 0;
      const calcTotal = Math.max(0, subtotal - discount + shipping);
      totalFormatted = `$${calcTotal.toFixed(2)}`;
    }

    const totalQty = o.items ? o.items.reduce((sum, item) => sum + (item.qty || 1), 0) : (o.quantity || 1);

    return {
      id: o.id,
      date: o.date,
      status: o.status || 'Processing',
      total: totalFormatted,
      customer: customerName,
      paymentMethod: o.paymentMethod || 'cod',
      quantity: totalQty
    };
  });

  const generateRows = (list, limit, showActions) => list.slice(0, limit).map((o, index) => {
    let badge = 'pending';
    if (o.status === 'Delivered') badge = 'success';
    if (o.status === 'Cancelled') badge = 'cancelled';

    let paymentMethodName = 'Cash on Delivery';
    if (o.paymentMethod === 'stripe') {
      paymentMethodName = 'Credit/Debit Card';
    } else if (o.paymentMethod === 'razorpay') {
      paymentMethodName = 'Razorpay';
    }

    return `
      <tr>
        <td style="text-align: center; font-weight: 600; color: #95a5a6;">${index + 1}</td>
        <td style="font-weight:600;">${o.id}</td>
        <td>${o.customer}</td>
        <td>${o.date}</td>
        <td><span class="status-badge ${badge}">${o.status}</span></td>
        <td>${o.total}</td>
        <td>${o.quantity}</td>
        ${showActions ? `
        <td>${paymentMethodName}</td>
        <td style="text-align: center;">
          <input type="checkbox" class="order-delivered-checkbox" 
                 ${o.status === 'Delivered' ? 'checked' : ''} 
                 ${o.status === 'Cancelled' ? 'disabled' : ''} 
                 onchange="toggleOrderDelivered('${o.id}', this.checked)" 
                 style="width: 18px; height: 18px; cursor: ${o.status === 'Cancelled' ? 'not-allowed' : 'pointer'}; accent-color: #27ae60;">
        </td>
        <td style="text-align: center;">
          <button class="action-btn delete" title="Delete Order" onclick="deleteOrderAdmin('${o.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </td>` : ''}
      </tr>`;
  }).join('');

  if (recentBody) recentBody.innerHTML = generateRows(displayOrders, 3, false);

  // Filter displayOrders for the main orders tab table
  const searchInput = document.getElementById('order-search-id');
  const statusSelect = document.getElementById('order-filter-status');

  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const statusFilter = statusSelect ? statusSelect.value : 'all';

  let filteredOrders = displayOrders;

  if (statusFilter !== 'all') {
    filteredOrders = filteredOrders.filter(o => {
      if (statusFilter === 'In Transit') {
        return o.status === 'In Transit' || o.status === 'Processing';
      }
      return o.status.toLowerCase() === statusFilter.toLowerCase();
    });
  }

  if (searchQuery) {
    filteredOrders = filteredOrders.filter(o => {
      const cleanId = o.id.replace('#', '').toLowerCase();
      const cleanQuery = searchQuery.replace('#', '').toLowerCase();
      return cleanId.includes(cleanQuery);
    });
  }

  if (allBody) {
    if (filteredOrders.length === 0) {
      allBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center; padding:40px; color:#95a5a6; font-weight:500;">
            🔍 No matching orders found. Try adjusting your search or filter.
          </td>
        </tr>`;
    } else {
      allBody.innerHTML = generateRows(filteredOrders, 50, true);
    }
  }
}

window.filterOrdersAdmin = function() {
  const orders = JSON.parse(localStorage.getItem('aqua_orders') || '[]');
  populateOrdersTable(orders);
};

window.toggleOrderDelivered = function(orderId, isChecked) {
  let orders = JSON.parse(localStorage.getItem('aqua_orders') || '[]');
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex > -1) {
    orders[orderIndex].status = isChecked ? 'Delivered' : 'In Transit';
    localStorage.setItem('aqua_orders', JSON.stringify(orders));

    // Create notifications/alerts
    const order = orders[orderIndex];
    const customerEmail = order.userEmail || (order.address && order.address.email) || "";
    let notifications = JSON.parse(localStorage.getItem('aqua_notifications') || '[]');

    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isChecked) {
      if (customerEmail) {
        notifications.unshift({
          notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
          id: orderId,
          userEmail: customerEmail,
          message: `Your order ${orderId} has been successfully delivered. Thank you for shopping with AquaShop!`,
          date: nowStr,
          read: false
        });
      }
      notifications.unshift({
        notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
        id: orderId,
        userEmail: 'admin',
        message: `Order ${orderId} marked as DELIVERED by Delivery Personnel/Admin.`,
        date: nowStr,
        read: false
      });
    } else {
      if (customerEmail) {
        notifications.unshift({
          notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
          id: orderId,
          userEmail: customerEmail,
          message: `Your order ${orderId} status has been updated to In Transit.`,
          date: nowStr,
          read: false
        });
      }
      notifications.unshift({
        notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
        id: orderId,
        userEmail: 'admin',
        message: `Order ${orderId} status reverted to In Transit.`,
        date: nowStr,
        read: false
      });
    }

    localStorage.setItem('aqua_notifications', JSON.stringify(notifications));
    loadAdminData();
    showAdminToast(isChecked ? '📦 Order marked as Delivered!' : '🔄 Order status set to In Transit.');
  }
};

window.deleteOrderAdmin = function(orderId) {
  let orders = JSON.parse(localStorage.getItem('aqua_orders') || '[]');
  
  // Find order
  let o = orders.find(ord => ord.id === orderId);
  if (!o) return;

  orderToDeleteId = orderId;
  productToDeleteId = null;

  // Set modal texts for order
  const titleEl = document.getElementById('delete-modal-title');
  const descEl = document.getElementById('delete-modal-desc');
  const confirmBtn = document.getElementById('btn-confirm-delete');
  if (titleEl) titleEl.textContent = 'Delete Order?';
  if (descEl) descEl.textContent = 'You are about to delete this order record. It will be removed from system storage. This action cannot be undone.';
  if (confirmBtn) confirmBtn.textContent = 'Delete Order';

  // Populate preview card inside the custom delete confirmation modal
  const nameEl = document.getElementById('delete-confirm-item-name');
  const priceEl = document.getElementById('delete-confirm-item-price');
  const imgEl = document.getElementById('delete-confirm-img');
  
  const customerName = (o.address && o.address.firstName) ? `${o.address.firstName} ${o.address.lastName}` : (o.customer || 'Guest');
  if (nameEl) nameEl.textContent = `Order ${o.id} (${customerName})`;
  
  // Compute total formatted if missing
  let totalFormatted = '$0.00';
  if (o.total) {
    totalFormatted = o.total;
  } else if (o.items && o.items.length > 0) {
    const subtotal = o.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const shipping = subtotal >= 50 ? 0 : 9.99;
    const discount = subtotal >= 300 ? 100 : 0;
    const calcTotal = Math.max(0, subtotal - discount + shipping);
    totalFormatted = `$${calcTotal.toFixed(2)}`;
  }

  if (priceEl) priceEl.textContent = totalFormatted;
  if (imgEl) {
    let firstItemImg = o.items && o.items[0] && o.items[0].img;
    imgEl.src = firstItemImg || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=100&q=80';
    imgEl.alt = `Order ${o.id}`;
  }

  openModal('delete-confirm-modal');
};

/* ══════════════════════════════
   USERS TABLE & MANAGEMENT
══════════════════════════════ */
let SYSTEM_USERS = [];

// Predefined fallbacks in case backend is offline
const DEFAULT_SYSTEM_USERS = [
  {
    first_name: "Admin",
    last_name: "User",
    email: "24ucs046@gmail.com",
    role: "Admin",
    joined: "2026-05-01",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=00BFCF&color=fff",
    phone: "123-456-7890"
  },
  {
    first_name: "Tony",
    last_name: "Stark",
    email: "tonystarkmark52@gmail.com",
    role: "Customer",
    joined: "2026-05-22",
    avatar: "https://ui-avatars.com/api/?name=Tony+Stark&background=00BFCF&color=fff",
    phone: "9363561221"
  }
];

async function populateUsersTable() {
  const usersBody = document.getElementById('users-body');
  if (!usersBody) return;

  try {
    if (typeof AuthAPI !== 'undefined' && AuthAPI.getUsers) {
      SYSTEM_USERS = await AuthAPI.getUsers();
    } else {
      SYSTEM_USERS = [...DEFAULT_SYSTEM_USERS];
    }
  } catch (err) {
    console.warn("Failed to fetch users from backend, using default list:", err.message);
    SYSTEM_USERS = [...DEFAULT_SYSTEM_USERS];
  }

  // If there are no users fetched (should not happen, but just in case), load defaults
  if (!SYSTEM_USERS || SYSTEM_USERS.length === 0) {
    SYSTEM_USERS = [...DEFAULT_SYSTEM_USERS];
  }

  const userJson = localStorage.getItem('aqua_user');
  let loggedInUser = null;
  if (userJson) {
    try {
      loggedInUser = JSON.parse(userJson);
    } catch (e) {}
  }

  // Sync with current user session if emails match
  if (loggedInUser && loggedInUser.email) {
    const cleanEmail = loggedInUser.email.toLowerCase().trim();
    SYSTEM_USERS.forEach(u => {
      const isMatch = u.role === 'Admin'
        ? (cleanEmail === '24ucs046@gmail.com' || cleanEmail === '24ucs046@gamil.com')
        : (cleanEmail === u.email.toLowerCase().trim());

      if (isMatch) {
        u.first_name = loggedInUser.first_name || u.first_name;
        u.last_name = loggedInUser.last_name || u.last_name;
        u.avatar = loggedInUser.avatar || u.avatar;
        u.email = loggedInUser.email; // Keep actual email format used to log in
        if (loggedInUser.phone) u.phone = loggedInUser.phone;
      }
    });
  }

  // Dynamically update the Active Users count on the dashboard overview
  const totalUsersEl = document.getElementById('dash-total-users');
  if (totalUsersEl) {
    totalUsersEl.textContent = SYSTEM_USERS.length.toString();
  }

  // Update count badge on users section header
  const badge = document.getElementById('users-count-badge');
  if (badge) {
    badge.textContent = `(${SYSTEM_USERS.length})`;
  }

  // Calculate users added today
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const newUsersToday = SYSTEM_USERS.filter(u => u.joined && u.joined.startsWith(todayStr)).length;
  const usersTrendEl = document.getElementById('dash-users-new-today');
  if (usersTrendEl) {
    if (newUsersToday > 0) {
      usersTrendEl.textContent = `+${newUsersToday} new today`;
      usersTrendEl.className = 'stat-trend positive';
    } else {
      usersTrendEl.textContent = '0 new today';
      usersTrendEl.className = 'stat-trend neutral';
    }
  }

  usersBody.innerHTML = SYSTEM_USERS.map((user, index) => {
    const roleBadge = user.role === 'Admin' ? 'success' : 'pending';
    return `
      <tr>
        <td style="text-align: center; font-weight: 600; color: #95a5a6;">${index + 1}</td>
        <td style="display:flex; align-items:center; gap:10px;">
          <img src="${user.avatar}" width="32" style="border-radius:50%;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + '+' + user.last_name)}&background=00BFCF&color=fff'">
          <span style="font-weight:600;">${user.first_name} ${user.last_name}</span>
        </td>
        <td>${user.email}</td>
        <td><span class="status-badge ${roleBadge}">${user.role}</span></td>
        <td>${user.joined}</td>
        <td>
          <button class="action-btn" title="Edit User" onclick="openEditUserModal('${user.email}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete" title="Delete User" onclick="deleteUserAdmin('${user.email}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </td>
      </tr>`;
  }).join('');

  populateUsersDropdown();
  populateNotificationsTable();
}

window.openAdminSelfEdit = function() {
  const userJson = localStorage.getItem('aqua_user');
  let email = '24ucs046@gmail.com';
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user && user.email) {
        email = user.email;
      }
    } catch(e) {}
  }
  openEditUserModal(email);
};

window.openEditUserModal = function(email) {
  const user = SYSTEM_USERS.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (!user) return;

  document.getElementById('edit-user-original-email').value = user.email;
  document.getElementById('edit-user-fname').value = user.first_name;
  document.getElementById('edit-user-lname').value = user.last_name;
  document.getElementById('edit-user-email').value = user.email;
  document.getElementById('edit-user-phone').value = user.phone || '';
  document.getElementById('edit-user-role').value = user.role;

  openModal('user-edit-modal');
};

window.saveUserEdit = async function(e) {
  e.preventDefault();

  const originalEmail = document.getElementById('edit-user-original-email').value;
  const first_name = document.getElementById('edit-user-fname').value.trim();
  const last_name = document.getElementById('edit-user-lname').value.trim();
  const email = document.getElementById('edit-user-email').value.trim();
  const phone = document.getElementById('edit-user-phone').value.trim();

  if (!first_name || !last_name || !email) {
    showAdminToast('⚠️ Please fill in all required fields.', 'warn');
    return;
  }

  try {
    // Call backend API if possible
    if (typeof AuthAPI !== 'undefined' && AuthAPI.updateUser) {
      try {
        await AuthAPI.updateUser(originalEmail, { first_name, last_name, email, phone });
      } catch (err) {
        console.warn('Backend user update skipped/failed:', err.message);
      }
    }

    // Update local SYSTEM_USERS list
    const userIndex = SYSTEM_USERS.findIndex(u => u.email.toLowerCase().trim() === originalEmail.toLowerCase().trim());
    if (userIndex > -1) {
      SYSTEM_USERS[userIndex].first_name = first_name;
      SYSTEM_USERS[userIndex].last_name = last_name;
      SYSTEM_USERS[userIndex].email = email;
      SYSTEM_USERS[userIndex].phone = phone;
      
      const currentAvatar = SYSTEM_USERS[userIndex].avatar;
      const isCustomAvatar = currentAvatar && !currentAvatar.includes('ui-avatars.com') && currentAvatar !== '#';
      if (!isCustomAvatar) {
        SYSTEM_USERS[userIndex].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name + '+' + last_name)}&background=00BFCF&color=fff`;
      }
    }

    // Sync current session if this is the active user
    const loggedJson = localStorage.getItem('aqua_user');
    if (loggedJson) {
      const loggedUser = JSON.parse(loggedJson);
      const isLoggedMatch = originalEmail.toLowerCase().trim() === loggedUser.email.toLowerCase().trim() ||
                            (isAdminEmail(originalEmail) && isAdminEmail(loggedUser.email));
      if (isLoggedMatch) {
        loggedUser.first_name = first_name;
        loggedUser.last_name = last_name;
        loggedUser.email = email;
        loggedUser.phone = phone;
        
        const currentAvatar = loggedUser.avatar;
        const isCustomAvatar = currentAvatar && !currentAvatar.includes('ui-avatars.com') && currentAvatar !== '#';
        if (!isCustomAvatar) {
          loggedUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name + '+' + last_name)}&background=00BFCF&color=fff`;
        }
        
        localStorage.setItem('aqua_user', JSON.stringify(loggedUser));

        // Update dashboard top avatar
        const avatarImg = document.getElementById('admin-top-avatar');
        if (avatarImg) avatarImg.src = loggedUser.avatar;
      }
    }

    closeModal('user-edit-modal');
    loadAdminData();
    showAdminToast('✅ User updated successfully!');
  } catch (err) {
    showAdminToast('❌ Error: ' + err.message, 'error');
  }
};

window.deleteUserAdmin = function(email) {
  userToDeleteEmail = email;
  productToDeleteId = null;
  orderToDeleteId = null;

  const titleEl = document.getElementById('delete-modal-title');
  const descEl = document.getElementById('delete-modal-desc');
  const confirmBtn = document.getElementById('btn-confirm-delete');
  if (titleEl) titleEl.textContent = 'Delete User Account?';
  if (descEl) descEl.textContent = `You are about to delete the user account associated with ${email}. This account will be permanently removed, and the user must register/log in freshly.`;
  if (confirmBtn) confirmBtn.textContent = 'Delete User';

  const nameEl = document.getElementById('delete-confirm-item-name');
  const priceEl = document.getElementById('delete-confirm-item-price');
  const imgEl = document.getElementById('delete-confirm-img');
  
  if (nameEl) nameEl.textContent = email;
  if (priceEl) priceEl.textContent = 'Role: ' + (isAdminEmail(email) ? 'Admin' : 'Customer');
  if (imgEl) {
    imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=00BFCF&color=fff`;
    imgEl.alt = email;
  }

  openModal('delete-confirm-modal');
};

async function deleteUserAdminConfirmed(email) {
  try {
    // Call backend API to delete from database
    if (typeof AuthAPI !== 'undefined' && AuthAPI.deleteUser) {
      try {
        await AuthAPI.deleteUser(email);
      } catch (err) {
        console.warn('Backend user delete skipped/failed:', err.message);
      }
    }

    // Check if the deleted user is the logged-in session user
    const loggedJson = localStorage.getItem('aqua_user');
    let isSelf = false;
    if (loggedJson) {
      const loggedUser = JSON.parse(loggedJson);
      isSelf = (email.toLowerCase().trim() === loggedUser.email.toLowerCase().trim()) ||
               (isAdminEmail(email) && isAdminEmail(loggedUser.email));
    }

    // Remove from local SYSTEM_USERS list
    SYSTEM_USERS = SYSTEM_USERS.filter(u => u.email.toLowerCase().trim() !== email.toLowerCase().trim());

    closeModal('delete-confirm-modal');
    userToDeleteEmail = null;

    if (isSelf) {
      showAdminToast('🗑️ Your account has been deleted. Logging out...', 'error');
      setTimeout(() => {
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
      }, 1500);
    } else {
      loadAdminData();
      showAdminToast('🗑️ User account deleted successfully!', 'error');
    }
  } catch (err) {
    showAdminToast('❌ Error: ' + err.message, 'error');
  }
}

/* ── ADMIN TOAST ── */
function showAdminToast(msg, type = 'success') {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'admin-toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════
   ADMIN NOTIFICATIONS MANAGEMENT
   ══════════════════════════════ */

// Populate the users dropdown in notification form
function populateUsersDropdown() {
  const selectEl = document.getElementById('notif-recipient-select');
  if (!selectEl) return;

  // Preserve the first option ("All Users / Customers")
  selectEl.innerHTML = '<option value="all">All Users / Customers</option>';

  // Add all loaded users from SYSTEM_USERS
  if (SYSTEM_USERS && SYSTEM_USERS.length > 0) {
    SYSTEM_USERS.forEach(u => {
      const email = u.email;
      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || email;
      const option = document.createElement('option');
      option.value = email;
      option.textContent = `${name} (${email})`;
      selectEl.appendChild(option);
    });
  }
}

// Populate sent notifications history (Filtered for admin alerts)
function populateNotificationsTable() {
  const historyBody = document.getElementById('notif-history-body');
  const countEl = document.getElementById('notif-history-count');
  if (!historyBody) return;

  let notifications = JSON.parse(localStorage.getItem('aqua_notifications') || '[]');
  // Filter notifications for admin alerts
  let adminAlerts = notifications.filter(n => n.userEmail === 'admin');

  // Render badge for unread alerts
  const badge = document.getElementById('sidebar-admin-notif-count');
  if (badge) {
    const tabBtn = document.querySelector('.admin-menu-item[data-tab="notifications"]');
    const isActive = tabBtn && tabBtn.classList.contains('active');

    if (isActive) {
      // If the admin is actively viewing notifications, mark any incoming notifications as read automatically
      const hasUnread = adminAlerts.some(n => !n.read);
      if (hasUnread) {
        notifications = notifications.map(n => n.userEmail === 'admin' ? { ...n, read: true } : n);
        localStorage.setItem('aqua_notifications', JSON.stringify(notifications));
        // Update local adminAlerts
        adminAlerts = notifications.filter(n => n.userEmail === 'admin');
      }
    }

    const unreadCount = adminAlerts.filter(n => !n.read).length;
    if (unreadCount > 0 && !isActive) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  if (countEl) {
    countEl.textContent = `(${adminAlerts.length})`;
  }

  if (adminAlerts.length === 0) {
    historyBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:40px; color:#95a5a6; font-weight:500;">
          No alerts or notifications received yet.
        </td>
      </tr>`;
    return;
  }

  historyBody.innerHTML = adminAlerts.map((n, index) => {
    const isPlaced = n.message.toLowerCase().includes('placed');
    const isCancelled = n.message.toLowerCase().includes('cancelled');
    
    let messageStyle = 'color: #4A6670;'; // Default text color
    if (isPlaced) {
      messageStyle = 'color: #27ae60; font-weight: 600;'; // Green color for placed orders
    } else if (isCancelled) {
      messageStyle = 'color: #e74c3c; font-weight: 600;'; // Red color for cancelled orders
    }

    return `
      <tr data-id="${n.notifId}">
        <td style="text-align: center; font-weight: 600; color: #95a5a6;">${index + 1}</td>
        <td style="font-weight:600; max-width:450px; overflow:hidden; text-overflow:ellipsis; white-space:normal; line-height:1.4; ${messageStyle}" title="${n.message}">${n.message}</td>
        <td style="white-space:nowrap;">${n.date}</td>
        <td style="text-align: center;">
          <button class="action-btn delete" title="Clear Alert" onclick="deleteAdminNotification('${n.notifId}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </td>
      </tr>`;
  }).join('');
}

// Send Admin Notification handler
window.sendAdminNotification = function(event) {
  event.preventDefault();

  const recipientSelect = document.getElementById('notif-recipient-select');
  const messageText = document.getElementById('notif-message-text');
  if (!recipientSelect || !messageText) return;

  const recipientVal = recipientSelect.value;
  const message = messageText.value.trim();

  if (!message) {
    showAdminToast('⚠️ Message content cannot be empty.', 'warn');
    return;
  }

  const notifications = JSON.parse(localStorage.getItem('aqua_notifications') || '[]');
  const nowStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (recipientVal === 'all') {
    // Broadcast notification: duplicate for every system user email
    if (SYSTEM_USERS && SYSTEM_USERS.length > 0) {
      SYSTEM_USERS.forEach(u => {
        notifications.unshift({
          notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
          id: '',
          userEmail: u.email,
          message: message,
          date: nowStr,
          read: false
        });
      });
    } else {
      // Fallback in case SYSTEM_USERS is empty
      notifications.unshift({
        notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
        id: '',
        userEmail: 'all',
        message: message,
        date: nowStr,
        read: false
      });
    }
  } else {
    // Direct notification
    notifications.unshift({
      notifId: `notif-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      id: '',
      userEmail: recipientVal,
      message: message,
      date: nowStr,
      read: false
    });
  }

  localStorage.setItem('aqua_notifications', JSON.stringify(notifications));

  // Show success toast, completely reset the form and refresh table
  showAdminToast('✅ Message sent successfully!');
  document.getElementById('admin-notif-form').reset();
  populateNotificationsTable();
};

// Retract/Delete sent notification
window.deleteAdminNotification = function(notifId) {
  let notifications = JSON.parse(localStorage.getItem('aqua_notifications') || '[]');
  notifications = notifications.filter(n => n.notifId !== notifId);
  localStorage.setItem('aqua_notifications', JSON.stringify(notifications));

  populateNotificationsTable();
  showAdminToast(`🗑️ Alert cleared successfully!`, 'error');
};

// Listen for local storage changes from other tabs (e.g. order placed, cancelled or newsletter subscribed)
window.addEventListener('storage', (e) => {
  if (e.key === 'aqua_notifications' || e.key === 'aqua_orders' || e.key === 'aqua_subscribers') {
    loadAdminData();
  }
});

/* ══════════════════════════════
   SUBSCRIBERS TABLE
══════════════════════════════ */
function populateSubscribersTable() {
  const body = document.getElementById('subscribers-body');
  const countBadge = document.getElementById('subscribers-count-badge');
  if (!body) return;

  const subscribers = JSON.parse(localStorage.getItem('aqua_subscribers') || '[]');

  if (countBadge) {
    countBadge.textContent = `(${subscribers.length})`;
  }

  if (subscribers.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:40px; color:#95a5a6;">
          No active subscribers yet.
        </td>
      </tr>`;
    return;
  }

  body.innerHTML = subscribers.map((email, index) => {
    return `
      <tr>
        <td style="text-align: center; font-weight: 600; color: #95a5a6;">${index + 1}</td>
        <td style="font-weight: 600; color: #1A2E35;">${email}</td>
        <td style="text-align: center;">
          <button class="action-btn delete" title="Delete Subscriber" onclick="deleteSubscriberAdmin('${email}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </td>
      </tr>`;
  }).join('');
}

window.deleteSubscriberAdmin = function(email) {
  subscriberToDeleteEmail = email;
  productToDeleteId = null;
  orderToDeleteId = null;
  userToDeleteEmail = null;

  const titleEl = document.getElementById('delete-modal-title');
  const descEl = document.getElementById('delete-modal-desc');
  const confirmBtn = document.getElementById('btn-confirm-delete');
  if (titleEl) titleEl.textContent = 'Remove Subscriber?';
  if (descEl) descEl.textContent = `You are about to remove ${email} from the newsletter subscribers list. This action cannot be undone.`;
  if (confirmBtn) confirmBtn.textContent = 'Remove Subscriber';

  const nameEl = document.getElementById('delete-confirm-item-name');
  const priceEl = document.getElementById('delete-confirm-item-price');
  const imgEl = document.getElementById('delete-confirm-img');
  
  if (nameEl) nameEl.textContent = email;
  if (priceEl) priceEl.textContent = 'Newsletter Subscriber';
  if (imgEl) {
    imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=00BFCF&color=fff`;
    imgEl.alt = email;
  }

  openModal('delete-confirm-modal');
};

