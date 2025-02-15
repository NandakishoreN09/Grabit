import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Cart() {
  const { cart } = useCart();

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems: cart }),
    });
    const { sessionId } = await response.json();
    stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <div className="bg-primary text-white min-h-screen py-16 px-6">
      <h1 className="text-5xl font-bold text-center mb-12 text-accent">Your Cart</h1>
      {cart.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 container mx-auto">
          {cart.map((item) => (
            <motion.div key={item.id} className="bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{item.img}</span>
                <div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-gray-300">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="text-lg">${item.price * item.quantity}</p>
            </motion.div>
          ))}
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
    </div>
  );
}
