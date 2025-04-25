import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

//   useEffect(()=>{
//     axios.get("/api/cart")
//     .then(res=>setCartItems(res.data))
//     .catch(()=>setCartItems([]));
//   },[]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.name === item.name);
      if (exists) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (name) => {
    setCartItems((prev) => prev.filter((i) => i.name !== name));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};