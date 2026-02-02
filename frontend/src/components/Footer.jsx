import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#1e293b', // Darker shade for footer
            color: '#f8fafc',
            padding: '4rem 0 2rem',
            marginTop: 'auto',
            borderTop: '1px solid #334155'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    {/* Brand Section */}
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>Area Stay Point</h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                            Your trusted companion for finding affordable and comfortable PG accommodations. We bridge the gap between owners and seekers with ease and transparency.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={{ color: '#94a3b8', fontSize: '1.2rem', transition: 'color 0.3s' }} className="hover:text-white"><FaFacebook /></a>
                            <a href="#" style={{ color: '#94a3b8', fontSize: '1.2rem', transition: 'color 0.3s' }} className="hover:text-white"><FaTwitter /></a>
                            <a href="#" style={{ color: '#94a3b8', fontSize: '1.2rem', transition: 'color 0.3s' }} className="hover:text-white"><FaInstagram /></a>
                            <a href="#" style={{ color: '#94a3b8', fontSize: '1.2rem', transition: 'color 0.3s' }} className="hover:text-white"><FaLinkedin /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#fff' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '0.8rem' }}><Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link></li>
                            <li style={{ marginBottom: '0.8rem' }}><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</Link></li>
                            <li style={{ marginBottom: '0.8rem' }}><Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none' }}>List Your PG</Link></li>
                            <li style={{ marginBottom: '0.8rem' }}><Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms & Conditions</Link></li>
                            <li><Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#fff' }}>Contact Us</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.8rem', color: '#94a3b8' }}>
                                <FaMapMarkerAlt style={{ marginTop: '4px', color: '#3b82f6' }} />
                                <span>Tech Park Phase 1, Hinjawadi,<br />Pune, Maharashtra 411057</span>
                            </li>
                            <li style={{ marginBottom: '1rem', display: 'flex', gap: '0.8rem', color: '#94a3b8' }}>
                                <FaPhone style={{ marginTop: '4px', color: '#3b82f6' }} />
                                <span>+91 98765 43210</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.8rem', color: '#94a3b8' }}>
                                <FaEnvelope style={{ marginTop: '4px', color: '#3b82f6' }} />
                                <span>support@areastaypoint.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter (Optional visual) */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#fff' }}>Newsletter</h4>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Subscribe to get latest updates and offers.</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                style={{
                                    padding: '0.6rem',
                                    borderRadius: '4px',
                                    border: '1px solid #475569',
                                    background: '#334155',
                                    color: 'white',
                                    outline: 'none',
                                    width: '100%'
                                }}
                            />
                            <button style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '4px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>Go</button>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid #334155',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem'
                }}>
                    <p>&copy; {new Date().getFullYear()} Area Stay Point. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
