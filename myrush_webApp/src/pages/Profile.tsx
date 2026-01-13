import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

interface UserProfile {
    full_name?: string;
    first_name?: string;
    email?: string;
    phone_number: string;
}

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/auth/profile');
                setUser(response.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="premium-dashboard">
            <motion.nav className="premium-nav">
                <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src="/Rush-logo.webp" alt="MyRush" className="nav-logo-img" />
                </div>
                <button className="logout-btn-minimal" onClick={() => navigate('/')}>BACK HOME</button>
            </motion.nav>

            <div style={{ paddingTop: '120px', maxWidth: '800px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
                <motion.div
                    className="premium-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ cursor: 'default', transform: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem'
                        }}>
                            👤
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '5px' }}>{user?.full_name || 'MyRush Player'}</h2>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{user?.phone_number}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#888', marginBottom: '5px', fontSize: '0.9rem' }}>TOTAL BOOKINGS</h4>
                            <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0</span>
                        </div>
                        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#888', marginBottom: '5px', fontSize: '0.9rem' }}>MEMBERSHIP</h4>
                            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-lime)' }}>FREE</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="premium-cta-btn"
                        style={{ width: '100%', background: '#333' }}
                    >
                        LOGOUT
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
