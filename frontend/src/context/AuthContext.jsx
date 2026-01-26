import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, we would validate the token or fetch user details here
            // For now, we assume valid if token exists
            const role = localStorage.getItem('role');
            setUser({ token, role });
        }
        setLoading(false);
    }, []);

    const login = async (loginData) => {
        try {
            const response = await api.post('/auth/login', loginData);
            const { accessToken, role } = response.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('role', role);
            setUser({ token: accessToken, role });
            return { success: true, role };
        } catch (error) {
            console.error('Login failed', error);
            let message = 'Login failed';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                } else {
                    // Handle validation errors map
                    message = Object.values(error.response.data).join(', ');
                }
            }
            return {
                success: false,
                message: message
            };
        }
    };

    const register = async (registerData) => {
        try {
            await api.post('/auth/register', registerData);
            return { success: true };
        } catch (error) {
            console.error('Registration failed', error);
            let message = 'Registration failed';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                } else {
                    // Handle validation errors map
                    message = Object.values(error.response.data).join(', ');
                }
            }
            return {
                success: false,
                message: message
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
