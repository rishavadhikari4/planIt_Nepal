import React from "react";
import { useCart } from "../context/CartContext";
import '../styles/Cart.css'


const Cart = () => {
  const { cartItems, removeFromCart } = useCart();

  return (
    <div className="cart-container" style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.name} style={{ borderBottom: "1px solid #eee" }}>
                  <td>
                    <img src={item.image} alt={item.name} width={60} />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>
                  <button className="remove-btn" onClick={() => removeFromCart(item.name)}>
                  X
                   </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "right", marginTop: 20 }}>
          <button className="proceed-btn">
                 Proceed to Checkout
          </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;