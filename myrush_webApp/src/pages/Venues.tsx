import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient } from '../api/client';
import './Dashboard.css';
import './Venues.css';

// Interfaces matching backend response
interface Venue {
    id: string;
    court_name: string;
    location: string;
    game_type: string;
    prices: string;
    photos: string[];
    // Add other fields as needed
}

export const Venues: React.FC = () => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedGameType, setSelectedGameType] = useState('');

    useEffect(() => {
        const fetchVenues = async () => {
            setLoading(true);
            try {
                // Construct query params
                const params = new URLSearchParams();
                if (selectedCity) params.append('city', selectedCity);
                if (selectedGameType) params.append('game_type', selectedGameType);

                // Base URL is .../api/user, so we just append /courts
                const response = await apiClient.get(`/courts?${params.toString()}`);
                setVenues(response.data);
            } catch (err) {
                console.error("Failed to fetch venues", err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce simple effect or just run on change
        fetchVenues();
    }, [selectedCity, selectedGameType]);

    // Simple Filter Options
    const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai'];
    const GAME_TYPES = ['Football', 'Cricket', 'Badminton', 'Tennis'];

    return (
        <div className="premium-dashboard">
            {/* Header */}
            <motion.nav
                className="premium-nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src="/Rush-logo.webp" alt="MyRush" className="nav-logo-img" />
                </div>
                <button className="logout-btn-minimal" onClick={() => navigate('/')}>BACK HOME</button>
            </motion.nav>

            <div style={{ paddingTop: '100px', paddingBottom: '60px', maxWidth: '1280px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'var(--color-black)' }}
                    >
                        BOOK A VENUE
                    </motion.h1>

                    {/* Filters Bar */}
                    <div className="filters-container">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="filters-wrapper"
                        >
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="city-selector"
                            >
                                <option value="">All Cities</option>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <div className="game-type-scroll">
                                <button
                                    onClick={() => setSelectedGameType('')}
                                    className={`filter-pill ${selectedGameType === '' ? 'active' : ''}`}
                                >
                                    ALL SPORTS
                                </button>
                                {GAME_TYPES.map(sport => (
                                    <button
                                        key={sport}
                                        onClick={() => setSelectedGameType(sport)}
                                        className={`filter-pill ${selectedGameType === sport ? 'active' : ''}`}
                                    >
                                        {sport.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>Loading venues...</div>
                ) : venues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#888' }}>
                        No venues found matching your filters.
                    </div>
                ) : (
                    <div className="cards-grid-premium">
                        {venues.map((venue, i) => (
                            <motion.div
                                key={venue.id}
                                className="premium-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * i }}
                                whileHover={{ y: -5 }}
                                style={{ padding: 0, border: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}
                                onClick={() => navigate(`/venues/${venue.id}`)}
                            >
                                <div style={{ height: '220px', overflow: 'hidden', background: '#eee', position: 'relative' }}>
                                    {venue.photos && venue.photos.length > 0 ? (
                                        <img src={venue.photos[0]} alt={venue.court_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>No Image</div>
                                    )}
                                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        ₹{venue.prices}/HR
                                    </div>
                                </div>
                                <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{venue.court_name}</h3>
                                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>{venue.location}</p>

                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            background: '#f0f0f0',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            color: '#555',
                                            fontWeight: 600
                                        }}>
                                            {venue.game_type}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
