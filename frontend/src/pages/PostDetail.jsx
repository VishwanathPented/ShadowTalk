import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { HiArrowLeft, HiPaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    const fetchPost = async () => {
        try {
            // Re-using fetch all posts logic for now OR create specific endpoint
            // Ideally backend should have /api/posts/{id}
            // Checking if we have get info endpoint. For now, let's assume valid ID or fetch list.
            // Actually, frontend PostCard has post object, but we are deep linking.
            // Let's implement fetch by ID on frontend or just assume user navigates from feed.
            // But good practice is to fetch fresh.
            // Wait, PostController has getAllPosts only. I need getPostById?
            // Or I can just fetch all and filter (inefficient but works for small app).
            // Let's assume we need to filter from all posts for now as I didn't add getById in Controller Plan.
            // Wait, plan said 'Post Detail view'.
            const res = await api.get('/api/posts');
            const found = res.data.find(p => p.id === parseInt(postId));
            setPost(found);
        } catch (error) {
            console.error("Failed to load post", error);
            toast.error("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            await api.post(`/api/posts/${postId}/comment`, { content: comment });
            toast.success('Comment added!');
            setComment('');
            fetchPost(); // Refresh
        } catch (error) {
            toast.error('Failed to comment');
        }
    };

    if (loading) return <div className="text-white text-center py-10">Loading...</div>;
    if (!post) return <div className="text-white text-center py-10">Post not found</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                <HiArrowLeft /> Back
            </button>

            <PostCard post={post} refreshPosts={fetchPost} />

            <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-4">Comments</h3>

                <form onSubmit={handleComment} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-brand-primary outline-none"
                    />
                    <button type="submit" disabled={!comment.trim()} className="bg-brand-primary p-2 rounded-lg text-white disabled:opacity-50 hover:bg-brand-accent">
                        <HiPaperAirplane className="w-5 h-5 rotate-90" />
                    </button>
                </form>

                <div className="space-y-4">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map(c => (
                            <div key={c.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-brand-primary text-sm">{c.user.anonymousName}</span>
                                    <span className="text-xs text-slate-500">
                                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-slate-300">{c.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center italic">No comments yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
