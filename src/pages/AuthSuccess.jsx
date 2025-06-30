import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // adjust path as needed

function AuthSuccess() {
  const navigate = useNavigate();
  const { refreshAuth } = useContext(AuthContext);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token');
    const user = query.get('user');

    if (token && user) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', decodeURIComponent(user)); // assuming the backend URI-encoded it
        refreshAuth(); // update context with stored user
        navigate('/');
      } catch (error) {
        console.error('Failed to parse user data from query:', error);
        navigate('/login'); // fallback
      }
    } else {
      navigate('/login');
    }
  }, [navigate, refreshAuth]);

  return <p>Logging in...</p>;
}

export default AuthSuccess;
