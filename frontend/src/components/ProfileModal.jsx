import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiX, HiLightningBolt } from 'react-icons/hi';

const ProfileModal = ({ onClose }) => {
    const { user, regenerateIdentity } = useAuth();
    const modalRef = useRef(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleRegenerate = async () => {
        if (window.confirm("Are you sure? This will permanently erase your current alias and generate a new one.")) {
            setIsRegenerating(true);
            try {
                await regenerateIdentity();
                // Optional: Show success toast or animation
            } catch (err) {
                alert("Failed to regenerate identity. Try again.");
            } finally {
                setIsRegenerating(false);
            }
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                ref={modalRef}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-scale-in"
            >
                {/* Background Glow */}
                <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[60px]"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <HiX className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent p-1 mb-4 shadow-lg shadow-brand-primary/20">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl overflow-hidden relative">
                            {/* Initials or Icon */}
                            <div className="w-full h-full absolute inset-0 opacity-50" style={{ backgroundColor: user.activePersona?.avatarColor || '#6366f1' }}></div>
                            <span className="relative z-10 font-bold text-white">
                                {user.anonymousName ? user.anonymousName.charAt(0) : '?'}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">
                        {user.anonymousName || 'Anonymous'}
                    </h2>
                    <p className="text-slate-400 text-sm mb-6"> shadow agent </p>

                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                            <div className="flex items-center justify-center gap-1.5 text-brand-primary mb-1">
                                <HiLightningBolt className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Reputation</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {user.reputationScore || 0}
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                            <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider">Posts</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {user.postCount || 0}
                            </div>
                        </div>
                    </div>
                    {user.createdAt && (
                        <div className="text-xs text-slate-500 mb-4">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                    )}

                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-500 hover:text-red-400 font-bold rounded-xl transition-all duration-300 border border-red-900/50 shadow-[0_0_10px_rgba(220,38,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isRegenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Rerolling...
                            </>
                        ) : (
                            <>
                                <span className="text-lg">🎲</span>
                                Burn Identity & Reborn
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
