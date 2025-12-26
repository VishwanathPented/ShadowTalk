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
            <div className="glass-panel rounded-3xl p-8 mb-8 bg-black/40 backdrop-blur-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full p-[4px] bg-gradient-to-tr from-neon-purple to-neon-cyan shadow-[0_0_30px_rgba(118,58,245,0.3)]">
                        <div className="w-full h-full bg-black rounded-full overflow-hidden p-[2px]">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.anonymousName)}&background=random&color=fff&size=128`}
                                alt={profile.anonymousName}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{profile.anonymousName}</h1>
                        <p className="text-neutral-400 font-mono text-sm mb-4">
                            MEMBER SINCE {formatDistanceToNow(new Date(profile.createdAt)).toUpperCase()} AGO
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-8 mb-6">
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-white">{profile.postsCount || posts.length}</span>
                                <span className="text-xs text-neutral-500 tracking-wider">POSTS</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-white">{profile.followersCount}</span>
                                <span className="text-xs text-neutral-500 tracking-wider">FOLLOWERS</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-white">{profile.followingCount}</span>
                                <span className="text-xs text-neutral-500 tracking-wider">FOLLOWING</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold text-neon-cyan">{profile.reputationScore}</span>
                                <span className="text-xs text-neutral-500 tracking-wider">REPUTATION</span>
                            </div>
                        </div>

                        {currentUser && currentUser.anonymousName !== profile.anonymousName && (
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`px-8 py-2 rounded-full font-bold text-sm tracking-wide transition-all ${profile.isFollowing
                                    ? 'bg-transparent border border-white/20 text-white hover:border-red-500 hover:text-red-500'
                                    : 'bg-neon-purple text-white hover:bg-neon-purple/80 shadow-[0_0_15px_rgba(118,58,245,0.4)]'
                                    }`}
                            >
                                {followLoading ? 'PROCESSING...' : profile.isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
                            </button>
                        )}
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
