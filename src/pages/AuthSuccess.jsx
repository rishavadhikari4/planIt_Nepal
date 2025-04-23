import {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function AuthSuccess(){
    const navigate = useNavigate();

    useEffect(()=>{
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');
        if(token){
            localStorage.setItem('token', token);
            navigate('/');
        }
    },[]);
    return (
        <p>Logging in...</p>
    )
}

export default AuthSuccess;