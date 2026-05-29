/* ═══════════════════════════════════════
   contact.js — AquaShop Contact Page Logic
   ═══════════════════════════════════════ */

/* ── AUTH GUARD ── */
(function () {
  const token = localStorage.getItem('aqua_token');
  if (!token) window.location.href = '../pages/login.html';
})();

/* ── NAVBAR ── */
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

/* ── BADGE COUNTS ── */
function updateBadges() {
  const cart = JSON.parse(localStorage.getItem('aqua_cart') || '[]');
  const wish = JSON.parse(localStorage.getItem('aqua_wishlist') || '[]');
  const cb = document.getElementById('cart-count');
  const wb = document.getElementById('wish-count');
  if (cb) cb.textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (wb) wb.textContent = wish.length;
}

/* ── VALIDATION ── */
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}
function hideErr(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
}

/* ── SEND MESSAGE ── */
async function sendMessage() {
  clearErrors();
  let ok = true;

  const firstName = document.getElementById('first-name').value.trim();
  const lastName  = document.getElementById('last-name').value.trim();
  const email     = document.getElementById('contact-email').value.trim();
  const phone     = document.getElementById('contact-phone').value.trim();
  const subject   = document.getElementById('contact-subject').value.trim();
  const message   = document.getElementById('contact-message').value.trim();

  if (!firstName) { showErr('err-fname',   'First name is required.');     ok = false; } else hideErr('err-fname');
  if (!lastName)  { showErr('err-lname',   'Last name is required.');      ok = false; } else hideErr('err-lname');
  if (!isEmail(email)) { showErr('err-email', 'Valid email is required.'); ok = false; } else hideErr('err-email');
  if (!subject)   { showErr('err-subject', 'Subject is required.');        ok = false; } else hideErr('err-subject');
  if (!message)   { showErr('err-message', 'Message is required.');        ok = false; } else hideErr('err-message');

  if (!ok) return;

  // Disable button
  const btn = document.getElementById('send-btn');
  btn.disabled   = true;
  btn.innerHTML  = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         style="animation:spin .8s linear infinite;width:18px;height:18px">
      <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
    </svg>
    Sending...`;

  try {
    // ── Send to Email (FormSubmit.co) & Local API ──
    const [emailRes] = await Promise.all([
      fetch('https://formsubmit.co/ajax/24ucs046@muthayammal.in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `New AquaShop Contact: ${subject}`,
          Name:     `${firstName} ${lastName}`,
          Email:    email,
          Phone:    phone || 'N/A',
          Subject:  subject,
          Message:  message,
          _template: 'table'
        })
      }),
      ContactAPI.send({
        name:    `${firstName} ${lastName}`,
        email,
        phone:   phone || '',
        subject,
        message,
      })
    ]);

    if (!emailRes.ok) throw new Error('Email service failed');

    // Show success
    document.getElementById('contact-form').style.display = 'none';
    document.getElementById('success-msg').classList.add('show');

  } catch (err) {
    showToast('❌ Failed to send. Please try again.');
    btn.disabled  = false;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      Send Message`;
  }
}

/* ── RESET FORM ── */
function resetForm() {
  document.getElementById('contact-form').style.display = 'block';
  document.getElementById('success-msg').classList.remove('show');
  
  // Manually clear all fields since #contact-form is a div
  document.getElementById('first-name').value = '';
  document.getElementById('last-name').value = '';
  document.getElementById('contact-email').value = '';
  document.getElementById('contact-phone').value = '';
  document.getElementById('contact-subject').value = '';
  document.getElementById('contact-message').value = '';
  
  clearErrors();
  const btn = document.getElementById('send-btn');
  btn.disabled  = false;
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
    Send Message`;
}

/* ── TOAST ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── SPIN ANIMATION ── */
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

/* ── FAQ TOGGLE ── */
function initFAQ() {
  const btn = document.getElementById('view-all-faq');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const hiddenItems = document.querySelectorAll('.faq-item.hidden-faq');
    hiddenItems.forEach(item => {
      item.classList.remove('hidden-faq');
      // Optional: Add a small animation/fade in
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.5s ease';
      setTimeout(() => item.style.opacity = '1', 10);
    });
    btn.style.display = 'none'; // Hide button after showing all
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateBadges();
  initFAQ();
});


