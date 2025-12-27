import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


import CyberpunkBackground from '../components/CyberpunkBackground';
import { motion } from 'framer-motion';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(0); // 0: Email, 1: OTP+NewPass

    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [alias, setAlias] = useState('');
    const { login, signup, verifyOtp, forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
            if (isForgotPassword) {
                if (resetStep === 0) {
                    // Send OTP for reset
                    await forgotPassword(email);
                    toast.success('Reset Code sent to email.');
                    setResetStep(1);
                } else {
                    // Confirm Reset
                    await resetPassword(email, otp, newPassword);
                    toast.success('Password reset! Please login.');
                    setIsForgotPassword(false);
                    setResetStep(0);
                    setIsLogin(true);
                }
            } else if (isOtpStep) {
                // Verify OTP (Signup)
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
            const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : error.message);
            toast.error('Operation failed: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (isForgotPassword) return resetStep === 0 ? 'Recover Access' : 'Secure New Key';
        if (isOtpStep) return 'Verify Signal';
        return isLogin ? 'Enter the Void' : 'Join the Shadows';
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
                            key={getTitle()}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent bg-clip-text text-transparent mb-2"
                        >
                            {getTitle()}
                        </motion.h2>
                        <p className="text-neutral-400">
                            {isForgotPassword
                                ? 'Lost in the net? Let’s get you back.'
                                : (isOtpStep ? 'Enter the code sent to your frequency.'
                                    : (isLogin ? 'Welcome back, anonymous traveler.' : 'Create your secret identity.'))
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {isForgotPassword && resetStep === 1 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Reset Code</label>
                                <input
                                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary tracking-widest text-center text-xl font-mono mb-4"
                                    placeholder="000000" maxLength={6}
                                />
                                <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">New Password</label>
                                <input
                                    type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    placeholder="New Secure Password"
                                />
                            </motion.div>
                        ) : isOtpStep ? (
                            <motion.div key="otp-input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Verification Code</label>
                                <input
                                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary tracking-widest text-center text-xl font-mono"
                                    placeholder="000000" maxLength={6}
                                />
                                <p className="text-xs text-center text-neutral-500 mt-2">Check your email for the code</p>
                            </motion.div>
                        ) : (
                            <>
                                {!isLogin && !isForgotPassword && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                                        <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Alias (Optional)</label>
                                        <input
                                            type="text" value={alias} onChange={(e) => setAlias(e.target.value)}
                                            className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                            placeholder="Choose your codename..."
                                        />
                                    </motion.div>
                                )}

                                {/* Email Field - Always visible except step 1 of reset (implicit state simplification) -- actually let's keep it consistent */}
                                <div>
                                    <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Email</label>
                                    <input
                                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                        placeholder="you@example.com"
                                        disabled={isForgotPassword && resetStep === 1}
                                    />
                                    {!isLogin && !isForgotPassword && (
                                        <div className="mt-3 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                                            <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                                                <span className="text-brand-primary font-bold uppercase tracking-wide mr-1">Privacy Note:</span>
                                                Your email is <span className="text-white font-bold">never revealed</span>. Used strictly for verification.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {!isForgotPassword && (
                                    <div>
                                        <label className="block text-brand-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Password</label>
                                        <input
                                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-neutral-950/50 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                            placeholder="••••••••"
                                        />
                                        {isLogin && (
                                            <div className="flex justify-end mt-1">
                                                <button type="button" onClick={() => { setIsForgotPassword(true); setIsLogin(false); }} className="text-blue-500 font-bold underline text-sm hover:text-blue-400 transition-colors">
                                                    Forgot Password? (DEBUG)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-brand-primary to-brand-accent shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">Processing...</span>
                            ) : (
                                isForgotPassword ? (resetStep === 0 ? 'Send Reset Code' : 'Reset Password') :
                                    isOtpStep ? 'Confirm Identity' : (isLogin ? 'Manifest Identity' : 'Initiate Protocol')
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setIsOtpStep(false);
                                setIsForgotPassword(false);
                                setResetStep(0);
                            }}
                            className="text-neutral-400 hover:text-white text-sm transition-colors group"
                        >
                            {isForgotPassword ? (
                                <span>Remembered it? <span className="text-brand-primary font-bold group-hover:underline">Login</span></span>
                            ) : isLogin ? (
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
