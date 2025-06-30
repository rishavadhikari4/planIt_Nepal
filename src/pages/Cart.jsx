import { useEffect } from "react";
import { useCart } from "../context/CartContext";
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
    <div className="max-w-4xl mx-auto px-4 py-12">
  <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">Your Cart</h2>

  {cartItems.length === 0 ? (
    <p className="text-center text-gray-500 text-lg">Your cart is empty.</p>
  ) : (
    <div className="overflow-x-auto rounded-lg shadow-lg bg-white p-6">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4 text-lg text-gray-600">Image</th>
            <th className="py-3 px-4 text-lg text-gray-600">Name</th>
            <th className="py-3 px-4 text-lg text-gray-600">Quantity</th>
            <th className="py-3 px-4 text-lg text-gray-600">Remove</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50 border-b transition">
              <td className="py-4 px-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md shadow-sm"
                />
              </td>
              <td className="py-4 px-4 text-gray-800 text-lg font-medium">{item.name}</td>
              <td className="py-4 px-4 text-gray-700 text-base">{item.quantity}</td>
              <td className="py-4 px-4">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 font-semibold transition"
                >
                  &#10005;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleCheckout}
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  )}
</div>

  );
};

export default Cart;
