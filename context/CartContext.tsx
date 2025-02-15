import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ✅ Define cart item structure
interface CartItem {
  id: number;
  name: string;
  price: number;
  img: string;
  quantity: number;
}

// ✅ Define context structure
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItem: (id: number, quantity: number) => void; // ✅ Added for modifying quantity
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
}

// ✅ Create Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ CartProvider Component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  // ✅ Save cart to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Add item to cart
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // ✅ Update item quantity in cart
  const updateCartItem = (id: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity: Math.max(1, quantity) } : cartItem
      )
    );
  };

  // ✅ Remove item from cart
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // ✅ Clear cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, cartCount: cart.reduce((total, item) => total + item.quantity, 0) }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Custom hook to use CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
