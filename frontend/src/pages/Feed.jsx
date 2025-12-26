import { useEffect, useState } from 'react';
import api from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import TrendingSidebar from '../components/TrendingSidebar';
import { HiFire } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="pt-[20px] pb-24 md:pt-10 md:pb-10 max-w-[1600px] mx-auto min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Feed Column (Floating Stream) */}
                <div className="lg:col-span-8 xl:col-span-7 mx-auto w-full max-w-2xl">

                    {/* Header: Greetings */}
                    <div className="mb-8 px-2">
                        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">System Feed <span className="text-neon-cyan">●</span></h1>
                        <p className="text-neutral-500 text-sm font-mono">ENCRYPTED CONNECTION ESTABLISHED</p>
                    </div>

                    {/* Stories Rail (Holographic Rings) */}
                    <div className="flex gap-4 overflow-x-auto pb-6 mb-4 scrollbar-hide px-2">
                        {/* Add Story */}
                        <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:border-neon-cyan group-hover:bg-neon-cyan/10 transition-all duration-300">
                                <span className="text-2xl text-white group-hover:text-neon-cyan">+</span>
                            </div>
                        </div>

                        {/* Stories */}
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-neon-purple to-neon-cyan group-hover:shadow-[0_0_15px_rgba(118,58,245,0.5)] transition-all duration-300">
                                    <div className="bg-black rounded-full w-full h-full p-[2px]">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff&size=50`}
                                            className="w-full h-full rounded-full object-cover"
                                            alt="story"
                                        />
                                    </div>
                                </div>
                                <span className="text-[10px] text-neutral-400 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                    User_{i + 1}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Create Post (Glass Bar) */}
                    <div className="mb-10 glass-panel rounded-xl p-4 flex gap-4 items-center cursor-text hover:bg-white/5 transition-colors border-l-4 border-l-neon-purple shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden shrink-0 ring-1 ring-white/10">
                            <img
                                src={`https://ui-avatars.com/api/?name=Me&background=random&color=fff&size=50`}
                                alt="Me"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Broadcast to the network..."
                            className="bg-transparent text-white w-full focus:outline-none placeholder-neutral-600 font-mono text-sm"
                            readOnly
                            onClick={() => document.getElementById('create-post-modal').showModal()}
                        />
                        <div className="flex gap-2 text-neutral-500">
                            <span className="hover:text-neon-cyan cursor-pointer transition-colors">📷</span>
                            <span className="hover:text-neon-purple cursor-pointer transition-colors">📎</span>
                        </div>
                        <CreatePost onPostCreated={fetchPosts} />
                    </div>

                    {/* Filter Tabs (Floating Glass) */}
                    <div className="flex gap-4 mb-8 sticky top-4 z-40">
                        <button
                            onClick={() => setFilter('latest')}
                            className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all backdrop-blur-md ${filter === 'latest' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'bg-black/40 text-neutral-500 border border-white/5 hover:border-white/20'}`}
                        >
                            Live Feed
                        </button>
                        <button
                            onClick={() => setFilter('top')}
                            className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all backdrop-blur-md ${filter === 'top' ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50 shadow-[0_0_15px_rgba(118,58,245,0.2)]' : 'bg-black/40 text-neutral-500 border border-white/5 hover:border-white/20'}`}
                        >
                            Trending
                        </button>
                    </div>

                    {/* Feed Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-2 border-white/10 border-t-neon-cyan rounded-full animate-spin"></div>
                            <p className="text-xs text-neutral-500 font-mono animate-pulse">DECRYPTING DATA...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-20">
                            <AnimatePresence>
                                {getSortedPosts().map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                                    >
                                        <div className="glass-panel rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl">
                                            <PostCard post={post} refreshPosts={fetchPosts} />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {posts.length === 0 && (
                                <div className="text-center py-20 text-neutral-500 font-mono text-xs">
                                    [NO SIGNALS DETECTED]
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column (Widget Stack) */}
                <div className="hidden lg:flex lg:col-span-4 xl:col-span-5 flex-col gap-6 pt-10 pr-10">
                    <div className="sticky top-10 space-y-6">

                        {/* Search Widget */}
                        <div className="glass-panel rounded-full px-5 py-3 flex items-center gap-3 bg-black/40 hover:bg-black/60 transition-colors group border border-white/10 focus-within:border-neon-cyan/50">
                            <span className="text-neutral-500 group-focus-within:text-neon-cyan transition-colors">🔍</span>
                            <input
                                type="text"
                                placeholder="Search the network..."
                                className="bg-transparent text-white text-sm focus:outline-none w-full placeholder-neutral-600"
                            />
                        </div>

                        {/* Trending Sidebar */}
                        <div className="glass-panel rounded-3xl p-6 bg-black/40 backdrop-blur-xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 blur-[50px] rounded-full pointer-events-none"></div>
                            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <HiFire className="text-neon-purple" /> Trending Nodes
                            </h3>
                            <TrendingSidebar />
                        </div>

                        {/* Footer */}
                        <div className="text-[10px] text-neutral-600 px-4 font-mono">
                            <p>SHADOW_TALK_OS v5.0.1 // SECURE</p>
                            <p className="mt-2 text-neutral-700">© 2024</p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Feed;
