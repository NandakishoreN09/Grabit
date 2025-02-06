import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { useRouter } from "next/router";
import { CartProvider } from "../context/CartContext";
import { useEffect, useState } from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Prevent hydration errors by ensuring the component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Avoid using `router.pathname` directly in SSR
  if (!isMounted) return null;

  // ✅ Define auth pages where only the "Grabit" logo should be visible
  const authPages = ["/login", "/signup"];
  const isAuthPage = authPages.includes(router.pathname);

  return (
    <CartProvider>
      <div className="min-h-screen">
        {/* ✅ Navbar logic */}
        {isAuthPage ? (
          // 🔹 Show only "Grabit" logo on auth pages, aligned correctly
          <div className="bg-black text-white py-4 px-8 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-3xl font-bold tracking-wide text-accent cursor-pointer">
                Grabit
              </h1>
            </Link>
          </div>
        ) : (
          // 🔹 Show full navbar on other pages
          <Navbar />
        )}

        {/* ✅ Render the main component */}
        <Component {...pageProps} />
      </div>
    </CartProvider>
  );
}
