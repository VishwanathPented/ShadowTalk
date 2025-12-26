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
        <div className="space-y-4">
            {hashtags.map(tag => (
                <div key={tag.id} className="flex justify-between items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <span className="text-neutral-400 group-hover:text-neon-cyan font-mono transition-colors">#{tag.name}</span>
                    <span className="text-[10px] text-neutral-600 group-hover:text-neutral-500 font-bold">{tag.usageCount} NODES</span>
                </div>
            ))}
        </div>
    );
};

export default TrendingSidebar;
