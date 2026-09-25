import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// ---------- Menu items ----------
export async function getMenuItems() {
  const snap = await getDocs(
    query(collection(db, "menuItems"), orderBy("category"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function addMenuItem(item) {
  return addDoc(collection(db, "menuItems"), item);
}

export function updateMenuItem(id, item) {
  return updateDoc(doc(db, "menuItems", id), item);
}

export function deleteMenuItem(id) {
  return deleteDoc(doc(db, "menuItems", id));
}

// ---------- Celebration packages ----------
export async function getPackages() {
  const snap = await getDocs(collection(db, "packages"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function addPackage(pkg) {
  return addDoc(collection(db, "packages"), pkg);
}

export function deletePackage(id) {
  return deleteDoc(doc(db, "packages", id));
}

// ---------- Fallback sample data ----------
// Shown only if Firestore has no menuItems/packages yet, so the
// site looks complete before you've added real data in the admin panel.
export const SAMPLE_MENU = [
  { category: "Chai & Coffee", name: "Masala Chai", price: "50", description: "Strong ginger-cardamom tea, brewed fresh." },
  { category: "Chai & Coffee", name: "Filter Coffee", price: "60", description: "South Indian style, served in a davara tumbler." },
  { category: "Chai & Coffee", name: "Cold Coffee", price: "90", description: "Thick, blended, sweet and creamy." },
  { category: "Snacks", name: "Veg Club Sandwich", price: "120", description: "Toasted bread with paneer, veggies and chutney." },
  { category: "Snacks", name: "Samosa Chaat", price: "80", description: "Crispy samosa topped with chole, curd and chutneys." },
  { category: "Meals", name: "Paneer Butter Masala with Roti", price: "180", description: "Creamy tomato gravy with 2 fresh rotis." },
];

export const SAMPLE_PACKAGES = [
  { name: "Chhota Party", price: "300", description: "A reserved corner for up to 10 guests with decoration, snacks plate, and cold drinks.", includes: "10 seats · 1.5 hrs · snacks & drinks" },
  { name: "Birthday Bash", price: "500", description: "Window table styled for your birthday, cake cutting setup, printed menu card, and special snacks.", includes: "20 seats · 1.5 hrs · cake & snacks" },
  { name: "Full Hall Booking", price: "600", description: "Private use of the full cafe for big parties, full catering, decoration, and DJ setup.", includes: "50 seats · 1.5 hrs · full catering" },
];
