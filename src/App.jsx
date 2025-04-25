import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './styles/global.css';

import AuthSuccess from './pages/AuthSuccess';
import Admin from './admin/Admin';
import Header from './components/Header';
import Home from './pages/Home';
import Venues from './pages/Venues';
import Dishes from './pages/Dishes';
import Decorations from './pages/Decorations';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './admin/adminLogin';
import Cart from './pages/Cart';


import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function AppContent() {
  const location = useLocation();
  const hideHeaderRoutes = ['/login','/auth-success', '/register','/admin','/admin-login','/*'];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <CartProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/decorations" element={<Decorations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart/>}/>
          <Route path="*" element={<NotFound />} /> 
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme="light"
        />
      </AuthProvider>
      </CartProvider>
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <main>
        <AppContent />
      </main>
    </BrowserRouter>
  );
}

export default App;