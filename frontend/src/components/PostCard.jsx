import { formatDistanceToNow } from 'date-fns';
import { HiHeart, HiChatAlt, HiRefresh } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PostCard = ({ post, refreshPosts }) => {
    const [liked, setLiked] = useState(false); // Quick local toggle, ideally sync with verification

    const handleLike = async () => {
        try {
            await api.post(`/api/posts/${post.id}/like`);
            setLiked(!liked);
            refreshPosts && refreshPosts(); // Ideally optimistic update
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const handleRepost = async () => {
        try {
            await api.post(`/api/posts/${post.id}/repost`);
            toast.success('Reposted!');
            refreshPosts && refreshPosts();
        } catch (error) {
            toast.error('Failed to repost');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-bold text-brand-primary">{post.user.anonymousName}</span>
                    <span className="text-slate-500 text-sm ml-2">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>

            <p className="text-slate-200 mb-4 whitespace-pre-wrap text-lg font-light leading-relaxed">
                {post.content}
            </p>

            <div className="flex gap-6 border-t border-slate-800 pt-3 text-slate-400">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 hover:text-red-500 transition-colors ${liked ? 'text-red-500' : ''}`}
                >
                    <HiHeart className="w-5 h-5" />
                    <span className="text-sm">Like</span>
                </button>



                <Link
                    to={`/posts/${post.id}`}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                    <HiChatAlt className="w-5 h-5" />
                    <span className="text-sm">Comment</span>
                </Link>
                <button
                    onClick={handleRepost}
                    className="flex items-center gap-1 hover:text-green-500 transition-colors"
                >
                    <HiRefresh className="w-5 h-5" />
                    <span className="text-sm">Repost</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
