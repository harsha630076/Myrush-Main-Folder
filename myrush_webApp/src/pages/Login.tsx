import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';


export const Login: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars


    const handleSendOTP = async () => {
        try {
            await apiClient.post('/auth/send-otp', { phone_number: phoneNumber });
            // Navigate to OTP verification, passing the phone number
            navigate('/verify-otp', { state: { phoneNumber } });
        } catch (error) {
            console.error('Failed to send OTP', error);
            alert('Failed to send OTP. Please try 1111111111');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-secondary)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Gradient */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(0, 200, 83, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none'
            }}></div>

            <div className="card" style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                padding: '3rem',
                maxWidth: '400px',
                width: '100%',
                zIndex: 10,
                textAlign: 'center',
                borderRadius: '16px'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <img src="/Rush-logo.webp" alt="MyRush" style={{ height: '60px', width: 'auto' }} />
                </div>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Enter your number to continue.</p>

                <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                        background: '#f9f9f9',
                        border: '1px solid #eee',
                        color: 'black',
                        marginBottom: '1.5rem',
                        padding: '16px',
                        borderRadius: '8px'
                    }}
                />

                <button
                    onClick={handleSendOTP}
                    className="premium-cta-btn"
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '1rem',
                        borderRadius: '50px'
                    }}
                >
                    SEND OTP
                </button>
            </div>
        </div>
    );
};
