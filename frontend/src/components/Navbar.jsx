import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiUserGroup, HiLogout, HiSearch, HiChatAlt2, HiBell, HiPlus, HiLightningBolt } from 'react-icons/hi';
import ProfileModal from './ProfileModal';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { logout, user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label, active }) => (
        <Link to={to} className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${active ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
            <Icon className="w-6 h-6" />
            {/* Tooltip for Desktop Rail */}
            <div className="absolute left-14 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 translate-x-[-10px] group-hover:translate-x-0 duration-200">
                {label}
            </div>
            {active && <div className="absolute left-0 w-1 h-6 bg-neon-cyan rounded-r-full shadow-[0_0_10px_#00E5FF]"></div>}
        </Link>
    );

    return (
        <>
            {/* --- DESKTOP: CONTROL RAIL (Left) --- */}
            <nav className="hidden md:flex flex-col fixed left-0 top-0 w-20 h-full glass-panel border-r border-white/5 z-50 items-center py-8">
                {/* Logo Icon */}
                <Link to="/" className="mb-10 w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-neon-purple to-neon-cyan rounded-xl shadow-[0_0_20px_rgba(118,58,245,0.3)] hover:scale-105 transition-transform">
                    <span className="text-xl font-bold text-black font-cookie">S</span>
                </Link>

                {/* Navigation Icons */}
                <div className="flex flex-col gap-6 w-full items-center">
                    <NavItem to="/feed" icon={HiHome} label="Home" active={location.pathname === '/feed'} />
                    <NavItem to="/search" icon={HiSearch} label="Search" active={location.pathname === '/search'} />
                    <NavItem to="/groups" icon={HiUserGroup} label="Groups" active={location.pathname === '/groups'} />
                    <NavItem to="/notifications" icon={HiBell} label="Alerts" active={location.pathname === '/notifications'} />
                    {user?.role === 'ADMIN' && (
                        <NavItem to="/shadow" icon={HiLightningBolt} label="God Mode" active={location.pathname === '/shadow'} />
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col gap-6 items-center w-full pb-4">
                    <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-neon-cyan hover:text-neon-cyan transition-all group">
                        <HiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>

                    <button onClick={() => setShowProfile(true)} className="relative group">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-neon-purple transition-all">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.anonymousName || 'User')}&background=random&color=fff&size=50`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>

                    <button onClick={logout} className="text-neutral-500 hover:text-red-400 transition-colors">
                        <HiLogout className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* --- MOBILE: COMMAND CAPSULE (Bottom Floating) --- */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-[70px] glass-panel rounded-full z-50 flex items-center justify-between px-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10">
                <Link to="/feed" className={`p-2 transition-colors ${location.pathname === '/feed' ? 'text-white' : 'text-neutral-500'}`}>
                    <HiHome className="w-6 h-6" />
                </Link>

                <Link to="/search" className="p-2 text-neutral-500">
                    <HiSearch className="w-6 h-6" />
                </Link>

                {/* Central Action Button (Floating Outstick) */}
                <button className="relative -top-6">
                    <div className="w-14 h-14 bg-gradient-to-tr from-neon-purple to-neon-cyan rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(118,58,245,0.4)] border-4 border-black hover:scale-105 transition-transform">
                        <HiPlus className="w-8 h-8 text-black" />
                    </div>
                </button>

                {user?.role === 'ADMIN' ? (
                    <Link to="/shadow" className={`p-2 transition-colors ${location.pathname === '/shadow' ? 'text-white' : 'text-neutral-500'}`}>
                        <HiLightningBolt className="w-6 h-6" />
                    </Link>
                ) : (
                    <Link to="/groups" className={`p-2 transition-colors ${location.pathname === '/groups' ? 'text-white' : 'text-neutral-500'}`}>
                        <HiUserGroup className="w-6 h-6" />
                    </Link>
                )}

                <button onClick={() => setShowProfile(true)} className="p-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/30">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.anonymousName || 'User')}&background=random&color=fff&size=50`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </button>
            </div>

            {/* Render Modal */}
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
        </>
    );
};

export default Navbar;
