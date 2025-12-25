import { useEffect, useState } from 'react';
import api from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import TrendingSidebar from '../components/TrendingSidebar';
import { HiFire } from 'react-icons/hi';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('latest');

    const getSortedPosts = () => {
        const sorted = [...posts];
        if (filter === 'top') {
            sorted.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        } else {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return sorted;
    };

    const fetchPosts = async () => {
        try {
            const res = await api.get('/api/posts');
            setPosts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-white">Global Feed</span>
                            <div className="flex relative">
                                <div className="absolute inset-0 bg-red-500 blur-sm rounded-full animate-pulse"></div>
                                <div className="relative w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
                            </div>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Live broadcasts from the void.</p>
                    </div>

                    {/* Filter Switcher */}
                    <div className="flex bg-slate-900/80 p-1 rounded-xl backdrop-blur-sm border border-slate-800">
                        <button
                            onClick={() => setFilter('latest')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === 'latest'
                                ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>🕒</span> Recently Posted
                        </button>
                        <button
                            onClick={() => setFilter('top')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === 'top'
                                ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>🔥</span> Most Liked
                        </button>
                    </div>
                </div>

                <CreatePost onPostCreated={fetchPosts} />

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-slate-800 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {getSortedPosts().map((post, index) => (
                            <div
                                key={post.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                            >
                                <PostCard post={post} refreshPosts={fetchPosts} />
                            </div>
                        ))}
                        {posts.length === 0 && (
                            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm border-dashed">
                                <div className="text-6xl mb-4 opacity-20">🌑</div>
                                <p className="text-slate-500 text-lg mb-2 font-light">It's quiet in the void...</p>
                                <p className="text-slate-600 text-sm">Be the first to whisper.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="lg:col-span-1 hidden lg:block sticky top-24 h-fit">
                <TrendingSidebar />


            </div>
        </div>
    );
};

export default Feed;
