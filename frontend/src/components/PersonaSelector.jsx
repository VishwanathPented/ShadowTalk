import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiUser, HiPlus, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const PersonaSelector = () => {
    const { user, fetchPersonas, createPersona, switchPersona } = useAuth();
    const [personas, setPersonas] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadPersonas();
        }
    }, [isOpen]);

    const loadPersonas = async () => {
        const data = await fetchPersonas();
        setPersonas(data);
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            await createPersona(null, null); // Backend generates random
            toast.success("A new mask has been forged.");
            await loadPersonas();
        } catch (error) {
            toast.error("Failed to forge mask.");
        } finally {
            setLoading(false);
        }
    };

    const handleSwitch = async (id) => {
        try {
            await switchPersona(id);
            toast.success("Mask equipped.");
            setIsOpen(false);
            window.location.reload(); // Simple reload to reflect changes for now
        } catch (error) {
            toast.error("Failed to equip mask.");
        }
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-800/50 transition-all group ring-2 ring-transparent hover:ring-brand-primary/30"
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-xs font-bold text-white relative overflow-hidden"
                    style={{ backgroundColor: user.activePersona?.avatarColor || '#6366f1' }}
                >
                    {user.activePersona?.name ? user.activePersona.name.charAt(0) : (user.anonymousName ? user.anonymousName.charAt(0) : <HiUser className="w-4 h-4" />)}
                </div>
                <div className="text-left hidden lg:block">
                    <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors max-w-[100px] truncate">
                        {user.activePersona?.name || user.anonymousName || 'Anonymous'}
                    </p>
                </div>
            </button>

            {isOpen && (
                <div className="absolute bottom-full md:bottom-auto md:top-full right-0 w-64 mb-4 md:mt-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-2 z-50 overflow-hidden animate-fade-in-up md:animate-fade-in-down">
                    <div className="max-h-60 overflow-y-auto space-y-1 mb-2 custom-scrollbar">
                        {personas.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSwitch(p.id)}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transform group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: p.avatarColor }}
                                    >
                                        {p.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-slate-200 group-hover:text-white">{p.name}</div>
                                        {user.activePersona?.id === p.id && <div className="text-[10px] text-brand-primary">Active Mask</div>}
                                    </div>
                                </div>
                                {user.activePersona?.id === p.id && <HiCheck className="text-brand-primary w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-accent rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-primary/25 transition-all"
                    >
                        <HiPlus className="w-4 h-4" />
                        <span>Forge New Mask</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PersonaSelector;
