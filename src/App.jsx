import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AuthSuccess from './pages/AuthSuccess';
import Header from './components/Header';
import Home from './pages/Home';
import Venues from './pages/Venues';
import Dishes from './pages/Dishes';
import Decorations from './pages/Decorations';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import './styles/global.css';


function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/decorations" element={<Decorations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} /> 
          <Route path="/auth-success" element={<AuthSuccess />} />
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
      </main>
    </BrowserRouter>
  );
}

export default App;
