import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
    const [pgs, setPgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchPGs();
    }, []);

    const fetchPGs = async () => {
        try {
            const response = await api.get('/pgs');
            setPgs(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching PGs:', error);
            setLoading(false);
        }
    };

    const handleBook = async (pg) => {
        if (!user) {
            toast.info('Please login to book a PG');
            return;
        }
        try {
            // 1. Create Booking (Pending)
            const bookingResponse = await api.post(`/bookings/${pg.id}`);
            const bookingId = bookingResponse.data.id;

            // 2. Create Razorpay Order
            const amount = pg.price;
            const paymentResponse = await axios.post(`/razorpay-service/api/payment/create-order?amount=${amount}`);
            const orderId = paymentResponse.data;

            // 3. Open Razorpay
            const options = {
                key: "rzp_test_RmhKOY4sl1EgCM",
                amount: amount * 100,
                currency: "INR",
                name: "Area Stay Point",
                description: `Booking for ${pg.name}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // 4. Update Booking Status
                        await api.put(`/bookings/${bookingId}/status`, { status: "CONFIRMED" });
                        toast.success('Payment Successful! Booking Confirmed.');
                    } catch (err) {
                        console.error('Update status failed', err);
                        toast.error('Payment succeeded but booking confirmation failed.');
                    }
                },
                prefill: {
                    name: user.name || "",
                    email: user.email || "",
                    contact: ""
                },
                theme: {
                    color: "#4F46E5"
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: 'Pay via UPI',
                                instruments: [
                                    {
                                        method: 'upi',
                                        flows: ['qr', 'collect']
                                    }
                                ],
                            },
                        },
                        sequence: ['block.upi', 'block.cards', 'block.netbanking'],
                        preferences: {
                            show_default_blocks: true,
                        },
                    },
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                toast.error("Payment Failed: " + response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error('Booking failed:', error);
            toast.error('Booking Process Failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="container">
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '4rem 0',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                borderRadius: 'var(--radius)',
                marginBottom: '3rem'
            }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>
                    Find Your Perfect Stay
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Discover comfortable and affordable Paying Guest accommodations in your preferred area with just a few clicks.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                        Get Started
                    </Link>
                </div>
            </section>

            {/* Featured Section */}
            <section>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: '700' }}>Available PGs</h2>
                {loading ? (
                    <p>Loading PGs...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {pgs.length === 0 ? <p>No PGs available at the moment.</p> : pgs.map((pg) => (
                            <div key={pg.id} className="card">
                                <div style={{ height: '200px', background: '#e2e8f0', borderRadius: 'var(--radius)', marginBottom: '1rem', overflow: 'hidden', position: 'relative' }}>
                                    {pg.imageUrls && pg.imageUrls.length > 0 ? (
                                        <img src={pg.imageUrls[0]} alt={pg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                            No Image Available
                                        </div>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{pg.name}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📍 {pg.address}</p>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    {pg.description}
                                </p>
                                {pg.videoUrl && (
                                    <a href={pg.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '1rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                                        Watch Video Tour 🎥
                                    </a>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.2rem' }}>₹{pg.price}/mo</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link
                                            to={`/pg/${pg.id}`}
                                            className="btn"
                                            style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem', backgroundColor: '#e2e8f0', color: '#1e293b', textDecoration: 'none' }}
                                        >
                                            View Details
                                        </Link>
                                        <Link
                                            to={`/pg/${pg.id}`}
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
