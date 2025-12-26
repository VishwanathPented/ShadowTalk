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
    const [banEndTime, setBanEndTime] = useState(() => {
        const saved = localStorage.getItem('shadow_ban_end_time');
        return saved ? parseInt(saved, 10) : null;
    });
    const [, setTick] = useState(0);

    // Ban Timer Effect
    useEffect(() => {
        if (!banEndTime) return;
        localStorage.setItem('shadow_ban_end_time', banEndTime);
        const interval = setInterval(() => {
            if (Date.now() > banEndTime) {
                setBanEndTime(null);
                localStorage.removeItem('shadow_ban_end_time');
                setNewMessage('');
            } else {
                setTick(t => t + 1); // Trigger re-render
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [banEndTime]);

    // Error Monitor for Ban
    useEffect(() => {
        if (error && (typeof error === 'string') && (error.includes('banned') || error.includes('Banned'))) {
            const match = error.match(/until ([\d-:.T]+)/);
            if (match) {
                const untilDate = new Date(match[1]);
                if (!isNaN(untilDate.getTime())) {
                    setBanEndTime(untilDate.getTime());
                    return;
                }
            }
            if (!banEndTime) {
                setBanEndTime(Date.now() + 5 * 60 * 1000);
            }
        }
    }, [error]);

    const formatTimeLeft = () => {
        if (!banEndTime) return "";
        const diff = Math.max(0, Math.floor((banEndTime - Date.now()) / 1000));
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
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




    const [pollMode, setPollMode] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [expiry, setExpiry] = useState(0); // 0 = Never
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (editingMsgId) {
            // Handle Edit
            if (!editContent.trim()) return;
            stompClientRef.current.send(`/app/chat/${groupId}/edit`, {}, JSON.stringify({
                messageId: editingMsgId.toString(),
                newContent: editContent,
                email: user?.email
            }));
            setEditingMsgId(null);
            setEditContent('');
            return;
        }

        if (pollMode) {
            if (!pollQuestion.trim() || pollOptions.some(o => !o.trim())) return;
            // Send Poll
            stompClientRef.current.send(`/app/chat/${groupId}`, {}, JSON.stringify({
                email: user?.email,
                type: 'POLL',
                pollQuestion,
                pollOptions,
                expiresIn: expiry
            }));
            setPollMode(false);
            setPollQuestion('');
            setPollOptions(['', '']);
            return;
        }

        if (!newMessage.trim()) return;

        const token = localStorage.getItem('token');
        let email = '';
        if (token) {
            try {
                const decoded = jwtDecode(token);
                email = decoded.sub;
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }

        if (stompClientRef.current && stompClientRef.current.connected) {
            const payload = {
                email: email,
                message: newMessage,
                type: 'TEXT',
                expiresIn: expiry
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

    const handleVote = (msgId, optionIndex) => {
        if (!stompClientRef.current) return;
        stompClientRef.current.send(`/app/chat/${groupId}/vote`, {}, JSON.stringify({
            messageId: msgId,
            optionIndex: optionIndex,
            email: user?.email
        }));
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
                        const isPoll = msg.type === 'POLL';
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

                                    <div className={`p-3 text-[15px] leading-snug rounded-2xl relative group ${isMe
                                        ? 'bg-social-blue text-white rounded-br-sm'
                                        : 'bg-neutral-800 text-white rounded-bl-sm'
                                        }`}>

                                        {/* Reply Preview */}
                                        {msg.replyTo && (
                                            <div className="text-xs mb-2 opacity-70 border-l-2 border-white/20 pl-2">
                                                Replying to: {msg.replyTo.type === 'POLL' ? 'Poll: ' + msg.replyTo.pollQuestion : msg.replyTo.message}
                                            </div>
                                        )}

                                        {/* Message Content */}
                                        {isPoll ? (
                                            <div className="min-w-[240px] bg-neutral-900/50 p-3 rounded-lg border border-white/10 mt-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xl">📊</span>
                                                    <h3 className="font-bold text-sm text-white">{msg.pollQuestion}</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    {msg.pollOptions.map((opt, i) => {
                                                        const votes = msg.votes ? msg.votes.filter(v => v.optionIndex === i).length : 0;
                                                        const totalVotes = msg.votes ? msg.votes.length : 0;
                                                        const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                                                        return (
                                                            <div
                                                                key={i}
                                                                onClick={() => handleVote(msg.id, i)}
                                                                className="relative cursor-pointer h-9 rounded-md bg-black/40 overflow-hidden border border-white/5 hover:border-white/20 transition group/opt"
                                                            >
                                                                {/* Progress Bar */}
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percent}%` }}
                                                                    className="absolute inset-0 bg-social-blue/30 group-hover/opt:bg-social-blue/40 transition-colors"
                                                                />

                                                                {/* Content */}
                                                                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs z-10 font-medium">
                                                                    <span className="text-white/90">{opt}</span>
                                                                    <span className="text-white/60">{votes} ({Math.round(percent)}%)</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="mt-2 text-[10px] text-white/40 text-right">
                                                    {msg.votes?.length || 0} total votes
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {msg.message}
                                                {msg.isEdited && <span className="text-[10px] opacity-50 ml-1">(edited)</span>}
                                            </div>
                                        )}

                                        {/* Reply Button (Visible on hover) */}
                                        <button
                                            onClick={() => setReplyTo(msg)}
                                            className="absolute -top-3 left-0 bg-neutral-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
                                            title="Reply"
                                        >
                                            <HiReply className="w-3 h-3" />
                                        </button>

                                        {/* Edit Button (Only for me, within 5 mins) */}
                                        {isMe && !isPoll && (Date.now() - new Date(msg.createdAt).getTime() < 5 * 60 * 1000) && (
                                            <button
                                                onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.message); }}
                                                className="absolute -top-3 right-0 bg-neutral-700 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {msg.expiresAt && (
                                    <span className="text-[9px] text-red-500/70 mt-0.5 px-1 flex items-center gap-1">
                                        ⏱ Expires at {new Date(msg.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
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

            {/* Editing / Poll / Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-black flex flex-col gap-2 relative border-t border-neutral-800">
                {/* Reply Preview Banner */}
                {replyTo && (
                    <div className="flex items-center justify-between bg-neutral-900/50 p-2 rounded text-xs text-neutral-400 border-l-2 border-social-blue mb-1">
                        <div className="flex flex-col">
                            <span className="font-bold text-social-blue">Replying to {replyTo.user?.anonymousName || 'User'}</span>
                            <span className="truncate max-w-[200px]">{replyTo.type === 'POLL' ? 'Poll: ' + replyTo.pollQuestion : replyTo.message}</span>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-neutral-800 rounded-full">
                            <HiX className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Mode Toggles */}
                {!editingMsgId && (
                    <div className="flex gap-2 text-xs overflow-x-auto pb-1">
                        <button type="button" onClick={() => setPollMode(!pollMode)} className={`px-2 py-1 rounded ${pollMode ? 'bg-social-blue text-white' : 'bg-neutral-900 text-neutral-400'}`}>
                            {pollMode ? 'Cancel Poll' : '📊 Poll'}
                        </button>
                        <select
                            value={expiry}
                            onChange={(e) => setExpiry(parseInt(e.target.value))}
                            className="bg-neutral-900 text-neutral-400 px-2 py-1 rounded outline-none border-none"
                        >
                            <option value="0">⏱ Never Expire</option>
                            <option value="1">⏱ 1 Min</option>
                            <option value="5">⏱ 5 Min</option>
                            <option value="60">⏱ 1 Hour</option>
                        </select>
                    </div>
                )}

                {pollMode ? (
                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 shadow-lg space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-sm flex items-center gap-2">
                                📊 Create Poll
                            </span>
                            <button type="button" onClick={() => setPollMode(false)} className="text-neutral-500 hover:text-white">
                                <HiX className="w-4 h-4" />
                            </button>
                        </div>

                        <input
                            className="w-full bg-black/50 border border-neutral-700/50 focus:border-social-blue text-white px-3 py-2 rounded text-sm placeholder-neutral-500 focus:outline-none transition"
                            placeholder="Ask a question..."
                            value={pollQuestion}
                            onChange={e => setPollQuestion(e.target.value)}
                            autoFocus
                        />

                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                            {pollOptions.map((opt, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input
                                        className="flex-1 bg-black/50 border border-neutral-700/50 focus:border-social-blue/50 text-white px-3 py-1.5 rounded text-sm placeholder-neutral-600 focus:outline-none transition"
                                        placeholder={`Option ${i + 1}`}
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...pollOptions];
                                            newOpts[i] = e.target.value;
                                            setPollOptions(newOpts);
                                        }}
                                    />
                                    {pollOptions.length > 2 && (
                                        <button type="button" onClick={() => {
                                            const newOpts = pollOptions.filter((_, idx) => idx !== i);
                                            setPollOptions(newOpts);
                                        }} className="text-neutral-600 hover:text-red-500 p-1">
                                            <HiX className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs text-social-blue hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-social-blue/10 transition">
                                + Add Option
                            </button>

                            <button type="submit" className="bg-social-blue text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-blue-600 transition shadow-lg shadow-blue-900/20">
                                Create Poll
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2 items-center">
                        {/* Ban Overlay Logic from previous step is preserved implicitly if state exists, but here we rebuild the input area */}
                        {banEndTime && (
                            <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center border-t border-red-500/30">
                                <span className="text-red-500 font-bold">BANNED ({formatTimeLeft()})</span>
                            </div>
                        )}

                        {editingMsgId ? (
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="flex-1 bg-neutral-900 text-white px-4 py-2 rounded-full focus:outline-none ring-1 ring-yellow-500/50"
                                    placeholder="Edit message..."
                                    autoFocus
                                />
                                <div className="text-xs text-neutral-500 flex flex-col justify-center cursor-pointer" onClick={() => setEditingMsgId(null)}>Cancel</div>
                            </div>
                        ) : (
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder="Message..."
                                    disabled={!!banEndTime}
                                    className="w-full bg-neutral-900 text-white placeholder-neutral-500 px-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-700 disabled:opacity-50"
                                />
                                <div className="absolute right-2 top-2.5 text-social-blue font-semibold text-sm cursor-pointer" onClick={handleSendMessage} style={{ opacity: newMessage.trim() ? 1 : 0, pointerEvents: newMessage.trim() ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                                    Send
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ChatBox;
