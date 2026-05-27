const fs = require('fs');
const path = require('path');

const htmlDir = path.join(__dirname, 'pages');
const globalCssFile = path.join(__dirname, 'css', 'global.css');

// 1. Add standard footer CSS to global.css
const standardFooterCss = `
/* ══════════════════════════════
   GLOBAL FOOTER (Unified)
══════════════════════════════ */
footer.global-footer {
  background: #0D2028 !important; color: rgba(255,255,255,.7) !important;
  padding: 52px 32px 24px !important;
  margin-top: auto !important; /* to push it down if flex body */
}
footer.global-footer .footer-grid {
  display: grid !important; grid-template-columns: 1.4fr 1fr 1fr 1.2fr !important;
  gap: 36px !important; max-width: 1200px !important; margin: 0 auto 36px !important;
}
footer.global-footer .footer-brand .f-logo {
  font-family: 'Nunito', sans-serif !important; font-size: 1.3rem !important;
  font-weight: 900 !important; color: var(--aqua) !important; margin-bottom: 10px !important;
}
footer.global-footer .footer-brand p { font-size: .82rem !important; line-height: 1.7 !important; margin-bottom: 18px !important; }
footer.global-footer .social-icons { display: flex !important; gap: 10px !important; }
footer.global-footer .social-btn {
  width: 36px !important; height: 36px !important; border-radius: 10px !important;
  background: rgba(255,255,255,.07) !important; border: 1px solid rgba(255,255,255,.1) !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  color: rgba(255,255,255,.6) !important; transition: all .2s !important;
}
footer.global-footer .social-btn:hover { background: var(--aqua) !important; color: #fff !important; border-color: var(--aqua) !important; }
footer.global-footer .social-btn svg { width: 16px !important; height: 16px !important; }

footer.global-footer .footer-col h4 { font-size: .875rem !important; font-weight: 700 !important; color: #fff !important; margin-bottom: 14px !important; }
footer.global-footer .footer-col ul { list-style: none !important; }
footer.global-footer .footer-col ul li { margin-bottom: 9px !important; }
footer.global-footer .footer-col ul li a { font-size: .82rem !important; color: rgba(255,255,255,.55) !important; transition: color .2s !important; }
footer.global-footer .footer-col ul li a:hover { color: var(--aqua) !important; }
footer.global-footer .contact-item { display: flex !important; align-items: flex-start !important; gap: 10px !important; margin-bottom: 10px !important; font-size: .82rem !important; }
footer.global-footer .contact-item svg { width: 15px !important; height: 15px !important; color: var(--aqua) !important; flex-shrink: 0 !important; margin-top: 2px !important; }

footer.global-footer .footer-bottom {
  border-top: 1px solid rgba(255,255,255,.07) !important;
  padding-top: 20px !important; text-align: center !important;
  font-size: .78rem !important; color: rgba(255,255,255,.3) !important;
  max-width: 1200px !important; margin: 0 auto !important;
}
footer.global-footer .footer-bottom a { color: rgba(255,255,255,.4) !important; }
footer.global-footer .footer-bottom a:hover { color: var(--aqua) !important; }

@media (max-width: 1024px) {
  footer.global-footer .footer-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 768px) {
  footer.global-footer .footer-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
}
`;

fs.appendFileSync(globalCssFile, standardFooterCss);

// 2. Standard Footer HTML snippet
const standardFooterHtml = `<footer class="global-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="f-logo">AquaShop</div>
      <p>Your trusted destination for premium quality products at affordable prices. Shop with confidence and enjoy amazing deals!</p>
      <div class="social-icons">
        <a class="social-btn" href="#" title="Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a class="social-btn" href="#" title="Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
        </a>
        <a class="social-btn" href="#" title="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
        </a>
        <a class="social-btn" href="#" title="YouTube">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="shop.html">Shop All Products</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="contact.html">Contact Us</a></li>
        <li><a href="order-tracking.html">Track Order</a></li>
        <li><a href="wishlist.html">Wishlist</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Customer Service</h4>
      <ul>
        <li><a href="contact.html">Help Center</a></li>
        <li><a href="order-tracking.html">Track Your Order</a></li>
        <li><a href="cart.html">Shopping Cart</a></li>
        <li><a href="checkout.html">Checkout</a></li>
        <li><a href="contact.html">FAQ</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Contact Us</h4>
      <div class="contact-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>123 Shopping Street, New York, NY 10001</span>
      </div>
      <div class="contact-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span>+1 (555) 123-4567</span>
      </div>
      <div class="contact-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/></svg>
        <span>support@aquashop.com</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    © 2026 AquaShop. All rights reserved. &nbsp;|&nbsp;
    <a href="#">Privacy Policy</a> &nbsp;|&nbsp;
    <a href="#">Terms of Service</a>
  </div>
</footer>`;

// 3. Update all HTML files except login.html
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html') && f !== 'login.html');
htmlFiles.forEach(file => {
  let content = fs.readFileSync(path.join(htmlDir, file), 'utf8');
  content = content.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i, standardFooterHtml);
  fs.writeFileSync(path.join(htmlDir, file), content);
});

console.log("Done");
