import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchLoginUser } from '../services/userService';
import '../styles/auth.css'

function AuthSuccess() {
  const navigate = useNavigate();
  const { refreshAuth } = useContext(AuthContext);

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const query = new URLSearchParams(window.location.search);
      const token = query.get('token');

      if (token) {
        localStorage.setItem('token', token);

        try {
          const fullUser = await fetchLoginUser(); // fetch user from your backend
          localStorage.setItem('user', JSON.stringify(fullUser));

          refreshAuth(); // This will now succeed because token and user exist
          navigate('/');
        } catch (error) {
          console.error("Failed to fetch user after Google login:", error);
          navigate('/login'); // or show an error
        }
      }
    };

    handleGoogleLogin();
  }, [navigate, refreshAuth]);

  return (
            <div class="wrapper">
                    <div class="blue ball"></div>
                    <div class="red ball"></div>  
                    <div class="yellow ball"></div>  
                    <div class="green ball"></div>  
            </div>
        );
}

export default AuthSuccess;
