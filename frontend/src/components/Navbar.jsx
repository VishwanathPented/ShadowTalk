import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiUserGroup, HiLogout, HiUser, HiHeart } from 'react-icons/hi';
import ProfileModal from './ProfileModal';

const Navbar = () => {
    const { logout, user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    return (
        <>
            {/* Desktop Sidebar (Left) */}
            <nav className="hidden md:flex flex-col fixed left-0 top-0 w-64 h-full bg-black/60 backdrop-blur-xl border-r border-white/5 p-6 z-50">
                {/* Logo */}
                <Link to="/" className="text-3xl font-bold tracking-tight text-white mb-10 pl-2 font-cookie" style={{ fontFamily: '"Billabong", "InstaFont", sans-serif' }}>
                    ShadowTalk
                </Link>

                {/* Nav Links */}
                <div className="flex flex-col gap-4">
                    <Link to="/feed" className="flex items-center gap-4 text-white hover:bg-white/10 p-3 rounded-xl transition-all group">
                        <HiHome className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-medium">Home</span>
                    </Link>

                    <button className="flex items-center gap-4 text-white hover:bg-white/10 p-3 rounded-xl transition-all group">
                        <div className="w-7 h-7 flex items-center justify-center">
                            <span className="text-2xl leading-none group-hover:scale-110 transition-transform">🔍</span>
                        </div>
                        <span className="text-lg font-medium">Search</span>
                    </button>

                    <button className="flex items-center gap-4 text-white hover:bg-white/10 p-3 rounded-xl transition-all group">
                        <div className="w-7 h-7 flex items-center justify-center">
                            <span className="text-2xl leading-none group-hover:scale-110 transition-transform">💬</span>
                        </div>
                        <span className="text-lg font-medium">Messages</span>
                    </button>

                    <Link to="/groups" className="flex items-center gap-4 text-white hover:bg-white/10 p-3 rounded-xl transition-all group relative">
                        <HiUserGroup className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-medium">Groups</span>
                        <div className="absolute top-3 left-8 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black"></div>
                    </Link>

                    <button className="flex items-center gap-4 text-white hover:bg-white/10 p-3 rounded-xl transition-all group">
                        <HiHeart className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-medium">Notifications</span>
                    </button>

                    <button className="flex items-center gap-4 text-white hover:bg-white/10 p-3 rounded-xl transition-all group">
                        <div className="w-7 h-7 border-2 border-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-xl leading-none mb-0.5">+</span>
                        </div>
                        <span className="text-lg font-medium">Create</span>
                    </button>

                    {/* Profile */}
                    <button onClick={() => setShowProfile(true)} className="flex items-center gap-4 text-white hover:bg-white/10 p-3 rounded-xl transition-all mt-auto group">
                        <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/20 group-hover:ring-neon-purple transition-all">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.anonymousName || 'User')}&background=random&color=fff&size=50`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-lg font-medium">Profile</span>
                    </button>
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-2">
                    <button onClick={logout} className="flex items-center gap-4 text-neutral-400 hover:text-white p-3 rounded-xl transition-colors">
                        <HiLogout className="w-6 h-6" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Top Bar (Logo Only) */}
            <div className="md:hidden fixed top-0 w-full glass-bar border-b-0 z-50 h-[60px] flex items-center justify-between px-4">
                <Link to="/" className="text-2xl font-bold tracking-tight text-white font-cookie" style={{ fontFamily: '"Billabong", "InstaFont", sans-serif' }}>
                    ShadowTalk
                </Link>
                <button className="text-white">
                    <HiHeart className="w-7 h-7" />
                </button>
            </div>

            {/* Mobile Bottom Bar (Floating) */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 h-[65px] glass-panel rounded-2xl flex items-center justify-around px-2 z-50">
                <Link to="/feed" className="p-2 text-white hover:text-neon-cyan transition-colors">
                    <HiHome className="w-7 h-7" />
                </Link>

                <Link to="/groups" className="p-2 text-white hover:text-neon-cyan transition-colors relative">
                    <HiUserGroup className="w-7 h-7" />
                </Link>

                <button className="p-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-neon-purple to-neon-cyan rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-[0_0_10px_rgba(211,0,197,0.5)]">
                        +
                    </div>
                </button>

                <button className="p-2 text-white hover:text-neon-cyan transition-colors">
                    <span className="text-2xl">💬</span>
                </button>

                <button onClick={() => setShowProfile(true)} className="p-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/50">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.anonymousName || 'User')}&background=random&color=fff&size=50`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </button>
            </nav>

            {/* Render Modal */}
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
        </>
    );
};

export default Navbar;
