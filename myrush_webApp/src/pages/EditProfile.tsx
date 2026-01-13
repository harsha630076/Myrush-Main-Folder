import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profile';
import './EditProfile.css';

export const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileRes, citiesRes] = await Promise.all([
                profileApi.getProfile(),
                profileApi.getCities()
            ]);

            if (citiesRes.success && citiesRes.data) {
                setCities(citiesRes.data);
            }

            if (profileRes.success && profileRes.data) {
                const p = profileRes.data;
                setFullName(p.full_name);
                setEmail(p.email || '');
                setSelectedCity(p.city_id || '');
                // Note: API might return city name in 'city' and ID in 'city_id'
                // We need to match the Select value.
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await profileApi.createOrUpdateProfile({
                full_name: fullName,
                email: email,
                city_id: selectedCity,
                // sports: [] // Add sports selection if needed
            });

            if (res.success) {
                alert('Profile Updated Successfully');
                navigate('/profile');
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="profile-setup-container">
            <header className="setup-header">
                <button className="back-btn" onClick={() => navigate('/profile')}>←</button>
                <h2>Edit Profile</h2>
            </header>

            <form className="setup-form" onSubmit={handleSave}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>City</label>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        required
                    >
                        <option value="">Select City</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="submit-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};
