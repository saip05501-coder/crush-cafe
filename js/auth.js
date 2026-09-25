import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// ---------- Core auth actions ----------

export async function signUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  // Create the user's profile doc in Firestore.
  // isAdmin defaults to false — flip it to true manually in the
  // Firestore console for your own account to unlock the admin panel.
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  });

  return cred.user;
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;

  // Create a Firestore profile if this is a new Google user
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      name:      user.displayName || "",
      email:     user.email || "",
      isAdmin:   false,
      createdAt: new Date().toISOString(),
    });
  }
  return user;
}

export function logOut() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ---------- Navbar wiring (runs on every page) ----------
// Expects the navbar to contain elements with these data attributes:
// [data-auth="guest"]  -> shown when logged OUT
// [data-auth="user"]   -> shown when logged IN (non-admin only)
// [data-auth="admin"]  -> shown when logged IN AND isAdmin === true
// [data-logout]        -> logout button
// [data-user-name]     -> filled with the user's display name

function wireNavbar(user, profile) {
  const isAdmin = !!(user && profile?.isAdmin);
  const isUser  = !!(user && !isAdmin);
  const isGuest = !user;

  // Use explicit "inline" for nav links so there's no ambiguity.
  // BUG FIX: Previously used display:"" (empty string) which meant the browser
  // fell back to the element's CSS default — sometimes "block" or "inline",
  // causing ALL items to appear visible before auth fired.
  document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
    el.style.display = isGuest ? "inline" : "none";
  });
  document.querySelectorAll('[data-auth="user"]').forEach((el) => {
    el.style.display = user ? "inline" : "none";
  });
  document.querySelectorAll('[data-auth="admin"]').forEach((el) => {
    // BUG FIX: Only show Admin link when user IS an admin.
    // Previously this fired before profile was loaded, showing Admin briefly.
    el.style.display = isAdmin ? "inline" : "none";
  });
  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = profile?.name || user?.email || "";
  });
  document.querySelectorAll("[data-logout]").forEach((el) => {
    el.onclick = async (e) => {
      e.preventDefault();
      await logOut();
      window.location.href = "index.html";
    };
  });

  // NOTE: Mobile nav toggle is wired once by layout.js (renderLayout).
  // Do NOT add another listener here — duplicate listeners cause the menu
  // to toggle twice (open then immediately close) on mobile.
}

// ---------- Auth state observer ----------
// BUG FIX: The previous code used a requestAnimationFrame retry loop with no
// cancellation token. If onAuthStateChanged fired multiple times (e.g. cached
// state then network-verified state), multiple concurrent loops ran, each
// calling wireNavbar with stale data → Login + Logout + Admin all showed
// simultaneously.
//
// Fix: Use a single cancellation counter (_generation). Every time a new auth
// callback fires, we increment the counter. Each pending RAF loop checks
// whether its generation is still current before applying — stale loops abort.

let _generation = 0;

watchAuth(async (user) => {
  const gen = ++_generation; // This callback's generation ID

  let profile = null;
  if (user) {
    try {
      profile = await getUserProfile(user.uid);
    } catch (err) {
      console.error("Could not load profile:", err);
    }
  }

  // If a newer auth callback fired while we were fetching the profile, abort.
  if (gen !== _generation) return;

  // Persist auth state to localStorage so layout.js can instantly apply the
  // correct nav visibility on the NEXT page load — before Firebase even fires.
  // This eliminates the flash where only the first 5 nav items show briefly.
  try {
    if (user) {
      localStorage.setItem("ka_auth", JSON.stringify({
        loggedIn: true,
        isAdmin: !!(profile?.isAdmin),
      }));
    } else {
      // User logged out — clear cache so next page shows Login correctly.
      localStorage.removeItem("ka_auth");
    }
  } catch (_) { /* ignore storage errors (private browsing, etc.) */ }

  // Wait for renderLayout() to inject the navbar HTML if it hasn't yet,
  // then wire it. Abort if superseded by a newer auth callback.
  function applyWhenReady() {
    if (gen !== _generation) return; // superseded — stop retrying
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      wireNavbar(user, profile);
      document.dispatchEvent(
        new CustomEvent("authready", { detail: { user, profile } })
      );
    } else {
      requestAnimationFrame(applyWhenReady);
    }
  }

  applyWhenReady();
});

// ---------- Route guards ----------
// Call from a page's own script:
//   requireAuth();        -> bounces guests to login.html
//   requireAdmin();       -> bounces non-admins to index.html

export function requireAuth(redirectTo = "login.html") {
  document.addEventListener("authready", (e) => {
    if (!e.detail.user) window.location.href = redirectTo;
  });
}

export function requireAdmin(redirectTo = "index.html") {
  document.addEventListener("authready", (e) => {
    if (!e.detail.user || !e.detail.profile?.isAdmin) {
      window.location.href = redirectTo;
    }
  });
}
