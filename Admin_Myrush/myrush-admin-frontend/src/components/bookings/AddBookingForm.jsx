import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, User, CreditCard } from 'lucide-react';
import { courtsApi, usersApi, bookingsApi } from '../../services/adminApi';

const TimePicker = ({ value, onChange, className }) => {
    const [hours, minutes] = (value || '09:00').split(':');
    let h = parseInt(hours, 10);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;

    const handleHourChange = (e) => {
        let newH = parseInt(e.target.value, 10);
        if (ampm === 'PM' && newH !== 12) newH += 12;
        if (ampm === 'AM' && newH === 12) newH = 0;
        onChange(`${newH.toString().padStart(2, '0')}:${m}`);
    };

    const handleMinuteChange = (e) => {
        onChange(`${hours}:${e.target.value}`);
    };

    const handleAmpmChange = (e) => {
        const newAmpm = e.target.value;
        let newH = parseInt(hours, 10);
        if (newAmpm === 'PM' && newH < 12) newH += 12;
        if (newAmpm === 'AM' && newH >= 12) newH -= 12;
        onChange(`${newH.toString().padStart(2, '0')}:${m}`);
    };

    return (
        <div className={`flex gap-1 ${className}`}>
            <select
                value={h}
                onChange={handleHourChange}
                className="px-1 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-green-500 w-14"
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                ))}
            </select>
            <span className="self-center">:</span>
            <select
                value={m}
                onChange={handleMinuteChange}
                className="px-1 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-green-500 w-14"
            >
                {['00', '15', '30', '45'].map(min => (
                    <option key={min} value={min}>{min}</option>
                ))}
            </select>
            <select
                value={ampm}
                onChange={handleAmpmChange}
                className="px-1 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-green-500 w-16"
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
};

