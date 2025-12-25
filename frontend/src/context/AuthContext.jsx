import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                console.log("Attempting to decode token:", token);
                const decoded = jwtDecode(token);
                console.log("Decoded successfully:", decoded);
                // Spring Security usually puts email/username in 'sub'
                // We also get 'anonymousName' from our custom claim
                setUser({
                    loggedIn: true,
                    email: decoded.sub,
                    anonymousName: decoded.anonymousName
                });
            } catch (e) {
                console.error("Failed to decode token", e);
                setUser(null);
                localStorage.removeItem('token'); // Clean up bad token
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        console.log("Login Response Data:", res.data); // Debug
        let newToken = res.data.token;
        if (typeof newToken === 'string') {
            // Remove potential double quotes if backend sent raw string somehow (unlikely but possible)
            newToken = newToken.replace(/^"|"$/g, '');
        }
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({ loggedIn: true });
        return true;
    };

    const signup = async (email, password, alias) => {
        await api.post('/auth/signup', { email, password, alias });
        return login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const fetchPersonas = async () => {
        try {
            const res = await api.get('/api/personas');
            return res.data;
        } catch (e) {
            console.error("Failed to fetch personas", e);
            return [];
        }
    };

    const createPersona = async (name, avatarColor) => {
        const res = await api.post('/api/personas', { name, avatarColor });
        return res.data;
    };

    const switchPersona = async (personaId) => {
        const res = await api.put(`/api/personas/${personaId}/equip`);
        // Update local user state with new active persona if needed, or just reload
        // Ideally we update the user object here.
        // For now, let's just refetch or rely on next page load.
        // Better: update user context
        // setUser(prev => ({ ...prev, ...updatedUserFields }));
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, fetchPersonas, createPersona, switchPersona }}>
            {loading ? <div className="text-white text-center mt-20">Initializing Session...</div> : children}
        </AuthContext.Provider>
    );
};
