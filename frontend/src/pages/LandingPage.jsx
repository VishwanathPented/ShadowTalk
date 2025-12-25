import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user && user.loggedIn) {
        return <Navigate to="/feed" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-brand-primary selection:text-white">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Navbar Placeholder (logo only) */}
            <nav className="relative z-10 flex justify-between items-center p-6 md:px-12">
                <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                    ShadowTalk
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 rounded-full border border-slate-700 hover:border-brand-primary hover:text-brand-primary transition-all duration-300 text-sm font-medium backdrop-blur-sm"
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 mt-20 md:mt-32">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-semibold tracking-wide uppercase animate-fade-in-down">
                    The Future of Anonymous Social
                </div>

                <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-brand-primary via-purple-500 to-brand-accent bg-clip-text text-transparent animate-pulse-slow">
                    ShadowTalk
                </h1>
                <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Speak freely in the shadows. <span className="text-brand-primary font-semibold">One Identity. No Masks. No Traces.</span>
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full font-bold text-lg shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/50 transform hover:-translate-y-1 transition-all duration-300 ring-2 ring-white/10"
                    >
                        Enter the Void
                    </button>
                    <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-full font-bold text-lg backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-300">
                        Learn More
                    </button>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full px-4 mb-20">
                    <FeatureCard
                        icon="🎭"
                        title="Anonymous Identity"
                        desc="Choose an alias or let us generate a cryptic codename for you. No real names required."
                    />
                    <FeatureCard
                        icon="👻"
                        title="Ghost Groups"
                        desc="Create ephemeral communities that exist only for the moment. Discuss freely."
                    />
                    <FeatureCard
                        icon="🔒"
                        title="Secure & Private"
                        desc="Your data is yours. Built with privacy-first architecture from the ground up."
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-brand-primary/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/80 group text-left">
        <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand-primary transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
