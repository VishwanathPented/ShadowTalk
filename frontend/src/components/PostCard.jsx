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
        <div className="border-b border-neutral-800 py-4 mb-2 last:border-0 hover:bg-neutral-900/40 transition-colors md:rounded-xl md:border md:bg-black">
            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="story-ring w-9 h-9 p-[2px] cursor-pointer hover:scale-105 transition-transform duration-200">
                        <div className="w-full h-full bg-black rounded-full p-[2px]">
                            <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-xs text-white uppercase font-bold">
                                {post.user.anonymousName.substring(0, 2)}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white leading-none">
                            {post.user.anonymousName.toLowerCase()}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                        </span>
                    </div>
                </div>
                <button className="text-white font-bold tracking-widest">...</button>
            </div>

            {/* Content (Image Placeholder + Text) */}
            <div className="px-4 mb-3">
                <p className="text-sm text-neutral-200 leading-snug whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Actions */}
            <div className="px-4 flex items-center gap-4 mb-3">
                <motion.button
                    onClick={handleLike}
                    className="group"
                    whileTap={{ scale: 0.8 }}
                >
                    {isLiked ? (
                        <FaHeart className="text-neon-purple text-2xl drop-shadow-[0_0_8px_rgba(211,0,197,0.5)]" />
                    ) : (
                        <FaRegHeart className="text-white text-2xl group-hover:text-neutral-400 transition-colors" />
                    )}
                </motion.button>
                <div className="flex items-center gap-1">
                    <FaRegComment className="text-white text-2xl hover:text-neutral-400 cursor-pointer" />
                </div>
                <FaRetweet className="text-white text-2xl hover:text-green-500 cursor-pointer" />
                <FaShare className="text-white text-2xl hover:text-neon-cyan cursor-pointer" />
            </div>

            {/* Likes Count */}
            <div className="px-4 mb-1">
                <span className="text-sm font-semibold text-white">{post.likes?.length || 0} likes</span>
            </div>

            <div className="px-4 text-xs text-neutral-500 cursor-pointer hover:text-neutral-400 transition-colors">
                View all {comments.length} comments
            </div>
        </div>
    );
};

export default PostCard;
