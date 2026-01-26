import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
    const [pgs, setPgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        price: '',
        description: ''
    });
    const [errors, setErrors] = useState({});



    const fetchMyPGs = async () => {
        try {
            const response = await api.get('/pgs/my-pgs');
            setPgs(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching PGs:', error);
            // toast.error('Failed to load your PGs');
            setLoading(false);
            if (error.response && error.response.status === 403) {
                toast.error("Access Denied. You are not an Owner.");
                navigate('/');
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'PG Name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (Number(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = new FormData();
        data.append('name', formData.name);
        data.append('address', formData.address);
        data.append('price', formData.price);
        data.append('description', formData.description);

        if (formData.images && formData.images.length > 0) {
            for (let i = 0; i < formData.images.length; i++) {
                data.append('images', formData.images[i]);
            }
        }

        if (formData.video) {
            data.append('video', formData.video);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': undefined // Let browser set multipart/form-data with boundary
                }
            };

            if (editingId) {
                // Backend currently expects JSON for PUT, but we are sending FormData. 
                // We need to update backend to support Multipart for PUT as well.
                // For now, sending FormData to PUT endpoint will likely fail until backend is updated.
                await api.put(`/pgs/${editingId}`, data, config);
                toast.success('PG Updated Successfully');
            } else {
                await api.post('/pgs', data, config);
                toast.success('PG Added Successfully');
            }

            fetchMyPGs();
            resetForm();
        } catch (error) {
            console.error('Error saving PG:', error);
            const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to save PG';
            toast.error('Failed to save PG: ' + errMsg);
        }
    };

    const handleEdit = (pg) => {
        setFormData({
            name: pg.name,
            address: pg.address,
            price: pg.price,
            description: pg.description || '',
            imageUrls: pg.imageUrls ? pg.imageUrls.join(', ') : '',
            videoUrl: pg.videoUrl || ''
        });
        setEditingId(pg.id);
        setShowForm(true);
        setErrors({});
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this PG?')) {
            try {
                await api.delete(`/pgs/${id}`);
                toast.success('PG Deleted Successfully');
                fetchMyPGs();
            } catch (error) {
                console.error('Error deleting PG:', error);
                toast.error('Failed to delete PG');
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', price: '', description: '', images: [], video: null });
        setEditingId(null);
        setShowForm(false);
        setErrors({});
    };

    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch current user details to check for roles
        api.get('/users/me').then(res => setUser(res.data)).catch(err => console.error(err));
        fetchMyPGs();
    }, []);

    const handleBecomeDonor = async () => {
        if (window.confirm('Do you want to become a Donor and help students by sponsoring their rent?')) {
            try {
                await api.post('/users/become-donor');
                toast.success('Congratulations! You are now a Donor.');
                window.location.reload();
            } catch (error) {
                console.error('Error becoming donor:', error);
                toast.error('Failed to update profile');
            }
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
                <h1 style={{ color: 'var(--primary)' }}>Owner Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Donor Option */}
                    {user && user.roles && user.roles.includes('ROLE_DONOR') ? (
                        <a href="/donor-dashboard" className="btn btn-secondary" style={{ backgroundColor: '#2563eb', color: 'white', fontSize: '0.9rem' }}>
                            Go to Donor Dashboard
                        </a>
                    ) : (
                        <button onClick={handleBecomeDonor} className="btn btn-outline" style={{ borderColor: '#2563eb', color: '#2563eb', fontSize: '0.9rem' }}>
                            ❤️ Become a Donor
                        </button>
                    )}

                    {!showForm && (
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            + Add New PG
                        </button>
                    )}
                </div>
            </div>

            {showForm ? (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
                        {editingId ? 'Edit PG Details' : 'Add New PG'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>PG Name *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Sai Residency"
                            />
                            {errors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</span>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full address"
                            />
                            {errors.address && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.address}</span>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (Monthly) *</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="5000"
                            />
                            {errors.price && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.price}</span>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upload Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="input-field"
                                onChange={(e) => setFormData({ ...formData, images: e.target.files })}
                            />
                            <small style={{ color: 'var(--text-muted)' }}>You can select multiple images</small>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upload Video Tour</label>
                            <input
                                type="file"
                                accept="video/*"
                                className="input-field"
                                onChange={(e) => setFormData({ ...formData, video: e.target.files[0] })}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                            <textarea
                                className="input-field"
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Amenities, rules, etc."
                                style={{ minHeight: '100px' }}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                {editingId ? 'Update PG' : 'Create PG'}
                            </button>
                            <button
                                type="button"
                                className="btn"
                                style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#1e293b' }}
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {pgs.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>You haven't listed any PGs yet.</p>
                            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '1rem' }}>
                                Add Your First PG
                            </button>
                        </div>
                    ) : (
                        pgs.map(pg => (
                            <div key={pg.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ height: '150px', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                    {pg.imageUrls && pg.imageUrls.length > 0 ? (
                                        <img src={pg.imageUrls[0]} alt={pg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                            No Image Available
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{pg.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📍 {pg.address}</p>
                                    <p style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1.1rem' }}>₹{pg.price} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/ month</span></p>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', backgroundColor: '#3b82f6', color: 'white' }}
                                            onClick={() => handleEdit(pg)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', backgroundColor: '#ef4444', color: 'white' }}
                                            onClick={() => handleDelete(pg.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
