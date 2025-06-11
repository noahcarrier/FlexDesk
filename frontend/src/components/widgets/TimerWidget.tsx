import { useState, useEffect, useRef } from 'react';
import BaseWidget from './BaseWidget';
import './TimerWidget.css';

interface TimerWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

export default function TimerWidget({ onExpand, isExpanded, onClose }: TimerWidgetProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preset timers
  const presets = [
    { name: 'Pomodoro', minutes: 25, icon: '🍅' },
    { name: 'Short Break', minutes: 5, icon: '☕' },
    { name: 'Long Break', minutes: 15, icon: '🛋️' },
    { name: 'Deep Work', minutes: 45, icon: '🎯' },
  ];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Timer finished - could add notification here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(minutes * 60 + seconds);
  };

  const setPreset = (presetMinutes: number) => {
    setMinutes(presetMinutes);
    setSeconds(0);
    setTimeLeft(presetMinutes * 60);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((minutes * 60 + seconds - timeLeft) / (minutes * 60 + seconds)) * 100;

  const widgetContent = (
    <div className="timer-widget-content">
      <div className="timer-display-mini">{formatTime(timeLeft)}</div>
      <div className="timer-status">
        {isRunning ? 'Running' : timeLeft === 0 ? 'Finished' : 'Paused'}
      </div>
      <div className="timer-progress-mini">
        <div 
          className="timer-progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );

  const expandedContent = (
    <div className="timer-expanded">
      <div className="timer-presets">
        {presets.map((preset, index) => (
          <button
            key={index}
            onClick={() => setPreset(preset.minutes)}
            className={`preset-btn ${minutes === preset.minutes && seconds === 0 ? 'active' : ''}`}
          >
            <span className="preset-icon">{preset.icon}</span>
            <span className="preset-name">{preset.name}</span>
            <span className="preset-time">{preset.minutes}m</span>
          </button>
        ))}
      </div>

      <div className="timer-main">
        <div className="timer-circle">
          <svg className="timer-svg" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#4A90E2"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              transform="rotate(-90 50 50)"
              className="timer-progress-circle"
            />
          </svg>
          <div className="timer-display-large">{formatTime(timeLeft)}</div>
        </div>

        <div className="timer-controls">
          <button 
            onClick={isRunning ? pauseTimer : startTimer}
            className={`timer-btn ${isRunning ? 'pause' : 'start'}`}
          >
            {isRunning ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
            )}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button onClick={resetTimer} className="timer-btn reset">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"></polyline>
              <polyline points="1,20 1,14 7,14"></polyline>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10M22.94,14.36A9,9,0,0,1,3.51,15l4.64,4.36"></path>
            </svg>
            Reset
          </button>
        </div>

        <div className="timer-settings">
          <div className="time-inputs">
            <div className="input-group">
              <label>Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  const newMinutes = parseInt(e.target.value) || 0;
                  setMinutes(newMinutes);
                  if (!isRunning) {
                    setTimeLeft(newMinutes * 60 + seconds);
                  }
                }}
                disabled={isRunning}
                className="time-input"
              />
            </div>
            <div className="input-group">
              <label>Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => {
                  const newSeconds = parseInt(e.target.value) || 0;
                  setSeconds(newSeconds);
                  if (!isRunning) {
                    setTimeLeft(minutes * 60 + newSeconds);
                  }
                }}
                disabled={isRunning}
                className="time-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseWidget
      title="Timer"
      icon="⏱️"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
      className="timer-widget"
    >
      {widgetContent}
    </BaseWidget>
  );
}
