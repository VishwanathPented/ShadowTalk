import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser({
                loggedIn: true,
                ...res.data
            });
        } catch (err) {
            console.error("Failed to fetch profile", err);
            // Don't log out immediately on benign network error, but if 401, maybe.
            // keeping simple:
        }
    };

    useEffect(() => {
        if (token) {
            // Initial decode for fast UI
            try {
                const decoded = jwtDecode(token);
                // Set basic user first
                setUser(prev => ({
                    ...(prev || {}),
                    loggedIn: true,
                    email: decoded.sub,
                    anonymousName: decoded.anonymousName,
                    role: decoded.role || 'USER' // fallback
                }));

                // Then fetch rich data
                fetchProfile();

            } catch (e) {
                console.error("Failed to decode token", e);
                setUser(null);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        // The backend now returns the full map, so we can set user immediately without extra fetch
        const data = res.data;
        let newToken = data.token;
        if (typeof newToken === 'string') {
            newToken = newToken.replace(/^"|"$/g, '');
        }
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({ loggedIn: true, ...data });
        return data;
    };

    const signup = async (email, password, alias) => {
        const res = await api.post('/auth/signup', { email, password, alias });
        return res.data;
    };

    const verifyOtp = async (email, otp) => {
        const res = await api.post('/auth/verify-otp', { email, otp });
        const data = res.data;
        let newToken = data.token;
        if (typeof newToken === 'string') {
            newToken = newToken.replace(/^"|"$/g, '');
        }
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({ loggedIn: true, ...data });
        return data;
    };



    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const regenerateIdentity = async () => {
        try {
            const res = await api.post('/auth/regenerate-identity');
            // The backend returns the new token AND user stats
            const data = res.data;
            let newToken = data.token;

            if (newToken) {
                if (typeof newToken === 'string') {
                    newToken = newToken.replace(/^"|"$/g, '');
                }
                localStorage.setItem('token', newToken);
                setToken(newToken);
                setUser({ loggedIn: true, ...data }); // Update immediatley
                return true;
            }
            return false;
        } catch (error) {
            console.error("Identity regeneration failed:", error);
            throw error;
        }
    };



    return (
        <AuthContext.Provider value={{ user, login, signup, verifyOtp, logout, regenerateIdentity, loading }}>
            {loading ? <div className="text-white text-center mt-20">Initializing Session...</div> : children}
        </AuthContext.Provider>
    );
};
