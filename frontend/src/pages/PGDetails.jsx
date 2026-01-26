import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PGDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [pg, setPg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    // Review Form
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchPGDetails();
        fetchReviews();
    }, [id]);

    const fetchPGDetails = async () => {
        try {
            const response = await api.get(`/pgs/${id}`);
            setPg(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching PG:', error);
            setLoading(false);
            toast.error('Failed to load PG details');
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await api.get(`/reviews/${id}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    // Aid Logic
    const [requestAid, setRequestAid] = useState(false);

    const handleBook = async () => {
        if (!user) {
            toast.info('Please login to book a PG');
            navigate('/login');
            return;
        }
        try {
            // 1. Create Booking
            const bookingResponse = await api.post(`/bookings/${id}`, null, {
                params: { requestAid: requestAid }
            });
            const booking = bookingResponse.data;

            if (requestAid) {
                toast.success('Sponsorship Request Submitted! Waiting for Donor Approval.');
                navigate('/user-dashboard');
                return;
            }

            const bookingId = booking.id;

            // 2. Create Razorpay Order (Directly call service on port 8081)
            console.log('Initiating payment order creation...');
            const amount = pg.price;
            // Ensure amount is integer for Razorpay (in paise)
            const amountInPaise = Math.round(amount * 100);
            const paymentResponse = await axios.post(`/razorpay-service/api/payment/create-order?amount=${amount}`);
            console.log('Payment Order Created:', paymentResponse.data);
            const orderId = paymentResponse.data;

            // 3. Open Razorpay
            const options = {
                key: "rzp_test_RmhKOY4sl1EgCM",
                amount: amountInPaise,
                currency: "INR",
                name: "Area Stay Point",
                description: `Booking for ${pg.name}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // 4. Update Booking Status to CONFIRMED
                        await api.put(`/bookings/${bookingId}/status`, { status: "CONFIRMED" });
                        toast.success('Payment Successful! Booking Confirmed.');
                    } catch (err) {
                        console.error('Update status failed', err);
                        const errorMsg = err.response && err.response.data ? err.response.data : err.message;
                        toast.error(`Payment succeeded but booking confirmation failed: ${typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}`);
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

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.info('Please login to leave a review');
            return;
        }
        try {
            await api.post(`/reviews/${id}`, { rating, comment });
            toast.success('Review added!');
            setComment('');
            fetchReviews();
        } catch (error) {
            console.error('Review failed:', error);
            toast.error('Failed to add review');
        }
    };

    // Distance Calculation Logic
    const [destination, setDestination] = useState('');
    const [distanceResult, setDistanceResult] = useState(null);
    const [calculatingDistance, setCalculatingDistance] = useState(false);

    const handleCalculateDistance = async () => {
        if (!destination) return;
        setCalculatingDistance(true);
        setDistanceResult(null);
        try {
            // Using the proxy configured in vite.config.js
            const response = await axios.get('/maps-service/api/maps/distance', {
                params: {
                    origin: pg.address,
                    destination: destination
                }
            });
            console.log('Distance Result:', response.data);
            setDistanceResult(response.data);
        } catch (error) {
            console.error('Distance calculation failed:', error);
            toast.error('Failed to calculate distance');
        } finally {
            setCalculatingDistance(false);
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</div>;
    if (!pg) return <div className="container">PG Not Found</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <button className="btn" onClick={() => navigate('/')} style={{ marginBottom: '1rem', backgroundColor: '#e2e8f0' }}>&larr; Back</button>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Images & Details */}
                <div>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{pg.name}</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>📍 {pg.address}</p>

                    {/* Image Gallery */}
                    <div style={{ marginBottom: '2rem' }}>
                        {pg.imageUrls && pg.imageUrls.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <img
                                    src={pg.imageUrls[0]}
                                    alt="Main"
                                    style={{ width: '100%', borderRadius: '10px', maxHeight: '400px', objectFit: 'cover' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                                    {pg.imageUrls.slice(1).map((img, idx) => (
                                        <img key={idx} src={img} alt={`PG ${idx}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '5px' }} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '300px', backgroundColor: '#cbd5e1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                No Images Available
                            </div>
                        )}
                    </div>

                    {/* Video Tour */}
                    {pg.videoUrl && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Video Tour</h3>
                            <video controls style={{ width: '100%', borderRadius: '10px' }}>
                                <source src={pg.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}

                    {/* Description */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3>About this PG</h3>
                        <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>{pg.description}</p>
                    </div>

                    {/* Location & Distance */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3>Location & Distance</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>{pg.address}</p>
                            <iframe
                                title="PG Location"
                                width="100%"
                                height="300"
                                style={{ border: 0, borderRadius: '10px', marginTop: '1rem' }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}>
                            </iframe>
                        </div>

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <h4>Check Distance to Key Locations</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Enter a destination to see how far it is from this PG.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter destination (e.g. IT Park, Station)"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="input-field"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    onClick={handleCalculateDistance}
                                    className="btn btn-primary"
                                    disabled={calculatingDistance || !destination}
                                >
                                    {calculatingDistance ? 'Calculating...' : 'Check'}
                                </button>
                            </div>

                            {distanceResult && (
                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
                                    {distanceResult.rows && distanceResult.rows.length > 0 && distanceResult.rows[0].elements[0].status === 'OK' ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '0.9rem', color: '#064e3b' }}>Distance</p>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                                                    {distanceResult.rows[0].elements[0].distance.humanReadable}
                                                </p>
                                            </div>
                                            <div style={{ height: '40px', width: '1px', backgroundColor: '#10b981' }}></div>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '0.9rem', color: '#064e3b' }}>Duration</p>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                                                    {distanceResult.rows[0].elements[0].duration.humanReadable}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#dc2626', textAlign: 'center' }}>
                                            Could not calculate distance. Please check the destination name.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="card">
                        <h3>Reviews ({reviews.length})</h3>
                        <div style={{ marginTop: '1rem' }}>
                            {reviews.length === 0 ? <p>No reviews yet.</p> : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {reviews.map(review => (
                                        <li key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>{review.username}</strong>
                                                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{'★'.repeat(review.rating)}</span>
                                            </div>
                                            <p style={{ marginTop: '0.5rem' }}>{review.comment}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Add Review Form */}
                        {user ? (
                            <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <h4>Write a Review</h4>
                                <form onSubmit={submitReview} style={{ marginTop: '1rem' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rating</label>
                                        <select
                                            value={rating}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            className="input-field"
                                            style={{ width: '100px' }}
                                        >
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Comment</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="input-field"
                                            rows="3"
                                            placeholder="Share your experience..."
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Submit Review</button>
                                </form>
                            </div>
                        ) : (
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}> <a href="/login">Login</a> to leave a review.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Key Info & Booking */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{pg.price}</span>
                            <span style={{ color: 'var(--text-muted)' }}> / month</span>
                        </div>

                        {/* Financial Aid Option */}
                        {/* Financial Aid Option */}
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="requestAid"
                                    checked={requestAid}
                                    onChange={(e) => setRequestAid(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <label htmlFor="requestAid" style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 'bold' }}>
                                    I need financial aid (Request Sponsorship)
                                </label>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', marginLeft: '1.8rem' }}>
                                If checked, your booking will be listed for donors to sponsor. You will pay the remaining amount after a donor approves it.
                            </p>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '1rem', padding: '1rem' }}
                            onClick={handleBook}
                        >
                            {requestAid ? 'Request Sponsorship' : 'Book Now & Pay'}
                        </button>

                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <p>✅ Verified Owner</p>
                            <p>✅ Instant Confirmation</p>
                            <p>✅ No Hidden Fees</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PGDetails;
