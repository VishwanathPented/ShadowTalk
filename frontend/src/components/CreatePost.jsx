import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiPaperAirplane } from 'react-icons/hi';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [banEndTime, setBanEndTime] = useState(() => {
        const saved = localStorage.getItem('shadow_ban_end_time');
        return saved ? parseInt(saved, 10) : null;
    });
    const [, setTick] = useState(0); // Force re-render for timer

    useEffect(() => {
        if (!banEndTime) {
            return;
        }
        localStorage.setItem('shadow_ban_end_time', banEndTime);
        const interval = setInterval(() => {
            if (Date.now() > banEndTime) {
                setBanEndTime(null);
                localStorage.removeItem('shadow_ban_end_time');
                setContent('');
            } else {
                // Trigger re-render by updating tick
                setTick(t => t + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [banEndTime]);

    const formatTimeLeft = () => {
        if (!banEndTime) return "";
        const diff = Math.max(0, Math.floor((banEndTime - Date.now()) / 1000));
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await api.post('/api/posts', { content });
            setContent('');
            toast.success('Posted anonymously!');
            if (onPostCreated) onPostCreated();
        } catch (error) {
            const msg = error.response?.data || 'Failed to post';
            toast.error(msg);

            if (msg.includes("banned")) {
                const match = msg.match(/until ([\d-:.T]+)/);
                if (match) {
                    // Try to parse server time
                    const untilDate = new Date(match[1]);
                    if (!isNaN(untilDate.getTime())) {
                        setBanEndTime(untilDate.getTime());
                        return;
                    }
                }
                // Fallback or "Banned word detected" (immediate 5 min)
                if (!banEndTime) {
                    setBanEndTime(Date.now() + 5 * 60 * 1000);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-neutral-900/40 backdrop-blur-md border border-neutral-700/50 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What whispers in the dark?..."
                    disabled={!!banEndTime}
                    className="w-full bg-neutral-950/50 text-neutral-100 p-4 rounded-xl border border-neutral-800/60 focus:border-brand-primary/50 focus:ring-0 focus:bg-neutral-950/80 outline-none resize-none transition-all placeholder:text-neutral-600 text-lg leading-relaxed min-h-[120px]"
                    maxLength={280}
                />

                {banEndTime && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border border-red-500/30">
                        <div className="text-red-500 font-mono text-2xl font-bold animate-pulse">
                            🚫 BANNED
                        </div>
                        <div className="text-neutral-400 font-mono mt-2">
                            COOLDOWN: <span className="text-white">{formatTimeLeft()}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-4 px-1">
                <div className={`text-xs font-medium transition-colors ${content.length > 250 ? 'text-red-400' : 'text-neutral-500'}`}>
                    {280 - content.length} chars remaining
                </div>
                <button
                    type="submit"
                    disabled={loading || !content.trim() || !!banEndTime}
                    className="bg-gradient-to-r from-brand-primary to-brand-accent hover:shadow-lg hover:shadow-brand-primary/25 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <span>Broadcast</span>
                    <HiPaperAirplane className={`w-4 h-4 rotate-90 ${loading ? 'animate-pulse' : ''}`} />
                </button>
            </div>
        </form>
    );
};

export default CreatePost;
