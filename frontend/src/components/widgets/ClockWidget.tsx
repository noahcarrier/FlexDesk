import { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import './ClockWidget.css';

interface ClockWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

export default function ClockWidget({ onExpand, isExpanded, onClose }: ClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('local');

  const timezones = [
    { id: 'local', name: 'Local Time', offset: 0 },
    { id: 'utc', name: 'UTC', offset: 0 },
    { id: 'est', name: 'Eastern (EST)', offset: -5 },
    { id: 'pst', name: 'Pacific (PST)', offset: -8 },
    { id: 'gmt', name: 'London (GMT)', offset: 0 },
    { id: 'cet', name: 'Central Europe', offset: 1 },
    { id: 'jst', name: 'Tokyo (JST)', offset: 9 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeForTimezone = (timezone: string, baseTime: Date) => {
    if (timezone === 'local') return baseTime;
    
    const tz = timezones.find(t => t.id === timezone);
    if (!tz) return baseTime;
    
    const utc = baseTime.getTime() + (baseTime.getTimezoneOffset() * 60000);
    return new Date(utc + (tz.offset * 3600000));
  };

  const displayTime = getTimeForTimezone(selectedTimezone, currentTime);
  const timeString = displayTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: isExpanded ? '2-digit' : undefined
  });
  const dateString = displayTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const widgetContent = (
    <div className="clock-widget-content">
      <div className="clock-time">{timeString}</div>
      <div className="clock-date">{dateString}</div>
    </div>
  );

  const expandedContent = (
    <div className="clock-expanded">
      <div className="timezone-selector">
        <label htmlFor="timezone">Select Timezone:</label>
        <select 
          id="timezone"
          value={selectedTimezone} 
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="timezone-select"
        >
          {timezones.map(tz => (
            <option key={tz.id} value={tz.id}>{tz.name}</option>
          ))}
        </select>
      </div>
        <div className="world-clocks">
        {timezones.slice(0, 6).map(tz => {
          const tzTime = getTimeForTimezone(tz.id, currentTime);
          return (
            <div key={tz.id} className="world-clock-item">
              <div className="world-clock-name">{tz.name}</div>
              <div className="world-clock-time">
                {tzTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="current-display">
        <div className="large-time">{timeString}</div>
        <div className="large-date">{dateString}</div>
        <div className="timezone-name">
          {timezones.find(t => t.id === selectedTimezone)?.name}
        </div>
      </div>
    </div>
  );

  return (
    <BaseWidget
      title="Clock"
      icon="⏰"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
      className="clock-widget"
    >
      {widgetContent}
    </BaseWidget>
  );
}
