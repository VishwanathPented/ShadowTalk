import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSpeakerphone, HiX } from 'react-icons/hi';
import api from '../api/axios';

const BroadcastPopup = () => {
    const [broadcast, setBroadcast] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const checkBroadcasts = async () => {
            try {
                // Fetch latest posts to find the most recent broadcast
                // Ideally this should be a lightweight endpoint, but using /posts is fine for now
                const res = await api.get('/api/posts');
                const latestBroadcast = res.data.find(p => p.content.startsWith('[SYSTEM BROADCAST]'));

                if (latestBroadcast) {
                    const lastSeenId = localStorage.getItem('lastSeenBroadcastId');

                    // If it's a new broadcast we haven't seen (or if we never saw one)
                    if (!lastSeenId || parseInt(lastSeenId) < latestBroadcast.id) {
                        setBroadcast(latestBroadcast);
                        setVisible(true);
                    }
                }
            } catch (err) {
                // Silent fail
            }
        };

        // Check immediately and then every 30 seconds
        checkBroadcasts();
        const interval = setInterval(checkBroadcasts, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = () => {
        if (broadcast) {
            localStorage.setItem('lastSeenBroadcastId', broadcast.id.toString());
        }
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && broadcast && (
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.9 }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg"
                >
                    <div className="bg-black/80 backdrop-blur-xl border-l-4 border-red-500 rounded-r-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-500/20 p-2 rounded-lg animate-pulse">
                                        <HiSpeakerphone className="text-red-500 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm">System Broadcast</h3>
                                        <p className="text-xs text-neutral-500 font-mono">PRIORITY: CRITICAL</p>
                                    </div>
                                </div>
                                <button onClick={handleDismiss} className="text-neutral-500 hover:text-white transition-colors">
                                    <HiX className="text-xl" />
                                </button>
                            </div>

                            <p className="text-white text-lg font-medium leading-relaxed">
                                {broadcast.content.replace('[SYSTEM BROADCAST]', '').trim()}
                            </p>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleDismiss}
                                    className="text-xs font-mono text-red-400 hover:text-red-300 uppercase tracking-wider underline decoration-red-500/30 underline-offset-4"
                                >
                                    Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BroadcastPopup;
