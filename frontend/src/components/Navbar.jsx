import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiUserGroup, HiLogout } from 'react-icons/hi';

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <nav className="fixed bottom-0 w-full bg-brand-dark/90 backdrop-blur-md border-t border-slate-800 md:top-0 md:bottom-auto md:border-b md:border-t-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent hidden md:block">
                    GhostSocial
                </Link>

                <div className="flex justify-around w-full md:w-auto md:gap-8">
                    <Link to="/" className="p-2 text-slate-400 hover:text-white transition-colors flex flex-col items-center md:flex-row md:gap-2">
                        <HiHome className="w-6 h-6" />
                        <span className="text-xs md:text-sm">Feed</span>
                    </Link>
                    <Link to="/groups" className="p-2 text-slate-400 hover:text-white transition-colors flex flex-col items-center md:flex-row md:gap-2">
                        <HiUserGroup className="w-6 h-6" />
                        <span className="text-xs md:text-sm">Groups</span>
                    </Link>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors flex flex-col items-center md:flex-row md:gap-2">
                        <HiLogout className="w-6 h-6" />
                        <span className="text-xs md:text-sm">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
