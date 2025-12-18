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
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-lg shadow-brand-primary/5">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your secrets anonymously..."
                className="w-full bg-slate-950 text-slate-200 p-3 rounded-lg border border-slate-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none transition-all placeholder:text-slate-600"
                rows="3"
                maxLength={280}
            />
            <div className="flex justify-between items-center mt-3">
                <span className="text-slate-600 text-xs">{content.length}/280</span>
                <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>Post</span>
                    <HiPaperAirplane className="w-4 h-4 rotate-90" />
                </button>
            </div>
        </form>
    );
};

export default CreatePost;
