import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { ScrollProgress } from './components/ui/Motion';

// Auth pages

import Login from './pages/auth/Login';

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

// Admin pages

// Common components
import Header from './components/common/Header';
import AdminHeader from './components/common/AdminHeader';

// Form components

/* Route-level splitting.
   The public catalogue stays in the first chunk — it is what a visitor
   arrives on, and a spinner there costs more than the bytes save. Everything
   behind a login, and the whole admin section, loads on demand: it was a
   third of a 650kB bundle that most visitors never open. */
const AuthSuccess = lazy(() => import('./pages/auth/AuthSuccess'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Welcome = lazy(() => import('./pages/auth/Welcome'));
const Cart = lazy(() => import('./pages/user/Cart'));
const UserProfile = lazy(() => import('./pages/user/Profile'));
const PaymentSelection = lazy(() => import('./pages/user/PaymentSelection'));
const PaymentCallback = lazy(() => import('./pages/user/PaymentCallback'));
const OrderSuccess = lazy(() => import('./pages/user/OrderSuccess'));
const Admin = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Adminstudios = lazy(() => import('./pages/admin/StudioManagement'));
const AdminCuisines = lazy(() => import('./pages/admin/CuisineManagement'));
const AdminVenues = lazy(() => import('./pages/admin/VenueManagement'));
const AdminContact = lazy(() => import('./pages/admin/ContactManagement'));
const AdminAvailability = lazy(() => import('./pages/admin/AvailabilityCalendar'));
const AdminOrderList = lazy(() => import('./pages/admin/OrderManagement'));
const OrderDetails = lazy(() => import('./pages/admin/OrderDetails'));
const ContactDetails = lazy(() => import('./pages/admin/ContactDetails'));
const UserInspection = lazy(() => import('./pages/admin/UserInspection'));
const AddstudioForm = lazy(() => import('./components/forms/AddStudioForm'));
const AddVenueForm = lazy(() => import('./components/forms/AddVenueForm'));
const AddCuisineForm = lazy(() => import('./components/forms/AddCuisineForm'));
const EditVenue = lazy(() => import('./components/forms/EditVenueForm'));
const EditCuisines = lazy(() => import('./components/forms/EditCuisineForm'));
const Editstudio = lazy(() => import('./components/forms/EditStudioForm'));

/* Held for a chunk that is still arriving. Deliberately quiet — a full-page
   spinner for a fetch that usually finishes in under 200ms reads as a fault. */
const RouteFallback = () => (
  <div className="flex min-h-[70vh] items-center justify-center bg-paper">
    <span className="loader" aria-label="Loading" />
  </div>
);

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';

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
    '/admin-availability',
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
      <FavoritesProvider>
      <ScrollProgress />
      {!shouldHideHeader && !shouldShowAdminHeader && <Header />}
      {shouldShowAdminHeader && <AdminHeader />}

      <PageTransition>
        <Suspense fallback={<RouteFallback />}>
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
          <Route path="/admin-availability" element={<AdminAvailability />} />
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
        </Suspense>
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
      </FavoritesProvider>
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
