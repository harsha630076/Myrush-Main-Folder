import { useState, useEffect } from 'react';
import { Calendar, User, Play, Building, Clock, IndianRupee, CheckCircle, XCircle, Filter, Search, Eye, ArrowUpDown, MoreVertical, Pencil } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import ToggleSwitch from '../components/settings/ToggleSwitch';
import BookingPolicies from '../components/settings/BookingPolicies';
import AddBookingForm from '../components/bookings/AddBookingForm';
import { citiesApi, branchesApi, courtsApi, gameTypesApi, bookingsApi } from '../services/adminApi';

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [cities, setCities] = useState([]);
    const [branches, setBranches] = useState([]);
    const [courts, setCourts] = useState([]);
    const [gameTypes, setGameTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('manage');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const navigate = useNavigate();
    const location = useLocation();

    // Handle tab changes via hash
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash === 'manage' || hash === 'transactions' || hash === 'policies') {
            setActiveTab(hash);
        } else {
            // Default to manage if no hash or invalid hash
            setActiveTab('manage');
            navigate('/bookings#manage', { replace: true });
        }
    }, [location.hash, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        navigate('/login');
    };

    // Fetch all data
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            const adminInfo = localStorage.getItem('admin_info');
            let branchId = null;
            if (adminInfo) {
                const parsed = JSON.parse(adminInfo);
                if (parsed.branch_id) {
                    branchId = parsed.branch_id;
                    // Also set selected branch ID for filtering UI if needed, though API handles data
                    setSelectedBranchId(branchId);
                }
            }

            const [citiesData, branchesData, courtsData, gameTypesData, bookingsData] = await Promise.all([
                citiesApi.getAll(),
                branchesApi.getAll(),
                courtsApi.getAll(),
                gameTypesApi.getAll(),
                bookingsApi.getAll(branchId)
            ]);

            setCities(citiesData);
            setBranches(branchesData);
            setCourts(courtsData);
            setGameTypes(gameTypesData);
            setBookings(bookingsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Filter branches and bookings based on selections
    const filteredBranches = selectedCityId
        ? branches.filter(branch => branch.city_id === selectedCityId)
        : branches;

    const filteredBookings = bookings
        .filter(booking => {
            const cityMatch = selectedCityId ? booking.court?.branch?.city_id === selectedCityId : true;
            const branchMatch = selectedBranchId ? booking.court?.branch_id === selectedBranchId : true;
            const statusMatch = selectedStatus ? booking.status === selectedStatus : true;
            const searchMatch = searchTerm
                ? (booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            return cityMatch && branchMatch && statusMatch && searchMatch;
        })
        .sort((a, b) => {
            if (!sortConfig.key) return 0;

            let aValue = '';
            let bValue = '';

            switch (sortConfig.key) {
                case 'customer_name':
                    aValue = a.customer_name || '';
                    bValue = b.customer_name || '';
                    break;
                case 'branch':
                    aValue = a.court?.branch?.name || '';
                    bValue = b.court?.branch?.name || '';
                    break;
                case 'game':
                    aValue = a.game_type?.name || '';
                    bValue = b.game_type?.name || '';
                    break;
                case 'booking_date':
                    aValue = a.booking_date || '';
                    bValue = b.booking_date || '';
                    break;
                case 'total_amount':
                    aValue = parseFloat(a.total_amount) || 0;
                    bValue = parseFloat(b.total_amount) || 0;
                    break;
                case 'advance':
                    aValue = a.payment_status === 'paid' ? (parseFloat(a.total_amount) || 0) : 0;
                    bValue = b.payment_status === 'paid' ? (parseFloat(b.total_amount) || 0) : 0;
                    break;
                case 'remaining':
                    const atotal = parseFloat(a.total_amount) || 0;
                    const aadvance = a.payment_status === 'paid' ? atotal : 0;
                    aValue = atotal - aadvance;

                    const btotal = parseFloat(b.total_amount) || 0;
                    const badvance = b.payment_status === 'paid' ? btotal : 0;
                    bValue = btotal - badvance;
                    break;
                case 'type':
                    aValue = 'Online'; // Placeholder
                    bValue = 'Online';
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setSelectedCityId(cityId);
        // Clear branch selection when city changes
        setSelectedBranchId('');
    };

    const handleAddBooking = () => {
        setShowForm(true);
    };

    const [viewBooking, setViewBooking] = useState(null);
    const [editBooking, setEditBooking] = useState(null);

    const handleViewBooking = (booking) => {
        setViewBooking(booking);
    };

    const handleEditBooking = (booking) => {
        setEditBooking(booking);
    };

    const handleCloseModal = () => {
        setViewBooking(null);
        setEditBooking(null);
        setShowForm(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Layout onLogout={handleLogout}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {activeTab === 'policies' ? 'Booking Policies' :
                            activeTab === 'transactions' ? 'Transactions & Earnings' :
                                'Bookings Management'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {activeTab === 'policies' ? 'Manage cancellation fees and terms of service' :
                            activeTab === 'transactions' ? 'View revenue and financial reports' :
                                'Manage customer bookings and reservations'}
                    </p>
                </div>
                {activeTab === 'manage' && (
                    <button
                        onClick={handleAddBooking}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        New Booking
                    </button>
                )}
            </div>

            {/* Tab Content */}
            {activeTab === 'manage' && (
                <>
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex-1 min-w-64">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by customer name or booking reference..."
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-48">
                                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                                <select
                                    value={selectedCityId}
                                    onChange={handleCityChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name} ({city.short_code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-48">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
                                <select
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                    disabled={!selectedCityId}
                                >
                                    <option value="">All Branches</option>
                                    {filteredBranches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-48">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                >
                                    <option value="">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bookings List - TABLE View */}
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading bookings...</div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">
                                                <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            </th>
                                            <th className="px-4 py-3 font-medium">Sr No.</th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('customer_name')}>
                                                <div className="flex items-center gap-1">
                                                    Customer <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('branch')}>
                                                <div className="flex items-center gap-1">
                                                    Branch <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('game')}>
                                                <div className="flex items-center gap-1">
                                                    Sport <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('booking_date')}>
                                                <div className="flex items-center gap-1">
                                                    Date <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('total_amount')}>
                                                <div className="flex items-center gap-1">
                                                    Total <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('advance')}>
                                                <div className="flex items-center gap-1">
                                                    Advance <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('remaining')}>
                                                <div className="flex items-center gap-1">
                                                    Remaining <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('type')}>
                                                <div className="flex items-center gap-1">
                                                    Type <ArrowUpDown className="h-3 w-3" />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking, index) => {
                                                const totalAmount = parseFloat(booking.total_amount) || 0;
                                                const isPaid = booking.payment_status === 'paid' || booking.payment_status === 'completed';
                                                const advancePaid = isPaid ? totalAmount : 0;
                                                const remainingAmount = totalAmount - advancePaid;

                                                return (
                                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-900">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900">{booking.customer_name}</div>
                                                            <div className="text-xs text-gray-500">{booking.customer_phone || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            {booking.court?.branch?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            {booking.game_type?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            <div className="font-medium">{booking.booking_date}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {booking.time_slots?.[0]?.start} - {booking.time_slots?.[booking.time_slots.length - 1]?.end}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-green-600">
                                                            ₹{totalAmount.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-700">
                                                            ₹{advancePaid.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-red-600">
                                                            ₹{remainingAmount.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">Online</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => navigate(`/bookings/${booking.id}`)}
                                                                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                    title="Edit Booking"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="12" className="px-4 py-12 text-center text-slate-500">
                                                    <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                    <p className="text-lg font-medium">No bookings found</p>
                                                    <button
                                                        onClick={handleAddBooking}
                                                        className="mt-3 text-green-600 hover:text-green-700 font-medium"
                                                    >
                                                        Create new booking
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'transactions' && (
                <TransactionsAndEarnings
                    bookings={bookings}
                    loading={loading}
                    error={error}
                />
            )}

            {activeTab === 'policies' && (
                <BookingPolicies />
            )}

            {/* Modals */}
            {(showForm || editBooking) && (
                <AddBookingForm
                    onClose={handleCloseModal}
                    onBookingAdded={fetchAllData}
                    booking={editBooking}
                />
            )}

            {viewBooking && (
                <ViewBookingModal
                    booking={viewBooking}
                    onClose={handleCloseModal}
                />
            )}
        </Layout>
    );
}

// TransactionsAndEarnings Component
function TransactionsAndEarnings({ bookings, loading, error }) {
    const calculateStats = () => {
        const paidBookings = bookings.filter(b => b.payment_status === 'paid');
        const pendingPayments = bookings.filter(b => b.payment_status === 'pending');
        const completedBookings = bookings.filter(b => b.status === 'completed');

        const totalRevenue = paidBookings.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
        const pendingRevenue = pendingPayments.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
        const totalBookings = bookings.length;

        return {
            totalRevenue,
            pendingRevenue,
            totalBookings,
            completedBookings: completedBookings.length,
            paidBookings: paidBookings.length
        };
    };

    const stats = calculateStats();

    const getMonthlyData = () => {
        const monthlyStats = {};
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        bookings.forEach(booking => {
            const bookingMonth = booking.booking_date.slice(0, 7);
            if (!monthlyStats[bookingMonth]) {
                monthlyStats[bookingMonth] = { revenue: 0, bookings: 0 };
            }
            if (booking.payment_status === 'paid') {
                monthlyStats[bookingMonth].revenue += parseFloat(booking.total_amount);
                monthlyStats[bookingMonth].bookings += 1;
            }
        });

        return monthlyStats;
    };

    const monthlyData = getMonthlyData();

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <IndianRupee className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Pending Revenue</p>
                            <p className="text-2xl font-bold text-yellow-600">₹{stats.pendingRevenue.toLocaleString()}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                            </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Revenue</h3>
                    <div className="space-y-4">
                        {Object.entries(monthlyData)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .slice(0, 6)
                            .map(([month, data]) => (
                                <div key={month} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">
                                            {new Date(month + '-01').toLocaleDateString('en-IN', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-slate-500">{data.bookings} bookings</p>
                                    </div>
                                    <p className="text-lg font-semibold text-green-600">₹{data.revenue.toLocaleString()}</p>
                                </div>
                            ))}
                        {Object.keys(monthlyData).length === 0 && (
                            <p className="text-slate-500 text-center py-8">No revenue data available</p>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {bookings
                            .filter(b => b.payment_status !== 'pending')
                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                            .slice(0, 10)
                            .map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${booking.payment_status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <IndianRupee className={`h-4 w-4 ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{booking.booking_reference}</p>
                                            <p className="text-xs text-slate-500">{booking.customer_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-green-600">₹{booking.total_amount}</p>
                                        <p className="text-xs text-slate-500">
                                            {booking.payment_status === 'paid' ? 'Paid' :
                                                booking.payment_status === 'failed' ? 'Failed' : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        {bookings.filter(b => b.payment_status !== 'pending').length === 0 && (
                            <p className="text-slate-500 text-center py-8">No transactions found</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Status Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600 mb-2">{stats.paidBookings}</p>
                        <p className="text-sm text-slate-600 mb-4">Paid Bookings</p>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${stats.totalBookings > 0 ? (stats.paidBookings / stats.totalBookings) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-600 mb-2">
                            {bookings.filter(b => b.payment_status === 'pending').length}
                        </p>
                        <p className="text-sm text-slate-600 mb-4">Pending Payments</p>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-yellow-600 h-2 rounded-full"
                                style={{
                                    width: `${stats.totalBookings > 0
                                        ? (bookings.filter(b => b.payment_status === 'pending').length / stats.totalBookings) * 100
                                        : 0}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-600 mb-2">
                            {bookings.filter(b => b.payment_status === 'failed').length}
                        </p>
                        <p className="text-sm text-slate-600 mb-4">Failed Payments</p>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{
                                    width: `${stats.totalBookings > 0
                                        ? (bookings.filter(b => b.payment_status === 'failed').length / stats.totalBookings) * 100
                                        : 0}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ViewBookingModal({ booking, onClose }) {
    if (!booking) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Booking Details</h2>
                        <p className="text-sm text-slate-500">Reference: {booking.booking_reference}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <XCircle className="h-6 w-6 text-slate-400 hover:text-red-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Status</h3>
                            <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                                    Payment: {booking.payment_status}
                                </span>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Customer</h3>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">{booking.customer_name}</p>
                                    <p className="text-xs text-slate-500">{booking.customer_phone}</p>
                                    <p className="text-xs text-slate-500">{booking.customer_email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Court */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Court Details</h3>
                            <div className="flex items-center gap-2">
                                <Play className="h-4 w-4 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">{booking.court?.name}</p>
                                    <p className="text-xs text-slate-500">{booking.game_type?.name} - {booking.court?.branch?.name}</p>
                                    <p className="text-xs text-slate-500">{booking.court?.branch?.city?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Schedule</h3>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">{booking.booking_date}</p>
                                    <p className="text-xs text-slate-500">
                                        {booking.time_slots && booking.time_slots.length > 0 ? (
                                            <span>
                                                {booking.time_slots[0].start} - {booking.time_slots[booking.time_slots.length - 1].end}
                                                <span className="ml-1 text-slate-400">({booking.total_duration_minutes / 60} hrs)</span>
                                            </span>
                                        ) : (
                                            <span>{booking.start_time} - {booking.end_time}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-3">Payment Details</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600">Total Amount</span>
                                <span className="text-lg font-bold text-green-600">₹{booking.total_amount}</span>
                            </div>
                            {booking.coupon_code && (
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="text-sm text-slate-600">Coupon Used</span>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900">{booking.coupon_code}</p>
                                        <p className="text-xs text-green-600">-₹{booking.coupon_discount}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Bookings;
