import { useState, useEffect } from 'react';
import '../styles/HomePage.css';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Start the loading timer
    const loadingTimer = setTimeout(() => {
      // Start collapse animation
      setIsCollapsing(true);
      
      // Wait for collapse animation to complete, then show button
      const buttonTimer = setTimeout(() => {
        setShowButton(true);
        // We keep isLoading true so spinner stays in DOM until animation completes
      }, 800); // Match with animation duration
      
      return () => clearTimeout(buttonTimer);
    }, 5000);
    
    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <div className="container">
      <div className="logo">FlexDesk</div>
      
      <div 
        className={`spinner ${isCollapsing ? 'spinner-collapsing' : ''}`}
        style={{ display: showButton ? 'none' : 'block' }}
        aria-label="Loading"
      ></div>
      
      <button 
        className={`enter-button ${showButton ? 'enter-button-visible' : ''}`}
        onClick={() => console.log("Navigating to dashboard")}
        style={{ display: showButton ? 'block' : 'none' }}
      >
        Begin Your Journey
      </button>
    </div>
  );
}
