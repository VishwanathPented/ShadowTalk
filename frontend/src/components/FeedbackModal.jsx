import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [type, setType] = useState('BUG');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/feedback', { type, content });
            toast.success('Feedback sent. Thank you!');
            setContent('');
            onClose();
        } catch (error) {
            console.error('Feedback Error:', error);
            toast.error('Failed to send feedback.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
                >
                    <h3 className="text-xl font-bold text-white mb-4">Report Bug / Suggestion</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4">
                            {['BUG', 'FEATURE', 'OTHER'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${type === t
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <textarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Describe the issue or idea..."
                            className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-brand-primary resize-none"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Feedback'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FeedbackModal;
