import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CyberpunkBackground from './CyberpunkBackground';

const Layout = () => {
    return (
        <div className="min-h-screen text-slate-200 pb-20 md:pb-0 md:pt-16 relative">
            <CyberpunkBackground />
            <Navbar />
            <main className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
                <Outlet />
            </main>

            {/* Global Footer */}
            <footer className="relative z-10 py-8 border-t border-slate-800/50 mt-10 bg-slate-950/30 backdrop-blur-sm">
                <div className="container mx-auto px-4 max-w-7xl text-center text-xs text-slate-600">
                    <p>&copy; 2024 ShadowTalk Network. All rights reserved.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <span className="hover:text-brand-primary cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-brand-primary cursor-pointer transition-colors">Terms of Service</span>
                        <span className="hover:text-brand-primary cursor-pointer transition-colors">Shadow Protocol</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
