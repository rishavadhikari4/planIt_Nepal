import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// User pages
import AuthSuccess from './pages/AuthSuccess';
import Header from './components/Header';
import Home from './pages/Home';
import Venues from './pages/Venues';
import Dishes from './pages/Dishes';
import Decorations from './pages/Decorations';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import Cart from './pages/Cart';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import UserProfile from './pages/userProfile';

// Admin pages
import Admin from './admin/Admin';
import AdminLogin from './admin/adminLogin';
import AdminHeader from './adminComponent/adminHeader';
import AdminDecorations from './adminComponent/adminDecorations';
import AdminDishes from './adminComponent/adminDishes';
import AdminVenues from './adminComponent/adminVenues';
import AdminContact from './adminComponent/adminContact';
import EditDecoration from './utillsComponents/editDecorations';
import EditVenue from './utillsComponents/editVenues';
import EditDish from './utillsComponents/editDishes';
import AdminOrderList from './adminComponent/adminOrders';
import AddDishForm from './utillsComponents/addDishForm';
import AddVenueForm from './utillsComponents/addVenuesFrom';
import AddDecorationForm from './utillsComponents/addDecorationForm';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function AppContent() {
  const location = useLocation();
  const pathname = location.pathname;

  const hideHeaderRoutes = [
    '/login',
    '/register',
    '/auth-success',
    '/admin-login',
    '/not-found',
    '/reset-password' 
  ];

  const showHeaderForAdmin = [
    '/admin',
    '/admin-orders',
    '/admin-decorations',
    '/admin-dishes',
    '/admin-venues',
    '/admin-contact',
    '/admin-decorations/edit',
    '/admin-venues/edit',
    '/admin-dishes/edit'
  ];

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
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/decorations" element={<Decorations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />}/>
          <Route path="/login/forgot-password" element={<ForgotPassword />}/>
          <Route path="/reset-password/:resetToken" element={<ResetPassword />}/>
          <Route path="/user-profile/:id" element={<UserProfile />}/>
          

          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-orders" element={<AdminOrderList />} />
          <Route path="/admin-decorations" element={<AdminDecorations />} />
          <Route path="/admin-dishes" element={<AdminDishes />} />
          <Route path="/admin-venues" element={<AdminVenues />} />
          <Route path="/admin-contact" element={<AdminContact />} />
          <Route path="/admin-decorations/edit/:id" element={<EditDecoration />} />
          <Route path="/admin-venues/edit/:id" element={<EditVenue />} />
          <Route path="/admin-dishes/edit/:categoryName/:dishId" element={<EditDish />} />
          <Route path="/admin-dishes/addDishes" element={<AddDishForm />} />
          <Route path="/admin-venues/addVenue" element={<AddVenueForm />} />
          <Route path="/admin-decorations/addDecoration" element={<AddDecorationForm />} />

          {/* Not Found Route */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
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
