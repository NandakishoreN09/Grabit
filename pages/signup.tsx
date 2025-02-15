import { useState, useEffect } from "react";
import { auth, signInWithGoogle } from "../lib/firebase";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ✅ Automatically verify the email if the user clicked the OTP link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailStored = window.localStorage.getItem("emailForSignIn");

      if (!emailStored) {
        emailStored = prompt("Please enter your email for verification:");
      }

      if (emailStored) {
        verifyEmailOTP(emailStored);
      }
    }
  }, []);

  // ✅ Handle Email OTP Request
  const sendEmailOTP = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setOtpSent(true);
      alert("Verification link sent to your email. Check your inbox.");
    } catch (error) {
      console.error("🚨 Email OTP Request Failed:", error);
      alert("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify Email OTP & Create Account
  const verifyEmailOTP = async (emailStored: string) => {
    try {
      setLoading(true);

      if (!emailStored) {
        alert("Email verification failed. Please try again.");
        return;
      }

      const result = await signInWithEmailLink(auth, emailStored, window.location.href);
      const user = result.user;

      // ✅ Store user details in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name,
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }

      alert("Signup Successful!");
      window.localStorage.removeItem("emailForSignIn");
      router.push("/profile");
    } catch (error) {
      console.error("🚨 Email OTP Verification Failed:", error);
      alert("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign-In with Firestore Data Storage
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // ✅ Save user details in Firestore (if they don't exist already)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "Unknown User",
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }

      alert("Signup Successful!");
      router.push("/profile");
    } catch (error) {
      console.error("🚨 Google Sign-In Failed:", error);
      alert("Failed to sign up with Google.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary text-white">
      <motion.div
        className="bg-black p-8 rounded-xl shadow-xl border border-gray-700 w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6 text-accent">Sign Up</h1>

        {!otpSent ? (
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="p-3 rounded-lg text-black border border-gray-600 focus:ring-2 focus:ring-accent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded-lg text-black border border-gray-600 focus:ring-2 focus:ring-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 rounded-lg text-black border border-gray-600 focus:ring-2 focus:ring-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <motion.button
              onClick={sendEmailOTP}
              disabled={loading}
              className="mt-4 bg-accent text-black px-6 py-3 rounded-lg font-semibold w-full hover:bg-green-600 transition"
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "Sending OTP..." : "Continue"}
            </motion.button>

            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-accent hover:underline">
                Login
              </a>
            </p>

            <motion.button
              onClick={handleGoogleSignUp}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold w-full flex justify-center items-center gap-2 hover:bg-gray-200 transition"
              whileHover={{ scale: 1.05 }}
            >
              Sign Up with Google
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <p className="text-lg">Click the link sent to {email} to verify your account</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
