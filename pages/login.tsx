import { useState } from "react";
import { auth, signInWithGoogle, signInWithPhone, checkUserRoleAndRedirect, saveUserToDatabase } from "../lib/firebase";
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
      await saveUserToDatabase(userCredential.user, false); // ✅ Ensure only necessary details are stored
      await redirectUser(userCredential.user.uid);
    } catch (error) {
      alert("Invalid credentials. Please try again.");
    }
  };

  // ✅ Google Login (Fixed)
  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithGoogle(router);
      if (userCredential?.user) {
        await saveUserToDatabase(userCredential.user, true); // ✅ Save only required details
        await redirectUser(userCredential.user.uid);
      }
    } catch (error) {
      alert("Google login failed. Try again.");
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

          {/* ✅ Signup Button Added */}
          <p
            className="text-gray-400 text-sm cursor-pointer hover:text-accent mt-2"
            onClick={() => router.push("/signup")}
          >
            Don't have an account? Sign up
          </p>
        </div>
      </motion.div>
    </div>
  );
}
