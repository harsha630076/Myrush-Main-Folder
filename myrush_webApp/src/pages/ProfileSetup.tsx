import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
// import { useAuth } from '../context/AuthContext'; // Might need to update token after profile creation

export const ProfileSetup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        age: '',
        city: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In a real flow, we'd submit this to /auth/update-profile or similar
        // For now, we simulate success and redirect to dashboard

        setTimeout(() => {
            alert("Profile Setup logic needs backend endpoint integration. Redirecting to Dashboard for demo.");
            navigate('/');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="card" style={{ marginTop: '50px', maxWidth: '500px' }}>
            <h1>Setup Profile</h1>
            <p>Tell us a bit about yourself to get started.</p>

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                <label>Full Name</label>
                <input
                    type="text"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    required
                />

                <label>Email (Optional)</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                />

                <label>City</label>
                <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    required
                />

                <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
                    {loading ? 'Saving...' : 'Complete Setup'}
                </button>
            </form>
        </div>
    );
};
