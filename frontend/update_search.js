const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'css', 'pages');
const htmlDir = path.join(__dirname, 'pages');
const globalCssFile = path.join(__dirname, 'css', 'global.css');
const shopJsFile = path.join(__dirname, 'js', 'pages', 'shop.js');

// 1. Add standard .nav-search to global.css
const standardNavSearch = `
/* ══════════════════════════════
   NAV SEARCH (Unified)
══════════════════════════════ */
.nav-search { flex: 1; max-width: 400px !important; position: relative; }
.nav-search input {
  width: 100%; padding: 10px 16px 10px 42px !important;
  border: 1.5px solid #DFF0F4 !important; border-radius: 50px !important;
  font-size: .875rem !important; color: var(--text-dark) !important; background: var(--off-white) !important;
  outline: none; transition: border-color .2s, box-shadow .2s;
  font-family: 'Poppins', sans-serif !important;
  height: auto !important; margin: 0 !important;
}
.nav-search input:focus { border-color: var(--aqua) !important; box-shadow: 0 0 0 3px var(--aqua-glow) !important; }
.nav-search input::placeholder { color: var(--text-light) !important; }
.nav-search .search-icon, .nav-search .s-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: var(--text-light); display: flex;
}
.nav-search .search-icon svg, .nav-search .s-icon svg { width: 16px; height: 16px; }

@media (max-width: 768px) {
  .nav-search { max-width: 200px !important; }
}
`;
fs.appendFileSync(globalCssFile, standardNavSearch);

// 2. Update shop.js
let shopJsContent = fs.readFileSync(shopJsFile, 'utf8');
if (!shopJsContent.includes("params.get('search')")) {
  shopJsContent = shopJsContent.replace(
    "const sale   = params.get('sale');",
    "const sale   = params.get('sale');\n  const q      = params.get('search');"
  );
  shopJsContent = shopJsContent.replace(
    "  if (sale === 'true') {\n    state.filtered = ALL_PRODUCTS.filter(p => p.discount > 0);\n  }",
    "  if (sale === 'true') {\n    state.filtered = ALL_PRODUCTS.filter(p => p.discount > 0);\n  }\n  if (q) {\n    const searchInput = document.querySelector('.nav-search input');\n    if(searchInput) searchInput.value = q;\n    onSearch(q);\n  }"
  );
  fs.writeFileSync(shopJsFile, shopJsContent);
}

// 3. Add onkeydown to all HTML files
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html') && f !== 'login.html');
htmlFiles.forEach(file => {
  let content = fs.readFileSync(path.join(htmlDir, file), 'utf8');
  
  if (file === 'shop.html') {
    // shop.html already handles this via oninput calling onSearch(),
    // but we can add onkeydown as well to prevent default or simply refresh page.
    // The user's request: "when user search any products then press enter it goes to shop page". 
    // They are already in shop page so it just updates instantly, but hitting enter shouldn't break anything.
  } else {
    // If it doesn't already have onkeydown
    if (!content.includes('onkeydown="if(event.key===\'Enter\')')) {
        // We look for the <input type="text" placeholder="Search products..." ... > inside .nav-search
        content = content.replace(
        /(<div class="nav-search">[\s\S]*?<input type="text" placeholder="Search products...")([^>]*>)/,
        '$1 onkeydown="if(event.key===\'Enter\') window.location.href=\'shop.html?search=\'+encodeURIComponent(this.value)"$2'
        );
        fs.writeFileSync(path.join(htmlDir, file), content);
    }
  }
});

console.log("Done");
