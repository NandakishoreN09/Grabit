import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdOutlineReplay } from "react-icons/md";
import { db } from "../lib/firebase"; 
import { collection, getDocs, updateDoc, doc, getFirestore } from "firebase/firestore";

interface Order {
  id: string;
  userName?: string;
  items?: { name: string; quantity: number }[];
  total: number;
  status: string;
  placedAt: string;
}

export default function AdminOrders(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const firestore = getFirestore();

  // ✅ Load Orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(firestore, "orders");
        const querySnapshot = await getDocs(ordersRef);

        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Order),
        }));

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Format items correctly
  const formatItems = (items?: { name: string; quantity: number }[]) => {
    return items?.map((item) => `${item.name} x${item.quantity}`).join(", ") || "No items";
  };

  // ✅ Update Order Status in Firestore
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // ✅ Revert Order Status in Firestore
  const revertOrderStatus = async (orderId: string) => {
    try {
      const orderRef = doc(firestore, "orders", orderId);
      const order = orders.find((order) => order.id === orderId);
      if (!order) return;

      const statusOptions = ["Preparing", "Ready for Pickup", "Completed"];
      const currentIndex = statusOptions.indexOf(order.status);
      if (currentIndex > 0) {
        const newStatus = statusOptions[currentIndex - 1];
        await updateDoc(orderRef, { status: newStatus });

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error reverting order status:", error);
    }
  };

  return (
    <div className="bg-primary text-white min-h-screen py-16 px-6">
      <h1 className="text-5xl font-bold text-center mb-12 text-accent">Restaurant Admin Panel</h1>
      {orders.length > 0 ? (
        <div className="container mx-auto space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center"
              whileHover={{ scale: 1.03 }}
            >
              <div>
                <h3 className="text-lg font-semibold text-accent">👤 {order.userName || "Unknown User"}</h3>
                <h3 className="text-xl font-bold mb-2">Order ID: {order.id}</h3>

                {/* ✅ Display Items Properly */}
                <p className="text-gray-300">Items: {formatItems(order.items)}</p>

                <p className="text-gray-400">Placed On: {new Date(order.placedAt).toLocaleString("en-US")}</p>
                <p className="text-lg font-bold mt-2">Total: ${order.total}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  {/* Status Display */}
                  <motion.div
                    className={`px-6 py-2 rounded-full font-semibold text-lg ${
                      order.status === "Preparing"
                        ? "bg-yellow-500 text-black"
                        : order.status === "Ready for Pickup"
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {order.status}
                  </motion.div>

                  {/* Small Revert Button */}
                  {order.status !== "Preparing" && (
                    <motion.button
                      onClick={() => revertOrderStatus(order.id)}
                      className="bg-red-500 p-1 rounded-full text-white hover:scale-110 transition"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      title="Revert Order Status"
                    >
                      <MdOutlineReplay size={14} />
                    </motion.button>
                  )}
                </div>

                {/* Admin Controls */}
                <div className="flex gap-3 mt-3">
                  {order.status === "Preparing" && (
                    <motion.button
                      onClick={() => updateOrderStatus(order.id, "Ready for Pickup")}
                      className="bg-blue-500 px-4 py-2 rounded-lg text-white text-lg hover:scale-105 transition"
                    >
                      Mark Ready
                    </motion.button>
                  )}
                  {order.status === "Ready for Pickup" && (
                    <motion.button
                      onClick={() => updateOrderStatus(order.id, "Completed")}
                      className="bg-green-500 px-4 py-2 rounded-lg text-white text-lg hover:scale-105 transition"
                    >
                      Mark Picked Up
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg text-gray-300">No orders placed yet.</p>
      )}
    </div>
  );
}
