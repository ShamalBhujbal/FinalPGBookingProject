import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [pgs, setPgs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const response = await api.get('/admin/users');
                setUsers(response.data);
            } else {
                const response = await api.get('/admin/pgs');
                setPgs(response.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            // toast.error("Failed to fetch data. Ensure you are Admin.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success("User deleted successfully");
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleDeletePG = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await api.delete(`/admin/pgs/${id}`);
            toast.success("PG listing deleted successfully");
            setPgs(pgs.filter(pg => pg.id !== id));
        } catch (error) {
            toast.error("Failed to delete PG listing");
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Admin Dashboard</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
                <button
                    className={`btn ${activeTab === 'pgs' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('pgs')}
                >
                    Manage PG Listings
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="card" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>{activeTab === 'users' ? 'Username' : 'Title'}</th>
                                <th style={{ padding: '1rem' }}>{activeTab === 'users' ? 'Email' : 'Location'}</th>
                                <th style={{ padding: '1rem' }}>{activeTab === 'users' ? 'Role' : 'Price'}</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'users' ? (
                                users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>{user.id}</td>
                                        <td style={{ padding: '1rem' }}>{user.username}</td>
                                        <td style={{ padding: '1rem' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>{user.roles && Array.from(user.roles).join(', ')}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                pgs.map(pg => (
                                    <tr key={pg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>{pg.id}</td>
                                        <td style={{ padding: '1rem' }}>{pg.name}</td>
                                        <td style={{ padding: '1rem' }}>{pg.address}</td>
                                        <td style={{ padding: '1rem' }}>${pg.price}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleDeletePG(pg.id)}
                                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {activeTab === 'users' && users.length === 0 && (
                                <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No users found</td></tr>
                            )}
                            {activeTab === 'pgs' && pgs.length === 0 && (
                                <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No PG listings found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
