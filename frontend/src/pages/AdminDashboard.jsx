import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import Navbar from '../components/Navbar';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiUser, HiUserGroup, HiTrash, HiShieldCheck, HiServer,
    HiSpeakerphone, HiChartBar, HiTerminal, HiLogout, HiRefresh,
    HiFire, HiLightningBolt
} from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalPosts: 0 });
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [messages, setMessages] = useState([]);
    const [bannedWords, setBannedWords] = useState([]);
    const [newBannedWord, setNewBannedWord] = useState("");
    const [newBannedDuration, setNewBannedDuration] = useState(5);
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [systemHealth, setSystemHealth] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userMessages, setUserMessages] = useState([]);
    const [injectMsg, setInjectMsg] = useState("");

    const [loading, setLoading] = useState(false);

    const trafficData = [
        { time: '00:00', messages: 12 }, { time: '04:00', messages: 18 },
        { time: '08:00', messages: 45 }, { time: '12:00', messages: 92 },
        { time: '16:00', messages: 78 }, { time: '20:00', messages: 34 },
        { time: '23:59', messages: 22 },
    ];

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, groupsRes, msgsRes, bannedRes, healthRes, reportsRes] = await Promise.all([
                api.get('/api/shadow/stats'),
                api.get('/api/shadow/users'),
                api.get('/api/shadow/groups'),
                api.get('/api/shadow/messages'),
                api.get('/api/shadow/banned-words'),
                api.get('/api/shadow/system-health'),
                api.get('/api/shadow/reports')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setGroups(groupsRes.data);
            setMessages(msgsRes.data);
            setBannedWords(bannedRes.data);
            setSystemHealth(healthRes.data);
            setReports(reportsRes.data);
        } catch (err) {
            console.error("Dashboard sync failed", err);
            // toast.error("Sync Failed"); // Optional: clean up logs
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleDeleteGroup = async (id) => {
        if (!confirm("Purge this network cell?")) return;
        try {
            await api.delete(`/api/shadow/groups/${id}`);
            setGroups(groups.filter(g => g.id !== id));
        } catch (err) { alert("Purge failed"); }
    };
    const handleManualRefresh = () => {
        setLoading(true);
        fetchData();
        setTimeout(() => setLoading(false), 1000);
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        try {
            await api.post('/api/shadow/feed/post', { content: `[SYSTEM BROADCAST] ${broadcastMsg}` });
            toast.success("Broadcast Sent");
            setBroadcastMsg("");
        } catch (err) { alert("Broadcast Failed"); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("Terminate this user access?")) return;
        try {
            await api.delete(`/api/shadow/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) { alert("Termination failed"); }
    };

    const inspectUser = async (user) => {
        setSelectedUser(user);
        try {
            const res = await api.get(`/api/shadow/messages/user/${user.id}`);
            setUserMessages(res.data);
        } catch (err) { setUserMessages([]); }
    };
    const handleDeleteMessage = async (id, type) => {
        if (!confirm("Delete this message?")) return;
        try {
            await api.delete(`/api/shadow/messages/${id}?type=${type || 'CHAT'}`);
            setMessages(messages.filter(m => !(m.id === id && m.type === type)));
        } catch (err) {
            const errorMsg = err.response?.data ? (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) : err.message;
            alert("Failed to delete: " + errorMsg);
        }
    };

    const handleAddBannedWord = async (e) => {
        e.preventDefault();
        if (!newBannedWord.trim()) return;
        console.log("Adding Banned Word:", newBannedWord, "Duration:", newBannedDuration);
        try {
            await api.post('/api/shadow/banned-words', {
                word: newBannedWord,
                duration: newBannedDuration || 5
            });
            setNewBannedWord('');
            setNewBannedDuration(5);
            fetchData();
        } catch (error) {
            alert(error.response?.data || 'Failed to add word');
        }
    };

    const handleDeleteBannedWord = async (id) => {
        try {
            await api.delete(`/api/shadow/banned-words/${id}`);
            setBannedWords(bannedWords.filter(w => w.id !== id));
        } catch (err) { alert("Failed to delete"); }
    };

    const [reports, setReports] = useState([]);

    const handleDeleteReport = async (id) => {
        try {
            await api.delete(`/api/shadow/reports/${id}`);
            setReports(reports.filter(r => r.id !== id));
            toast.success("Report dismissed");
        } catch (err) { alert("Failed to dismiss report"); }
    };

    // Add edit stats handler
    const handleEditLikes = async (postId, currentLikes) => {
        const newLikes = prompt(`Enter new like count (Current: ${currentLikes || 0}):`, currentLikes || 0);
        if (newLikes !== null && !isNaN(newLikes)) {
            try {
                await api.put(`/api/shadow/posts/${postId}/stats`, { likes: parseInt(newLikes) });
                toast.success("Likes updated. It may take a moment to reflect.");
                if (activeTab === 'messages') fetchData(); // Refresh list to see if possible (though unified list might not show likes directly without updates)
            } catch (e) {
                alert("Failed to update stats");
            }
        }
    };

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-neutral-900/50 p-8 rounded-2xl border border-red-900/50 backdrop-blur-xl text-center">
                    <HiShieldCheck className="text-red-600 text-6xl mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-2 text-red-500 tracking-wider">RESTRICTED ACCESS</h1>
                    <p className="mb-8 text-neutral-400">Classified Level 5 Clearance Required.</p>
                    <a href="/login" className="block w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-widest transition-all mb-4">
                        AUTHENTICATE
                    </a>
                </div>
                <Navbar />
            </div>
        );
    }

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${activeTab === id ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-500' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
        >
            <Icon className="text-xl" />
            <span className="font-medium tracking-wide">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-black text-neutral-200 flex overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-neutral-900/50 border-r border-white/10 flex flex-col backdrop-blur-xl h-screen sticky top-0">
                <div className="p-8">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tighter">
                        GOD NODE
                    </h1>
                    <p className="text-xs text-neutral-500 tracking-widest mt-1">V2.0.4 BETA</p>
                </div>

                <nav className="flex-1 flex flex-col py-4">
                    <SidebarItem id="overview" icon={HiChartBar} label="Dashboard" />
                    <div className="my-2 border-t border-white/5 mx-6"></div>
                    <SidebarItem id="reports" icon={HiShieldCheck} label="Reports" />
                    <SidebarItem id="users" icon={HiUser} label="Operatives" />
                    <SidebarItem id="groups" icon={HiUserGroup} label="Networks" />
                    <SidebarItem id="messages" icon={HiTerminal} label="Intercepts" />
                    <SidebarItem id="banned" icon={HiShieldCheck} label="Blacklist" />
                    <div className="my-2 border-t border-white/5 mx-6"></div>
                    <SidebarItem id="broadcast" icon={HiSpeakerphone} label="Broadcast" />
                    <SidebarItem id="system" icon={HiServer} label="System Core" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
                            SHADOW<span className="text-indigo-500">NET</span>
                            <span className="text-xs ml-2 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-400 font-mono">ADMIN v2.0</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleManualRefresh}
                                disabled={loading}
                                className={`p-3 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Force System Sync"
                            >
                                <HiRefresh className={`text-xl ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={logout} className="p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
                <div className="p-8 max-w-7xl mx-auto pb-24">
                    {/* Header */}
                    <header className="mb-8 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
                            <p className="text-neutral-400">System Monitoring & Control Interface</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-neutral-500 font-mono">SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            <p className="text-xs text-green-500 font-mono">● SECURE CONNECTION ESTABLISHED</p>
                        </div>
                    </header>

                    {/* Content Views */}
                    {loading && (
                        <div className="p-8 text-center text-indigo-400 font-mono animate-pulse">
                            {`>>>`} ESTABLISHING UPLINK...
                        </div>
                    )}

                    {!loading && activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Traffic Chart */}
                            <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/10 backdrop-blur-sm h-80 relative overflow-hidden group">
                                <h3 className="text-neutral-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <HiLightningBolt className="text-yellow-500" /> Network Traffic Velocity
                                </h3>
                                <div className="absolute inset-x-0 bottom-0 top-16">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trafficData}>
                                            <defs>
                                                <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="messages" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMsg)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-indigo-500/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><HiUser className="text-2xl" /></div>
                                        <span className="text-xs font-mono text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">+12%</span>
                                    </div>
                                    <h3 className="text-neutral-400">Total Operatives</h3>
                                    <p className="text-5xl font-bold text-white mt-2">{stats.totalUsers}</p>
                                </div>
                                <div className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all"><HiUserGroup className="text-2xl" /></div>
                                    </div>
                                    <h3 className="text-neutral-400">Active Cells</h3>
                                    <p className="text-5xl font-bold text-white mt-2">{stats.totalGroups}</p>
                                </div>
                                <div className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-emerald-500/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all"><HiTerminal className="text-2xl" /></div>
                                    </div>
                                    <h3 className="text-neutral-400">Total Intercepts</h3>
                                    <p className="text-5xl font-bold text-white mt-2">{stats.totalPosts}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'users' && (
                        <div className="bg-neutral-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm">
                            {users.length === 0 ? (
                                <div className="p-12 text-center text-neutral-500">No operatives found in the database.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400 font-medium">
                                        <tr>
                                            <th className="p-6">Identity</th>
                                            <th className="p-6">Contact Route</th>
                                            <th className="p-6">Clearance</th>
                                            <th className="p-6 text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-6 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: u.avatarColor || '#6366f1' }}>
                                                        {u.anonymousName ? u.anonymousName[0] : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{u.anonymousName || 'Unknown'}</div>
                                                        <div className="text-xs text-neutral-500">ID: {u.id}</div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-neutral-400 font-mono text-sm">{u.email}</td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-neutral-700/50 text-neutral-300 border border-neutral-600/30'}`}>
                                                        {u.role || 'USER'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => inspectUser(u)}
                                                        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                        title="Inspect Comms"
                                                    >
                                                        <HiTerminal className="text-xl" />
                                                    </button>
                                                    {u.role !== 'ADMIN' && (
                                                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Terminate User">
                                                            <HiTrash className="text-xl" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* User Inspector Modal */}
                    <AnimatePresence>
                        {selectedUser && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                                onClick={() => setSelectedUser(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className="bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-neutral-800/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: selectedUser.avatarColor || '#6366f1' }}>
                                                {selectedUser.anonymousName ? selectedUser.anonymousName[0] : '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{selectedUser.anonymousName}</h3>
                                                <p className="text-sm text-indigo-400 font-mono">TARGET_ID: {selectedUser.id}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`WARNING: BURN IDENTITY PROTOCOL\n\nAre you sure you want to forcibly reset ${selectedUser.anonymousName}? Their identity will be erased and regenerated.`)) {
                                                    await api.post(`/api/shadow/users/${selectedUser.id}/reset-identity`);
                                                    alert("TARGET IDENTITY SCRAMBLED.");
                                                    setSelectedUser(null);
                                                    fetchData();
                                                }
                                            }}
                                            className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/50 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-all mr-4"
                                        >
                                            BURN IDENTITY
                                        </button>
                                        <button onClick={() => setSelectedUser(null)} className="text-neutral-500 hover:text-white text-2xl">×</button>
                                    </div>
                                    <div className="p-0 max-h-[60vh] overflow-y-auto">
                                        {userMessages.length === 0 ? (
                                            <div className="p-12 text-center text-neutral-500 font-mono">NO INTERCEPTED COMMUNICATIONS</div>
                                        ) : (
                                            <table className="w-full text-left font-mono text-sm">
                                                <thead className="bg-black/20 text-xs text-neutral-500 sticky top-0 backdrop-blur-md">
                                                    <tr>
                                                        <th className="p-4">Timestamp</th>
                                                        <th className="p-4">Content</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {userMessages.map(m => (
                                                        <tr key={m.id} className="hover:bg-white/5">
                                                            <td className="p-4 text-neutral-500 whitespace-nowrap">{new Date(m.createdAt).toLocaleString()}</td>
                                                            <td className="p-4 text-white">{m.message}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-white/10 bg-neutral-800/50 flex justify-between items-center text-xs text-neutral-500 font-mono">
                                        <span>TOTAL_RECORDS: {userMessages.length}</span>
                                        <span className="text-green-500">● LIVE FEED</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!loading && activeTab === 'groups' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groups.length === 0 ? <p className="text-neutral-500">No active cells found.</p> : groups.map(g => (
                                <div key={g.id} className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                            <HiUserGroup className="text-2xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{g.name}</h3>
                                            <p className="text-sm text-neutral-500 max-w-[200px] truncate">{g.description}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteGroup(g.id)} className="px-4 py-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm font-medium">
                                        Purge
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && activeTab === 'messages' && (
                        <div className="bg-black/50 rounded-2xl border border-white/10 overflow-hidden font-mono text-sm">
                            {/* Injection Console */}
                            <div className="p-4 bg-indigo-900/20 border-b border-indigo-500/30 flex gap-4 items-center">
                                <input
                                    type="text"
                                    value={injectMsg}
                                    onChange={(e) => setInjectMsg(e.target.value)}
                                    placeholder=">>> INJECT SYSTEM MESSAGE TO GLOBAL FEED..."
                                    className="flex-1 bg-black/50 border border-indigo-500/30 rounded px-4 py-2 text-indigo-300 placeholder-indigo-700/50 focus:outline-none focus:border-indigo-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && injectMsg.trim()) {
                                            api.post('/api/shadow/feed/post', { content: injectMsg }).then(() => {
                                                alert("INJECTION SUCCESSFUL");
                                                setInjectMsg("");
                                                fetchData();
                                            });
                                        }
                                    }}
                                />
                                <HiLightningBolt className="text-indigo-500 text-xl" />
                            </div>
                            {messages.map((m, idx) => (
                                <div key={`${m.type}_${m.id}_${idx}`} className="p-4 border-b border-white/5 flex gap-4 hover:bg-white/5 transition-colors group items-center">
                                    <div className="text-neutral-500 w-24 shrink-0 text-xs">{new Date(m.createdAt).toLocaleTimeString()}</div>

                                    <div className="w-24 shrink-0">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${m.type === 'POST' ? 'border-pink-500/30 text-pink-400' : 'border-indigo-500/30 text-indigo-400'}`}>
                                            {m.type === 'POST' ? 'FEED' : 'CHAT'}
                                        </span>
                                    </div>

                                    <div className="text-indigo-400 w-32 shrink-0 truncate font-bold">{m.user?.anonymousName || 'UNKNOWN'}</div>

                                    <div className="flex-1">
                                        <div className="text-neutral-300">{m.message}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-[10px] text-neutral-500">{m.source}</div>
                                            {m.type === 'POST' && m.likes !== undefined && (
                                                <span className="text-[10px] text-neon-purple font-mono bg-neon-purple/10 px-1 rounded border border-neon-purple/20">
                                                    ♥ {m.likes}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button onClick={() => handleDeleteMessage(m.id, m.type)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-4">
                                        DELETE
                                    </button>

                                    {m.type === 'POST' && (
                                        <button
                                            onClick={() => handleEditLikes(m.id)}
                                            className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity px-2 text-xs font-bold border border-indigo-500/30 rounded"
                                            title="Edit Stats"
                                        >
                                            EDIT STATS
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && activeTab === 'banned' && (
                        <div className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <HiShieldCheck className="text-red-500" /> Protocol Violations
                            </h2>

                            <form onSubmit={handleAddBannedWord} className="mb-8 flex gap-4">
                                <input
                                    type="text"
                                    value={newBannedWord}
                                    onChange={(e) => setNewBannedWord(e.target.value)}
                                    placeholder="Enter forbidden sequence..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 font-mono text-sm"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={newBannedDuration}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNewBannedDuration(val === '' ? '' : parseInt(val));
                                    }}
                                    placeholder="Min"
                                    className="w-24 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500/50 font-mono text-sm"
                                    title="Ban Duration (minutes)"
                                />
                                <button type="submit" className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-mono text-sm uppercase tracking-wider border border-red-500/20">
                                    Blacklist
                                </button>
                            </form>

                            <div className="space-y-2">
                                {bannedWords?.map(word => (
                                    <div key={word.id} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5 group hover:border-red-500/30 transition-all">
                                        <div className="font-mono text-neutral-300">
                                            {word.word}
                                            <span className="ml-3 text-xs text-neutral-500 bg-neutral-900 px-2 py-1 rounded">
                                                {word.banDurationMinutes || 5}m
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBannedWord(word.id)}
                                            className="text-neutral-600 hover:text-red-500 transition-colors"
                                        >
                                            <HiTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'broadcast' && (
                        <div className="max-w-2xl mx-auto mt-10">
                            <div className="bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                <div className="bg-neutral-800/50 p-4 border-b border-white/5 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-4 text-xs font-mono text-neutral-500">EMERGENCY_BROADCAST_SYSTEM</span>
                                </div>
                                <div className="p-8">
                                    <textarea
                                        value={broadcastMsg}
                                        onChange={(e) => setBroadcastMsg(e.target.value)}
                                        placeholder=">>> TYPE SYSTEM ALERT MESSAGE HERE..."
                                        className="w-full h-40 bg-black border border-white/10 rounded-xl p-6 text-red-500 font-mono text-lg focus:outline-none focus:border-red-500/50 mb-6 resize-none"
                                    ></textarea>
                                    <button
                                        onClick={handleBroadcast}
                                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-3"
                                    >
                                        <HiSpeakerphone className="text-2xl animate-pulse" />
                                        TRANSMIT ALERT
                                    </button>
                                </div>
                            </div>
                            <p className="text-center text-neutral-500 mt-4 text-xs">WARNING: This message will be pushed to all active connected clients instantly.</p>
                        </div>
                    )}

                    {!loading && activeTab === 'reports' && (
                        <div className="space-y-4">
                            {reports.length === 0 ? (
                                <div className="p-12 text-center text-neutral-500 font-mono">NO ACTIVE REPORTS</div>
                            ) : (
                                reports.map(report => (
                                    <div key={report.id} className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-red-400 font-bold uppercase tracking-wider text-xs border border-red-500/30 px-2 py-0.5 rounded">
                                                    {report.type}
                                                </span>
                                                <span className="text-neutral-500 text-xs">
                                                    {new Date(report.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-white font-bold mb-1">Reason: <span className="text-red-300 font-normal">{report.reason}</span></p>
                                            <p className="text-neutral-400 text-sm italic">
                                                Reporter: {report.reporter?.anonymousName || 'Unknown'} (ID: {report.reporter?.id})
                                            </p>
                                            {report.reportedPost && (
                                                <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/5 text-sm text-neutral-300">
                                                    "{report.reportedPost.content}"
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleDeleteReport(report.id)}
                                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                DISMISS REPORT
                                            </button>
                                            {report.reportedPost && (
                                                <button
                                                    onClick={() => handleDeleteMessage(report.reportedPost.id, 'POST')}
                                                    className="px-4 py-2 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    DELETE CONTENT
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'system' && systemHealth && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <HiServer className="text-green-400" />
                                    System Vitals
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2 text-neutral-400">
                                            <span>Status</span>
                                            <span className="text-green-400 font-bold">{systemHealth.status}</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2 text-neutral-400">
                                            <span>Memory Usage</span>
                                            <span className="text-indigo-400 font-mono">{systemHealth.memoryUsed} / {systemHealth.memoryTotal}</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: '40%' }}></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-neutral-500 uppercase">Uptime</p>
                                            <p className="text-2xl font-mono text-white">{(systemHealth.uptime / 1000).toFixed(0)}s</p>
                                        </div>
                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-neutral-500 uppercase">Active Threads</p>
                                            <p className="text-2xl font-mono text-white">{systemHealth.activeThreads}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div >
    );
};

export default AdminDashboard;
