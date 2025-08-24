import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DateRangePicker = ({ 
  onDateSelect, 
  onClose, 
  bookedDates = [], 
  minDate = new Date(),
  readOnly = false,
  title = "Select Date Range",
  className = "",
  showLegend = true 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getBookingForDate = (date) => {
    return bookedDates.find(booking => {
      const bookingStart = new Date(booking.bookedFrom);
      const bookingEnd = new Date(booking.bookedTill);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      const d = new Date(date);
      d.setHours(0,0,0,0);
      return d >= bookingStart && d <= bookingEnd;
    }) || null;
  };

  const isBooked = (date) => {
    return !!getBookingForDate(date);
  };

  const isBeforeMinDate = (date) => {
    const today = new Date(minDate);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDisabled = (date) => {
    return !readOnly && (isBooked(date) || isBeforeMinDate(date));
  };

  const isSelected = (date) => {
    return (selectedStartDate && date.getTime() === selectedStartDate.getTime()) ||
           (selectedEndDate && date.getTime() === selectedEndDate.getTime());
  };

  const isInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  };

  const handleDateClick = (date) => {
    if (readOnly || isDisabled(date)) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (date >= selectedStartDate) {
      // Set end date
      setSelectedEndDate(date);
    } else {
      // If selected date is before start date, make it the new start date
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    }
  };

  const handleConfirm = () => {
    if (selectedStartDate && selectedEndDate) {
      onDateSelect({
        from: selectedStartDate.toISOString(),
        till: selectedEndDate.toISOString()
      });
      onClose && onClose();
    }
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const booking = getBookingForDate(date);
      const booked = !!booking;
      const disabled = isDisabled(date);
      const selected = isSelected(date);
      const inRange = isInRange(date);

      const bgStyle = {};
      if (booked && booking?.color) {
        bgStyle.backgroundColor = booking.color;
      }

      const computedClasses = [
        'h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative',
        disabled && !booked && !readOnly ? 'cursor-not-allowed text-gray-300 bg-gray-100' : '',
        disabled && booked && !readOnly ? 'cursor-not-allowed text-white bg-red-500 hover:bg-red-600' : '',
        booked && readOnly ? 'shadow-md transform scale-105 text-white' : '',
        selected ? 'bg-purple-600 text-white shadow-lg scale-105' : '',
        inRange ? 'bg-purple-100 text-purple-700' : '',
        readOnly ? 'cursor-default' : 'hover:bg-purple-50 text-gray-700'
      ].filter(Boolean).join(' ');

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={disabled || readOnly}
          className={computedClasses}
          style={bgStyle}
          title={booked && readOnly ? `${booking?.itemName || 'Booked'} (${booking?.itemType || ''})` : ''}
        >
          {day}
          {booked && readOnly && (
            <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: booking?.color || '#fff' }} />
          )}
        </button>
      );
    }

    return days;
  };

  // If readOnly and used as embedded component (no modal)
  if (readOnly && !onClose) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h4 className="font-medium text-gray-800 min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <span className="text-gray-600">Booked (colored per item)</span>
                </div>
              </div>
            </div>
          )}

          {/* No bookings message */}
          {bookedDates.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No booking dates found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modal version for date selection or read-only modal
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl max-w-md w-full p-6"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-purple-100/50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-purple-600" />
          </button>
          <h4 className="text-lg font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-purple-100/50 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-purple-600" />
          </button>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {renderDays()}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex items-center justify-center gap-4 mb-4 text-xs">
            {!readOnly && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-600 rounded shadow-sm"></div>
                <span className="text-gray-700">Selected</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded shadow-sm"></div>
              <span className="text-gray-700">Booked</span>
            </div>
            {!readOnly && (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded shadow-sm"></div>
                  <span className="text-gray-700">Unavailable</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded shadow-sm"></div>
                  <span className="text-gray-700">Past Date</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Selected dates display */}
        {!readOnly && selectedStartDate && (
          <div className="text-center text-sm text-gray-700 mb-4 bg-white/30 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <span className="font-medium">
              From: {selectedStartDate.toLocaleDateString()}
              {selectedEndDate && ` - To: ${selectedEndDate.toLocaleDateString()}`}
            </span>
          </div>
        )}

        {/* Read-only booking info */}
        {readOnly && bookedDates.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Booking Details:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {bookedDates.map((booking, index) => (
                <div key={index} className="text-sm bg-white/30 backdrop-blur-sm rounded-lg p-2 border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: booking.color || '#ccc' }} />
                    <div>
                      <div className="font-medium text-gray-800">
                        {booking.itemName || `Booking ${index + 1}`}
                      </div>
                      <div className="text-gray-600">
                        {new Date(booking.bookedFrom).toLocaleDateString()} - {new Date(booking.bookedTill).toLocaleDateString()}
                      </div>
                      {booking.itemType && (
                        <div className="text-xs text-purple-600 capitalize">
                          {booking.itemType}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-white/30 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/50 transition-all duration-200"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
          )}
          {!readOnly && (
            <button
              onClick={handleConfirm}
              disabled={!selectedStartDate || !selectedEndDate}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              Confirm
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DateRangePicker;