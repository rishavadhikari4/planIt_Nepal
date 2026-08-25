import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { ScrollProgress } from './components/ui/Motion';

// Auth pages
import AuthSuccess from './pages/auth/AuthSuccess';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Welcome from './pages/auth/Welcome';

// Public pages
import Home from './pages/public/Home';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

// Service pages
import Venues from './pages/services/Venues';
import VenueDetails from './pages/services/VenueDetails';
import Cuisines from './pages/services/Cuisines';
import Studios from './pages/services/Studios';
import StudioDetails from './pages/services/StudioDetails';

// User pages
import Cart from './pages/user/Cart';
import UserProfile from './pages/user/Profile';
import PaymentSelection from './pages/user/PaymentSelection';
import PaymentCallback from './pages/user/PaymentCallback';
import OrderSuccess from './pages/user/OrderSuccess';

// Admin pages
import Admin from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Adminstudios from './pages/admin/StudioManagement';
import AdminCuisines from './pages/admin/CuisineManagement';
import AdminVenues from './pages/admin/VenueManagement';
import AdminContact from './pages/admin/ContactManagement';
import AdminOrderList from './pages/admin/OrderManagement';
import OrderDetails from './pages/admin/OrderDetails';
import ContactDetails from './pages/admin/ContactDetails';
import UserInspection from './pages/admin/UserInspection';

// Common components
import Header from './components/common/Header';
import AdminHeader from './components/common/AdminHeader';

// Form components
import AddstudioForm from './components/forms/AddStudioForm';
import AddVenueForm from './components/forms/AddVenueForm';
import AddCuisineForm from './components/forms/AddCuisineForm';
import EditVenue from './components/forms/EditVenueForm';
import EditCuisines from './components/forms/EditCuisineForm';
import Editstudio from './components/forms/EditStudioForm';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

/* Routes fade through each other rather than cutting. The wrapper also resets
   scroll on navigation — react-router keeps the old position otherwise, which
   drops you into the middle of the next page. */
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function AppContent() {
  const location = useLocation();
  const pathname = location.pathname;

  const hideHeaderRoutes = [
    '/login',
    '/register',
    '/auth-success',
    '/admin-login',
    '/not-found',
    '/reset-password',
    '/welcome',
  ];

  const showHeaderForAdmin = [
    '/admin',
    '/admin-orders',
    '/admin-studios',
    '/admin-cuisines',
    '/admin-venues',
    '/admin-contact',
    '/admin-studios/edit',
    '/admin-venues/edit',
    '/admin-cuisines/edit',
    '/admin-cuisines/add',
    '/admin-cuisines/addCuisine',
    '/admin-venues/addVenue',
    '/admin-studios/addstudio',
    '/admin/users/inspect' // Add this for user inspection
  ];

  const shouldHideHeader = hideHeaderRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  const shouldShowAdminHeader = showHeaderForAdmin.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  return (
    <AuthProvider>
      <CartProvider>
      <ScrollProgress />
      {!shouldHideHeader && !shouldShowAdminHeader && <Header />}
      {shouldShowAdminHeader && <AdminHeader />}

      <PageTransition>
        <Routes location={location}>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:venueId" element={<VenueDetails />} />
          <Route path="/studios/:studioId" element={<StudioDetails />} />
          <Route path="/cuisines" element={<Cuisines />} />
          <Route path="/studios" element={<Studios />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          <Route path="/user-profile/:id" element={<UserProfile />} />
          {/* Khalti and Fonepay both return the customer here. */}
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/payment/:orderId" element={<PaymentSelection />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-orders" element={<AdminOrderList />} />
          <Route path="/admin/orders/:orderId" element={<OrderDetails />} />
          <Route path="/admin-studios" element={<Adminstudios />} />
          <Route path="/admin-cuisines" element={<AdminCuisines />} />
          <Route path="/admin-venues" element={<AdminVenues />} />
          <Route path="/admin-contact" element={<AdminContact />} />
          <Route path="/admin-contact/:contactId" element={<ContactDetails/>}/>
          
          {/* Admin Edit Routes */}
          <Route path="/admin-studios/edit/:id" element={<Editstudio />} />
          <Route path="/admin-venues/edit/:id" element={<EditVenue />} />
          <Route path="/admin-cuisines/edit/:categoryId/:dishId" element={<EditCuisines />} />
          
          {/* Admin Add Routes */}
          <Route path="/admin-cuisines/add" element={<AddCuisineForm />} />
          <Route path="/admin-cuisines/addCuisine" element={<AddCuisineForm />} />
          <Route path="/admin-venues/addVenue" element={<AddVenueForm />} />
          <Route path="/admin-studios/addstudio" element={<AddstudioForm />} />

          {/* User Inspection Route */}
          <Route path="/admin/users/inspect/:userId" element={<UserInspection />} />

          {/* Not Found Route */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </PageTransition>

        {/* Styling lives in globals.css so toasts inherit the house type and
            palette. The inline fontFamily that used to sit here named Inter,
            which this site does not load. */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          newestOnTop={false}
          closeOnClick
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
