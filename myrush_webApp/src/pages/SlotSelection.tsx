import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { venuesApi } from '../api/venues';
import './SlotSelection.css';

interface Slot {
    time: string;
    display_time: string;
    price: number;
    available: boolean;
}

export const SlotSelection: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query params
    const searchParams = new URLSearchParams(location.search);
    const venueId = searchParams.get('venueId');

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);

    // Month Navigation
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        if (venueId) {
            fetchSlots();
        }
    }, [venueId, selectedDate, currentDate]);

    const fetchSlots = async () => {
        if (!venueId) return;
        setLoading(true);

        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = selectedDate.toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const res = await venuesApi.getAvailableSlots(venueId, dateStr);
        if (res.success && res.data) {
            setAvailableSlots(res.data.slots);
        } else {
            setAvailableSlots([]);
        }
        setLoading(false);
    };

    const handleSlotClick = (slot: Slot) => {
        // Toggle selection
        const isSelected = selectedSlots.some(s => s.display_time === slot.display_time);
        if (isSelected) {
            setSelectedSlots(prev => prev.filter(s => s.display_time !== slot.display_time));
        } else {
            setSelectedSlots(prev => [...prev, slot]);
        }
    };

    const handleConfirm = () => {
        if (selectedSlots.length === 0) {
            alert('Please select at least one slot.');
            return;
        }
        // Navigate to booking summary
        // Pass data via state or query params. State is cleaner for complex objects.
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;

        navigate('/booking/summary', {
            state: {
                venueId,
                date: dateStr,
                selectedSlots,
                totalPrice: selectedSlots.reduce((sum, s) => sum + s.price, 0)
            }
        });
    };

    const generateDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const isPastDate = (day: number) => {
        const today = new Date();
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        today.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    return (
        <div className="slot-selection-page">
            <header className="slot-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <h2>Select Slots</h2>
            </header>

            <div className="calendar-section">
                <div className="month-selector">
                    <button
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setCurrentDate(newDate);
                        }}
                        disabled={currentDate <= new Date()}
                    >←</button>
                    <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setCurrentDate(newDate);
                        }}
                    >→</button>
                </div>

                <div className="days-scroll">
                    {generateDays().map(day => {
                        const disabled = isPastDate(day);
                        const active = selectedDate === day && !disabled;
                        return (
                            <button
                                key={day}
                                className={`day-chip ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                                onClick={() => !disabled && setSelectedDate(day)}
                                disabled={disabled}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="slots-grid-section">
                <h3>Available Slots</h3>
                {loading ? (
                    <div className="loading-slots">Loading slots...</div>
                ) : availableSlots.length === 0 ? (
                    <div className="no-slots">No slots available for this date.</div>
                ) : (
                    <div className="slots-grid">
                        {availableSlots.map(slot => {
                            const isSelected = selectedSlots.some(s => s.display_time === slot.display_time);
                            return (
                                <button
                                    key={slot.display_time}
                                    className={`slot-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSlotClick(slot)}
                                >
                                    <div className="slot-time">{slot.display_time}</div>
                                    <div className="slot-price">₹{slot.price}</div>
                                    {isSelected && <div className="check-icon">✓</div>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <footer className="slot-footer">
                <div className="total-info">
                    <span className="label">Total Price</span>
                    <span className="amount">₹{selectedSlots.reduce((sum, s) => sum + s.price, 0)}</span>
                </div>
                <button
                    className="confirm-btn"
                    disabled={selectedSlots.length === 0}
                    onClick={handleConfirm}
                >
                    Confirm Booking ({selectedSlots.length})
                </button>
            </footer>
        </div>
    );
};
