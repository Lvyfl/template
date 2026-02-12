'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { eventsAPI } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  adminName?: string;
  departmentName?: string;
}

export default function CalendarSection() {
  const { theme } = useTheme();
  const d = theme === 'dark';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', eventDate: '', endDate: '', location: '' });
  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthName = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();

  const loadEvents = useCallback(async () => {
    try {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      const res = await eventsAPI.getEvents({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        allDepartments: true,
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Calendar grid computation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({ day, isCurrentMonth: false, date: new Date(currentYear, currentMonth - 1, day) });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(currentYear, currentMonth, i) });
    }

    // Next month leading days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, i) });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Events map by date key
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(e => {
      const key = new Date(e.eventDate).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Upcoming events (today and future)
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5);
  }, [events, today]);

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.eventDate) return;
    setSubmitting(true);
    try {
      await eventsAPI.createEvent(newEvent);
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', eventDate: '', endDate: '', location: '' });
      loadEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const hasEvents = (date: Date) => eventsByDate.has(date.toDateString());

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* School Calendar Card */}
      <div className={`rounded-2xl p-5 ${d ? 'bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} transition-colors duration-300`}>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className={`p-1.5 rounded-lg transition-colors ${d ? 'hover:bg-white/10 text-orange-400' : 'hover:bg-orange-200 text-orange-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className={`text-sm font-bold uppercase tracking-widest ${d ? 'text-orange-400' : 'text-orange-700'}`}>
            School Calendar
          </h3>
          <button onClick={nextMonth} className={`p-1.5 rounded-lg transition-colors ${d ? 'hover:bg-white/10 text-orange-400' : 'hover:bg-orange-200 text-orange-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Month / Year */}
        <div className="text-center mb-4">
          <p className={`text-2xl font-extrabold tracking-wide ${d ? 'text-white' : 'text-gray-900'}`}>{monthName}</p>
          <p className={`text-lg font-semibold ${d ? 'text-orange-400' : 'text-orange-600'}`}>{currentYear}</p>
        </div>

        {/* Add Event + Time */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          >
            Add Event
          </button>
          <span className={`text-xs font-mono ${d ? 'text-orange-300/60' : 'text-orange-600/60'}`}>{timeStr} PHT</span>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className={`text-center text-xs font-bold py-1 ${d ? 'text-orange-400/70' : 'text-orange-600/70'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, i) => {
            const dayEvents = eventsByDate.get(item.date.toDateString()) || [];
            const showDot = dayEvents.length > 0 && !isToday(item.date);
            return (
              <div
                key={i}
                className={`relative group/day flex items-center justify-center h-8 rounded-full text-xs font-medium transition-all
                  ${!item.isCurrentMonth
                    ? d ? 'text-gray-600' : 'text-gray-300'
                    : isToday(item.date)
                      ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/30 cursor-pointer'
                      : dayEvents.length > 0
                        ? d ? 'text-gray-200 hover:bg-white/10 cursor-pointer' : 'text-gray-700 hover:bg-orange-100 cursor-pointer'
                        : d ? 'text-gray-200' : 'text-gray-700'
                  }
                `}
              >
                {item.day}
                {showDot && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-orange-400" />
                )}
                {/* Hover tooltip for events */}
                {dayEvents.length > 0 && item.isCurrentMonth && (
                  <div className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover/day:opacity-100 group-hover/day:visible transition-all duration-200 pointer-events-none
                    ${d ? 'bg-gray-900 border border-orange-500/30' : 'bg-white border border-gray-200 shadow-xl'}
                  `}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${d ? 'text-orange-400' : 'text-orange-600'}`}>
                      {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={`rounded-lg p-2 ${d ? 'bg-white/5' : 'bg-orange-50'}`}>
                          <p className={`text-xs font-semibold truncate ${d ? 'text-white' : 'text-gray-900'}`}>{ev.title}</p>
                          {ev.location && (
                            <p className={`text-[10px] mt-0.5 ${d ? 'text-gray-400' : 'text-gray-500'}`}>📍 {ev.location}</p>
                          )}
                          {ev.description && (
                            <p className={`text-[10px] mt-0.5 truncate ${d ? 'text-gray-500' : 'text-gray-400'}`}>{ev.description}</p>
                          )}
                          <p className={`text-[10px] mt-0.5 ${d ? 'text-orange-400/60' : 'text-orange-500/70'}`}>
                            {new Date(ev.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className={`text-[10px] text-center ${d ? 'text-gray-500' : 'text-gray-400'}`}>+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                    {/* Tooltip arrow */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${d ? 'bg-gray-900 border-r border-b border-orange-500/30' : 'bg-white border-r border-b border-gray-200'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events Card */}
      <div className={`rounded-2xl p-5 ${d ? 'bg-gradient-to-br from-orange-900/30 to-amber-900/20 border border-orange-500/20' : 'bg-white border border-orange-200 shadow-sm'} transition-colors duration-300`}>
        <div className="mb-4">
          <h3 className={`text-sm font-bold uppercase tracking-widest ${d ? 'text-orange-400' : 'text-orange-700'}`}>
            Upcoming Events
          </h3>
          <p className={`text-xs mt-1 ${d ? 'text-orange-300/50' : 'text-orange-500/70'}`}>
            TODAY: {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-3 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500/30 border-t-orange-500"></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className={`flex items-center justify-center py-10 ${d ? 'text-gray-500' : 'text-gray-400'}`}>
              <p className="text-sm">No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div
                key={event.id}
                className={`rounded-xl p-3 transition-colors ${d ? 'bg-white/5 border border-orange-500/10 hover:border-orange-500/30' : 'bg-orange-50 border border-orange-100 hover:border-orange-300'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex flex-col items-center justify-center text-center ${d ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <span className={`text-[10px] font-bold uppercase ${d ? 'text-orange-400' : 'text-orange-600'}`}>
                      {new Date(event.eventDate).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className={`text-sm font-bold leading-none ${d ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(event.eventDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${d ? 'text-white' : 'text-gray-900'}`}>{event.title}</p>
                    {event.location && (
                      <p className={`text-xs mt-0.5 ${d ? 'text-gray-400' : 'text-gray-500'}`}>📍 {event.location}</p>
                    )}
                    {event.departmentName && (
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${d ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                        {event.departmentName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Card (Vision/Mission style) */}
      <div className="space-y-4">
        <div className={`rounded-2xl p-5 ${d ? 'bg-gradient-to-br from-orange-600/20 to-orange-500/10 border border-orange-500/20' : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg'} transition-colors duration-300`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-lg ${d ? '' : 'opacity-90'}`}>📢</span>
            <h3 className={`text-sm font-bold uppercase tracking-widest ${d ? 'text-orange-400' : 'text-white'}`}>
              Announcements
            </h3>
          </div>
          <p className={`text-xs leading-relaxed ${d ? 'text-gray-300' : 'text-white/90'}`}>
            Stay updated with the latest events and announcements from all departments. Use the calendar to track important dates and deadlines.
          </p>
        </div>

        <div className={`rounded-2xl p-5 ${d ? 'bg-gradient-to-br from-amber-600/20 to-orange-500/10 border border-orange-500/20' : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg'} transition-colors duration-300`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-lg ${d ? '' : 'opacity-90'}`}>📋</span>
            <h3 className={`text-sm font-bold uppercase tracking-widest ${d ? 'text-orange-400' : 'text-white'}`}>
              Quick Stats
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`text-center rounded-lg p-2 ${d ? 'bg-white/5' : 'bg-white/20'}`}>
              <p className={`text-xl font-bold ${d ? 'text-white' : 'text-white'}`}>{events.length}</p>
              <p className={`text-[10px] uppercase ${d ? 'text-gray-400' : 'text-white/70'}`}>This Month</p>
            </div>
            <div className={`text-center rounded-lg p-2 ${d ? 'bg-white/5' : 'bg-white/20'}`}>
              <p className={`text-xl font-bold ${d ? 'text-white' : 'text-white'}`}>{upcomingEvents.length}</p>
              <p className={`text-[10px] uppercase ${d ? 'text-gray-400' : 'text-white/70'}`}>Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div
            className={`w-full max-w-md rounded-2xl p-6 ${d ? 'bg-gray-900 border border-orange-500/20' : 'bg-white shadow-2xl'}`}
            onClick={e => e.stopPropagation()}
          >
            <h3 className={`text-lg font-bold mb-4 ${d ? 'text-white' : 'text-gray-900'}`}>Add New Event</h3>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${d ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${d ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${d ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm resize-none h-20 ${d ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${d ? 'text-gray-300' : 'text-gray-700'}`}>Start Date *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.eventDate}
                    onChange={e => setNewEvent(p => ({ ...p, eventDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${d ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${d ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={e => setNewEvent(p => ({ ...p, endDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${d ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${d ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${d ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Event location"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${d ? 'text-gray-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={submitting || !newEvent.title || !newEvent.eventDate}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
