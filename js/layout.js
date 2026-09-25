// Injects the shared navbar and footer into any page that has
// <div id="site-nav"></div> and <div id="site-footer"></div>.
// Pass the current page's filename so the right nav link gets the
// "active" state, e.g. renderLayout("menu.html").

// ---------- Instant nav visibility from localStorage cache ----------
// auth.js saves { loggedIn, isAdmin } to localStorage after Firebase confirms.
// We read it here so nav items show correctly THE INSTANT the nav HTML is
// injected — with zero waiting for Firebase (no flash, no pop-in).
function applyNavCache(navEl) {
  let cached = null;
  try {
    const raw = localStorage.getItem("ka_auth");
    if (raw) cached = JSON.parse(raw);
  } catch (_) { /* ignore parse errors */ }

  // No cached state yet (e.g. first-ever visit) — CSS hides everything by
  // default (.nav-links [data-auth] { display:none }) until auth.js fires.
  if (!cached) return;

  const showGuest = !cached.loggedIn;
  const showUser  = cached.loggedIn;
  const showAdmin = cached.loggedIn && cached.isAdmin;

  navEl.querySelectorAll('[data-auth="guest"]').forEach(el => {
    el.style.display = showGuest ? "inline" : "none";
  });
  navEl.querySelectorAll('[data-auth="user"]').forEach(el => {
    el.style.display = showUser ? "inline" : "none";
  });
  navEl.querySelectorAll('[data-auth="admin"]').forEach(el => {
    el.style.display = showAdmin ? "inline" : "none";
  });
}

export function renderLayout(current = "") {
  const nav = document.getElementById("site-nav");
  const footer = document.getElementById("site-footer");

  const link = (href, label) =>
    `<a href="${href}" class="${current === href ? "active" : ""}">${label}</a>`;

  if (nav) {
    nav.innerHTML = `
      <div class="nav-inner">
        <a href="index.html" class="brand">
          <span class="brand-mark">C</span> Crush Cafe
        </a>
        <button class="nav-toggle" aria-label="Menu">&#9776;</button>
        <div class="nav-links">
          ${link("index.html", "Home")}
          ${link("menu.html", "Menu")}
          ${link("book-table.html", "Book a Table")}
          ${link("celebrations.html", "Celebrations")}
          ${link("contact.html", "Contact")}
          <a href="my-bookings.html" data-auth="user" class="${current === "my-bookings.html" ? "active" : ""}">My Bookings</a>
          <a href="admin.html" data-auth="admin">Admin</a>
          <a href="login.html" data-auth="guest" class="nav-cta">Login</a>
          <a href="#" data-auth="user" data-logout>Log Out</a>
        </div>
      </div>
    `;

    // Apply cached auth state IMMEDIATELY (synchronous) so the nav items are
    // correct before the browser paints the first frame — no flash at all.
    applyNavCache(nav);

    // ── Mobile nav toggle ──────────────────────────────────────────────
    const toggle = nav.querySelector(".nav-toggle");
    const links  = nav.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        links.classList.toggle("open");
      });
      // Close nav when clicking anywhere outside it
      document.addEventListener("click", (e) => {
        if (!nav.contains(e.target)) {
          links.classList.remove("open");
        }
      });
      // Close nav when a nav link is clicked (page stays same, SPA-style)
      links.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => links.classList.remove("open"));
      });
    }
  }

  if (footer) {
    footer.innerHTML = `
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <h4>Crush Cafe</h4>
            <p style="max-width:36ch; opacity:0.85;">Freshly brewed chai, coffee, and snacks — a cosy place to sit, eat, and enjoy with family and friends.</p>
          </div>
          <div>
            <h4>Links</h4>
            <a href="menu.html">Menu</a>
            <a href="book-table.html">Book a Table</a>
            <a href="celebrations.html">Celebrations</a>
          </div>
          <div>
            <h4>Cafe</h4>
            <a href="contact.html">Contact &amp; Timings</a>
            <a href="login.html">Account</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} Crush Cafe</span>
          <span>Islampur, 415414</span>
        </div>
      </div>
    `;
  }
}
