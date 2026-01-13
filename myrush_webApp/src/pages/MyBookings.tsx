import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import './MyBookings.css';

interface Booking {
    id: string;
    booking_display_id?: string;
    venue_name: string;
    venue_location: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    price_per_hour: number;
    total_amount: number;
    status: string;
    created_at: string;
    time_slots?: any[];
}

export const MyBookings: React.FC = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, [activeTab]);

    const loadBookings = async () => {
        setLoading(true);
        const res = await bookingsApi.getUserBookings();
        if (res.success && res.data) {
            let processedBookings = res.data.map((b: Booking) => {
                // Determine status based on time if confirmed
                let status = b.status.toLowerCase();
                if (status !== 'cancelled') {
                    const bookingTime = new Date(`${b.booking_date}T${b.end_time}`);
                    if (bookingTime < new Date()) {
                        status = 'completed';
                    } else {
                        status = 'upcoming';
                    }
                }
                return { ...b, status };
            });

            // Filter
            if (activeTab !== 'all') {
                processedBookings = processedBookings.filter((b: Booking) => b.status === activeTab);
            }

            // Sort (Newest first)
            processedBookings.sort((a: Booking, b: Booking) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

            setBookings(processedBookings);
        }
        setLoading(false);
    };

    const getStatusBadge = (status: string) => {
        let className = 'status-badge';
        switch (status) {
            case 'completed': className += ' completed'; break;
            case 'upcoming': className += ' upcoming'; break;
            case 'cancelled': className += ' cancelled'; break;
            default: className += ' default';
        }
        return <span className={className}>{status}</span>;
    };

    return (
        <div className="my-bookings-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <h2>My Bookings</h2>
            </header>

            <div className="tabs">
                {['all', 'upcoming', 'completed', 'cancelled'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab as any)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <main className="bookings-list">
                {loading ? (
                    <div className="loading">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state">No bookings found in this category.</div>
                ) : (
                    bookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <div className="card-header">
                                <span className="booking-date">{new Date(booking.booking_date).toLocaleDateString()}</span>
                                {getStatusBadge(booking.status)}
                            </div>
                            <h3>{booking.venue_name}</h3>
                            <p className="location">{booking.venue_location}</p>
                            <div className="details-row">
                                <span>🕒 {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</span>
                                <span className="amount">₹{booking.total_amount}</span>
                            </div>
                            <div className="card-footer">
                                <span className="booking-id">ID: {booking.booking_display_id || booking.id.slice(0, 8)}</span>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};
