import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaMoneyBillWave, FaExternalLinkAlt, FaHome } from 'react-icons/fa';

const Home = () => {
    const [pgs, setPgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [filteredPgs, setFilteredPgs] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('All');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        fetchPGs();
    }, []);

    useEffect(() => {
        filterPGs();
    }, [pgs, searchTerm, filterGender, maxPrice]);

    const fetchPGs = async () => {
        try {
            const response = await api.get('/pgs');
            setPgs(response.data);
            setFilteredPgs(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching PGs:', error);
            setLoading(false);
        }
    };

    const filterPGs = () => {
        let result = pgs;

        // Search by name or location
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(pg =>
                pg.name.toLowerCase().includes(lowerTerm) ||
                pg.address.toLowerCase().includes(lowerTerm)
            );
        }

        // Filter by Gender
        if (filterGender !== 'All') {
            result = result.filter(pg => pg.gender === filterGender);
        }

        // Filter by Max Price
        if (maxPrice) {
            result = result.filter(pg => pg.price <= parseFloat(maxPrice));
        }

        setFilteredPgs(result);
    };

    // ... handleBook remains same ...
    const handleBook = async (pg) => {
        // ... (keep existing handleBook logic)
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
                    color: "#0f766e"
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
                background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
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

            {/* Filter Section */}
            <section style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Search & Filter</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search by location or name..."
                        className="input-field"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="input-field"
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                    >
                        <option value="All">All Genders</option>
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                        <option value="Co-ed">Co-ed</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Max Price (₹)"
                        className="input-field"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>
            </section>

            {/* Featured Section */}
            <section>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: '700' }}>Available PGs</h2>
                {loading ? (
                    <p>Loading PGs...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filteredPgs.length === 0 ? <p>No PGs match your criteria.</p> : filteredPgs.map((pg) => (
                            <div key={pg.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ height: '220px', background: '#e2e8f0', borderRadius: 'calc(var(--radius) - 4px)', marginBottom: '1rem', overflow: 'hidden', position: 'relative' }}>
                                    {pg.imageUrls && pg.imageUrls.length > 0 ? (
                                        <img src={pg.imageUrls[0]} alt={pg.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '2rem' }}>
                                            <FaHome />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        PG
                                    </div>
                                    {pg.gender && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            left: '10px',
                                            background: pg.gender === 'Boys' ? '#3b82f6' : pg.gender === 'Girls' ? '#ec4899' : '#8b5cf6',
                                            color: 'white',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            {pg.gender}
                                        </div>
                                    )}
                                </div>
                                {/* ... (rest of card content) ... */}

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{pg.name}</h3>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                        <span style={{ color: 'var(--primary)', marginTop: '3px' }}><FaMapMarkerAlt /></span>
                                        <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{pg.address}</span>
                                    </div>

                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {pg.description}
                                    </p>

                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FaMoneyBillWave style={{ color: 'var(--success)' }} />
                                                <span style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-main)' }}>₹{pg.price}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span>
                                            </div>
                                            <a
                                                href={`https://maps.google.com/?q=${encodeURIComponent(pg.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '500' }}
                                            >
                                                See on Map <FaExternalLinkAlt size={12} />
                                            </a>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <Link
                                                to={`/pg/${pg.id}`}
                                                className="btn btn-outline"
                                                style={{ width: '100%', justifyContent: 'center' }}
                                            >
                                                Details
                                            </Link>
                                            <Link
                                                to={`/pg/${pg.id}`}
                                                className="btn btn-primary"
                                                style={{ width: '100%', justifyContent: 'center' }}
                                            >
                                                Book Now
                                            </Link>
                                        </div>
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
