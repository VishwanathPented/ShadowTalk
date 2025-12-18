import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiPlus, HiLockClosed, HiGlobeAlt } from 'react-icons/hi';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', isPrivate: false });

    const fetchGroups = async () => {
        try {
            const res = await api.get('/api/groups');
            setGroups(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load groups: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/groups', newGroup);
            toast.success('Group created!');
            setShowCreate(false);
            setNewGroup({ name: '', description: '', isPrivate: false });
            fetchGroups();
        } catch (error) {
            toast.error('Failed to create group');
        }
    };

    const handleJoin = async (id) => {
        try {
            await api.post(`/api/groups/${id}/join`);
            toast.success('Joined group!');
            // Redirect or refresh
        } catch (error) {
            // toast.error('Already joined or error');
        }
    };

    // Join Private Logic would be a separate modal/input, skipping for brevity in this file

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Groups</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                    <HiPlus className="w-5 h-5" />
                    Create
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
                    <input
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white mb-2"
                        placeholder="Group Name"
                        value={newGroup.name}
                        onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                        required
                    />
                    <input
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white mb-2"
                        placeholder="Description"
                        value={newGroup.description}
                        onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    />
                    <div className="flex items-center gap-2 mb-4">
                        <label className="text-slate-400">Private?</label>
                        <input type="checkbox" checked={newGroup.isPrivate} onChange={e => setNewGroup({ ...newGroup, isPrivate: e.target.checked })} />
                    </div>
                    <button type="submit" className="bg-brand-primary px-4 py-2 rounded text-white text-sm">Create Group</button>
                </form>
            )}

            <div className="grid gap-4">
                {groups.map(group => (
                    <div key={group.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-brand-primary/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-brand-primary flex items-center gap-2">
                                    {group.name}
                                    {group.isPrivate ? <HiLockClosed className="w-4 h-4 text-red-400" /> : <HiGlobeAlt className="w-4 h-4 text-green-400" />}
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">{group.description}</p>
                            </div>
                            <Link
                                to={`/groups/${group.id}`}
                                onClick={() => handleJoin(group.id)} // Ideally join check before navigation
                                className="bg-slate-800 hover:bg-brand-primary text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                                Open
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Groups;
