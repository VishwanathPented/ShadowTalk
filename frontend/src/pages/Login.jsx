import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

import CyberpunkBackground from '../components/CyberpunkBackground';
import { motion } from 'framer-motion';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alias, setAlias] = useState('');
    const { login, signup, googleLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
        if (!emailRegex.test(email)) {
            toast.error("Invalid email format. Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const userData = await login(email, password);
                toast.success('Welcome back, ghost.');
                if (userData.role === 'ADMIN') {
                    navigate('/shadow');
                    return;
                }
            } else {
                await signup(email, password, alias);
                toast.success('Account created anonymously.');
            }
            navigate('/feed');
        } catch (error) {
            console.error("Login Error:", error);
            if (error.response) {
                console.error("Response Data:", error.response.data);
                console.error("Response Status:", error.response.status);
            }
            toast.error(isLogin ? 'Login failed: ' + (error.response?.data?.message || error.message) : 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            <CyberpunkBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl bg-neutral-900/60">
                    <div className="text-center mb-8">
                        <motion.h2
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent bg-clip-text text-transparent mb-2"
                        >
                            {isLogin ? 'Enter the Void' : 'Join the Shadows'}
                        </motion.h2>
                        <p className="text-neutral-400">
                            {isLogin ? 'Welcome back, anonymous traveler.' : 'Create your secret identity. No masks required.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Alias (Optional)</label>
                                <input
                                    type="text"
                                    value={alias}
                                    onChange={(e) => setAlias(e.target.value)}
                                    className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all decoration-none"
                                    placeholder="Choose your codename..."
                                />
                            </motion.div>
                        )}
                        <div>
                            <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-brand-primary to-brand-accent shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                isLogin ? 'Manifest Identity' : 'Initiate Protocol'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                googleLogin(credentialResponse.credential)
                                    .then((userData) => {
                                        toast.success('Welcome back, verified operative.');
                                        if (userData.role === 'ADMIN') {
                                            navigate('/shadow');
                                        } else {
                                            navigate('/feed');
                                        }
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        toast.error('Google Sign-In failed: ' + (err.response?.data || "Unable to verify"));
                                    });
                            }}
                            onError={() => {
                                toast.error('Google Sign-In Failed');
                            }}
                            theme="filled_black"
                            shape="pill"
                            width="300"
                        />
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-neutral-400 hover:text-white text-sm transition-colors group"
                        >
                            {isLogin ? (
                                <span>Need a secret identity? <span className="text-brand-primary font-bold group-hover:underline">Sign up</span></span>
                            ) : (
                                <span>Already have a mask? <span className="text-brand-primary font-bold group-hover:underline">Login</span></span>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
