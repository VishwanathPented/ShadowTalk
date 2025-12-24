import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
// import { Stomp } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// Note: Vite polyfills for 'global' might be needed for SockJS/Stomp depending on version.
// Standard workaround or use a purely websocket library.
// For simplicity in this stack, let's assume we use 'stompjs' directly over native WS or SockJS.
// We'll use a simple stompwrapper or just standard logic.

// Since we cannot run npm install dynamically effectively, I will write logic that assumes standard imports work.
// If 'global' is issue in Vite, we add: <script>window.global = window;</script> to index.html manually if needed.

import Stomp from 'stompjs';
import SockJS from 'sockjs-client/dist/sockjs'; // Explicit dist import for Vite compatibility
import { jwtDecode } from "jwt-decode";
import api from '../api/axios';
import { HiPaperAirplane, HiReply, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBox = ({ groupId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const typingTimeoutRef = useRef(null);
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        // Load history
        const loadHistory = async () => {
            try {
                const res = await api.get(`/api/groups/${groupId}/messages`);
                setMessages(res.data || []);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to load chat history", err);
                setError("Failed to load history");
            }
        };
        loadHistory();

        // Connect WebSocket
        let client = null;
        try {
            const wsUrl = 'http://localhost:8080/ws';
            const socket = new SockJS(wsUrl);
            client = Stomp.over(socket);
            client.debug = null; // Disable debug logging for cleaner console

            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            client.connect(headers, (frame) => {
                console.log('Connected: ' + frame);
                setError(null);
                // Chat Subscription
                client.subscribe(`/topic/group/${groupId}`, (message) => {
                    const receivedMsg = JSON.parse(message.body);
                    setMessages((prev) => [...prev, receivedMsg]);
                    scrollToBottom();
                });

                // Typing Subscription
                client.subscribe(`/topic/group/${groupId}/typing`, (message) => {
                    const data = JSON.parse(message.body);
                    if (data.email === user?.email) return; // Ignore self

                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        if (data.isTyping === "true") {
                            newSet.add(data.anonymousName);
                        } else {
                            newSet.delete(data.anonymousName);
                        }
                        return newSet;
                    });
                });

                // Active Users Subscription
                client.subscribe(`/topic/group/${groupId}/active`, (message) => {
                    setActiveUsers(JSON.parse(message.body));
                });

                // Reaction Subscription
                client.subscribe(`/topic/group/${groupId}/react`, (message) => {
                    const updatedMessage = JSON.parse(message.body);
                    setMessages((prev) => prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
                });
            }, (err) => {
                console.error('STOMP connection error', err);
                const msg = err && typeof err === 'object' && err.headers && err.headers.message ? err.headers.message : "Connection lost";
                setError(msg);
            });

            stompClientRef.current = client;
        } catch (e) {
            console.error("WebSocket init error", e);
            setError("Failed to initialize chat");
        }

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [groupId, user?.email]); // Add user?.email dependency

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!stompClientRef.current || !stompClientRef.current.connected) return;

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Send typing started
        const token = localStorage.getItem('token');
        let email = '';
        let anonymousName = user?.anonymousName || 'Anonymous';

        if (token) {
            try {
                const decoded = jwtDecode(token);
                email = decoded.sub;
            } catch (err) { }
        }

        stompClientRef.current.send(`/app/chat/${groupId}/typing`, {}, JSON.stringify({
            email: email,
            anonymousName: anonymousName,
            isTyping: "true"
        }));

        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.send(`/app/chat/${groupId}/typing`, {}, JSON.stringify({
                    email: email,
                    anonymousName: anonymousName,
                    isTyping: "false"
                }));
            }
        }, 2000);
    };

    const handleReaction = (messageId, emoji) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) return;

        const token = localStorage.getItem('token');
        let email = '';
        if (token) {
            try {
                const decoded = jwtDecode(token);
                email = decoded.sub;
            } catch (err) { }
        }

        stompClientRef.current.send(`/app/chat/${groupId}/react`, {}, JSON.stringify({
            messageId: messageId.toString(),
            emoji: emoji,
            email: email
        }));
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const token = localStorage.getItem('token');
        let email = '';
        if (token) {
            try {
                const decoded = jwtDecode(token);
                email = decoded.sub; // 'sub' usually holds the username/email in Spring Security JWT
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }

        if (stompClientRef.current && stompClientRef.current.connected) {
            const payload = {
                email: email,
                message: newMessage
            };
            if (replyTo) {
                payload.replyToId = replyTo.id.toString();
            }

            stompClientRef.current.send(`/app/chat/${groupId}`, {}, JSON.stringify(payload));
            setNewMessage('');
            setReplyTo(null);
        } else {
            console.error("STOMP client is not connected");
        }
    };

    return (
        <div className="flex flex-col h-[500px] glass-panel rounded-xl overflow-hidden">
            {error && <div className="bg-red-500/10 text-red-500 p-2 text-center text-sm">{error}</div>}

            {/* Active Users */}
            {activeUsers && activeUsers.length > 0 && (
                <div className="bg-black/20 p-2 flex items-center border-b border-white/5 px-4 gap-2">
                    <div className="flex -space-x-2">
                        {activeUsers.slice(0, 5).map((u, i) => (
                            <img
                                key={i}
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u)}&background=random&color=fff&size=24`}
                                alt={u}
                                title={u}
                                className="w-6 h-6 rounded-full border border-slate-900"
                            />
                        ))}
                    </div>
                    {activeUsers.length > 5 && <span className="text-xs text-slate-500">+{activeUsers.length - 5}</span>}
                    <span className="text-xs text-brand-primary font-medium animate-pulse">● {activeUsers.length} Online</span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {Array.isArray(messages) && messages.map((msg, idx) => {
                        // Check if message is from me
                        const isMe = user?.email && msg.user?.email === user.email;

                        return (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group max-w-[80%]`}
                            >
                                <span className="text-xs text-slate-500 mb-1 ml-1">{msg.user?.anonymousName || 'Unknown'}</span>

                                <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.anonymousName || 'U')}&background=random&color=fff&size=32`}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full shadow-md"
                                    />
                                    <div className={`px-4 py-2 rounded-2xl break-words relative ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                        {msg.replyTo && (
                                            <div className={`text-xs mb-2 p-2 rounded border-l-2 ${isMe ? 'bg-white/10 border-white/50' : 'bg-black/20 border-slate-500'}`}>
                                                <span className="font-bold block opacity-75">{msg.replyTo.user?.anonymousName || 'Unknown'}</span>
                                                <span className="line-clamp-1 opacity-75">{msg.replyTo.message}</span>
                                            </div>
                                        )}
                                        {msg.message}

                                        {/* Reactions Display */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1 -mb-1">
                                                {Object.entries(msg.reactions.reduce((acc, r) => {
                                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                                    return acc;
                                                }, {})).map(([emoji, count]) => (
                                                    <span key={emoji} className="text-xs bg-black/20 rounded px-1">{emoji} {count > 1 ? count : ''}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons (Reply & React) */}
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setReplyTo(msg)}
                                            className="p-1 text-slate-500 hover:text-white"
                                            title="Reply"
                                        >
                                            <HiReply className="w-4 h-4" />
                                        </button>
                                        <div className="flex gap-1">
                                            {['❤️', '😂', '🔥', '👍'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg.id, emoji)}
                                                    className="text-xs hover:scale-125 transition-transform"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
                <div className="px-4 py-1 text-xs text-slate-500 italic">
                    {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </div>
            )}

            {replyTo && (
                <div className="bg-slate-900/90 border-t border-slate-800 p-2 flex justify-between items-center px-4 backdrop-blur-sm">
                    <div className="text-sm text-slate-300 border-l-2 border-brand-primary pl-2">
                        <div className="text-brand-primary text-xs font-bold">Replying to {replyTo.user?.anonymousName}</div>
                        <div className="line-clamp-1 opacity-75">{replyTo.message}</div>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-900 text-slate-200 px-4 py-2 rounded-full border border-slate-800 focus:border-brand-primary focus:outline-none"
                />
                <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-brand-primary rounded-full text-white hover:bg-brand-accent transition-colors disabled:opacity-50">
                    <HiPaperAirplane className="w-5 h-5 rotate-90" />
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
