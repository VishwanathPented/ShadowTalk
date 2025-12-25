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
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 hover:border-brand-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/5 group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-brand-primary to-purple-600 shadow-inner">
                        {post.user.anonymousName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm tracking-wide group-hover:text-brand-primary transition-colors flex items-center gap-2">
                            {post.user.anonymousName}
                            <span className="text-[10px] bg-slate-800 text-brand-primary px-1.5 py-0.5 rounded border border-slate-700/50 font-mono" title="Shadow Reputation">
                                {post.user.reputationScore || 0}
                            </span>
                        </p>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="text-brand-primary/60 text-[10px] uppercase tracking-wider">Ghost</span>
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-slate-200 mb-4 whitespace-pre-wrap text-[15px] leading-relaxed font-light pl-13">
                {post.content}
            </p>

            <div className="flex gap-6 border-t border-slate-800/50 pt-3 text-slate-500 text-sm">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 hover:text-red-500 transition-all active:scale-95 ${liked ? 'text-red-500' : ''}`}
                >
                    <HiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                </button>

                <Link
                    to={`/posts/${post.id}`}
                    className="flex items-center gap-1.5 hover:text-blue-400 transition-all active:scale-95"
                >
                    <HiChatAlt className="w-5 h-5" />
                    <span>Comment</span>
                </Link>
                <button
                    onClick={handleRepost}
                    className="flex items-center gap-1.5 hover:text-green-500 transition-all active:scale-95"
                >
                    <HiRefresh className="w-5 h-5" />
                    <span>Repost</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
