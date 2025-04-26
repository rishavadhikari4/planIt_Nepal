import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

useEffect(() => {
  API.get("/api/cart")
    .then(res => {
      setCartItems(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => {
      console.error("Cart fetch failed", err);
      setCartItems([]);
    });
}, []);


  const addToCart = async (item) => {
    try {
      const res = await API.post("/api/cart", item);
      setCartItems(res.data); 
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };


  const removeFromCart = async (id) => {
    try {
      const res = await API.delete(`/api/cart/${id}`);
      setCartItems(res.data); 
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};