import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { HiUser, HiUserGroup, HiTrash, HiShieldCheck } from 'react-icons/hi';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalPosts: 0 });
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await api.get('/shadow/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/shadow/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/shadow/groups');
            setGroups(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchStats();
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'groups') fetchGroups();
        }
    }, [user, activeTab]);

    const handleBecomeAdmin = async () => {
        try {
            await api.post('/shadow/become-god');
            alert("You are now Admin! Please refresh authentication (logout/login or wait).");
            window.location.reload();
        } catch (err) {
            alert("Auto-hack failed. Try manual override.");
        }
    };

    const handleManualOverride = async () => {
        const code = prompt("Enter Shadow Protocol Override Code:");
        if (!code) return;
        try {
            await api.post('/shadow/manual-override', {
                code,
                email: user.email
            });
            alert("Override Accepted. Welcome, Admin.");
            window.location.reload();
        } catch (err) {
            alert("Access Denied: Invalid Code or User not found");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("Destroy this user?")) return;
        try {
            await api.delete(`/shadow/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const handleDeleteGroup = async (id) => {
        if (!confirm("Destroy this group?")) return;
        try {
            await api.delete(`/shadow/groups/${id}`);
            setGroups(groups.filter(g => g.id !== id));
        } catch (err) {
            alert("Failed to delete");
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4 text-red-500">Restricted Area ⚠️</h1>
                <p className="mb-8">Level 5 Clearance Required.</p>
                <button
                    onClick={handleBecomeAdmin}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all mb-4"
                >
                    Hack Mainframe (Auto)
                </button>
                <div className="text-xs text-slate-500 mb-2">OR</div>
                <button
                    onClick={handleManualOverride}
                    className="px-6 py-3 bg-transparent border border-red-900/50 text-red-800 hover:text-red-500 hover:border-red-500 rounded-lg transition-all text-xs font-mono"
                >
                    Initialize Manual Override
                </button>
                <div className="fixed bottom-0 w-full"><Navbar /></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-slate-200 pb-20">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                            God Mode
                        </h1>
                        <p className="text-slate-500">System Administration Console</p>
                    </div>
                    <div className="px-3 py-1 bg-red-900/30 border border-red-500/50 text-red-400 rounded-full text-xs font-mono">
                        ADMIN_ACCESS_GRANTED
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-1">
                    {['overview', 'users', 'groups'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 capitalize transition-colors ${activeTab === tab
                                ? 'text-white border-b-2 border-red-500'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="animate-fade-in">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                                <div className="text-slate-400 text-sm uppercase font-bold mb-2">Total Users</div>
                                <div className="text-4xl font-bold text-white">{stats.totalUsers}</div>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                                <div className="text-slate-400 text-sm uppercase font-bold mb-2">Active Groups</div>
                                <div className="text-4xl font-bold text-brand-primary">{stats.totalGroups}</div>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                                <div className="text-slate-400 text-sm uppercase font-bold mb-2">Total Posts</div>
                                <div className="text-4xl font-bold text-purple-400">{stats.totalPosts}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Users</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td className="p-4 flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full"
                                                    style={{ backgroundColor: u.avatarColor || '#333' }}
                                                ></div>
                                                <span className="font-medium text-white">{u.anonymousName}</span>
                                            </td>
                                            <td className="p-4 text-slate-400">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${u.role === 'ADMIN' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {u.role !== 'ADMIN' && (
                                                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-400">
                                                        <HiTrash />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Group Name</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {groups.map(g => (
                                        <tr key={g.id}>
                                            <td className="p-4 font-medium text-white">{g.name}</td>
                                            <td className="p-4 text-slate-400">{g.description}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteGroup(g.id)} className="text-red-500 hover:text-red-400">
                                                    <HiTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default AdminDashboard;
