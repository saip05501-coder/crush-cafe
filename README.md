# Kettle & Ash — Cafe Website

A pure HTML / CSS / vanilla JavaScript cafe website with Firebase for
authentication and data (no React, no build step, no npm packages).

## What's included

- `index.html` — home page
- `menu.html` — menu, grouped by category
- `book-table.html` — table booking (requires login)
- `celebrations.html` — celebration/birthday packages + booking (requires login)
- `my-bookings.html` — a logged-in user's bookings, with cancel
- `login.html` / `signup.html` — Firebase email/password auth
- `admin.html` — admin dashboard (stats)
- `admin-bookings.html` — admin: view/delete any booking
- `admin-menu.html` — admin: add/delete menu items
- `contact.html` — contact info + a simple client-side form
- `firestore.rules` — security rules to paste into the Firebase console
- `css/style.css` — the whole site's styling
- `js/firebaseConfig.js` — your Firebase project keys go here
- `js/auth.js`, `js/booking.js`, `js/menu.js`, `js/layout.js` — logic

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com and create a project.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (start in production mode).
4. **Project settings → General → Your apps → Add app → Web (`</>`)** — copy the config object.

## 2. Add your config

Open `js/firebaseConfig.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

## 3. Add the security rules

Open **Firestore Database → Rules** in the Firebase console, and paste in
the contents of `firestore.rules`, then click **Publish**.

## 4. Run it locally

This is a static site — no build step. The easiest way to serve it (module
imports need `http://`, not `file://`) is:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed local URL in your browser.

## 5. Make yourself an admin

1. Sign up for an account on the site.
2. In the Firebase console, go to **Firestore Database → users → (your uid)**.
3. Edit the `isAdmin` field from `false` to `true`.
4. Reload the site — an **Admin** link will appear in the navbar.

## 6. Add real menu items & packages

Use `admin-menu.html` to add menu items once you're an admin. Celebration
packages currently come from a sample list in `js/menu.js`
(`SAMPLE_PACKAGES`) — to make these editable too, duplicate the pattern
used for menu items (a `packages` Firestore collection, already wired up
in `js/menu.js` via `addPackage` / `getPackages` / `deletePackage`) and
build a small form for it on `admin-menu.html`, the same way the menu-item
form works.

## Notes

- Until you add real data, the site shows sample menu items and
  celebration packages so pages don't look empty — replace them by
  adding real entries in the admin panel.
- All Firebase calls use the modular v10 SDK loaded directly from
  `gstatic.com` via `<script type="module">` — no npm install needed.
