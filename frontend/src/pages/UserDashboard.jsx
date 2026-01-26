import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUserCircle, FaCalendarAlt, FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHandHoldingHeart, FaEdit } from 'react-icons/fa';

const UserDashboard = () => {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(authUser);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editFormData, setEditFormData] = useState({
        username: '',
        email: '',
        phoneNumber: ''
    });

    useEffect(() => {
        if (authUser) {
            fetchUserDetails();
            fetchBookings();
        }
    }, [authUser]);

    const fetchUserDetails = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
            setEditFormData({
                username: response.data.username || '',
                email: response.data.email || '',
                phoneNumber: response.data.phoneNumber || ''
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/users/me', editFormData);
            setUser(response.data);
            setIsEditingProfile(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        }
    };

    const handleInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // ... (keep fetchBookings and other helpers)

    // ... (keep getStatusConfig and other render helpers)

    // (Inside return, update header and add modal)
    // We'll replace the return block fully in the next instruction chunk due to tool limits or try to target specific blocks. 
    // Since I can't do multiple disjoint edits easily in one go without multi_replace, and I want to be safe,
    // I will use replace_file_content on the component body.

    // Actually, I should use the multi_replace tool or just one big replace.
    // Let's scroll down to where I can inject the modal and button.

    // I'll start by adding the state and handlers in the beginning of the component.
    // Then I'll update the header to include the edit button.
    // Then I'll add the modal at the end.

    // LIMITATION: 'replace_file_content' replaces a CONTIGUOUS block.
    // I can't easily add state at top AND modal at bottom in one go without replacing everything in between (which is huge).
    // I must use `multi_replace_file_content`!

    // Let's use `multi_replace_file_content` for this.
    // 1. Insert State & Handlers after `const [loading, setLoading] = ...`
    // 2. Insert Edit Button in Header.
    // 3. Insert Modal at end of JSX.

    // Wait, I need to check where `fetchUserDetails` is to update it to set `editFormData`.

    // Let's just do a big replace of the component body or use multi-replace.
    // multi_replace is safer for preserving code I don't want to touch.


    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setLoading(false);
        }
    };

    const calculateDeadline = (bookingDate) => {
        if (!bookingDate) return 'N/A';
        const date = new Date(bookingDate);
        date.setDate(date.getDate() + 30);
        return date.toLocaleDateString();
    };

    const calculateDaysLeft = (bookingDate) => {
        if (!bookingDate) return 0;
        const start = new Date(bookingDate);
        const due = new Date(start);
        due.setDate(due.getDate() + 30);
        const now = new Date();
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const handleCancel = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await api.delete(`/bookings/${bookingId}`);
                toast.success('Booking cancelled');
                setBookings(prev => prev.filter(b => b.id !== bookingId));
            } catch (error) {
                console.error('Error cancelling booking:', error);
                toast.error('Failed to cancel booking');
            }
        }
    };

    const handlePayRemaining = async (booking) => {
        try {
            let amount = booking.pg.price;
            if (booking.donorContribution) {
                amount = amount - booking.donorContribution;
            }

            const response = await fetch(`/razorpay-service/api/payment/create-order?amount=${amount}`, { method: 'POST' });
            const orderId = await response.text();

            const options = {
                key: "rzp_test_RmhKOY4sl1EgCM",
                amount: Math.round(amount * 100),
                currency: "INR",
                name: "Area Stay Point",
                description: `Payment for ${booking.pg.name}`,
                order_id: orderId,
                handler: async function (response) {
                    await api.put(`/bookings/${booking.id}/status`, { status: "CONFIRMED" });
                    toast.success('Payment Successful! Booking Confirmed.');
                    fetchBookings();
                },
                prefill: {
                    name: user.name || "",
                    email: user.email || "",
                },
                theme: { color: "#0f766e" }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error(error);
            toast.error("Payment initiation failed");
        }
    };

    const handleRequestAid = async (bookingId) => {
        if (window.confirm('Do you want to request sponsorship for this booking? Your booking will be listed for donors to help.')) {
            try {
                await api.put(`/bookings/${bookingId}/status`, { status: "REQUESTING_AID" });
                toast.success('Sponsorship Requested!');
                fetchBookings();
            } catch (error) {
                console.error('Error requesting aid:', error);
                toast.error('Failed to request sponsorship');
            }
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'CONFIRMED': return { bg: '#ecfdf5', color: '#059669', icon: <FaCheckCircle />, label: 'Confirmed' };
            case 'REQUESTING_AID': return { bg: '#eff6ff', color: '#2563eb', icon: <FaHandHoldingHeart />, label: 'Seeking Aid' };
            case 'APPROVED_AID': return { bg: '#fffbeb', color: '#d97706', icon: <FaMoneyBillWave />, label: 'Aid Approved' };
            case 'PENDING': return { bg: '#fef2f2', color: '#dc2626', icon: <FaClock />, label: 'Pending Payment' };
            default: return { bg: '#f3f4f6', color: '#4b5563', icon: <FaUserCircle />, label: status };
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '1200px' }}>
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                borderRadius: '16px',
                padding: '3rem 2rem',
                color: 'white',
                marginBottom: '3rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem'
                    }}>
                        <FaUserCircle />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 'bold' }}>Welcome back, {user?.username || 'User'}!</h1>
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Edit Profile"
                            >
                                <FaEdit size={16} /> {/* Need to add FaEdit to imports */}
                            </button>
                        </div>
                        <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '1.1rem' }}>{user?.email}</p>
                    </div>
                </div>

                {/* Quick Stats in Header */}
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Active Bookings</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{bookings.length}</p>
                    </div>
                    {/* Add more stats if available */}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCalendarAlt style={{ color: '#0f766e' }} /> Your Bookings
                </h2>
                <a href="/" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}>+ Book New PG</a>
            </div>

            {bookings.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '5rem 2rem',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaCalendarAlt /></div>
                    <h3 style={{ color: '#64748b' }}>No active bookings found</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>It looks quiet here. Start your journey by finding the perfect PG!</p>
                    <a href="/" className="btn btn-outline">Explore PGs</a>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {bookings.map((booking) => {
                        const statusConfig = getStatusConfig(booking.status);
                        return (
                            <div key={booking.id} style={{
                                background: 'white',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: '1px solid #f1f5f9',
                                position: 'relative'
                            }}
                                className="booking-card"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                                }}
                            >
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600', color: '#1e293b' }}>
                                            {booking.pg ? booking.pg.name : 'Unknown PG'}
                                        </h3>
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            backgroundColor: statusConfig.bg,
                                            color: statusConfig.color
                                        }}>
                                            {statusConfig.icon} {statusConfig.label}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#64748b', fontSize: '0.95rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaMapMarkerAlt style={{ color: '#94a3b8' }} />
                                            {booking.pg ? booking.pg.address : 'Unknown Address'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaMoneyBillWave style={{ color: '#94a3b8' }} />
                                            <span style={{ fontWeight: '600', color: '#0f172a' }}>₹{booking.pg ? booking.pg.price : 0}</span> / month
                                        </div>

                                        {booking.donorContribution && (
                                            <div style={{ background: '#ecfdf5', padding: '0.5rem', borderRadius: '6px', color: '#059669', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <FaHandHoldingHeart /> Includes ₹{booking.donorContribution} sponsorship
                                            </div>
                                        )}

                                        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem' }}>Next Rent Due</p>
                                            <p style={{ margin: '0.2rem 0 0', fontWeight: 'bold', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FaClock /> {calculateDeadline(booking.bookingDate)}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>{calculateDaysLeft(booking.bookingDate)} days remaining</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', display: 'flex', gap: '0.8rem', borderTop: '1px solid #f1f5f9' }}>
                                    {booking.status === 'APPROVED_AID' && (
                                        <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.9rem' }} onClick={() => handlePayRemaining(booking)}>
                                            Pay Remainder
                                        </button>
                                    )}
                                    {booking.status === 'PENDING' && (
                                        <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.9rem' }} onClick={() => handleRequestAid(booking.id)}>
                                            Request Sponsorship
                                        </button>
                                    )}
                                    <a href={`/pg/${booking.pg.id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem' }}>Details</a>
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        className="btn btn-outline"
                                        style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                                        title="Cancel Booking"
                                    >
                                        <FaTimesCircle />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, color: '#1e293b' }}>Edit Profile</h2>
                            <button onClick={() => setIsEditingProfile(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}><FaTimesCircle /></button>
                        </div>

                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editFormData.username}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '500' }}>Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={editFormData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCheckCircle /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
