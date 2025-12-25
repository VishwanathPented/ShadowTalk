import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiUserGroup, HiLogout, HiUser } from 'react-icons/hi';
import ProfileModal from './ProfileModal';

const Navbar = () => {
    const { logout, user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    return (
        <nav className="fixed bottom-0 w-full bg-slate-900/60 backdrop-blur-xl border-t md:border-b md:border-t-0 border-slate-700/50 md:top-0 md:bottom-auto z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent hidden md:block tracking-tight">
                    ShadowTalk
                </Link>

                <div className="flex justify-around w-full md:w-auto md:gap-6 items-center">
                    <Link to="/feed" className="p-2 text-slate-400 hover:text-white transition-colors flex flex-col items-center md:flex-row md:gap-2 group">
                        <HiHome className="w-6 h-6 group-hover:text-brand-primary transition-colors" />
                        <span className="text-xs md:text-sm hidden md:block">Feed</span>
                    </Link>
                    <Link to="/groups" className="p-2 text-slate-400 hover:text-white transition-colors flex flex-col items-center md:flex-row md:gap-2 group">
                        <HiUserGroup className="w-6 h-6 group-hover:text-brand-primary transition-colors" />
                        <span className="text-xs md:text-sm hidden md:block">Groups</span>
                    </Link>

                    <div className="h-8 w-px bg-slate-700/50 hidden md:block mx-2"></div>

                    {/* Profile Trigger */}
                    <button
                        onClick={() => setShowProfile(true)}
                        className="p-1 rounded-full border-2 border-transparent hover:border-brand-primary transition-all ml-2"
                    >
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.anonymousName || 'User')}&background=random&color=fff&size=32`}
                            alt="Profile"
                            className="w-8 h-8 rounded-full bg-slate-800"
                        />
                    </button>

                    {user?.role === 'ADMIN' && (
                        <Link to="/shadow" className="p-2 text-red-500 hover:text-red-400 transition-colors flex flex-col items-center md:flex-row md:gap-2 group ml-2" title="Shadow Protocol (Admin)">
                            <span className="text-xl">🛡️</span>
                        </Link>
                    )}

                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors flex flex-col items-center md:flex-row md:gap-2 group ml-2">
                        <HiLogout className="w-6 h-6 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Render Modal */}
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
        </nav>
    );
};

export default Navbar;
