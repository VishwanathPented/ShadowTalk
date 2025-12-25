import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CyberpunkBackground from './CyberpunkBackground';

const Layout = () => {
    return (
        <div className="min-h-screen text-slate-200 pb-20 md:pb-0 md:pt-16 relative">
            <CyberpunkBackground />
            <Navbar />
            <main className="container mx-auto px-4 py-4 max-w-2xl relative z-10">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
