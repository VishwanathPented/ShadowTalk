import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


import CyberpunkBackground from '../components/CyberpunkBackground';
import { motion } from 'framer-motion';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alias, setAlias] = useState('');
    const { login, signup, verifyOtp } = useAuth();
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
            if (isOtpStep) {
                // Verify OTP
                await verifyOtp(email, otp);
                toast.success('Identity Verified.');
                navigate('/feed');
            } else if (isLogin) {
                const userData = await login(email, password);
                toast.success('Welcome back, ghost.');
                if (userData.role === 'ADMIN') {
                    navigate('/shadow');
                    return;
                }
                navigate('/feed');
            } else {
                // Signup Step 1
                const res = await signup(email, password, alias);
                toast.success(res.message || 'OTP Sent to your email.');
                setIsOtpStep(true);
            }
        } catch (error) {
            console.error("Auth Error:", error);
            const msg = error.response?.data?.message || error.message;
            toast.error(isOtpStep ? 'Verification failed: ' + msg : (isLogin ? 'Login failed: ' + msg : 'Signup failed: ' + msg));
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
                            key={isLogin ? 'login' : (isOtpStep ? 'verify' : 'signup')}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent bg-clip-text text-transparent mb-2"
                        >
                            {isOtpStep ? 'Verify Signal' : (isLogin ? 'Enter the Void' : 'Join the Shadows')}
                        </motion.h2>
                        <p className="text-neutral-400">
                            {isOtpStep ? 'Enter the code sent to your frequency.' : (isLogin ? 'Welcome back, anonymous traveler.' : 'Create your secret identity. No masks required.')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isOtpStep ? (
                            <motion.div
                                key="otp-input"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Verification Code</label>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-center tracking-widest text-xl font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                                <p className="text-xs text-center text-neutral-500 mt-2">Check your console/email for the code (Dev Mode)</p>
                            </motion.div>
                        ) : (
                            <>
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
                            </>
                        )}

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
                                isOtpStep ? 'Confirm Identity' : (isLogin ? 'Manifest Identity' : 'Initiate Protocol')
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setIsOtpStep(false);
                            }}
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
