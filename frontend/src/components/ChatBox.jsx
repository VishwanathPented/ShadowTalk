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
import { FaHeart } from 'react-icons/fa'; // Add FaHeart import
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
            // NATIVE WEBSOCKET CONNECTION (Robust, no polyfills needed)
            const wsUrl = 'ws://localhost:8080/ws-raw';
            console.log("Attempting Raw WebSocket Connection to:", wsUrl);

            // Create native WebSocket
            const socket = new WebSocket(wsUrl);

            // Pass to Stomp
            client = Stomp.over(socket);
            client.debug = (str) => console.log(str);
            client.reconnect_delay = 5000; // Auto-reconnect

            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            client.connect(headers, (frame) => {
                console.log('Connected to Stomp (Raw):', frame);
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
        <div className="flex flex-col h-[600px] bg-black border border-neutral-800 rounded-xl overflow-hidden">
            {/* Header Insta Style */}
            <div className="border-b border-neutral-800 p-4 flex items-center justify-between bg-black z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={`https://ui-avatars.com/api/?name=Group+${groupId}&background=random`}
                            className="w-8 h-8 rounded-full"
                        />
                        {activeUsers.length > 0 && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-white text-sm">Shadow Group {groupId}</span>
                        <span className="text-xs text-neutral-500">Active now</span>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {/* Tiny avatars of active users */}
                    {activeUsers.slice(0, 3).map((u, i) => (
                        <img key={i} src={`https://ui-avatars.com/api/?name=${u}&background=random`} className="w-6 h-6 rounded-full border-2 border-black" />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {Array.isArray(messages) && messages.map((msg, idx) => {
                        const isMe = user?.email && msg.user?.email === user.email;
                        const isSystem = msg.message.startsWith('[SYSTEM]');
                        const showAvatar = !isMe && (idx === 0 || messages[idx - 1]?.user?.email !== msg.user?.email);

                        if (isSystem) {
                            return (
                                <div key={idx} className="flex justify-center my-4">
                                    <span className="text-xs text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full">
                                        {msg.message.replace('[SYSTEM]', '').trim()}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] ${isMe ? 'ml-auto' : ''}`}
                            >
                                <div className="flex gap-2 items-end">
                                    {!isMe && (
                                        <div className="w-7 h-7 shrink-0">
                                            {showAvatar && (
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.anonymousName || 'U')}&background=random&color=fff`}
                                                    className="w-full h-full rounded-full"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className={`px-4 py-2 text-[15px] leading-snug rounded-2xl ${isMe
                                        ? 'bg-social-blue text-white rounded-br-sm'
                                        : 'bg-neutral-800 text-white rounded-bl-sm'
                                        }`}>
                                        {msg.replyTo && (
                                            <div className="text-xs mb-1 opacity-70 border-l-2 border-white/20 pl-2">
                                                Replying to: {msg.replyTo.message}
                                            </div>
                                        )}
                                        {msg.message}
                                    </div>
                                </div>
                                {/* Timestamp optional */}
                                {/* <span className="text-[10px] text-neutral-600 mt-1 px-1">{format(new Date(msg.createdAt), 'HH:mm')}</span> */}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {typingUsers.size > 0 && (
                <div className="px-4 py-2 text-xs text-neutral-500">
                    <span className="font-semibold">{Array.from(typingUsers).join(", ")}</span> is typing...
                </div>
            )}

            <form onSubmit={handleSendMessage} className="p-3 bg-black flex gap-2 items-center">
                <div className="p-2 text-social-blue cursor-pointer hover:bg-neutral-900 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Message..."
                        className="w-full bg-neutral-900 text-white placeholder-neutral-500 px-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-700"
                    />
                    <div className="absolute right-2 top-2.5 text-social-blue font-semibold text-sm cursor-pointer" onClick={handleSendMessage} style={{ opacity: newMessage.trim() ? 1 : 0, pointerEvents: newMessage.trim() ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                        Send
                    </div>
                </div>
                {!newMessage.trim() && (
                    <div className="p-2 text-white cursor-pointer hover:bg-neutral-900 rounded-full">
                        <FaHeart className="w-6 h-6" />
                        {/* Just an icon example for "Like" shortcut */}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ChatBox;
