import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Order {
  id: string;
  items?: { name: string; quantity: number }[]; // ✅ Ensure items are objects with names and quantities
  total: number;
  status: string;
  placedAt: string;
  timestamp: number;
  timeLeft: number;
}

export default function Orders(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);

  // ✅ Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;

      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map((doc) => {
          const order = doc.data() as Order;
          const elapsedTime = Math.floor((Date.now() - order.timestamp) / 1000);
          const remainingTime = Math.max(30 * 60 - elapsedTime, 0);
          return { ...order, timeLeft: remainingTime };
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // ⏳ Countdown Timer (Updates Every Second)
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.status === "Preparing" && order.timeLeft > 0) {
            return { ...order, timeLeft: order.timeLeft - 1 };
          }
          return order;
        })
      );
    }, 1000); // Runs every second

    return () => clearInterval(interval);
  }, []);

  // ✅ Format timestamp properly
  const formatDate = (isoString: string) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // ✅ Ensures AM/PM format
    });
  };

  // ⏳ Format countdown timer correctly
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  // ✅ Format items correctly
  const formatItems = (items?: { name: string; quantity: number }[]) => {
    if (!items || !Array.isArray(items)) return "No items";
    return items.map((item) => `${item.name} x${item.quantity}`).join(", ");
  };

  return (
    <div className="bg-primary text-white min-h-screen py-16 px-6">
      <h1 className="text-5xl font-bold text-center mb-12 text-accent">My Orders</h1>
      {orders.length > 0 ? (
        <div className="container mx-auto space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center"
              whileHover={{ scale: 1.03 }}
            >
              <div>
                <h3 className="text-xl font-bold mb-2">Order ID: {order.id}</h3>

                {/* ✅ Fixed Items Display */}
                <p className="text-gray-300">Items: {formatItems(order.items)}</p>

                <p className="text-gray-400">Placed At: {formatDate(order.placedAt)}</p>
                <p className="text-lg font-bold mt-2">Total: ${order.total}</p>
              </div>
              <div className="flex flex-col items-center">
                <motion.div
                  className={`px-6 py-2 rounded-full font-semibold text-lg mb-2 ${
                    order.status === "Preparing"
                      ? "bg-yellow-500 text-black"
                      : order.status === "Ready for Pickup"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {order.status}
                </motion.div>

                {/* Show timer only when order is "Preparing" */}
                {order.status === "Preparing" && order.timeLeft > 0 && (
                  <div className="text-2xl font-bold text-white">{formatTime(order.timeLeft)}</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg text-gray-300">You have no orders yet.</p>
      )}
      <div className="text-center mt-6">
        <Link href="/menu">
          <motion.button
            className="bg-gray-700 px-6 py-3 rounded-full text-white text-lg hover:scale-105 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Order More Food
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
