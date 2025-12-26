import { useEffect, useState } from 'react';
import api from '../api/axios';
import { HiLightningBolt, HiHeart } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const TrendingSidebar = () => {
    const [topPosts, setTopPosts] = useState([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await api.get('/api/posts/top');
                setTopPosts(res.data);
            } catch (error) {
                console.error("Failed to load trending posts", error);
            }
        };
        fetchTrending();
    }, []);

    if (topPosts.length === 0) return null;

    return (
        <div className="space-y-4">
            {topPosts.slice(0, 5).map((post, index) => (
                <Link to={`/post/${post.id}`} key={post.id} className="block group cursor-pointer p-3 rounded-xl bg-neutral-900/40 border border-white/5 hover:border-brand-primary/30 hover:bg-white/5 transition-all relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-brand-primary font-bold text-xs truncate max-w-[100px]">{post.user.anonymousName}</span>
                            {index === 0 && <span className="bg-brand-primary/20 text-brand-primary text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">#1 Hot</span>}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-500 text-xs">
                            <HiHeart className="text-red-500/80" />
                            <span>{post.fakeLikeCount !== null && post.fakeLikeCount !== undefined ? post.fakeLikeCount : (post.likes?.length || 0)}</span>
                        </div>
                    </div>
                    <p className="text-neutral-300 text-xs line-clamp-2 font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                        {post.content}
                    </p>
                </Link>
            ))}
        </div>
    );
};

export default TrendingSidebar;
