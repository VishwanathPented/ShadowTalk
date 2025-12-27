import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // Fetch Profile Info
                const profileRes = await api.get(`/api/users/${encodeURIComponent(username)}`);
                setProfile(profileRes.data);

                // Fetch User Posts
                const postsRes = await api.get(`/api/users/${encodeURIComponent(username)}/posts`);
                setPosts(postsRes.data);
            } catch (error) {
                console.error("Failed to load profile", error);
                toast.error("User not found or connection failed");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfileData();
        }
    }, [username]);

    const handleFollow = async () => {
        if (!currentUser) {
            toast.error("Please login to follow");
            return;
        }

        setFollowLoading(true);
        try {
            if (profile.isFollowing) {
                await api.delete(`/api/users/${profile.id}/follow`);
                setProfile(prev => ({
                    ...prev,
                    isFollowing: false,
                    followersCount: prev.followersCount - 1
                }));
                toast.success(`Unfollowed ${profile.anonymousName}`);
            } else {
                await api.post(`/api/users/${profile.id}/follow`);
                setProfile(prev => ({
                    ...prev,
                    isFollowing: true,
                    followersCount: prev.followersCount + 1
                }));
                toast.success(`Following ${profile.anonymousName}`);
            }
        } catch (error) {
            toast.error("Action failed");
            console.error(error);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-12 h-12 border-2 border-white/10 border-t-neon-cyan rounded-full animate-spin"></div>
                <p className="text-xs text-neutral-500 font-mono animate-pulse">LOADING PROFILE DATA...</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 min-h-screen">
            {/* Profile Header */}
            <div className="relative mb-12">
                {/* Holographic Scanner Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 pointer-events-none rounded-3xl overflow-hidden"
                >
                    <div className="w-full h-[2px] bg-neon-green shadow-[0_0_20px_#0f0] absolute top-0 animate-scanline"></div>
                </motion.div>

                <div className="glass-panel rounded-3xl p-8 bg-black/60 backdrop-blur-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/20 blur-[100px] rounded-full pointer-events-none"></div>

                    {/* ID Card "Verified" Stamp */}
                    <motion.div
                        initial={{ opacity: 0, scale: 2, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: -15 }}
                        transition={{ delay: 1.8, type: "spring" }}
                        className="absolute top-8 right-8 z-10 border-4 border-neon-green text-neon-green font-black text-xl px-4 py-2 rounded uppercase tracking-widest opacity-0 transform rotate-[-15deg]"
                    >
                        Verified Ops
                    </motion.div>

                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        {/* Avatar Box */}
                        <div className="relative">
                            <div className="w-40 h-40 hexagon-border shadow-[0_0_50px_rgba(118,58,245,0.3)]">
                                <div className="hexagon-content bg-neutral-900">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.anonymousName)}&background=random&color=fff&size=128`}
                                        alt={profile.anonymousName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black border border-neon-cyan text-neon-cyan text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                Lvl. {(profile.reputationScore / 10).toFixed(0)}
                            </div>
                        </div>

                        {/* Info & Hex Stats */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-black text-white mb-1 tracking-tighter uppercase glitch-text" data-text={profile.anonymousName}>{profile.anonymousName}</h1>
                            <p className="text-neutral-400 font-mono text-xs mb-6 flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                                OPERATIVE SINCE {new Date(profile.createdAt).getFullYear()} // {formatDistanceToNow(new Date(profile.createdAt)).toUpperCase()} AGO
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
                                {/* Hex Stat Item */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-20 h-24 hexagon-border">
                                        <div className="hexagon-content bg-neutral-900/80 group-hover:bg-neutral-800 transition-colors">
                                            <span className="text-xl font-bold text-white">{profile.postsCount || posts.length}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 font-bold tracking-wider">POSTS</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-20 h-24 hexagon-border backdrop-blur-md">
                                        <div className="hexagon-content bg-neutral-900/80 group-hover:bg-neutral-800 transition-colors">
                                            <span className="text-xl font-bold text-neon-purple">{profile.followersCount}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 font-bold tracking-wider">FOLLOWERS</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-20 h-24 hexagon-border">
                                        <div className="hexagon-content bg-neutral-900/80 group-hover:bg-neutral-800 transition-colors">
                                            <span className="text-xl font-bold text-white">{profile.followingCount}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 font-bold tracking-wider">FOLLOWING</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-20 h-24 hexagon-border shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                                        <div className="hexagon-content bg-black/80">
                                            <span className="text-xl font-bold text-neon-cyan">{profile.reputationScore}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-neon-cyan/70 font-bold tracking-wider glow-text">REP</span>
                                </div>
                            </div>

                            {currentUser && currentUser.anonymousName !== profile.anonymousName && (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`px-10 py-3 rounded-xl font-bold text-sm tracking-[0.2em] transition-all uppercase clip-path-button relative overflow-hidden group/btn ${profile.isFollowing
                                        ? 'bg-transparent border border-white/20 text-white hover:border-red-500 hover:text-red-500'
                                        : 'bg-neon-purple text-white hover:bg-neon-purple/90 shadow-[0_0_20px_rgba(118,58,245,0.4)]'
                                        }`}
                                >
                                    <span className="relative z-10">{followLoading ? 'PROCESSING...' : profile.isFollowing ? 'DISCONNECT' : 'INITIALIZE LINK'}</span>
                                    {!profile.isFollowing && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-neon-cyan rounded-full"></span>
                    Transmission History
                </h2>

                <AnimatePresence>
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="glass-panel rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/5">
                                    <PostCard post={post} />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-neutral-500 font-mono">
                            [NO TRANSMISSIONS FOUND]
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProfilePage;
