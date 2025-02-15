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

// ✅ Enable Firestore Persistence (Only in Browser)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("⚠️ Firestore Persistence Error:", err);
  });

  window.addEventListener("online", async () => {
    console.log("🔄 Reconnecting Firestore...");
    await enableNetwork(db);
  });

  window.addEventListener("offline", async () => {
    console.warn("⚠️ Firestore Offline. Retrying...");
    await disableNetwork(db);
  });
}

// ========================
// ✅ Function to Save Users in Firestore (Fix Applied)
// ========================
export const saveUserToDatabase = async (user: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Unknown User",
      email: user.email || "",
      phone: user.phoneNumber || "",
    });
  }
};

// ========================
// ✅ User Role Check & Redirect
// ========================
export const checkUserRoleAndRedirect = async (uid: string, router: any) => {
  try {
    const adminRef = doc(db, "admins", uid);
    const adminSnap = await getDoc(adminRef);
    const isAdmin = adminSnap.exists();

    if (router && typeof router.push === "function") {
      router.push(isAdmin ? "/admin" : "/menu");
    }
  } catch (error) {
    console.error("🚨 Error fetching user role:", error);
    router?.push("/menu"); // Default to menu if role check fails
  }
};

// ========================
// ✅ Authentication Functions (Google & OTP Fix)
// ========================

// 👉 Google Sign-In (Fixed)
export const signInWithGoogle = async (router: any) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    await saveUserToDatabase(result.user); // ✅ Ensure only required fields are saved
    await checkUserRoleAndRedirect(result.user.uid, router);
    return result;
  } catch (error) {
    console.error("🚨 Google Sign-In Error:", error);
    alert("Google Sign-In failed. Try again.");
    return null;
  }
};

// ✅ reCAPTCHA Initialization (Ensures Single Instance)
const initializeRecaptcha = () => {
  if (typeof window !== "undefined" && auth) {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          { size: "invisible" },
          auth
        );
      }
    } catch (error) {
      console.error("🚨 reCAPTCHA init failed:", error);
    }
  }
};

// 👉 Phone Authentication (OTP)
export const signInWithPhone = async (phoneNumber: string) => {
  try {
    initializeRecaptcha(); // ✅ Ensure reCAPTCHA is initialized
    const recaptcha = window.recaptchaVerifier;
    return await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
  } catch (error) {
    console.error("🚨 Phone Sign-In Error:", error);
    alert("Failed to send OTP. Try again.");
    return null;
  }
};

// 👉 Verify OTP & Redirect (Fixed)
export const verifyOTP = async (confirmation: any, otp: string, router: any, userName: string, email: string) => {
  try {
    const result = await confirmation.confirm(otp);

    // ✅ Store user details in Firestore (Only Name, Email, Phone)
    await saveUserToDatabase({
      uid: result.user.uid,
      email,
      name: userName || "",
      phone: result.user.phoneNumber || "",
    });

    await checkUserRoleAndRedirect(result.user.uid, router);
  } catch (error) {
    console.error("🚨 OTP Verification Error:", error);
    alert("Invalid OTP. Try again.");
  }
};

// 👉 Logout with Redirection
export const logout = async (router: any) => {
  try {
    await signOut(auth);
    console.log("✅ User logged out successfully");

    if (router && typeof router.push === "function") {
      setTimeout(() => router.push("/login"), 500);
    }
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

// 👉 Add a user as an admin
export const addAdmin = async (uid: string) => {
  try {
    await setDoc(doc(db, "admins", uid), { role: "admin" });
    console.log(`✅ User ${uid} is now an admin.`);
  } catch (error) {
    console.error("🚨 Error adding admin:", error);
  }
};

// 👉 Remove admin privileges
export const removeAdmin = async (uid: string) => {
  try {
    await deleteDoc(doc(db, "admins", uid));
    console.log(`✅ Admin role removed from user ${uid}.`);
  } catch (error) {
    console.error("🚨 Error removing admin:", error);
  }
};
