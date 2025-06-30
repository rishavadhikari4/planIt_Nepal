import {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

function AuthSuccess(){
    const navigate = useNavigate();
    const refreshAuth = useContext(AuthContext);

    useEffect(()=>{
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');
        if(token){
            refreshAuth();
            navigate('/');

        }
    },[]);
    return (
        <p>Logging in...</p>
    )
}

export default AuthSuccess;