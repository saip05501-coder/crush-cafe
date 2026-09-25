import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Rejects after ms milliseconds — prevents Firestore from hanging forever
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

export async function createBooking(booking) {
  return addDoc(collection(db, "bookings"), {
    ...booking,
    createdAt: new Date().toISOString(),
  });
}

export async function getUserBookings(uid) {
  const q = query(collection(db, "bookings"), where("userId", "==", uid));
  const snap = await withTimeout(getDocs(q));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAllBookings() {
  // orderBy needs an index — sort client-side to avoid index requirement
  const snap = await withTimeout(getDocs(collection(db, "bookings")));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function deleteBooking(id) {
  return deleteDoc(doc(db, "bookings", id));
}

// ---------- Contact Messages ----------
export async function saveContactMessage(msg) {
  return withTimeout(
    addDoc(collection(db, "contactMessages"), {
      ...msg,
      createdAt: new Date().toISOString(),
    })
  );
}

export async function getAllMessages() {
  // No orderBy — avoids needing a Firestore index. Sort client-side.
  const snap = await withTimeout(getDocs(collection(db, "contactMessages")));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function deleteMessage(id) {
  return deleteDoc(doc(db, "contactMessages", id));
}
