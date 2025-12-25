import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiPaperAirplane } from 'react-icons/hi';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

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
            toast.error(error.response?.data || 'Failed to post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What whispers in the dark?..."
                className="w-full bg-slate-950/50 text-slate-100 p-4 rounded-xl border border-slate-800/60 focus:border-brand-primary/50 focus:ring-0 focus:bg-slate-950/80 outline-none resize-none transition-all placeholder:text-slate-600 text-lg leading-relaxed min-h-[120px]"
                maxLength={280}
            />

            <div className="flex justify-between items-center mt-4 px-1">
                <div className={`text-xs font-medium transition-colors ${content.length > 250 ? 'text-red-400' : 'text-slate-500'}`}>
                    {280 - content.length} chars remaining
                </div>
                <button
                    type="submit"
                    disabled={loading || !content.trim()}
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
