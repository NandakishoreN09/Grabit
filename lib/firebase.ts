import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  enableIndexedDbPersistence, 
  enableNetwork, 
  disableNetwork 
} from "firebase/firestore";

// ✅ Firebase Configuration (Uses Environment Variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Initialize Firebase (Prevent Re-initialization)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Enable Persistence Only in Browser
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("⚠️ Firestore Persistence Error:", err);
  });

  // 🔄 Auto-reconnect Firestore on Internet Restore
  window.addEventListener("online", async () => {
    console.log("🔄 Reconnecting Firestore...");
    await enableNetwork(db);
  });

  // ❌ Disable Firestore on Internet Disconnect
  window.addEventListener("offline", async () => {
    console.warn("⚠️ Firestore Offline. Retrying...");
    await disableNetwork(db);
  });
}

// ========================
// ✅ Admin Check & Redirect Function
// ========================
export const checkUserRoleAndRedirect = async (uid: string, router: any) => {
  try {
    const adminRef = doc(db, "admins", uid);
    const adminSnap = await getDoc(adminRef);
    const isAdmin = adminSnap.exists();

    router.push(isAdmin ? "/admin" : "/menu");
  } catch (error) {
    console.error("🚨 Error fetching user role:", error);
    router.push("/menu"); // Default to menu if role check fails
  }
};

// ========================
// ✅ Authentication Functions
// ========================

// 👉 Google Sign-In
export const signInWithGoogle = async (router: any) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Wait for role check & redirect
    await checkUserRoleAndRedirect(result.user.uid, router);
  } catch (error) {
    console.error("🚨 Google Sign-In Error:", error);
    alert("Google Sign-In failed. Try again.");
  }
};

// 👉 Phone Authentication (OTP)
export const recaptchaVerifier = (containerId: string) =>
  new RecaptchaVerifier(containerId, { size: "invisible" }, auth);

export const signInWithPhone = async (phoneNumber: string, recaptchaContainer: string, router: any) => {
  try {
    const recaptcha = recaptchaVerifier(recaptchaContainer);
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
    return confirmation;
  } catch (error) {
    console.error("🚨 Phone Sign-In Error:", error);
    alert("Failed to send OTP. Try again.");
    return null;
  }
};

// 👉 Verify OTP & Redirect
export const verifyOTP = async (confirmation: any, otp: string, router: any) => {
  try {
    const result = await confirmation.confirm(otp);
    
    // Wait for role check & redirect
    await checkUserRoleAndRedirect(result.user.uid, router);
  } catch (error) {
    console.error("🚨 OTP Verification Error:", error);
    alert("Invalid OTP. Try again.");
  }
};

// 👉 Sign Out
export const logout = async (router: any) => {
  try {
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    console.error("🚨 Logout Error:", error);
    alert("Logout failed. Try again.");
  }
};

// ========================
// ✅ Admin Control Functions
// ========================

// 👉 Check if a user is an admin
export const isAdmin = async (uid: string) => {
  try {
    const adminRef = doc(db, "admins", uid);
    const adminSnap = await getDoc(adminRef);
    return adminSnap.exists();
  } catch (error) {
    console.error("🚨 Error checking admin role:", error);
    return false;
  }
};

// 👉 Add a user as an admin (ONLY YOU CAN DO THIS MANUALLY)
export const addAdmin = async (uid: string) => {
  try {
    await setDoc(doc(db, "admins", uid), { role: "admin" });
    console.log(`✅ User ${uid} is now an admin.`);
  } catch (error) {
    console.error("🚨 Error adding admin:", error);
  }
};

// 👉 Remove admin privileges from a user
export const removeAdmin = async (uid: string) => {
  try {
    await deleteDoc(doc(db, "admins", uid));
    console.log(`✅ Admin role removed from user ${uid}.`);
  } catch (error) {
    console.error("🚨 Error removing admin:", error);
  }
};
