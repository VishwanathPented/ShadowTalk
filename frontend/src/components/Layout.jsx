import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CyberpunkBackground from './CyberpunkBackground';
import BroadcastPopup from './BroadcastPopup';
import FeedbackModal from './FeedbackModal';

const Layout = () => {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    return (
        <div className="min-h-screen text-neutral-200 pb-20 md:pb-0 md:pt-0 md:pl-20 selection:bg-neon-cyan selection:text-black font-sans">
            <CyberpunkBackground />
            <BroadcastPopup />
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-[1920px]">
                <Outlet />
            </main>

            <button
                onClick={() => setIsFeedbackOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-neutral-900/80 backdrop-blur-md border border-brand-primary/50 text-brand-primary p-3 rounded-full shadow-lg hover:shadow-brand-primary/40 hover:scale-110 transition-all group"
                title="Report Bug / Feedback"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-neutral-900 text-xs px-2 py-1 rounded border border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Feedback
                </span>
            </button>

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

            {/* Global Footer - Minimal */}
            <footer className="py-10 border-t border-white/10 mt-20 text-center">
                <p className="text-xs text-neutral-600 font-mono uppercase tracking-widest">ShadowTalk Network // Obsidian Protocol</p>
            </footer>
        </div>
    );
};

export default Layout;
