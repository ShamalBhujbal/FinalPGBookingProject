import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBuilding } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '1rem 2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 0
            }}>
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <FaBuilding />
                    PG Finder
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                        <FaHome /> Home
                    </Link>
                    <Link to="/about" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                        About Us
                    </Link>

                    {user ? (
                        <>
                            <span style={{ fontWeight: '500' }}>Welcome!</span>

                            {user.role === 'ROLE_ADMIN' && (
                                <Link to="/admin-dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Dashboard</Link>
                            )}
                            {user.role === 'ROLE_OWNER' && (
                                <Link to="/owner-dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Dashboard</Link>
                            )}
                            {user.role === 'ROLE_USER' && (
                                <Link to="/user-dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>My Bookings</Link>
                            )}
                            {user.role === 'ROLE_DONOR' && (
                                <Link to="/donor-dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Donor Dashboard</Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="btn btn-outline"
                                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                            >
                                <FaSignOutAlt style={{ marginRight: '0.5rem' }} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline" style={{ border: 'none' }}>
                                <FaSignInAlt style={{ marginRight: '0.5rem' }} /> Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                <FaUserPlus style={{ marginRight: '0.5rem' }} /> Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
