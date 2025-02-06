import { useState } from "react";
import { auth, signInWithGoogle, signInWithPhone } from "../lib/firebase";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter Details, Step 2: OTP Verification
  const [loading, setLoading] = useState(false);

  // ✅ Handle OTP Verification
  const requestOTP = async () => {
    if (!name || !email || !phone || !password) {
      alert("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const confirmation = await signInWithPhone(phone, "recaptcha-container");
      setVerificationId(confirmation.verificationId);
      setStep(2);
    } catch (error) {
      console.error("OTP Request Failed:", error);
      alert("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP and Create Account
  const verifyOTP = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      setLoading(true);
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await auth.signInWithCredential(credential);
      const user = userCredential.user;

      // ✅ Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), { name, email, phone });

      alert("Signup Successful!");
      window.location.href = "/profile";
    } catch (error) {
      console.error("OTP Verification Failed:", error);
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
          phone: user.phoneNumber || "",
        });
      }

      alert("Signup Successful!");
      window.location.href = "/profile"; // ✅ Redirect after signup
    } catch (error) {
      console.error("Google Sign-In Failed:", error);
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

        {step === 1 ? (
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
              type="text"
              placeholder="+1xxxxxxxxxx"
              className="p-3 rounded-lg text-black border border-gray-600 focus:ring-2 focus:ring-accent"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 rounded-lg text-black border border-gray-600 focus:ring-2 focus:ring-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <motion.button
              onClick={requestOTP}
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
            <p className="text-lg">Enter the OTP sent to {phone}</p>
            <input
              type="text"
              placeholder="Enter OTP"
              className="p-3 rounded-lg text-black border border-gray-600 focus:ring-2 focus:ring-accent"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <motion.button
              onClick={verifyOTP}
              disabled={loading}
              className="mt-4 bg-green-500 text-black px-6 py-3 rounded-lg font-semibold w-full hover:bg-green-600 transition"
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "Verifying OTP..." : "Verify & Sign Up"}
            </motion.button>
          </div>
        )}

        <div id="recaptcha-container"></div>
      </motion.div>
    </div>
  );
}
