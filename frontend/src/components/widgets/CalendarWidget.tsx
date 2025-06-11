import React, { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import './CalendarWidget.css';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  color: string;
}

interface CalendarWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

export default function CalendarWidget({ onExpand, isExpanded, onClose }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: '',
    color: '#4A90E2'
  });

  // Helper function
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      }
    }
  }, []);

  // Calculate today's data
  const today = new Date();
  const todayString = formatDate(today);
  const todayEvents = events.filter(event => event.date === todayString);

  const addEvent = () => {
    if (!newEvent.title.trim()) {
      alert('Please enter an event title');
      return;
    }
    
    if (!newEvent.time) {
      alert('Please enter an event time');
      return;
    }

    try {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title.trim(),
        date: formatDate(selectedDate),
        time: newEvent.time,
        description: newEvent.description || '',
        color: newEvent.color
      };

      const updatedEvents = [...events, event];
      setEvents(updatedEvents);
      localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
      
      setNewEvent({
        title: '',
        time: '',
        description: '',
        color: '#4A90E2'
      });
      
      setShowEventForm(false);
      
    } catch (error) {
      console.error('Error adding event:', error);
      alert('There was an error adding the event. Please try again.');
    }
  };

  const deleteEvent = (eventId: string) => {
    try {
      const updatedEvents = events.filter(event => event.id !== eventId);
      setEvents(updatedEvents);
      localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return formatDate(date) === todayString;
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return formatDate(date) === formatDate(selectedDate);
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => event.date === formatDate(date));
  };

  // Widget content that should match the other widgets' layout
  const widgetContent = (
    <div className="calendar-widget-content">
      <div className="calendar-date-display">
        <div className="calendar-day-number">{today.getDate()}</div>
        <div className="calendar-month-name">{today.toLocaleDateString('en-US', { month: 'short' })}</div>
      </div>
      <div className="calendar-info">
        <div className="calendar-events-count">
          {todayEvents.length} events today
        </div>
        {todayEvents.length > 0 && (
          <div className="calendar-next-event">
            Next: {todayEvents[0].time} - {todayEvents[0].title}
          </div>
        )}
      </div>
    </div>
  );

  const expandedContent = (
    <div className="calendar-expanded">
      <div className="calendar-header">
        <button onClick={() => navigateMonth('prev')} className="nav-btn">
          ‹
        </button>
        <h3>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => navigateMonth('next')} className="nav-btn">
          ›
        </button>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {getDaysInMonth(currentDate).map((date, index) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <span className="day-number">{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="event-indicators">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className="event-dot"
                            style={{ backgroundColor: event.color }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="selected-date-events">
        <div className="events-header">
          <h4>Events for {selectedDate.toLocaleDateString()}</h4>
          <button onClick={() => setShowEventForm(true)} className="add-event-btn">+ Add Event</button>
        </div>
        
        {getEventsForDate(selectedDate).map(event => (
          <div key={event.id} className="event-item" style={{ borderLeft: `4px solid ${event.color}` }}>
            <div className="event-info">
              <div className="event-title">{event.title}</div>
              <div className="event-time">{event.time}</div>
              {event.description && <div className="event-description">{event.description}</div>}
            </div>
            <button onClick={() => deleteEvent(event.id)} className="delete-event-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
              </svg>
            </button>
          </div>
        ))}
        
        {getEventsForDate(selectedDate).length === 0 && (
          <div className="no-events-selected">No events for this date</div>
        )}
      </div>

      {showEventForm && (
        <div className="event-form-overlay">
          <div className="event-form">
            <h4>Add New Event</h4>
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
            />
            <textarea
              placeholder="Description (optional)"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            />
            <select
              value={newEvent.color}
              onChange={(e) => setNewEvent({...newEvent, color: e.target.value})}
            >
              <option value="#4A90E2">Blue</option>
              <option value="#50E3C2">Teal</option>
              <option value="#F5A623">Orange</option>
              <option value="#D0021B">Red</option>
              <option value="#7ED321">Green</option>
              <option value="#9013FE">Purple</option>
            </select>
            <div className="form-buttons">
              <button onClick={() => setShowEventForm(false)} className="cancel-btn">Cancel</button>
              <button onClick={addEvent} className="save-btn">Save Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BaseWidget
      title="📅 Calendar"
      icon="📅"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
    >
      {widgetContent}
    </BaseWidget>
  );
}
