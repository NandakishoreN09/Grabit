import { useState } from "react";
import { auth, signInWithGoogle, signInWithPhone, checkUserRoleAndRedirect } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Function to redirect based on role
  const redirectUser = async (uid: string) => {
    await checkUserRoleAndRedirect(uid, router);
  };

  // ✅ Email Login
  const handleLoginWithEmail = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await redirectUser(userCredential.user.uid);
    } catch (error) {
      alert("Invalid credentials. Please try again.");
    }
  };

  // ✅ Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle(router);
    } catch (error) {
      alert("Google login failed. Try again.");
    }
  };

  // ✅ Phone OTP Request
  const sendOtp = async () => {
    if (!phone.startsWith("+1") || phone.length !== 12) {
      alert("Enter a valid USA phone number (+1xxxxxxxxxx)");
      return;
    }
    const { confirmation } = await signInWithPhone(phone, "recaptcha-container", router);
    setVerificationId(confirmation.verificationId);
    alert("OTP Sent!");
  };

  // ✅ OTP Verification
  const verifyOtp = async () => {
    if (!verificationId) return;
    try {
      const credential = await (await import("firebase/auth")).PhoneAuthProvider.credential(
        verificationId,
        otp
      );
      const userCredential = await auth.signInWithCredential(credential);
      await redirectUser(userCredential.user.uid);
    } catch {
      alert("Invalid OTP");
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
        <h1 className="text-4xl font-bold mb-6 text-accent">Login</h1>

        {/* Step 1: Email & Password Login */}
        {step === 1 && (
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="bg-blue-500 px-6 py-3 rounded-lg text-white hover:bg-blue-600 transition"
            >
              Login with Google
            </button>
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded-lg text-black border border-gray-600"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 rounded-lg text-black border border-gray-600"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLoginWithEmail}
              className="bg-green-500 px-6 py-3 rounded-lg text-white hover:bg-green-600 transition"
            >
              Login with Email
            </button>
            <p
              className="text-gray-400 text-sm cursor-pointer hover:text-accent mt-2"
              onClick={() => setStep(2)}
            >
              Login with Phone
            </p>
          </div>
        )}

        <div id="recaptcha-container"></div>
      </motion.div>
    </div>
  );
}
