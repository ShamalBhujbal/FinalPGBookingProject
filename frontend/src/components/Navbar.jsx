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
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '1rem 2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '2rem',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            borderBottom: '1px solid #334155'
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
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                }}>
                    <FaBuilding style={{ color: '#3b82f6' }} /> {/* Accent color for logo icon */}
                    PG Finder
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500', color: '#e2e8f0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#e2e8f0'}>
                        <FaHome /> Home
                    </Link>
                    <Link to="/about" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500', color: '#e2e8f0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#e2e8f0'}>
                        About Us
                    </Link>

                    {user ? (
                        <>
                            <span style={{ fontWeight: '500', color: '#94a3b8' }}>Welcome!</span>

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
                                className="btn"
                                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', cursor: 'pointer' }}
                            >
                                <FaSignOutAlt style={{ marginRight: '0.5rem' }} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                <FaSignInAlt style={{ marginRight: '0.5rem' }} /> Login
                            </Link>
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
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
