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
        <div className="pt-[60px] pb-24 md:pt-10 md:pb-10 md:pl-72 md:pr-10 max-w-[1400px] mx-auto min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                {/* Main Feed Column */}
                <div className="md:col-span-8 lg:col-span-7 xl:col-span-6 mx-auto w-full max-w-xl">

                    {/* Stories Rail */}
                    <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide px-2">
                        {/* Add Story Button */}
                        <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 group-hover:border-neon-cyan transition-colors">
                                <span className="text-2xl text-white">+</span>
                            </div>
                            <span className="text-xs text-neutral-400">Add Story</span>
                        </div>

                        {/* Mock Active Users as 'Stories' */}
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                                <div className="story-ring w-16 h-16 p-[2px] group-hover:scale-105 transition-transform duration-300">
                                    <div className="bg-black rounded-full w-full h-full p-[2px]">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff&size=50`}
                                            className="w-full h-full rounded-full object-cover"
                                            alt="story"
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-white truncate w-16 text-center group-hover:text-neon-cyan transition-colors">
                                    user_{i + 1}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Create Post Trigger */}
                    <div className="mb-8 glass-panel rounded-2xl p-4 flex gap-4 items-center cursor-text hover:bg-neutral-800/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-neutral-700 overflow-hidden shrink-0">
                            <img
                                src={`https://ui-avatars.com/api/?name=Me&background=random&color=fff&size=50`}
                                alt="Me"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="What's happening in the shadows?"
                            className="bg-transparent text-white w-full focus:outline-none placeholder-neutral-500"
                            readOnly
                            onClick={() => document.getElementById('create-post-modal').showModal()} // Hypothetical
                        />
                    </div>
                    <CreatePost onPostCreated={fetchPosts} />

                    {/* Filter Tabs (Sticky) */}
                    <div className="flex border-b border-white/10 mb-6 sticky top-[60px] md:top-0 bg-black/80 backdrop-blur-xl z-40 pt-2 rounded-t-xl">
                        <button
                            onClick={() => setFilter('latest')}
                            className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-all ${filter === 'latest' ? 'text-white border-b-2 border-neon-cyan' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            FOR YOU
                        </button>
                        <button
                            onClick={() => setFilter('top')}
                            className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-all ${filter === 'top' ? 'text-white border-b-2 border-neon-purple' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            FOLLOWING
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-white/10 border-t-neon-cyan rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {getSortedPosts().map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.08, ease: "backOut" }}
                                    >
                                        <div className="glass-panel rounded-2xl overflow-hidden hover:border-white/10 transition-colors duration-300">
                                            <PostCard post={post} refreshPosts={fetchPosts} />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {posts.length === 0 && (
                                <div className="text-center py-20 text-neutral-500">
                                    <h3 className="text-xl font-bold mb-2">Welcome to ShadowTalk</h3>
                                    <p>Follow people to see their posts here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column (Trending / Suggestions) - Hidden on Tablet, Visible Desktop */}
                <div className="hidden lg:block lg:col-span-5 xl:col-span-4 pl-8">
                    <div className="sticky top-10 space-y-6">

                        {/* Search Box */}
                        <div className="glass-panel rounded-full px-4 py-3 flex items-center gap-3">
                            <span className="text-neutral-500">🔍</span>
                            <input
                                type="text"
                                placeholder="Search ShadowTalk..."
                                className="bg-transparent text-white text-sm focus:outline-none w-full"
                            />
                        </div>

                        {/* Trending Sidebar Component */}
                        <div className="glass-panel rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <HiFire className="text-neon-cyan" /> Trending Now
                            </h3>
                            <TrendingSidebar />
                        </div>

                        {/* Footer */}
                        <div className="text-xs text-neutral-600 px-4 leading-relaxed">
                            <p>© 2024 ShadowTalk Inc.</p>
                            <p className="hover:text-neutral-400 cursor-pointer mt-1">Privacy • Terms • Cookies • More</p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Feed;
