import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: ''
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.usernameOrEmail || !formData.password) {
            setErrors({ general: 'All fields are required' });
            return;
        }

        const result = await login(formData);
        if (result.success) {
            toast.success('Login Successful!');
            if (result.role === 'ROLE_ADMIN' || formData.usernameOrEmail === 'admin' || formData.usernameOrEmail === 'admin@pgfinder.com') {
                navigate('/admin-dashboard');
            } else if (result.role === 'ROLE_OWNER') {
                navigate('/owner-dashboard');
            } else if (result.role === 'ROLE_DONOR') {
                navigate('/donor-dashboard');
            } else {
                navigate('/user-dashboard'); // Default to User Dashboard instead of Home
            }
        } else {
            toast.error(result.message);
            setErrors({ general: result.message });
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Username or Email</label>
                        <input
                            type="text"
                            name="usernameOrEmail"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            className="input-field"
                            required
                            placeholder="Enter your username or email"
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field"
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    {errors.general && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{errors.general}</div>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
