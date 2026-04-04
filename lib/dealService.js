"use client";

import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

const dealsRef = collection(db, "deals");

// Create new deal
export const createDeal = async (data) => {
  return await addDoc(dealsRef, {
    ...data,
    status: "Pending",
    createdAt: serverTimestamp()
  });
};

// Real-time deals
export const subscribeDeals = (email, callback) => {
  const q = query(dealsRef, where("user", "==", email));

  return onSnapshot(q, (snapshot) => {
    const deals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(deals);
  });
};
