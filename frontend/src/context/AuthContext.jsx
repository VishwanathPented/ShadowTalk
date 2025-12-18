import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
// import jwtDecode from 'jwt-decode'; // Cannot use import needing install if not installed, but we added it to package.json.
// However, to keep it simple and robust without valid node_modules, we will just store token.

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // decipher user from token or fetch profile?
            // For MVP, we just assume valid if token exists.
            // Ideally: await api.get('/auth/me')
            setUser({ loggedIn: true });
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({ loggedIn: true });
        return true;
    };

    const signup = async (email, password) => {
        await api.post('/auth/signup', { email, password });
        return login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
