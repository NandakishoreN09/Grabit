import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <motion.h1 
        className="text-6xl font-bold text-accent mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to Grabit!
      </motion.h1>
      <p className="text-xl text-gray-300 mb-6">
        Order delicious meals for curbside pickup.
      </p>
      <Link href="/menu">
        <motion.button
          className="bg-gradient-to-r from-accent to-green-500 text-black px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Explore Menu
        </motion.button>
      </Link>
    </div>
  );
}
