import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsApi } from '../services/adminApi';
import AddBookingForm from '../components/bookings/AddBookingForm';
import Layout from '../components/Layout';
import { ArrowLeft } from 'lucide-react';

const EditBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const data = await bookingsApi.getById(id);
            setBooking(data);
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingUpdated = () => {
        navigate('/bookings');
    };

    const handleClose = () => {
        navigate('/bookings');
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-screen">Loading...</div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-red-500">{error}</p>
                <button onClick={() => navigate('/bookings')} className="text-blue-600 hover:underline">Go Back</button>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate('/bookings')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Edit Booking</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {/* We pass a special prop 'isPage' to adjust internal layout if needed, 
                    though currently AddBookingForm is styled as a modal. 
                    We might want to adjust AddBookingForm to be more flexible. 
                    For now, let's wrap it or modify it to fit.
                */}
                <AddBookingForm
                    booking={booking}
                    onBookingAdded={handleBookingUpdated}
                    onClose={handleClose}
                    isFullPage={true}
                />
            </div>
        </Layout>
    );
};

export default EditBooking;
