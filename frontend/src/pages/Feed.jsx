import { useEffect, useState } from 'react';
import api from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import TrendingSidebar from '../components/TrendingSidebar';
import { HiFire } from 'react-icons/hi';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
                <div className="flex items-center gap-2 mb-6">
                    <h1 className="text-2xl font-bold text-white">Global Feed</h1>
                    <HiFire className="text-orange-500 w-6 h-6" />
                </div>

                <CreatePost onPostCreated={fetchPosts} />

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post, index) => (
                            <div
                                key={post.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                            >
                                <PostCard post={post} refreshPosts={fetchPosts} />
                            </div>
                        ))}
                        {posts.length === 0 && (
                            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                                <p className="text-slate-500 text-lg mb-2">It's quiet in the void...</p>
                                <p className="text-slate-600 text-sm">Be the first to whisper.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="md:col-span-1">
                <TrendingSidebar />
            </div>
        </div>
    );
};

export default Feed;
