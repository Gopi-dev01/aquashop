const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]')
  ? 'http://localhost:8000'
  : 'https://aquashops-backend.onrender.com';

/* ── HELPER ── */
async function request(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('aqua_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Something went wrong');
  return data;
}

/* ══════════════════════════════
   AUTH
══════════════════════════════ */
const AuthAPI = {
  login: (email, password) => request('/auth/login', 'POST', { email, password }),
  register: (payload) => request('/auth/register', 'POST', payload),
  google: () => window.location.href = `${API_BASE}/auth/google`,
  updateUser: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}`, 'PUT', payload),
  deleteUser: (email) => request(`/auth/users/${encodeURIComponent(email)}`, 'DELETE'),
  getUsers: () => request('/auth/users'),
  logout: () => {
    localStorage.removeItem('aqua_token');
    localStorage.removeItem('aqua_user');
    localStorage.removeItem('aqua_cart');
    localStorage.removeItem('aqua_wishlist');
    localStorage.removeItem('last_order_id');
    window.location.href = 'login.html';
  }
};

/* ══════════════════════════════
   PRODUCTS
══════════════════════════════ */
const ProductAPI = {
  getAll: (params = '') => request(`/products?${params}`),
  getById: (id) => request(`/products/${id}`),
  search: (query) => request(`/products/search?q=${query}`),
  getByCategory: (cat) => request(`/products?category=${cat}`)
};

/* ══════════════════════════════
   REVIEWS
   ══════════════════════════════ */
const ReviewAPI = {
  get: (productId) => request(`/products/${productId}/reviews`),
  add: (productId, payload) => request(`/products/${productId}/reviews`, 'POST', payload)
};

/* ══════════════════════════════
   CART
══════════════════════════════ */
const CartAPI = {
  get: () => request('/cart'),
  add: (product_id, quantity = 1) => request('/cart/add', 'POST', { product_id, quantity }),
  update: (product_id, quantity) => request('/cart/update', 'PUT', { product_id, quantity }),
  remove: (product_id) => request('/cart/remove', 'DELETE', { product_id }),
  clear: () => request('/cart/clear', 'DELETE')
};

/* ══════════════════════════════
   WISHLIST
══════════════════════════════ */
const WishlistAPI = {
  get: () => request('/wishlist'),
  add: (product_id) => request('/wishlist/add', 'POST', { product_id }),
  remove: (product_id) => request('/wishlist/remove', 'DELETE', { product_id })
};

/* ══════════════════════════════
   ORDERS
══════════════════════════════ */
const OrderAPI = {
  getAll: (adminView = false) => request(`/orders${adminView ? '?admin_view=true' : ''}`),
  getById: (id) => request(`/orders/${encodeURIComponent(id)}`),
  track: (id) => request(`/orders/${encodeURIComponent(id)}/track`),
  place: (payload) => request('/orders', 'POST', payload),
  cancel: (id) => request(`/orders/${encodeURIComponent(id)}/cancel`, 'PUT'),
  update: (id, payload) => request(`/orders/${encodeURIComponent(id)}`, 'PUT', payload)
};

/* ══════════════════════════════
   CHECKOUT
══════════════════════════════ */
const CheckoutAPI = {
  initiate: (payload) => request('/checkout', 'POST', payload),
  confirm: (payload) => request('/checkout/confirm', 'POST', payload)
};

/* ══════════════════════════════
   USER / DASHBOARD
══════════════════════════════ */
const UserAPI = {
  getProfile: () => request('/auth/profile'),
  updateProfile: (payload) => request('/auth/profile', 'PUT', payload),
  getAddresses: () => request('/user/addresses'),
  addAddress: (payload) => request('/user/addresses', 'POST', payload)
};

/* ══════════════════════════════
   CONTACT
══════════════════════════════ */
const ContactAPI = {
  send: (payload) => request('/contact', 'POST', payload)
};