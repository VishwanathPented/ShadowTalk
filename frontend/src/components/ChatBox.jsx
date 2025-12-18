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
import SockJS from "sockjs-client"; // Import explicitly dist
import { jwtDecode } from "jwt-decode";
import api from '../api/axios';
import { HiPaperAirplane } from 'react-icons/hi';

const ChatBox = ({ groupId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth(); // We might need user email for local optimistic display, but real logic relies on backend

    useEffect(() => {
        // Load history
        const loadHistory = async () => {
            try {
                const res = await api.get(`/api/groups/${groupId}/messages`);
                setMessages(res.data);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };
        loadHistory();

        // Connect WebSocket
        const wsUrl = 'http://localhost:8080/ws'; // SockJS endpoint
        const socket = new SockJS(wsUrl);
        const stompClient = Stomp.over(socket);
        // stompClient.debug = () => { }; // Keep debug for now

        stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame);
            // Subscribe
            stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
                const receivedMsg = JSON.parse(message.body);
                setMessages((prev) => [...prev, receivedMsg]);
                scrollToBottom();
            });
        }, (error) => {
            console.error('STOMP error', error);
        });

        stompClientRef.current = stompClient;

        return () => {
             if (stompClientRef.current) stompClientRef.current.disconnect();
        };
    }, [groupId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
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
            stompClientRef.current.send(`/app/chat/${groupId}`, {}, JSON.stringify({
                email: email,
                message: newMessage
            }));
            setNewMessage('');
        } else {
            console.error("STOMP client is not connected");
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = false; // Logic to detect self (email compare)
                    // We need my email to know if it's me.
                    // Let's assume consistent Anon names are the display.

                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs text-slate-500 mb-1 ml-1">{msg.user?.anonymousName || 'Unknown'}</span>
                            <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                {msg.message}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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
