import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaPrint, FaDownload, FaArrowLeft } from 'react-icons/fa';

const BookingReceipt = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await api.get(`/bookings/${bookingId}`); // Uses the endpoint we just added
                setBooking(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching booking:", err);
                const status = err.response ? err.response.status : 'Unknown';
                const statusText = err.response ? err.response.statusText : '';
                const message = err.message || 'Unknown Error';
                setError(`Failed to load receipt information. Status: ${status} ${statusText} - ${message}`);
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="text-center mt-5">Loading receipt...</div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!booking) return <div className="text-center mt-5">Booking not found</div>;

    return (
        <div className="receipt-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: 'white' }}>
            <div className="no-print" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaArrowLeft /> Back
                </button>
                <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPrint /> Print / Download PDF
                </button>
            </div>

            <div id="receipt-content" style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, color: '#333' }}>FindMyPG</h1>
                    <p style={{ margin: 0, color: '#666' }}>Your trusted partner in finding homes</p>
                    <h2 style={{ marginTop: '1rem', color: '#0f766e' }}>PAYMENT RECEIPT</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div>
                        <h4 style={{ color: '#555', marginBottom: '0.5rem' }}>Billed To:</h4>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{booking.username}</p>
                        <p style={{ margin: 0 }}>ID: {booking.id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h4 style={{ color: '#555', marginBottom: '0.5rem' }}>Receipt Details:</h4>
                        <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                        <p style={{ margin: 0 }}><strong>Receipt #:</strong> {booking.id}-{Date.now().toString().slice(-4)}</p>
                        <p style={{ margin: 0 }}><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>PAID</span></p>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '1rem' }}>
                                <strong>PG Booking: {booking.pg.name}</strong><br />
                                <small>{booking.pg.address}</small>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>₹{booking.pg.price}</td>
                        </tr>
                        {booking.donorContribution > 0 && (
                            <tr style={{ borderBottom: '1px solid #eee', color: 'green' }}>
                                <td style={{ padding: '1rem' }}>
                                    Less: Sponsorship/Scholarship
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>-₹{booking.donorContribution}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid #333' }}>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Total Paid:</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                ₹{booking.pg.price - (booking.donorContribution || 0)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#777', textAlign: 'center' }}>
                    <p>This is a computer-generated receipt and does not require a physical signature.</p>
                    <p>Thank you for choosing FindMyPG!</p>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .receipt-container { border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                        #receipt-content { border: none !important; }
                    }
                `}
            </style>
        </div>
    );
};

export default BookingReceipt;
