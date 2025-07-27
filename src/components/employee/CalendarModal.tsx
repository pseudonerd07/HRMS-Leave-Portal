import React, { useState } from 'react';
import { X, Calendar, Home, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { getCurrentUser, getLeaveRequests, getWFHRequests, saveWFHRequest, addNotification, getUsers } from '../../utils/storage';
import { CalendarEvent } from '../../types';

interface CalendarModalProps {
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [wfhReason, setWfhReason] = useState('');
  const [showWFHForm, setShowWFHForm] = useState(false);
  
  const currentUser = getCurrentUser();
  const leaveRequests = getLeaveRequests().filter(r => r.employeeId === currentUser?.id);
  const wfhRequests = getWFHRequests().filter(r => r.employeeId === currentUser?.id);

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number): CalendarEvent[] => {
    if (!day) return [];
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const events: CalendarEvent[] = [];
    
    // Add leave events
    leaveRequests.forEach(request => {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const checkDate = new Date(dateStr);
      
      if (checkDate >= startDate && checkDate <= endDate) {
        events.push({
          id: request.id,
          title: `${request.leaveType} Leave`,
          date: dateStr,
          type: 'leave',
          status: request.status
        });
      }
    });
    
    // Add WFH events
    wfhRequests.forEach(request => {
      if (request.date === dateStr) {
        events.push({
          id: request.id,
          title: 'Work From Home',
          date: dateStr,
          type: 'wfh',
          status: request.status
        });
      }
    });
    
    return events;
  };

  const handleWFHSubmit = async () => {
    if (!currentUser || !selectedDate || !wfhReason) return;

    const newWFHRequest = {
      id: Date.now().toString(),
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: selectedDate,
      reason: wfhReason,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    saveWFHRequest(newWFHRequest);

    // Add notification for manager
    const users = getUsers();
    const manager = users.find(u => u.id === currentUser.managerId);
    if (manager) {
      addNotification({
        id: Date.now().toString(),
        userId: manager.id,
        message: `New WFH request from ${currentUser.name} for ${selectedDate}`,
        type: 'info',
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    setShowWFHForm(false);
    setSelectedDate('');
    setWfhReason('');
  };

  const days = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar View</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button
              onClick={() => setShowWFHForm(true)}
              variant="primary"
              icon={Plus}
              size="sm"
            >
              Request WFH
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2 h-24"></div>;
              }

              const events = getEventsForDate(day);
              const isToday = day === new Date().getDate() && 
                           currentMonth === new Date().getMonth() && 
                           currentYear === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`p-2 h-24 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
                  }`}
                  onClick={() => setSelectedDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded text-white truncate ${
                          event.type === 'leave' 
                            ? event.status === 'approved' 
                              ? 'bg-green-500' 
                              : event.status === 'rejected' 
                                ? 'bg-red-500' 
                                : 'bg-yellow-500'
                            : event.status === 'approved'
                              ? 'bg-blue-500'
                              : 'bg-gray-500'
                        }`}
                      >
                        {event.type === 'wfh' ? <Home className="w-3 h-3 inline mr-1" /> : <Calendar className="w-3 h-3 inline mr-1" />}
                        {event.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Approved Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Pending Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Work From Home</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Rejected</span>
            </div>
          </div>
        </div>

        {/* WFH Request Form */}
        {showWFHForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Work From Home</h3>
                <button
                  onClick={() => setShowWFHForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={wfhReason}
                    onChange={(e) => setWfhReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Reason for working from home..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowWFHForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWFHSubmit}
                    variant="primary"
                    disabled={!selectedDate || !wfhReason}
                    className="flex-1"
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};