import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { AiOutlineMinus, AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, setDoc, getDocs } from "firebase/firestore";

export default function Cart() {
  const { cart, clearCart, updateCartItem, removeFromCart } = useCart();

  // ✅ Get Next Order ID in `ODXXXXXX` Format
  const getNextOrderId = async () => {
    const ordersRef = collection(db, "orders");
    const querySnapshot = await getDocs(ordersRef);
  
    // ✅ Ensure valid IDs before processing
    const orderNumbers = querySnapshot.docs
      .map((doc) => doc.data()?.id) // Safely access `id`
      .filter((id) => id && typeof id === "string" && id.startsWith("OD")) // ✅ Ensure `id` is valid
      .map((id) => parseInt(id.replace("OD", ""), 10))
      .filter((num) => !isNaN(num)); // ✅ Remove invalid numbers
  
    // ✅ Get next order number
    const nextOrderNumber = orderNumbers.length > 0 ? Math.max(...orderNumbers) + 1 : 1;
    return `OD${String(nextOrderNumber).padStart(6, "0")}`;
  };
  

  // ✅ Function to handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // ✅ Fetch User's Name from Firestore
    let userName = "Unknown User";
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userName = userSnap.data().name || "Unknown User";
      }
    }

    // ✅ Get unique order ID
    const orderId = await getNextOrderId();

    // ✅ Store only item name & quantity
    const newOrder = {
      id: orderId,
      userId: auth.currentUser?.uid || "guest",
      userName,
      items: cart.map((item) => ({ name: item.name, quantity: item.quantity })), // ✅ FIXED
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "Preparing",
      placedAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    try {
      // ✅ Save order with `ODXXXXXX` format
      await setDoc(doc(db, "orders", orderId), newOrder);
      console.log("Order added with ID:", orderId);
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to place order!");
      return;
    }

    // ✅ Clear cart after checkout
    clearCart();
    alert(`Order ${orderId} placed! Redirecting to success page.`);
    window.location.href = "/success";
  };

  return (
    <div className="bg-primary text-white min-h-screen py-16 px-6">
      <h1 className="text-5xl font-bold text-center mb-12 text-accent">Your Cart</h1>
      {cart.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 container mx-auto">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              className="bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center"
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{item.img}</span>
                <div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-gray-300">Price: ${item.price}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <motion.button
                      className="bg-red-500 p-2 rounded-lg hover:bg-red-600 transition"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <AiOutlineMinus size={16} />
                    </motion.button>

                    <span className="text-lg font-bold">{item.quantity}</span>

                    <motion.button
                      className="bg-green-500 p-2 rounded-lg hover:bg-green-600 transition"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    >
                      <AiOutlinePlus size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>

                <motion.button
                  className="mt-3 bg-red-600 p-2 rounded-lg text-white hover:bg-red-700 transition"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromCart(item.id)}
                >
                  <AiOutlineDelete size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}

          <div className="text-right text-xl font-bold text-gray-300">
            Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
          </div>

          <motion.button
            onClick={handleCheckout}
            className="bg-gradient-to-r from-accent to-green-500 text-black px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Proceed to Checkout
          </motion.button>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-300">Your cart is empty.</p>
      )}

      <div className="text-center mt-6">
        <Link href="/menu">
          <motion.button
            className="bg-gray-700 px-6 py-3 rounded-full text-white text-lg hover:scale-105 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Back to Menu
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
