import { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, CalendarDays, X } from 'lucide-react';

function SlotCalendar({ slots, onSlotsChange, defaultPrice }) {
  const [activeTab, setActiveTab] = useState('recurring'); // 'recurring' or 'dates'
  const [selectedDates, setSelectedDates] = useState([]);
  const [newDateSlot, setNewDateSlot] = useState({ from: '09:00', to: '10:00', price: defaultPrice || '' });

  const daysOfWeek = [
    { id: 'mon', label: 'Monday', short: 'Mon' },
    { id: 'tue', label: 'Tuesday', short: 'Tue' },
    { id: 'wed', label: 'Wednesday', short: 'Wed' },
    { id: 'thu', label: 'Thursday', short: 'Thu' },
    { id: 'fri', label: 'Friday', short: 'Fri' },
    { id: 'sat', label: 'Saturday', short: 'Sat' },
    { id: 'sun', label: 'Sunday', short: 'Sun' }
  ];

  // Separate recurring (day-based) and date-specific slots
  const recurringSlots = slots.filter(slot => !slot.dates || slot.dates.length === 0);
  const dateSpecificSlots = slots.filter(slot => slot.dates && slot.dates.length > 0);

  // Initialize slots for each day if not present
  const getDaySlots = (dayId) => {
    return recurringSlots.filter(slot => slot.days && slot.days.includes(dayId));
  };

  const addSlotToDay = (dayId) => {
    const newSlot = {
      id: Date.now() + Math.random(),
      type: 'recurring',
      days: [dayId],
      slotFrom: '09:00',
      slotTo: '10:00',
      price: defaultPrice || ''
    };
    onSlotsChange([...slots, newSlot]);
  };

  const addDateSpecificSlot = () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one date');
      return;
    }
    const newSlot = {
      id: Date.now() + Math.random(),
      type: 'date',
      dates: [...selectedDates],
      slotFrom: newDateSlot.from,
      slotTo: newDateSlot.to,
      price: newDateSlot.price
    };
    onSlotsChange([...slots, newSlot]);
    setSelectedDates([]);
  };

  const removeSlot = (slotId) => {
    onSlotsChange(slots.filter(slot => slot.id !== slotId));
  };

  const updateSlot = (slotId, field, value) => {
    onSlotsChange(slots.map(slot =>
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ));
  };

  const addDayToSlot = (slotId, dayId) => {
    onSlotsChange(slots.map(slot => {
      if (slot.id === slotId) {
        const days = slot.days || [];
        if (!days.includes(dayId)) {
          return { ...slot, days: [...days, dayId] };
        }
      }
      return slot;
    }));
  };

  const removeDayFromSlot = (slotId, dayId) => {
    onSlotsChange(slots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, days: (slot.days || []).filter(d => d !== dayId) };
      }
      return slot;
    }));
  };

  const toggleDateSelection = (dateString) => {
    setSelectedDates(prev =>
      prev.includes(dateString)
        ? prev.filter(d => d !== dateString)
        : [...prev, dateString]
    );
  };

  const addDateToSlot = (slotId, dateString) => {
    onSlotsChange(slots.map(slot => {
      if (slot.id === slotId) {
        const dates = slot.dates || [];
        if (!dates.includes(dateString)) {
          return { ...slot, dates: [...dates, dateString] };
        }
      }
      return slot;
    }));
  };

  const removeDateFromSlot = (slotId, dateString) => {
    onSlotsChange(slots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, dates: (slot.dates || []).filter(d => d !== dateString) };
      }
      return slot;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium text-slate-900">Slot Management</h3>
        </div>
        <p className="text-sm text-slate-500">Add recurring (day-wise) or date-specific slots</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'recurring'
            ? 'text-green-600 border-b-2 border-green-600'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <CalendarDays className="h-4 w-4 inline mr-2" />
          Recurring (Day-wise)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dates')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'dates'
            ? 'text-green-600 border-b-2 border-green-600'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Date-Specific
        </button>
      </div>

      {/* Recurring Slots Tab */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">

          <div className="space-y-4">
            {daysOfWeek.map(day => {
              const daySlots = getDaySlots(day.id);

              return (
                <div key={day.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">{day.label}</h4>
                    <button
                      type="button"
                      onClick={() => addSlotToDay(day.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Slot
                    </button>
                  </div>

                  {daySlots.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                      No slots added for {day.short}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.map(slot => (
                        <div key={slot.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                              <TimePicker
                                value={slot.slotFrom || ''}
                                onChange={(val) => updateSlot(slot.id, 'slotFrom', val)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                              <TimePicker
                                value={slot.slotTo || ''}
                                onChange={(val) => updateSlot(slot.id, 'slotTo', val)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
                              <input
                                type="number"
                                value={slot.price || ''}
                                onChange={(e) => updateSlot(slot.id, 'price', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSlot(slot.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Multi-Day Slots Section */}
          <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-semibold text-slate-800 mb-3">Multi-Day Slots</h4>
            <p className="text-sm text-slate-600 mb-4">Slots that apply to multiple days at once</p>

            {recurringSlots.filter(slot => slot.days && slot.days.length > 1).length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                No multi-day slots. Add a slot to a day and then add more days to it.
              </div>
            ) : (
              <div className="space-y-3">
                {recurringSlots.filter(slot => slot.days && slot.days.length > 1).map(slot => (
                  <div key={slot.id} className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                          <TimePicker
                            value={slot.slotFrom || ''}
                            onChange={(val) => updateSlot(slot.id, 'slotFrom', val)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                          <TimePicker
                            value={slot.slotTo || ''}
                            onChange={(val) => updateSlot(slot.id, 'slotTo', val)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={slot.price || ''}
                            onChange={(e) => updateSlot(slot.id, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Applies to:</label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => {
                          const isSelected = slot.days && slot.days.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  removeDayFromSlot(slot.id, day.id);
                                } else {
                                  addDayToSlot(slot.id, day.id);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isSelected
                                ? 'bg-green-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-600 hover:border-green-500'
                                }`}
                            >
                              {day.short}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date-Specific Slots Tab */}
      {activeTab === 'dates' && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-slate-800 mb-4">Add Date-Specific Slots</h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Dates (Click to select multiple dates)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedDates.map(date => (
                  <span
                    key={date}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <button
                      type="button"
                      onClick={() => toggleDateSelection(date)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="date"
                onChange={(e) => {
                  if (e.target.value && !selectedDates.includes(e.target.value)) {
                    toggleDateSelection(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Select dates"
              />
              <p className="text-xs text-slate-500 mt-2">
                Select dates one by one to add them to the list above
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">From Time</label>
                <TimePicker
                  value={newDateSlot.from}
                  onChange={(val) => setNewDateSlot({ ...newDateSlot, from: val })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">To Time</label>
                <TimePicker
                  value={newDateSlot.to}
                  onChange={(val) => setNewDateSlot({ ...newDateSlot, to: val })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={newDateSlot.price}
                  onChange={(e) => setNewDateSlot({ ...newDateSlot, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const fromTime = document.getElementById('dateSlotFrom').value;
                const toTime = document.getElementById('dateSlotTo').value;
                const price = document.getElementById('dateSlotPrice').value;

                if (selectedDates.length === 0) {
                  alert('Please select at least one date');
                  return;
                }

                const newSlot = {
                  id: Date.now() + Math.random(),
                  type: 'date',
                  dates: [...selectedDates],
                  slotFrom: fromTime,
                  slotTo: toTime,
                  price: price || defaultPrice || ''
                };
                onSlotsChange([...slots, newSlot]);
                setSelectedDates([]);
                document.getElementById('dateSlotFrom').value = '09:00';
                document.getElementById('dateSlotTo').value = '10:00';
                document.getElementById('dateSlotPrice').value = defaultPrice || '';
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Slot for Selected Dates
            </button>
          </div>

          {/* Existing Date-Specific Slots */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-semibold text-slate-800 mb-3">Date-Specific Slots</h4>

            {dateSpecificSlots.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-white">
                No date-specific slots added yet
              </div>
            ) : (
              <div className="space-y-3">
                {dateSpecificSlots.map(slot => (
                  <div key={slot.id} className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                          <TimePicker
                            value={slot.slotFrom || ''}
                            onChange={(val) => updateSlot(slot.id, 'slotFrom', val)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                          <TimePicker
                            value={slot.slotTo || ''}
                            onChange={(val) => updateSlot(slot.id, 'slotTo', val)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={slot.price || ''}
                            onChange={(e) => updateSlot(slot.id, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Applies to Dates:</label>
                      <div className="flex flex-wrap gap-2">
                        {(slot.dates || []).map(dateString => (
                          <span
                            key={dateString}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-2"
                          >
                            {new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <button
                              type="button"
                              onClick={() => removeDateFromSlot(slot.id, dateString)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-2">
                        <input
                          type="date"
                          onChange={(e) => {
                            if (e.target.value && !slot.dates.includes(e.target.value)) {
                              addDateToSlot(slot.id, e.target.value);
                            }
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-green-500"
                          placeholder="Add more dates"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TimePicker = ({ value, onChange, className }) => {
  // Parse 24h time to 12h
  const [hours, minutes] = (value || '09:00').split(':');
  let h = parseInt(hours, 10);
  const m = minutes;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'

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
        {/* Allow explicit text input for minute if needed? Custom input maybe better. But for now steps of 15 are common for bookings, but let's do 5 min steps just in case */}
        {Array.from({ length: 60 / 5 }, (_, i) => (i * 5).toString().padStart(2, '0')).map(min => (
          !['00', '15', '30', '45'].includes(min) && <option key={min} value={min}>{min}</option>
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

export default SlotCalendar;

