import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineShoppingCart, AiOutlineHome, AiOutlineUser } from "react-icons/ai";
import { MdOutlineReceiptLong } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/router";
import { auth, isAdmin } from "../lib/firebase";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { cartCount } = useCart(); // ✅ Get cart count
  const router = useRouter();

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        setIsAdminUser(await isAdmin(user.uid)); // ✅ Check if the user is an admin
      }
    });
  }, []);

  return (
    <motion.nav 
      className="bg-black text-white py-4 px-6 fixed top-0 w-full z-50 shadow-lg"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* ✅ Logo */}
        <h1 className="text-3xl font-bold tracking-wide text-accent">
          <Link href="/">Grabit</Link>
        </h1>

        {/* ✅ If on Home Page ("/"), show ONLY Login & Signup Buttons */}
        {router.pathname === "/" ? (
          <div className="flex gap-4">
            <Link href="/login">
              <motion.button
                className="bg-blue-500 px-6 py-2 rounded-full text-white font-semibold hover:scale-105 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Login
              </motion.button>
            </Link>
            <Link href="/signup">
              <motion.button
                className="bg-green-500 px-6 py-2 rounded-full text-white font-semibold hover:scale-105 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Sign Up
              </motion.button>
            </Link>
          </div>
        ) : (
          // ✅ Show Full Navigation Menu on other pages ONLY if user is logged in
          isLoggedIn && (
            <ul className="flex space-x-8 text-lg">
              <li>
                <Link href="/" className="hover:text-accent flex items-center gap-1">
                  <AiOutlineHome size={24}/> Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-accent flex items-center gap-1">
                  🍽️ Menu
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-accent flex items-center gap-1">
                  <MdOutlineReceiptLong size={24}/> My Orders
                </Link>
              </li>

              {/* ✅ Cart Icon with Count */}
              <li className="relative">
                <Link href="/cart" className="hover:text-accent flex items-center gap-1">
                  <AiOutlineShoppingCart size={28}/>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link href="/profile" className="hover:text-accent flex items-center gap-1">
                  <AiOutlineUser size={24}/> Profile
                </Link>
              </li>

              {/* ✅ Show Admin Panel ONLY if the user is an admin */}
              {isAdminUser && (
                <li>
                  <Link href="/admin" className="hover:text-accent flex items-center gap-1">
                    🛠 Admin Panel
                  </Link>
                </li>
              )}
            </ul>
          )
        )}
      </div>
    </motion.nav>
  );
}
