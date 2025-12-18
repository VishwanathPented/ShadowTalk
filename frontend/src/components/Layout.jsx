import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 md:pb-0 md:pt-16">
            <Navbar />
            <main className="container mx-auto px-4 py-4 max-w-2xl">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
