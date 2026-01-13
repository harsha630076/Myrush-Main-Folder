import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Dashboard.css';

interface UserProfile {
    id: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number: string;
}

// Animation Variants matching myrush.in feel
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] // Custom snappy easing
        }
    })
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);
    const heroY = useTransform(scrollY, [0, 500], [0, 150]);

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

    const displayName = user?.full_name?.split(' ')[0] || user?.first_name || 'PLAYER';

    return (
        <div className="premium-dashboard">
            {/* Navbar - Desktop Only */}
            <motion.nav
                className="premium-nav desktop-only"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
            >
                <div className="nav-logo">
                    <img src="/Rush-logo.webp" alt="MyRush" className="nav-logo-img" />
                </div>
                <div className="nav-menu">
                    <button className="nav-link active">Home</button>
                    <button className="nav-link" onClick={() => navigate('/bookings')}>Bookings</button>
                    <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
                </div>
                <div className="nav-user">
                    <span className="user-name">HELLO, {displayName}</span>
                    <button className="logout-btn-minimal" onClick={handleLogout}>LOGOUT</button>
                </div>
            </motion.nav>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav mobile-only">
                <div className="mobile-nav-item active" onClick={() => navigate('/')}>
                    <span>🏠</span>
                    <span className="label">Home</span>
                </div>
                <div className="mobile-nav-item" onClick={() => navigate('/bookings')}>
                    <span>📅</span>
                    <span className="label">Bookings</span>
                </div>
                <div className="mobile-nav-item" onClick={() => navigate('/profile')}>
                    <span>👤</span>
                    <span className="label">Profile</span>
                </div>
            </nav>

            {/* Immersive Hero */}
            <section className="hero-container">
                <motion.div className="hero-bg" style={{ opacity: heroOpacity, y: heroY }}>
                    {/* Placeholder for high-quality video/image */}
                    <div className="hero-placeholder-image" />
                    <div className="hero-overlay" />
                </motion.div>

                <div className="hero-content-wrapper">
                    <motion.h1
                        className="hero-title"
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        variants={fadeInUp}
                    >
                        FOR ALL THINGS <br />
                        <span className="text-lime">SPORT.</span>
                    </motion.h1>

                    <motion.div
                        className="hero-sub"
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        variants={fadeInUp}
                    >
                        <p>ARENAS. ACADEMIES. EVENTS. <br /> THE ULTIMATE PLATFORM FOR YOUR GAME.</p>
                    </motion.div>

                    <motion.button
                        className="premium-cta-btn"
                        initial="hidden"
                        animate="visible"
                        custom={3}
                        variants={fadeInUp}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/venues')}
                    >
                        BOOK A COURT
                    </motion.button>
                </div>
            </section>

            {/* Diagonal Divider */}
            <div className="diagonal-divider"></div>

            {/* Services Section */}
            <section className="services-section">
                <div className="section-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>EXPLORE <span className="text-lime">RUSH</span></h2>
                    </motion.div>

                    <motion.div
                        className="cards-grid-premium"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {[
                            { title: 'BOOK TURF', desc: 'Premium artificial and natural turfs.', icon: '⚽' },
                            { title: 'ACADEMY', desc: 'Train with the best coaches.', icon: '🎓' },
                            { title: 'EVENTS', desc: 'Join leagues and tournaments.', icon: '🏆' },
                            { title: 'CORPORATE', desc: 'Team building and sports days.', icon: '🤝' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="premium-card"
                                variants={fadeInUp}
                                custom={i}
                                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,255,0,0.1)' }}
                                onClick={() => item.title === 'BOOK TURF' ? navigate('/venues') : null}
                            >
                                <div className="card-icon-large">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                                <div className="card-arrow">→</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Footer Padding */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
};
