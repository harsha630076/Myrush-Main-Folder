import { useState, useEffect } from 'react';
import { Edit2, Plus, Play, Eye, Trash2, X, Settings, Clock } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import Modal from './Modal';
import AddCourtForm from './AddCourtForm';
import { citiesApi, branchesApi, gameTypesApi, courtsApi, globalPriceConditionsApi, IMAGE_BASE_URL } from '../../services/adminApi';

function CourtsSettings() {
  const [courts, setCourts] = useState([]);
  const [cities, setCities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [gameTypes, setGameTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // View state: 'list', 'add', 'edit'
  const [view, setView] = useState('list');
  const [editingCourt, setEditingCourt] = useState(null);
  const [viewingCourt, setViewingCourt] = useState(null);

  // Global Price Conditions
  const [globalConditions, setGlobalConditions] = useState([]);
  const [showGlobalConditions, setShowGlobalConditions] = useState(false);
  const [editingGlobalCondition, setEditingGlobalCondition] = useState(null);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
    fetchGlobalConditions();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [citiesData, branchesData, gameTypesData, courtsData] = await Promise.all([
        citiesApi.getAll(),
        branchesApi.getAll(),
        gameTypesApi.getAll(),
        courtsApi.getAll()
      ]);

      setCities(citiesData);
      setBranches(branchesData);
      setGameTypes(gameTypesData);
      setCourts(courtsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalConditions = async () => {
    try {
      const conditions = await globalPriceConditionsApi.getAll();
      setGlobalConditions(conditions);
    } catch (err) {
      console.error('Error fetching global conditions:', err);
    }
  };

  // Filter branches and courts based on selections
  const filteredBranches = selectedCityId
    ? branches.filter(branch => branch.city_id === selectedCityId)
    : branches;

  const filteredCourts = courts.filter(court => {
    // 1. City Check
    if (selectedCityId) {
      let cityMatches = false;
      // Check deeply nested
      if (court.branch?.city?.id === selectedCityId) cityMatches = true;
      // Check direct ID on branch object
      else if (court.branch?.city_id === selectedCityId) cityMatches = true;
      // Check via looking up branch in separate list
      else {
        const branch = branches.find(b => b.id === court.branch_id);
        if (branch?.city_id === selectedCityId) cityMatches = true;
      }

      if (!cityMatches) return false;
    }

    // 2. Branch Check
    if (selectedBranchId) {
      if (String(court.branch_id) !== String(selectedBranchId)) return false;
    }

    return true;
  });

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);
    // Clear branch selection when city changes
    setSelectedBranchId('');
  };

  const handleAddClick = () => {
    setEditingCourt(null);
    setView('add');
  };

  const handleEditClick = (court) => {
    setEditingCourt(court);
    setView('add'); // Reusing the 'add' view which renders AddCourtForm
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        await courtsApi.delete(id);
        await fetchAllData();
      } catch (err) {
        console.error('Error deleting court:', err);
        setError('Failed to delete court');
      }
    }
  };

  const handleToggleCourt = async (court) => {
    try {
      const updateData = new FormData();
      updateData.append('name', court.name);
      updateData.append('branch_id', court.branch_id);
      updateData.append('game_type_id', court.game_type_id);
      updateData.append('price_per_hour', court.price_per_hour || court.default_price);
      updateData.append('is_active', !court.is_active);

      await courtsApi.update(court.id, updateData);
      await fetchAllData();
    } catch (err) {
      console.error('Error toggling court:', err);
      setError('Failed to update court status');
    }
  };

  const handleFormSuccess = async () => {
    await fetchAllData();
    setView('list');
    setEditingCourt(null);
  };

  if (viewingCourt) {
    return (
      <CourtViewModal
        court={viewingCourt}
        onClose={() => setViewingCourt(null)}
      />
    );
  }

  if (view === 'add') {
    return (
      <AddCourtForm
        onCancel={() => {
          setView('list');
          setEditingCourt(null);
        }}
        onSuccess={handleFormSuccess}
        initialData={editingCourt}
      />
    );
  }

  return (
    <div>
      {/* Filters and Add Button */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            City
          </label>
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
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Branch
          </label>
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
        <div className="pt-6">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Court
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Global Price Conditions Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">Global Price Conditions</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Applies to ALL courts
            </span>
          </div>
          <button
            onClick={() => setShowGlobalConditions(!showGlobalConditions)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {showGlobalConditions ? 'Hide' : 'Show'} Conditions
          </button>
        </div>

        {showGlobalConditions && (
          <GlobalPriceConditionsSection
            conditions={globalConditions}
            onRefresh={fetchGlobalConditions}
            onEdit={setEditingGlobalCondition}
            editingCondition={editingGlobalCondition}
          />
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading courts...</div>
      ) : (
        <div className="space-y-3">
          {filteredCourts.map((court) => (
            <div key={court.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                  {court.images && court.images.length > 0 ? (
                    <img
                      src={court.images[0]}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Play className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{court.name}</h3>
                  <p className="text-sm text-slate-500">
                    {court.branch?.city?.name} • {court.branch?.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    Default: {court.game_type?.name} • ₹{court.price_per_hour || court.default_price}/hr
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ToggleSwitch
                  isChecked={court.is_active}
                  onToggle={() => handleToggleCourt(court)}
                />
                <button
                  onClick={() => setViewingCourt(court)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditClick(court)}
                  className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredCourts.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Play className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p>No courts found for the selected filters.</p>
              <p className="text-sm">Click "Add Court" to create your first court.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CourtViewModal({ court, onClose }) {
  return (
    <div className="bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">View Court Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Images & Videos Gallery (Horizontal Scroll) */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {/* Show placeholder if no media */}
            {(!court.images?.length && !court.videos?.length) && (
              <div className="w-full h-64 bg-green-50 rounded-xl flex items-center justify-center border-2 border-dashed border-green-100 flex-shrink-0">
                <Play className="h-16 w-16 text-green-200" />
              </div>
            )}

            {/* Images */}
            {court.images?.map((img, idx) => (
              <div key={`img-${idx}`} className="h-64 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 snap-center">
                <img
                  src={`${IMAGE_BASE_URL}${img}`}
                  alt={`Court ${idx}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.closest('div').style.display = 'none'; }}
                />
              </div>
            ))}

            {/* Videos */}
            {court.videos?.map((vid, idx) => (
              <div key={`vid-${idx}`} className="h-64 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black flex-shrink-0 snap-center">
                <video
                  src={`${IMAGE_BASE_URL}${vid}`}
                  className="w-full h-full object-cover"
                  controls
                  onError={(e) => { e.target.closest('div').style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Court Information */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">Court Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Court Name</label>
                <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-md">{court.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Game Type</label>
                <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-md">{court.game_type?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Price per Hour</label>
                <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-md">₹{court.price_per_hour || court.default_price}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">Location Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Branch</label>
                <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-md">{court.branch?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-md">{court.branch?.city?.name} ({court.branch?.city?.short_code})</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Active Status</label>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${court.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {court.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Conditions */}
          {court.price_conditions && court.price_conditions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Price Conditions</h3>
              <div className="space-y-3">
                {court.price_conditions.map((condition, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {condition.days && condition.days.length > 0 && condition.days.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 uppercase">
                          {day}
                        </span>
                      ))}
                      {condition.dates && condition.dates.length > 0 && condition.dates.map(date => (
                        <span key={date} className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-blue-700 rounded text-xs font-medium">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">
                        {condition.slotFrom} - {condition.slotTo}
                      </span>
                      <span className="font-medium text-green-600">
                        ₹{condition.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unavailability Slots */}
          {court.unavailability_slots && court.unavailability_slots.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Unavailability Slots</h3>
              <div className="space-y-3">
                {court.unavailability_slots.map((slot, index) => (
                  <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-red-700 text-sm">{slot.date}</span>
                      <span className="text-xs text-red-500 bg-white px-2 py-0.5 rounded border border-red-100">
                        {slot.reason || 'Unavailable'}
                      </span>
                    </div>
                    <div className="text-sm text-red-600">
                      {slot.from} - {slot.to}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// TimePicker component for AM/PM time selection
function TimePicker({ value, onChange, className }) {
  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: '12', minute: '00', ampm: 'AM' };
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { hour: String(h).padStart(2, '0'), minute: minutes, ampm };
  };

  const formatTime = (hour, minute, ampm) => {
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${minute}`;
  };

  const { hour, minute, ampm } = parseTime(value);

  const handleHourChange = (e) => {
    onChange(formatTime(e.target.value, minute, ampm));
  };

  const handleMinuteChange = (e) => {
    onChange(formatTime(hour, e.target.value, ampm));
  };

  const handleAmpmChange = (e) => {
    onChange(formatTime(hour, minute, e.target.value));
  };

  return (
    <div className={`flex gap-1 ${className || ''}`}>
      <select
        value={hour}
        onChange={handleHourChange}
        className="px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
          <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>
      <span className="flex items-center px-1 text-slate-600">:</span>
      <select
        value={minute}
        onChange={handleMinuteChange}
        className="px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
      >
        {['00', '15', '30', '45'].map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        value={ampm}
        onChange={handleAmpmChange}
        className="px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm font-medium"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

// Helper function to format time from 24-hour to 12-hour with AM/PM
function formatTime12Hour(time24) {
  if (!time24) return '';

  // Handle both "HH:MM" and "HH:MM:SS" formats
  const timeParts = time24.split(':');
  if (timeParts.length < 2) return time24; // Return as-is if invalid format

  const hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];

  if (isNaN(hours)) return time24; // Return as-is if invalid

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
}

function GlobalPriceConditionsSection({ conditions, onRefresh, onEdit, editingCondition }) {
  const [isAdding, setIsAdding] = useState(false);
  const [conditionType, setConditionType] = useState('recurring'); // 'recurring' or 'date'
  const [newCondition, setNewCondition] = useState({
    days: [],
    dates: [],
    slotFrom: '06:00',
    slotTo: '07:00',
    price: ''
  });
  const [selectedDate, setSelectedDate] = useState('');

  // Effect to populate form when editing
  useEffect(() => {
    if (editingCondition) {
      setIsAdding(true);
      setConditionType(editingCondition.condition_type || 'recurring');
      setNewCondition({
        days: editingCondition.days || [],
        dates: editingCondition.dates || [],
        slotFrom: editingCondition.slot_from,
        slotTo: editingCondition.slot_to,
        price: editingCondition.price
      });
    }
  }, [editingCondition]);

  const daysOfWeek = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' }
  ];

  const toggleDay = (dayId) => {
    setNewCondition(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }));
  };

  useEffect(() => { }, []);

  const addDate = () => {
    if (selectedDate && !newCondition.dates.includes(selectedDate)) {
      setNewCondition(prev => ({
        ...prev,
        dates: [...prev.dates, selectedDate]
      }));
      setSelectedDate('');
    }
  };

  const removeDate = (dateToRemove) => {
    setNewCondition(prev => ({
      ...prev,
      dates: prev.dates.filter(d => d !== dateToRemove)
    }));
  };

  const handleSave = async () => {
    if (conditionType === 'recurring' && (!newCondition.days || newCondition.days.length === 0)) {
      alert('Please select at least one day');
      return;
    }
    if (conditionType === 'date' && (!newCondition.dates || newCondition.dates.length === 0)) {
      alert('Please select at least one date');
      return;
    }
    if (!newCondition.price) {
      alert('Please enter a price');
      return;
    }
    if (!newCondition.slotFrom || !newCondition.slotTo) {
      alert('Please enter both start and end times');
      return;
    }

    try {
      const data = {
        condition_type: conditionType,
        days: conditionType === 'recurring' ? newCondition.days : [],
        dates: conditionType === 'date' ? newCondition.dates : [],
        slot_from: newCondition.slotFrom,
        slot_to: newCondition.slotTo,
        price: newCondition.price
      };

      if (editingCondition) {
        await globalPriceConditionsApi.update(editingCondition.id, data);
        await globalPriceConditionsApi.applyToAllCourts();
        alert('Global price condition updated and synchronized with all courts!');
      } else {
        await globalPriceConditionsApi.create(
          data.days,
          data.dates,
          data.slot_from,
          data.slot_to,
          data.price,
          data.condition_type
        );
        // The backend create might apply it, but let's be sure or just stick to the pattern. 
        // Actually, usually 'create' might just create the template. Explicit apply is safer if backend supports it.
        // However, looking at the previous code, it just said "Add & Apply". 
        // Let's assume create does it or we need to call it.
        // Given the endpoint exists separately, let's call it.
        // But wait, applyToAllCourts probably applies ALL active conditions.
        await globalPriceConditionsApi.applyToAllCourts();
        alert('Global price condition added and applied to all courts!');
      }

      setNewCondition({ days: [], dates: [], slotFrom: '06:00', slotTo: '07:00', price: '' });
      setConditionType('recurring');
      setIsAdding(false);
      onEdit(null); // Clear editing state
      onRefresh();
    } catch (err) {
      alert('Failed to save global condition: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this global condition?')) {
      try {
        await globalPriceConditionsApi.delete(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete condition: ' + err.message);
      }
    }
  };

  const startEdit = (condition) => {
    onEdit(condition);
  };

  return (
    <div className="space-y-4">
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Global Price Condition
        </button>
      ) : (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="space-y-4">
            {/* Condition Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Condition Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConditionType('recurring');
                    setNewCondition({ ...newCondition, dates: [] });
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${conditionType === 'recurring'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:border-green-500'
                    }`}
                >
                  Recurring (Day-wise)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConditionType('date');
                    setNewCondition({ ...newCondition, days: [] });
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${conditionType === 'date'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:border-green-500'
                    }`}
                >
                  Date-Specific
                </button>
              </div>
            </div>

            {/* Recurring Days Selection */}
            {conditionType === 'recurring' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${newCondition.days.includes(day.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-600 hover:border-green-500'
                        }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date-Specific Selection */}
            {conditionType === 'date' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Dates</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={addDate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Date
                  </button>
                </div>
                {newCondition.dates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newCondition.dates.map(date => (
                      <span
                        key={date}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <button
                          type="button"
                          onClick={() => removeDate(date)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">From Time</label>
                <TimePicker
                  value={newCondition.slotFrom}
                  onChange={(val) => setNewCondition({ ...newCondition, slotFrom: val })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">To Time</label>
                <TimePicker
                  value={newCondition.slotTo}
                  onChange={(val) => setNewCondition({ ...newCondition, slotTo: val })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={newCondition.price}
                  onChange={(e) => setNewCondition({ ...newCondition, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingCondition ? 'Update Condition' : 'Add & Apply to All Courts'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewCondition({ days: [], dates: [], slotFrom: '06:00', slotTo: '07:00', price: '' });
                  setConditionType('recurring');
                  onEdit(null); // Clear editing state
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {conditions.map(condition => (
          <div key={condition.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                {condition.condition_type === 'date' && condition.dates && condition.dates.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {condition.dates.map(date => (
                        <span key={date} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-blue-600 mb-1">Date-Specific</div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 mb-1">
                      {condition.days && condition.days.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium uppercase">
                          {day}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-green-600 mb-1">Recurring</div>
                  </>
                )}
                <div className="text-sm text-slate-600">
                  {formatTime12Hour(condition.slot_from)} - {formatTime12Hour(condition.slot_to)} • ₹{condition.price}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(condition)}
                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(condition.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {conditions.length === 0 && (
          <div className="text-center py-4 text-sm text-slate-400">
            No global price conditions. Add one to apply to all courts automatically.
          </div>
        )}
      </div>
    </div>
  );
}

export default CourtsSettings;
