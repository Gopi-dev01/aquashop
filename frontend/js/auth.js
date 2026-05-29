function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
  const tabEl = document.getElementById('tab-' + tab);
  if (tabEl) tabEl.classList.add('active');
  document.getElementById('form-' + tab).classList.add('active');
  clearErrors();
}

/* ── TOGGLE PASSWORD VISIBILITY ── */
function togglePass(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;
}

/* ── PASSWORD STRENGTH ── */
const strengthColors = ['#FF5A5F', '#FFAA00', '#00BFCF', '#00C896'];
const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

function checkStrength(val) {
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  ['s1','s2','s3','s4'].forEach((id, i) => {
    document.getElementById(id).style.background =
      i < score ? strengthColors[score - 1] : '#E0EEF2';
  });

  const label = document.getElementById('s-label');
  label.textContent  = val.length ? strengthLabels[score - 1] || '' : '';
  label.style.color  = val.length ? strengthColors[score - 1] : '';
}

/* ── VALIDATION HELPERS ── */
function showErr(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
}
function hideErr(id) { document.getElementById(id).classList.remove('show'); }
function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
}
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhone(v) { return v.length >= 7; }


/* ── TOAST ── */
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ══════════════════════════════
   LOGIN
══════════════════════════════ */
async function handleLogin() {
  let ok = true;
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (!isEmail(email)) { showErr('login-email-err', 'Please enter a valid email.'); ok = false; }
  else hideErr('login-email-err');

  if (!pass) { showErr('login-pass-err', 'Password is required.'); ok = false; }
  else hideErr('login-pass-err');

  if (!ok) return;

  try {
    showToast('🔐 Signing you in…');
    const data = await AuthAPI.login(email, pass);
    localStorage.removeItem('aqua_user');
    localStorage.removeItem('aqua_cart');
    localStorage.removeItem('aqua_wishlist');
    localStorage.removeItem('last_order_id');
    localStorage.setItem('aqua_token', data.access_token);
    localStorage.setItem('aqua_user',  JSON.stringify(data.user));
    showToast('✅ Welcome back!');
    setTimeout(() => window.location.href = 'home.html', 1000);
  } catch (err) {
    showToast('❌ ' + err.message);
  }
}

/* ══════════════════════════════
   SIGNUP
══════════════════════════════ */
async function handleSignup() {
  let ok = true;
  const fn    = document.getElementById('su-fname').value.trim();
  const ln    = document.getElementById('su-lname').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const phone = document.getElementById('su-phone').value.trim();
  const pass  = document.getElementById('su-pass').value;
  const cpass = document.getElementById('su-cpass').value;

  if (!fn)            { showErr('su-fname-err',  'First name is required.');    ok = false; } else hideErr('su-fname-err');
  if (!ln)            { showErr('su-lname-err',  'Last name is required.');     ok = false; } else hideErr('su-lname-err');
  if (!isEmail(email)){ showErr('su-email-err',  'Valid email required.');      ok = false; } else hideErr('su-email-err');
  if (!isPhone(phone)){ showErr('su-phone-err',  'Valid phone required.');      ok = false; } else hideErr('su-phone-err');
  if (pass.length < 8){ showErr('su-pass-err',   'Min. 8 characters.');         ok = false; } else hideErr('su-pass-err');
  if (pass !== cpass) { showErr('su-cpass-err',  'Passwords do not match.');    ok = false; } else hideErr('su-cpass-err');

  if (!ok) return;

  try {
    showToast('✨ Creating your account…');
    const data = await AuthAPI.register({
      first_name: fn,
      last_name:  ln,
      email,
      phone,
      password: pass
    });
    localStorage.removeItem('aqua_user');
    localStorage.removeItem('aqua_cart');
    localStorage.removeItem('aqua_wishlist');
    localStorage.removeItem('last_order_id');
    localStorage.setItem('aqua_token', data.access_token);
    localStorage.setItem('aqua_user',  JSON.stringify(data.user));
    showToast('🎉 Welcome to AquaShop!');
    setTimeout(() => window.location.href = 'home.html', 1000);
  } catch (err) {
    showToast('❌ ' + err.message);
  }
}

/* ══════════════════════════════
   GOOGLE AUTH
══════════════════════════════ */
function handleGoogleAuth() {
  showToast('🔗 Redirecting to Google…');
  setTimeout(() => AuthAPI.google(), 800);
}

/* ══════════════════════════════
   RESET PASSWORD
   ══════════════════════════════ */
async function handleResetPassword() {
  let ok = true;
  const email = document.getElementById('forgot-email').value.trim();
  const pass  = document.getElementById('forgot-pass').value;
  const cpass = document.getElementById('forgot-cpass').value;

  if (!isEmail(email)) { showErr('forgot-email-err', 'Please enter a valid email.'); ok = false; }
  else hideErr('forgot-email-err');

  if (pass.length < 8) { showErr('forgot-pass-err', 'Password must be at least 8 characters.'); ok = false; }
  else hideErr('forgot-pass-err');

  if (pass !== cpass) { showErr('forgot-cpass-err', 'Passwords do not match.'); ok = false; }
  else hideErr('forgot-cpass-err');

  if (!ok) return;

  try {
    showToast('🔑 Updating your password…');
    await AuthAPI.resetPassword(email, pass);
    showToast('✅ Password updated successfully! Please Sign In.');
    
    // Clear inputs
    document.getElementById('forgot-email').value = '';
    document.getElementById('forgot-pass').value = '';
    document.getElementById('forgot-cpass').value = '';
    
    setTimeout(() => switchTab('login'), 1500);
  } catch (err) {
    showToast('❌ ' + err.message);
  }
}
