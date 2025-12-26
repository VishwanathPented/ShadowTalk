import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaShare, FaFlag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Particle State
    const [particles, setParticles] = useState([]);

    const handleLike = async () => {
        // Optimistic UI update handled by parent or local state usually, but here we trigger effect
        if (!isLiked) {
            // Trigger Explosion
            const newParticles = Array.from({ length: 12 }).map((_, i) => ({
                id: Date.now() + i,
                angle: (i / 12) * 360,
                distance: 20 + Math.random() * 30,
            }));
            setParticles(newParticles);
            setTimeout(() => setParticles([]), 800);
        }

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

    const handleReport = async () => {
        const reason = prompt("Why are you reporting this post? (Spam, Harassment, etc.)");
        if (reason) {
            try {
                await api.post(`/api/posts/${post.id}/report`, { reason });
                toast.success('Report submitted securely.');
            } catch (error) {
                toast.error('Report failed to transmit.');
            }
        }
    };

    return (
        <div className="relative group rounded-2xl mb-4 transition-all duration-300 hover:scale-[1.01]">
            {/* Holographic Border Gradient */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 animate-gradient-xy"></div>

            <div className="relative bg-neutral-900/90 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl p-4 md:p-0">

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${encodeURIComponent(post.user.anonymousName)}`}>
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple to-neon-cyan rounded-full animate-spin-slow opacity-75"></div>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.anonymousName)}&background=random&color=fff&size=50`}
                                    alt="avatar"
                                    className="absolute inset-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full object-cover border border-black"
                                />
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
                    <div className="flex items-center gap-2">
                        <button onClick={handleReport} className="text-neutral-600 hover:text-red-500 transition-colors">
                            <FaFlag className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 mb-4 relative z-10">
                    <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-light">
                        {post.content}
                    </p>
                </div>

                {/* Actions Bar */}
                <div className="px-4 pb-4 relative z-10">
                    <div className="flex items-center justify-between bg-black/40 rounded-full px-4 py-2 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-6">
                            <motion.button
                                onClick={handleLike}
                                className="flex items-center gap-2 group/like relative"
                                whileTap={{ scale: 0.8 }}
                            >
                                {/* Particle Explosion */}
                                <AnimatePresence>
                                    {particles.map((p) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                                            animate={{
                                                x: Math.cos(p.angle * Math.PI / 180) * p.distance,
                                                y: Math.sin(p.angle * Math.PI / 180) * p.distance,
                                                scale: 1,
                                                opacity: 0
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            className="absolute left-2 top-2 w-2 h-2 text-neon-purple pointer-events-none"
                                        >
                                            <FaHeart className="w-full h-full" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {isLiked ? (
                                    <FaHeart className="text-neon-purple text-lg drop-shadow-[0_0_8px_rgba(211,0,197,0.8)]" />
                                ) : (
                                    <FaRegHeart className="text-neutral-400 text-lg group-hover/like:text-neon-purple transition-colors" />
                                )}
                                <span className={`text-xs font-mono ${isLiked ? 'text-neon-purple' : 'text-neutral-500'} group-hover/like:text-neon-purple transition-colors`}>
                                    {post.fakeLikeCount !== null && post.fakeLikeCount !== undefined ? post.fakeLikeCount : (post.likes?.length || 0)}
                                </span>
                            </motion.button>

                            <button className="flex items-center gap-2 group/comment">
                                <FaRegComment className="text-neutral-400 text-lg group-hover/comment:text-neon-cyan transition-colors" />
                                <span className="text-xs font-mono text-neutral-500 group-hover/comment:text-neon-cyan transition-colors">
                                    {comments.length}
                                </span>
                            </button>

                            <button onClick={handleRepost} className="flex items-center gap-2 group/repost">
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
        </div>
    );
};

export default PostCard;
