import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import { venuesApi } from '../api/venues';
import './BookingSummary.css';

interface Slot {
    time: string;
    display_time: string;
    price: number;
}

interface LocationState {
    venueId: string;
    date: string;
    selectedSlots: Slot[];
    totalPrice: number;
}

export const BookingSummary: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [venueName, setVenueName] = useState('Venue');
    const [numPlayers, setNumPlayers] = useState(2);
    const [teamName, setTeamName] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!state) {
            navigate('/venues');
            return;
        }
        // Fetch venue name if possible, or pass it in state
        const loadVenue = async () => {
            const res = await venuesApi.getVenueById(state.venueId);
            if (res.success && res.data) {
                setVenueName(res.data.court_name);
            }
        };
        loadVenue();
    }, [state, navigate]);

    if (!state) return null;

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            // Prepare payload
            // Sort slots to get start time and duration
            const sortedSlots = [...state.selectedSlots].sort((a, b) => a.time.localeCompare(b.time));
            const startTime = sortedSlots[0].time;
            const durationMinutes = sortedSlots.length * 60; // Assuming 60 min slots

            const payload = {
                courtId: state.venueId,
                bookingDate: state.date,
                startTime: startTime,
                durationMinutes: durationMinutes,
                numberOfPlayers: numPlayers,
                pricePerHour: sortedSlots[0].price, // Base price, approximate
                teamName: teamName,
                specialRequests: specialRequests,
                timeSlots: state.selectedSlots,
                totalAmount: state.totalPrice
            };

            const res = await bookingsApi.createBooking(payload);

            if (res.success) {
                alert('Booking Confirmed! (Mock Payment Success)');
                navigate('/'); // Redirect to dashboard or My Bookings
            } else {
                alert('Booking failed: ' + (res.data?.detail || res.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="booking-summary-page">
            <header className="booking-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <h2>Booking Summary</h2>
            </header>

            <main className="booking-content">
                <section className="summary-card">
                    <h3>{venueName}</h3>
                    <p className="summary-date">{state.date}</p>
                    <div className="selected-slots-list">
                        {state.selectedSlots.map(slot => (
                            <span key={slot.time} className="slot-chip">{slot.display_time}</span>
                        ))}
                    </div>
                </section>

                <section className="input-section">
                    <label>Number of Players</label>
                    <div className="counter-row">
                        <button onClick={() => setNumPlayers(Math.max(1, numPlayers - 1))}>-</button>
                        <span>{numPlayers}</span>
                        <button onClick={() => setNumPlayers(numPlayers + 1)}>+</button>
                    </div>

                    <label>Team Name (Optional)</label>
                    <input
                        type="text"
                        placeholder="Enter team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                    />

                    <label>Special Requests</label>
                    <textarea
                        placeholder="e.g., Extra equipment needed"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                </section>

                <section className="payment-summary">
                    <div className="row">
                        <span>Slots Cost ({state.selectedSlots.length} slots)</span>
                        <span>₹{state.totalPrice}</span>
                    </div>
                    <div className="row total">
                        <span>Total Payable</span>
                        <span>₹{state.totalPrice}</span>
                    </div>
                </section>
            </main>

            <footer className="booking-footer">
                <div className="total-display">
                    <span className="label">Total</span>
                    <span className="amount">₹{state.totalPrice}</span>
                </div>
                <button
                    className="pay-btn"
                    onClick={handleConfirm}
                    disabled={submitting}
                >
                    {submitting ? 'Processing...' : 'Confirm & Pay'}
                </button>
            </footer>
        </div>
    );
};
