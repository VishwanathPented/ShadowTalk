import { useState, useEffect } from 'react';
import api from '../api/axios';
import { HiSpeakerphone, HiBell } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // In a real app, this would be a dedicated notifications endpoint
                // For now, we filter posts for [SYSTEM BROADCAST]
                const res = await api.get('/api/posts');
                const broadcasts = res.data.filter(p => p.content.startsWith('[SYSTEM BROADCAST]'));
                setNotifications(broadcasts);
            } catch (err) {
                console.error("Failed to load notifications");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div className="container mx-auto max-w-2xl pt-24 pb-20 px-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-neutral-800 rounded-xl">
                    <HiBell className="text-2xl text-neon-cyan" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">System Logs</h1>
                    <p className="text-neutral-500">History of network-wide broadcasts</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-white/5">
                    <p className="text-neutral-500 font-mono">NO LOGS FOUND</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(note => (
                        <div key={note.id} className="relative group">
                            <div className="absolute inset-0 bg-neon-cyan/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-black/60 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-neon-cyan/30 transition-colors">
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                            <HiSpeakerphone className="text-red-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-red-500 border border-red-500/30 px-2 py-0.5 rounded bg-red-500/5 uppercase tracking-wider">
                                                Broadcast
                                            </span>
                                            <span className="text-xs text-neutral-500 font-mono">
                                                {formatDistanceToNow(new Date(note.createdAt))} ago
                                            </span>
                                        </div>
                                        <p className="text-neutral-200 leading-relaxed">
                                            {note.content.replace('[SYSTEM BROADCAST]', '').trim()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
