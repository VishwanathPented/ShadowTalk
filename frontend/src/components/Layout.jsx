import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CyberpunkBackground from './CyberpunkBackground';

const Layout = () => {
    return (
        <div className="min-h-screen bg-black text-slate-200 pb-20 md:pb-0 md:pt-16 selection:bg-white selection:text-black">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Outlet />
            </main>

            {/* Global Footer - Minimal */}
            <footer className="py-10 border-t border-white/10 mt-20 text-center">
                <p className="text-xs text-neutral-600 font-mono uppercase tracking-widest">ShadowTalk Network // Obsidian Protocol</p>
            </footer>
        </div>
    );
};

export default Layout;
