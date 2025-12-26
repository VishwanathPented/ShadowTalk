import { useEffect, useState } from 'react';
import api from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import TrendingSidebar from '../components/TrendingSidebar';
import { HiFire, HiChip, HiLightningBolt } from 'react-icons/hi';
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
        <div className="min-h-screen text-neutral-200">
            {/* Top Operational Stats - Decorative */}
            <div className="flex justify-between items-center mb-8 px-2 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_10px_#00e5ff]"></span>
                    <h1 className="text-sm font-mono tracking-widest text-white">SYSTEM_FEED // LIVE</h1>
                </div>
                <div className="flex gap-4 text-[10px] font-mono text-neutral-500">
                    <span>LATENCY: 12ms</span>
                    <span>ENCRYPTION: MAX</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Main Stream (Cols 1-8) */}
                <div className="lg:col-span-8 flex flex-col gap-8">

                    {/* Broadcast Terminal (Create Post) */}
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 opacity-50 group-hover:opacity-75 transition duration-500 blur rounded-xl"></div>
                        <div className="relative bg-black/80 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl transition-all duration-300 group-hover:border-white/20">
                            <div className="flex items-center gap-3 mb-4">
                                <HiLightningBolt className="text-neon-cyan" />
                                <span className="text-xs font-mono text-neutral-400 tracking-wider">NEW_TRANSMISSION</span>
                            </div>

                            <CreatePost onPostCreated={fetchPosts} />
                        </div>
                    </div>

                    {/* Signal Tuners (Filters) */}
                    <div className="flex gap-8 border-b border-white/5 pb-1 ml-2">
                        <button
                            onClick={() => setFilter('latest')}
                            className={`pb-3 text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${filter === 'latest' ? 'text-neon-cyan text-shadow-neon' : 'text-neutral-500 hover:text-white'
                                }`}
                        >
                            Live Feed
                            {filter === 'latest' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1px] bg-neon-cyan shadow-[0_0_10px_#00e5ff]" />
                            )}
                        </button>
                        <button
                            onClick={() => setFilter('top')}
                            className={`pb-3 text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${filter === 'top' ? 'text-neon-purple text-shadow-neon' : 'text-neutral-500 hover:text-white'
                                }`}
                        >
                            High Voltage
                            {filter === 'top' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1px] bg-neon-purple shadow-[0_0_10px_#763af5]" />
                            )}
                        </button>
                    </div>

                    {/* Feed Output */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                            <HiChip className="text-4xl text-neon-cyan animate-spin" />
                            <p className="text-xs text-neon-cyan font-mono animate-pulse">DECODING STREAM...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {getSortedPosts().map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <div className="glass-panel rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 bg-black/20 backdrop-blur-sm border border-white/5 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                            <PostCard post={post} refreshPosts={fetchPosts} />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {posts.length === 0 && (
                                <div className="text-center py-20 text-neutral-600 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                                    [NO SIGNALS DETECTED IN SECTOR]
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: Intelligence Panel (Cols 9-12) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Trending Module (Moved Up) */}
                    <div className="bg-black/40 backdrop-blur-3xl rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                        {/* Decorative Background Blob */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-neon-purple/20 transition-all"></div>

                        <div className="flex items-center gap-2 mb-6 relative z-10">
                            <HiFire className="text-neon-purple" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Trending Vectors</h3>
                        </div>

                        <TrendingSidebar />
                    </div>

                    {/* System Info / Footer */}
                    <div className="p-6 rounded-2xl border border-dashed border-white/5 text-[10px] text-neutral-600 font-mono space-y-3">
                        <div className="flex justify-between items-center">
                            <span>NETWORK_STATUS</span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                OPTIMAL
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>UPTIME</span>
                            <span>99.9%</span>
                        </div>
                        <div className="h-[1px] bg-white/5 my-2"></div>
                        <div className="flex justify-between opacity-50">
                            <span>PROTOCOL</span>
                            <span>SHADOW_TALK_V1</span>
                        </div>
                        <p className="pt-2 text-center opacity-30">© 2024 DECENTRALIZED DATA</p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Feed;