export default function AddBookingForm({ onClose, onBookingAdded, booking = null, isFullPage = false }) {
    const [courts, setCourts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        court_id: '',
        user_id: '',
        date: new Date().toISOString().split('T')[0],
        time_slots: [{ start: '09:00', end: '10:00', price: 0 }],
        status: 'pending',
        payment_status: 'pending',
        total_amount: 0
    });

    useEffect(() => {
        fetchData();
        if (booking) {
            // Robustly map time slots ensuring we have start/end keys
            const mappedSlots = (booking.time_slots && booking.time_slots.length > 0)
                ? booking.time_slots.map(slot => ({
                    start: slot.start || slot.start_time || slot.startTime,
                    end: slot.end || slot.end_time || slot.endTime,
                    price: slot.price || slot.price_per_slot || 0 // Assuming price might be there
                }))
                : [{
                    start: booking.start_time,
                    end: booking.end_time,
                    price: booking.price_per_hour || 0
                }];

            // Populate form with booking data
            setFormData({
                court_id: booking.court_id || booking.court?.id || '',
                user_id: booking.user_id || booking.customer_id || '',
                date: booking.booking_date,
                time_slots: mappedSlots,
                status: booking.status,
                payment_status: booking.payment_status,
                total_amount: booking.total_amount
            });
        }
    }, [booking]);

    useEffect(() => {
        // Recalculate total amount when slots change
        // Only if not initial load/edit to prevent overriding manual adjustments if logic differs,
        // but for now, keep it simple.
        if (formData.time_slots) {
            const total = formData.time_slots.reduce((sum, slot) => sum + (parseFloat(slot.price) || 0), 0);
            if (total !== parseFloat(formData.total_amount)) {
                setFormData(prev => ({ ...prev, total_amount: total }));
            }
        }
    }, [formData.time_slots]);

    const fetchData = async () => {
        try {
            const [courtsData, usersData] = await Promise.all([
                courtsApi.getAll(),
                usersApi.getAll()
            ]);
            setCourts(courtsData);
            setUsers(usersData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            alert('Failed to load required data');
        }
    };

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...formData.time_slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setFormData({ ...formData, time_slots: newSlots });
    };

    const addSlot = () => {
        const lastSlot = formData.time_slots[formData.time_slots.length - 1];
        const newStart = lastSlot ? lastSlot.end : '09:00';
        // Add 1 hour to start for end
        const [h, m] = newStart.split(':');
        let endH = parseInt(h) + 1;
        const end = `${endH.toString().padStart(2, '0')}:${m}`;

        setFormData({
            ...formData,
            time_slots: [...formData.time_slots, { start: newStart, end: end, price: 0 }]
        });
    };

    const removeSlot = (index) => {
        if (formData.time_slots.length === 1) return;
        const newSlots = formData.time_slots.filter((_, i) => i !== index);
        setFormData({ ...formData, time_slots: newSlots });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.court_id || !formData.user_id) {
            alert('Please select a court and a user');
            return;
        }

        try {
            const firstSlot = formData.time_slots[0];
            const lastSlot = formData.time_slots[formData.time_slots.length - 1];

            // Ensure we have valid time strings before sending
            const cleanSlots = formData.time_slots.map(slot => ({
                start: slot.start,
                end: slot.end,
                price: parseFloat(slot.price) || 0
            }));

            const payload = {
                court_id: formData.court_id,
                user_id: formData.user_id,
                booking_date: formData.date,
                start_time: firstSlot.start,
                end_time: lastSlot.end,
                duration_minutes: formData.time_slots.length * 60,
                total_amount: formData.total_amount,
                status: formData.status,
                payment_status: formData.payment_status,
                time_slots: cleanSlots,
                price_per_hour: cleanSlots.length > 0 ? cleanSlots[0].price : 0
            };

            if (booking) {
                await bookingsApi.update(booking.id, payload);
                alert('Booking updated successfully!');
            } else {
                await bookingsApi.create(payload);
                alert('Booking created successfully!');
            }
            onBookingAdded();
            if (!booking.isFullPage) onClose(); // Only close if modal
        } catch (error) {
            console.error('Failed to save booking:', error);
            alert(`Error saving booking: ${error.message}`);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const FormContent = () => (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Court Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Court</label>
                    <select
                        value={formData.court_id}
                        onChange={(e) => setFormData({ ...formData, court_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                    >
                        <option value="">Select a Court</option>
                        {courts.map(court => (
                            <option key={court.id} value={court.id}>{court.name} ({court.branch?.city?.short_code}) - ₹{court.price_per_hour || court.default_price}/hr</option>
                        ))}
                    </select>
                </div>

                {/* User Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">User</label>
                    <select
                        value={formData.user_id}
                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                    >
                        <option value="">Select a User</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.full_name} ({user.phone_number})</option>
                        ))}
                    </select>
                </div>

                {/* Date Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                </div>

                {/* Statuses */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={formData.payment_status}
                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="pending">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Time Slots Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-800">Time Slots</h3>
                    <button
                        type="button"
                        onClick={addSlot}
                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" /> Add Slot
                    </button>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                    {formData.time_slots.map((slot, index) => (
                        <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-3 p-3 bg-white rounded-md border border-slate-200">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                                <TimePicker
                                    value={slot.start}
                                    onChange={(val) => handleSlotChange(index, 'start', val)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
                                <TimePicker
                                    value={slot.end}
                                    onChange={(val) => handleSlotChange(index, 'end', val)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    value={slot.price}
                                    onChange={(e) => handleSlotChange(index, 'price', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500"
                                    placeholder="Price"
                                />
                            </div>
                            {formData.time_slots.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSlot(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded mb-0.5"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end items-center gap-2 text-lg font-medium text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{formData.total_amount}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                >
                    {booking ? 'Update Booking' : 'Create Booking'}
                </button>
            </div>
        </form>
    );

    if (isFullPage) {
        return <FormContent />;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-slate-800">{booking ? 'Edit Booking' : 'Create New Booking'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <FormContent />
            </div>
        </div>
    );
}
