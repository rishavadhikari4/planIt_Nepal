import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import '../styles/Cart.css';
import API from "../services/api";

const Cart = () => {
  const { cartItems, removeFromCart,fetchCartItems} = useCart([]);


  useEffect(() => {
    fetchCartItems();
  }, []);
  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await API.post(
        '/api/orders',);

      if (response.status === 200) {
        alert('Order placed successfully!');

        window.location.reload(); 
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <div className="cart-table-wrapper">
          <table className="cart-table">
            <tbody>
              {cartItems.map((item) => (
                <tr key={item._id} className="cart-row">
                  <td className="cart-img-cell">
                    <img src={item.image} alt={item.name} className="cart-img" />
                  </td>
                  <td className="cart-name">{item.name}</td>
                  <td className="cart-qty">{item.quantity}</td>
                  <td className="cart-remove">
                    <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-actions">
            <button className="proceed-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
