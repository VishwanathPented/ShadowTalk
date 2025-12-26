import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, login, signup } = useAuth();

    // Default to Signup for "Getting Started" feel
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alias, setAlias] = useState('');

    if (user && user.loggedIn) {
        return <Navigate to="/feed" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
        if (!emailRegex.test(email)) {
            toast.error("Invalid email format.");
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await login(email, password);
                toast.success('Welcome back, Shadow.');
            } else {
                await signup(email, password, alias);
                toast.success('Identity Created.');
            }
            navigate('/feed');
        } catch (error) {
            console.error("Auth Error:", error);
            toast.error(isLogin ? 'Login failed.' : 'Signup failed. Email might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Mesh Background is global in index.css, just need transparency here */}

            <div className="w-full max-w-sm relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Glass Monolith Card */}
                    <div className="glass-panel p-8 rounded-[30px] border border-white/10 backdrop-blur-2xl bg-black/40 shadow-[0_0_50px_rgba(118,58,245,0.15)]">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-5xl font-bold mb-2 font-cookie text-white tracking-wider" style={{ fontFamily: '"Billabong", "InstaFont", sans-serif' }}>
                                ShadowTalk
                            </h1>
                            <p className="text-neutral-400 text-sm tracking-widest uppercase font-semibold">
                                {isLogin ? 'RESUME SESSION' : 'INITIATE PROTOCOL'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Signup Alias Field */}
                            <AnimatePresence>
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-white/5 rounded-xl border border-white/5 focus-within:border-neon-purple transition-colors p-1">
                                            <input
                                                type="text"
                                                value={alias}
                                                onChange={(e) => setAlias(e.target.value)}
                                                className="w-full bg-transparent border-none text-white px-3 py-2 focus:outline-none placeholder-neutral-500 text-sm"
                                                placeholder="Codename (Optional)"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="bg-white/5 rounded-xl border border-white/5 focus-within:border-neon-cyan transition-colors p-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent border-none text-white px-3 py-2 focus:outline-none placeholder-neutral-500 text-sm"
                                    placeholder="Email"
                                />
                            </div>

                            <div className="bg-white/5 rounded-xl border border-white/5 focus-within:border-neon-cyan transition-colors p-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent border-none text-white px-3 py-2 focus:outline-none placeholder-neutral-500 text-sm"
                                    placeholder="Password"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-bold text-sm text-black shadow-lg transition-all duration-300 mt-4
                                    ${isLogin
                                        ? 'bg-white hover:bg-neutral-200'
                                        : 'bg-gradient-to-r from-neon-purple to-neon-cyan hover:shadow-neon-purple/50'
                                    }`}
                            >
                                {loading ? 'PROCESSING...' : (isLogin ? 'ENTER' : 'JOIN THE SHADOWS')}
                            </motion.button>
                        </form>

                        {/* Toggle */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
                            >
                                {isLogin ? "Don't have an ID? Create One" : "Already have an ID? Login"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const FeatureCard = ({ number, title, desc }) => (
    <div className="p-12 bg-brand-dark hover:bg-brand-surface group transition-colors relative overflow-hidden h-64 flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white group-hover:text-acid transition-colors select-none">{number}</div>
        <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tighter font-sans group-hover:text-acid transition-colors">{title}</h3>
        <p className="text-neutral-500 text-sm leading-relaxed font-mono">{desc}</p>
        <div className="w-8 h-1 bg-neutral-800 group-hover:bg-acid transition-colors mt-auto" />
    </div>
);

export default LandingPage;
