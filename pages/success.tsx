import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Success() {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className="bg-primary text-white min-h-screen flex flex-col justify-center items-center">
      <motion.h1 className="text-5xl font-bold text-green-400 mb-4">Payment Successful! 🎉</motion.h1>
      <p className="text-xl text-gray-300 mb-6">Thank you for your order.</p>
      
      {/* Pickup Time */}
      <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-lg text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-accent">Estimated Pickup Time</h2>
        <p className="text-4xl font-bold text-white mt-2">{formatTime(timeLeft)}</p>
        <p className="text-gray-400 mt-1">Your order will be ready in 30 minutes.</p>
      </motion.div>

      {/* Continue Shopping Button */}
      <Link href="/menu">
        <motion.button
          className="bg-green-500 px-6 py-3 mt-6 rounded-lg shadow-lg text-black text-lg hover:scale-105 transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Continue Shopping
        </motion.button>
      </Link>
    </div>
  );
}
