import { useEffect, useState } from 'react';
import api from '../api/axios';
import { HiTrendingUp } from 'react-icons/hi';

const TrendingSidebar = () => {
    const [hashtags, setHashtags] = useState([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await api.get('/api/hashtags/trending');
                setHashtags(res.data);
            } catch (error) {
                console.error("Failed to load trending tags", error);
            }
        };
        fetchTrending();
    }, []);

    if (hashtags.length === 0) return null;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sticky top-4">
            <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                <HiTrendingUp className="text-brand-primary" />
                Trending
            </h3>
            <div className="space-y-3">
                {hashtags.map(tag => (
                    <div key={tag.id} className="flex justify-between items-center group cursor-pointer hover:bg-slate-800/50 p-2 rounded transition-colors">
                        <span className="text-slate-300 group-hover:text-brand-primary transition-colors">#{tag.name}</span>
                        <span className="text-xs text-slate-500">{tag.usageCount} posts</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingSidebar;
