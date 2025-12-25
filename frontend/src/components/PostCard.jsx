import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaShare } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, refreshPosts }) => {
    const { user } = useAuth();

    // Safety check for arrays
    const likes = post.likes || [];
    const comments = post.comments || [];
    const reposts = post.reposts || [];

    // Check if current user has liked
    // Assuming backend returns user object in likes list. If not, we might need a different check.
    // Based on PostLike.java: private User user;
    const isLiked = likes.some(like => like.user?.email === user?.email);

    const handleLike = async () => {
        try {
            await api.post(`/api/posts/${post.id}/like`);
            refreshPosts && refreshPosts();
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
            {/* Action Buttons - Instagram Style (Icons Only) */}
            <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center gap-6">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'
                        }`}
                    title="Like"
                >
                    <div className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-all ${isLiked ? 'bg-pink-500/10' : ''}`}>
                        {isLiked ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
                    </div>
                    {likes.length > 0 && <span className="text-sm font-medium">{likes.length}</span>}
                </button>

                <Link
                    to={`/posts/${post.id}`}
                    className="flex items-center gap-2 group text-slate-400 hover:text-blue-400 transition-colors"
                    title="Comment"
                >
                    <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-all">
                        <FaRegComment className="w-5 h-5" />
                    </div>
                    {comments.length > 0 && <span className="text-sm font-medium">{comments.length}</span>}
                </Link>

                <button
                    onClick={handleRepost}
                    className="flex items-center gap-2 group text-slate-400 hover:text-green-400 transition-colors"
                    title="Repost"
                >
                    <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-all">
                        <FaRetweet className="w-5 h-5" />
                    </div>
                    {reposts.length > 0 && <span className="text-sm font-medium">{reposts.length}</span>}
                </button>
            </div>
        </div >
    );
};

export default PostCard;
