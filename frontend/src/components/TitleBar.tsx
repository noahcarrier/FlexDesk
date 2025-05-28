import { useState, useEffect } from 'react';
import '../styles/TitleBar.css';

// Define the Window API type
declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isMaximized: () => Promise<boolean>;
    }
  }
}

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Check and update maximized state
  const updateMaximizedState = async () => {
    if (window.electronAPI) {
      const maximized = await window.electronAPI.isMaximized();
      setIsMaximized(maximized);
    }
  };

  useEffect(() => {
    // Initial check
    updateMaximizedState();
    
    // Listen for window resize to update the maximize/restore button
    window.addEventListener('resize', updateMaximizedState);
    
    return () => {
      window.removeEventListener('resize', updateMaximizedState);
    };
  }, []);

  // Window control handlers
  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };
  
  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };
  
  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-drag-area">
        <div className="app-logo">F</div>
        <div className="app-title">FlexDesk</div>
      </div>
      
      <div className="window-controls">
        <button 
          className="window-control minimize" 
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          <svg width="11" height="1" viewBox="0 0 11 1">
            <path d="M11,1H0V0h11V1z" />
          </svg>
        </button>
        
        <button 
          className="window-control maximize" 
          onClick={handleMaximize}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            // Restore icon (two overlapping rectangles)
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2.1,0v2H0v8h8V8h2V0H2.1z M7,9H1V3h6V9z M9,7H8V2H3V1h6V7z" />
            </svg>
          ) : (
            // Maximize icon (single rectangle)
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" />
            </svg>
          )}
        </button>
        
        <button 
          className="window-control close" 
          onClick={handleClose}
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M10,1.01L8.99,0L5,3.99L1.01,0L0,1.01L3.99,5L0,8.99L1.01,10L5,6.01L8.99,10L10,8.99L6.01,5L10,1.01z" />
          </svg>
        </button>
      </div>
    </div>
  );
}