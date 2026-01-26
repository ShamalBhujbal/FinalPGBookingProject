import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DonorDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [impactHistory, setImpactHistory] = useState([]);

    useEffect(() => {
        if (user) {
            fetchRequests();
            fetchImpact();
        }
    }, [user]);

    const fetchRequests = async () => {
        // ... (existing fetchRequests code)
        try {
            const response = await api.get('/bookings/aid-requests');
            setRequests(response.data);
            setLoading(false);
        } catch (error) {
            // ... (existing error handling)
            setLoading(false);
        }
    };

    const fetchImpact = async () => {
        try {
            // We need an endpoint for this. Assuming /bookings/my-sponsorships exists or we filter client side?
            // Since we don't have a dedicated endpoint yet, I will create one or use existing if adaptable.
            // Currently BookingController has `getMyBookings` which gets bookings FOR user.
            // We need bookings BY donor.
            // I will use a new endpoint `/bookings/my-sponsorships` or just fetch all and filter client side?
            // Fetching all is bad security.
            // I will ADD the backend endpoint in next step. For now I will mock it or leave empty until backend is ready.
            // Actually, I can use the same logic as UserDashboard but checking if I am the donor?
            // No, the `getMyBookings` endpoint uses `bookingService.getBookingsByUser(username)`.
            // I need `bookingService.getBookingsByDonor(username)`.
            const response = await api.get('/bookings/my-sponsorships');
            setImpactHistory(response.data);
        } catch (error) {
            console.error('Error fetching impact:', error);
        }
    };

    const handleSponsor = async (bookingId) => {
        try {
            const percentInput = document.getElementById(`percent-${bookingId}`);
            const percentage = percentInput ? parseFloat(percentInput.value) : 10;

            await api.put(`/bookings/${bookingId}/sponsor`, { percentage });
            toast.success('Sponsorship Approved!');
            fetchRequests();
            fetchImpact();
        } catch (error) {
            console.error('Sponsorship failed:', error);
            toast.error('Failed to approve sponsorship');
        }
    };

    if (loading) return <div className="container text-center mt-5">Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="text-3xl font-bold text-primary" style={{ margin: 0 }}>Donor Dashboard</h1>
                <button onClick={() => { fetchRequests(); fetchImpact(); }} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>🔄 Refresh</button>
            </div>

            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4">Requests from Needy Students</h2>
                {requests.length === 0 ? (
                    <p className="text-muted">No pending requests at the moment.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {requests.map(req => (
                            <div key={req.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{req.username}</h3>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>PG: {req.pg.name}</p>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Rent: ₹{req.pg.price} / month</p>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Requested: {new Date(req.bookingDate).toLocaleDateString()}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', display: 'block' }}>Sponsor %</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            defaultValue="10"
                                            id={`percent-${req.id}`}
                                            className="input-field"
                                            style={{ width: '80px', padding: '0.3rem' }}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                        onClick={() => handleSponsor(req.id)}
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Your Impact Log</h2>
                {impactHistory.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                        <p className="text-muted">You haven't sponsored anyone yet. Start today!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Student</th>
                                    <th style={{ padding: '0.75rem' }}>PG Name</th>
                                    <th style={{ padding: '0.75rem' }}>Sponsored Amount</th>
                                    <th style={{ padding: '0.75rem' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {impactHistory.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '0.75rem' }}>{log.username}</td>
                                        <td style={{ padding: '0.75rem' }}>{log.pg.name}</td>
                                        <td style={{ padding: '0.75rem', color: '#059669', fontWeight: 'bold' }}>₹{log.donorContribution ? log.donorContribution.toFixed(2) : 0}</td>
                                        <td style={{ padding: '0.75rem', color: 'gray' }}>{new Date(log.bookingDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorDashboard;
