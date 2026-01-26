import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUsers, FaHandHoldingHeart, FaHome, FaBookmark, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDonors: 0,
        totalOwners: 0,
        totalPGs: 0,
        totalBookings: 0
    });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchStats();
        if (activeTab !== 'dashboard') {
            fetchData(activeTab);
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (tab) {
                case 'users': endpoint = '/admin/users'; break;
                case 'pgs': endpoint = '/admin/pgs'; break;
                default: return;
            }
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            // toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const itemType = activeTab === 'pgs' ? 'PG listing' : 'User';
        if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) return;

        try {
            const endpoint = activeTab === 'pgs' ? `/admin/pgs/${id}` : `/admin/users/${id}`;
            await api.delete(endpoint);
            toast.success(`${itemType} deleted successfully`);
            setData(data.filter(item => item.id !== id));
            fetchStats(); // Update stats
        } catch (error) {
            toast.error(`Failed to delete ${itemType}`);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem({ ...item });
        setShowModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            const endpoint = activeTab === 'pgs' ? `/admin/pgs/${editingItem.id}` : `/admin/users/${editingItem.id}`;
            await api.put(endpoint, editingItem);
            toast.success("Updated successfully");
            setShowModal(false);
            fetchData(activeTab); // Refresh list
        } catch (error) {
            toast.error("Failed to update");
            console.error(error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingItem(prev => ({ ...prev, [name]: value }));
    };

    const StatCard = ({ title, count, icon, color }) => (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderLeft: `5px solid ${color}`
        }}>
            <div style={{ fontSize: '2rem', color: color }}>{icon}</div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{count}</h3>
                <p style={{ margin: 0, color: '#64748b' }}>{title}</p>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Admin Dashboard</h1>

            {/* Statistics Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Total Users" count={stats.totalUsers} icon={<FaUsers />} color="#3b82f6" />
                <StatCard title="Total PG Listings" count={stats.totalPGs} icon={<FaHome />} color="#10b981" />
                <StatCard title="Total Bookings" count={stats.totalBookings} icon={<FaBookmark />} color="#f59e0b" />
                <StatCard title="Users w/ Bookings" count={stats.usersWithBookings || 0} icon={<FaUsers />} color="#8b5cf6" />
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('dashboard')}>Overview</button>
                <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}>Manage Users</button>
                <button className={`btn ${activeTab === 'pgs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('pgs')}>Manage PGs</button>
                <button className="btn btn-outline" onClick={() => { fetchStats(); if (activeTab !== 'dashboard') fetchData(activeTab); }} title="Refresh Data">🔄 Refresh</button>
            </div>

            {/* Main Content Area */}
            {activeTab !== 'dashboard' && (
                <div className="card" style={{ overflowX: 'auto', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {loading ? <p>Loading data...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    {activeTab === 'pgs' ? (
                                        <>
                                            <th style={{ padding: '1rem' }}>Name</th>
                                            <th style={{ padding: '1rem' }}>Location</th>
                                            <th style={{ padding: '1rem' }}>Price</th>
                                        </>
                                    ) : (
                                        <>
                                            <th style={{ padding: '1rem' }}>Username</th>
                                            <th style={{ padding: '1rem' }}>Email</th>
                                            <th style={{ padding: '1rem' }}>Role</th>
                                        </>
                                    )}
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>{item.id}</td>
                                        {activeTab === 'pgs' ? (
                                            <>
                                                <td style={{ padding: '1rem' }}>{item.name}</td>
                                                <td style={{ padding: '1rem' }}>{item.address}</td>
                                                <td style={{ padding: '1rem' }}>₹{item.price}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: '1rem' }}>{item.username}</td>
                                                <td style={{ padding: '1rem' }}>{item.email}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    {item.roles && Array.from(item.roles).map(role =>
                                                        <span key={role} style={{
                                                            fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '5px',
                                                            background: role === 'ROLE_ADMIN' ? '#fee2e2' : role === 'ROLE_DONOR' ? '#fce7f3' : '#e0f2fe',
                                                            color: role === 'ROLE_ADMIN' ? '#ef4444' : role === 'ROLE_DONOR' ? '#db2777' : '#0ea5e9'
                                                        }}>
                                                            {role.replace('ROLE_', '')}
                                                        </span>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditClick(item)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }} title="Edit">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }} title="Delete">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {showModal && editingItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Edit {activeTab === 'pgs' ? 'Listing' : 'User'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {activeTab === 'pgs' ? (
                                <>
                                    <label>Name <input type="text" name="name" value={editingItem.name} onChange={handleInputChange} className="input-field" style={{ width: '100%', padding: '0.5rem' }} /></label>
                                    <label>Address <input type="text" name="address" value={editingItem.address} onChange={handleInputChange} className="input-field" style={{ width: '100%', padding: '0.5rem' }} /></label>
                                    <label>Price <input type="number" name="price" value={editingItem.price} onChange={handleInputChange} className="input-field" style={{ width: '100%', padding: '0.5rem' }} /></label>
                                    <label>Description <textarea name="description" value={editingItem.description} onChange={handleInputChange} className="input-field" style={{ width: '100%', padding: '0.5rem' }} /></label>
                                </>
                            ) : (
                                <>
                                    <label>Username <input type="text" name="username" value={editingItem.username} onChange={handleInputChange} className="input-field" style={{ width: '100%', padding: '0.5rem' }} /></label>
                                    <label>Email <input type="email" name="email" value={editingItem.email} onChange={handleInputChange} className="input-field" style={{ width: '100%', padding: '0.5rem' }} /></label>
                                    <label>Phone Number <input type="text" name="phoneNumber" value={editingItem.phoneNumber || ''} onChange={handleInputChange} className="input-field" style={{ width: '100%', padding: '0.5rem' }} /></label>
                                    {/* Role editing is complex for string set, simplified to text or omitted for now to avoid errors */}
                                </>
                            )}

                            <button onClick={handleSaveEdit} className="btn btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <FaSave /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
