import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alias, setAlias] = useState('');
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
                toast.success('Welcome back, ghost.');
            } else {
                await signup(email, password, alias);
                toast.success('Account created anonymously.');
            }
            navigate('/');
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent text-center mb-2">
                    {isLogin ? 'Enter the Void' : 'Join the Shadows'}
                </h2>
                <p className="text-slate-500 text-center mb-8">
                    {isLogin ? 'Welcome back, anonymous traveler.' : 'Create your secret identity.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Alias (Optional)</label>
                            <input
                                type="text"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                                placeholder="Choose your codename..."
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Email (Private)</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-400 hover:text-brand-primary text-sm transition-colors"
                    >
                        {isLogin ? "Need a secret identity? Sign up" : "Already have a mask? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
