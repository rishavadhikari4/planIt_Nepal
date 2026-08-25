import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getServerCart, saveServerCart } from '../services/users';

const CartContext = createContext();

const STORAGE_KEY = "weddingCart";

/* Storage can throw outright — private windows, blocked site data — and a cart
   that cannot be remembered is not a reason to fail the page. */
const readLocal = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Nothing to do: the cart still works for this session.
  }
};

export const CartProvider = ({ children }) => {
  /* Seeded synchronously from localStorage so the cart is correct on the
     first paint rather than appearing empty and then filling in. */
  const [cartItems, setCartItems] = useState(readLocal);
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef(null);

  /* On sign-in, the local cart and the stored one are merged rather than one
     overwriting the other: someone who added a venue on their phone and a
     studio on their laptop should end up with both. */
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      setSynced(false);
      return;
    }

    let live = true;
    getServerCart()
      .then((cart) => {
        if (!live) return;
        const stored = Array.isArray(cart?.items) ? cart.items : [];
        setCartItems((local) => {
          const merged = [...stored];
          for (const item of local) {
            const clash = merged.some(
              (m) => m._id === item._id && m.type === item.type,
            );
            if (!clash) merged.push(item);
          }
          return merged;
        });
        if (cart?.guestCount) {
          try {
            localStorage.setItem("guestCount", String(cart.guestCount));
          } catch {
            // Ignored: the headcount is re-asked on the cart page.
          }
        }
      })
      .catch(() => {})
      .finally(() => live && setSynced(true));

    return () => {
      live = false;
    };
  }, []);

  /* Local writes are immediate; the server write is debounced, because the
     cart changes on every tap of a quantity stepper. */
  useEffect(() => {
    writeLocal(cartItems);

    if (!synced) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const guestCount = Number(localStorage.getItem("guestCount")) || null;
      saveServerCart({ items: cartItems, guestCount }).catch(() => {
        // Silent: the cart is intact locally and the next change retries.
      });
    }, 900);

    return () => clearTimeout(saveTimer.current);
  }, [cartItems, synced]);

  const addToCart = (item, bookingDates = null, silent = false, isRecommendationPackage = false) => {
    try {
      // Normalize the item type - convert 'cuisine' to 'dish'
      const normalizedItem = {
        ...item,
        type: item.type === 'cuisine' ? 'dish' : item.type
      };

      // Check if trying to add venue when one already exists, OR studio when one already exists
      if (normalizedItem.type === "venue" || normalizedItem.type === "studio") {
        // Only check for the same type, not both types
        const existingSameType = cartItems.find(cartItem => 
          cartItem.type === normalizedItem.type
        );

        if (existingSameType) {
          if (!silent) {
            toast.error(`You can only book one ${normalizedItem.type} at a time. Please remove the existing ${normalizedItem.type} first.`);
          }
          return false;
        }
      }

      // For dishes, handle them separately - no booking dates needed
      if (normalizedItem.type === "dish") {
        // Check if dish already exists in cart
        const existingDishIndex = cartItems.findIndex(cartItem => 
          cartItem._id === normalizedItem._id && cartItem.type === "dish"
        );
        
        if (existingDishIndex !== -1) {
          // Dish exists, update quantity
          const updatedCartItems = cartItems.map((cartItem, index) => 
            index === existingDishIndex 
              ? { ...cartItem, quantity: cartItem.quantity + (normalizedItem.quantity || 1) }
              : cartItem
          );
          setCartItems(updatedCartItems);
          if (!silent) {
            toast.success(`Updated ${normalizedItem.name} quantity in cart! ✨`);
          }
        } else {
          // New dish, add to cart
          const newDish = {
            ...normalizedItem,
            quantity: normalizedItem.quantity || 1,
            _id: normalizedItem._id,
            type: "dish"
          };
          setCartItems(prevItems => [...prevItems, newDish]);
          if (!silent) {
            toast.success(`${normalizedItem.name} added to cart successfully! ✨`);
          }
        }
        return true;
      }

      // For venues and studios, handle booking dates
      if (normalizedItem.type === "venue" || normalizedItem.type === "studio") {
        // If it's from a recommendation package, allow adding without dates initially
        if (!bookingDates && !isRecommendationPackage) {
          if (!silent) {
            toast.error(`Booking dates are required for ${normalizedItem.type}`);
          }
          return false;
        }

        // Since we only allow one venue and one studio, we can just add it directly
        const newItem = {
          ...normalizedItem,
          quantity: 1, // Always 1 for venues/studios
          _id: normalizedItem._id,
          bookingDates: bookingDates,
          isRecommendationItem: isRecommendationPackage
        };
        
        setCartItems(prevItems => [...prevItems, newItem]);
        
        if (!silent) {
          if (bookingDates) {
            const fromDate = new Date(bookingDates.from).toLocaleDateString();
            const tillDate = new Date(bookingDates.till).toLocaleDateString();
            toast.success(`${normalizedItem.name} added to cart for ${fromDate} - ${tillDate}! ✨`);
          } else if (isRecommendationPackage) {
            toast.success(`${normalizedItem.name} added to cart! Please set booking dates before checkout. ✨`);
          }
        }
        
        return true;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      if (!silent) {
        toast.error("Failed to add item to cart. Please try again.");
      }
      return false;
    }
  };

  const removeFromCart = (itemId) => {
    try {
      const itemToRemove = cartItems.find(item => item._id === itemId);
      
      const newCartItems = cartItems.filter(item => item._id !== itemId);
      
      setCartItems(newCartItems);
      
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from cart`);
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      toast.error("Failed to remove item from cart.");
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Failed to update quantity.");
    }
  };

  const updateBookingDates = (itemId, bookingDates) => {
    try {
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, bookingDates } : item
        )
      );
      toast.success("Booking dates updated successfully! ✨");
    } catch (err) {
      console.error("Error updating booking dates:", err);
      toast.error("Failed to update booking dates.");
    }
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("guestCount");
    } catch {
      // Ignored.
    }
    if (synced) saveServerCart({ items: [], guestCount: null }).catch(() => {});
    toast.success("Cart cleared successfully!");
  };

  const fetchCartItems = () => {
    // Return current cart items (no API call needed)
    return cartItems;
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      fetchCartItems, 
      updateQuantity,
      updateBookingDates,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Named export for CartContext
export { CartContext };