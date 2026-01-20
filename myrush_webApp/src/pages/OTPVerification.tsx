import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const OTPVerification: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const phone = location.state?.phoneNumber || location.state?.phone;

    if (!phone) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Button onClick={() => navigate('/login')} variant="primary">Go to Login</Button>
            </div>
        );
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/auth/verify-otp', {
                phone_number: phone,
                otp_code: otp
            });

            if (response.data.access_token) {
                login(response.data.access_token);
                navigate('/');
            } else if (response.data.needs_profile) {
                navigate('/setup-profile', { state: { phone } });
            } else {
                setError('Verification failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-primary/5 pointer-events-none" />

            <Card className="w-full max-w-md p-8 z-10 mx-4">
                <h1 className="text-3xl font-black text-black mb-4 font-montserrat text-center">
                    VERIFY OTP
                </h1>
                <p className="text-gray-500 mb-8 text-center">
                    Enter the code sent to <span className="text-black font-bold">{phone}</span>
                </p>
                <p className="text-xs text-gray-400 mb-6 text-center">Try 12345 (dev)</p>

                <form onSubmit={handleVerify} className="space-y-6">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 text-black mb-6 p-4 text-center tracking-[0.5em] text-xl rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />

                    {error && <p className="text-danger text-sm text-center font-semibold">{error}</p>}

                    <Button
                        type="submit"
                        disabled={loading}
                        variant="primary"
                        className="w-full py-4 rounded-full text-white font-bold"
                    >
                        {loading ? 'VERIFYING...' : 'CONFIRM ACCESS'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};
