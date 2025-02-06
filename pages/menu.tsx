import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

const menuItems = [
  { id: 1, name: "Burger", price: 10, img: "🍔" },
  { id: 2, name: "Pizza", price: 12, img: "🍕" },
  { id: 3, name: "Sushi", price: 15, img: "🍣" },
  { id: 4, name: "Pasta", price: 14, img: "🍝" },
  { id: 5, name: "Salad", price: 9, img: "🥗" },
];

export default function Menu() {
  const { addToCart } = useCart(); // ✅ Ensures cart functionality works

  return (
    <div className="bg-primary text-white min-h-screen py-16 px-6">
      <h1 className="text-5xl font-bold text-center mb-12 text-accent">Our Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 container mx-auto">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            className="bg-gray-800 rounded-lg shadow-lg p-6 text-center flex flex-col items-center hover:scale-105 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-6xl mb-4">{item.img}</span>
            <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
            <p className="text-lg text-gray-300 mb-6">${item.price}</p>
            <motion.button
              onClick={() => addToCart(item)}
              className="bg-gradient-to-r from-accent to-green-500 text-black px-6 py-2 rounded-full shadow-lg hover:scale-105 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Add to Cart
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
