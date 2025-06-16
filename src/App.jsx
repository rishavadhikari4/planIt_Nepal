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
// admins controller
import AdminHeader from './adminComponent/adminHeader';
import AdminDecorations from './adminComponent/adminDecorations';
import AdminDishes from './adminComponent/adminDishes';
import AdminVenues from './adminComponent/adminVenues';
import AdminContact from './adminComponent/adminContact';
import EditDecoration from './editComponents/editDecorations';
import EditVenue from './editComponents/editVenues';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function AppContent() {
  const location = useLocation();

  const hideHeaderRoutes = [
    '/login', '/auth-success', '/register', '/admin-login'
  ];

  const showHeaderForAdmin = [
    '/admin',
    '/admin-decorations',
    '/admin-dishes',
    '/admin-venues',
    '/admin-contact',
    '/admin-decorations/edit',
    '/admin-venues/edit'

  ];

  const pathname = location.pathname;

  const shouldHideHeader = hideHeaderRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  const shouldShowAdminHeader = showHeaderForAdmin.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  return (
    <AuthProvider>
      {!shouldHideHeader && !shouldShowAdminHeader && <Header />}
      {shouldShowAdminHeader && <AdminHeader />}

      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/decorations" element={<Decorations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-decorations" element={<AdminDecorations />} />
          <Route path="/admin-dishes" element={<AdminDishes />} />
          <Route path="/admin-venues" element={<AdminVenues />} />
          <Route path="/admin-contact" element={<AdminContact />} />
          <Route path="/admin-decorations/edit/:id" element={<EditDecoration />} />
          <Route path="/admin-venues/edit/:id" element={<EditVenue />} />
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
      </CartProvider>
    </AuthProvider>
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
