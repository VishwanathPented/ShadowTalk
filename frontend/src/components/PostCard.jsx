import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaShare } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
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
        <div className="border-b border-white/5 py-4 mb-2 last:border-0 transition-all md:rounded-2xl md:bg-white/5 md:backdrop-blur-md md:border md:border-white/5 hover:border-white/20 hover:shadow-[0_0_30px_rgba(118,58,245,0.1)] group relative overflow-hidden">
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${encodeURIComponent(post.user.anonymousName)}`}>
                        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-neon-purple to-neon-cyan cursor-pointer hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] transition-all">
                            <div className="w-full h-full bg-black rounded-full p-[2px] overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.anonymousName)}&background=random&color=fff&size=50`}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </Link>
                    <div className="flex flex-col">
                        <Link to={`/profile/${encodeURIComponent(post.user.anonymousName)}`}>
                            <span className="text-sm font-bold text-white leading-none tracking-wide hover:text-neon-cyan cursor-pointer transition-colors">
                                {post.user.anonymousName}
                            </span>
                        </Link>
                        <span className="text-[10px] text-neutral-400 font-mono mt-1">
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                        </span>
                    </div>
                </div>
                <button className="text-neutral-500 hover:text-white transition-colors">
                    <span className="text-xl leading-none mb-2 block">...</span>
                </button>
            </div>

            {/* Content */}
            <div className="px-4 mb-4 relative z-10">
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-light">
                    {post.content}
                </p>
            </div>

            {/* Actions Bar (Glass Pill) */}
            <div className="px-4 mb-2 relative z-10">
                <div className="flex items-center justify-between bg-black/40 rounded-full px-4 py-2 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <motion.button
                            onClick={handleLike}
                            className="flex items-center gap-2 group/like"
                            whileTap={{ scale: 0.8 }}
                        >
                            {isLiked ? (
                                <FaHeart className="text-neon-purple text-lg drop-shadow-[0_0_8px_rgba(211,0,197,0.8)]" />
                            ) : (
                                <FaRegHeart className="text-neutral-400 text-lg group-hover/like:text-neon-purple transition-colors" />
                            )}
                            <span className={`text-xs font-mono ${isLiked ? 'text-neon-purple' : 'text-neutral-500'} group-hover/like:text-neon-purple transition-colors`}>
                                {post.likes?.length || 0}
                            </span>
                        </motion.button>

                        <button className="flex items-center gap-2 group/comment">
                            <FaRegComment className="text-neutral-400 text-lg group-hover/comment:text-neon-cyan transition-colors" />
                            <span className="text-xs font-mono text-neutral-500 group-hover/comment:text-neon-cyan transition-colors">
                                {comments.length}
                            </span>
                        </button>

                        <button className="flex items-center gap-2 group/repost">
                            <FaRetweet className="text-neutral-400 text-lg group-hover/repost:text-green-400 transition-colors" />
                        </button>
                    </div>

                    <button className="text-neutral-500 hover:text-white transition-colors">
                        <FaShare />
                    </button>
                </div>
            </div>

            {/* View Comments Link */}
            {comments.length > 0 && (
                <div className="px-6 pb-2 relative z-10">
                    <span className="text-[10px] text-neutral-500 cursor-pointer hover:text-neon-cyan transition-colors uppercase tracking-wider font-bold">
                        View all comments
                    </span>
                </div>
            )}
        </div>
    );
};

export default PostCard;
