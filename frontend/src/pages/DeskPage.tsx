import React, { useState, useEffect } from 'react';
import '../styles/DeskPage.css';
import ClockWidget from '../components/widgets/ClockWidget';
import CalculatorWidget from '../components/widgets/CalculatorWidget';
import TodoWidget from '../components/widgets/TodoWidget';
import NotesWidget from '../components/widgets/NotesWidget';
import WeatherWidget from '../components/widgets/WeatherWidget';
import TimerWidget from '../components/widgets/TimerWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import ContactsWidget from '../components/widgets/ContactsWidget';

// Define widget types
type WidgetType = 'calendar' | 'calculator' | 'todo' | 'notes' | 'weather' | 'clock' | 'timer' | 'contacts';

// Widget option interface
interface WidgetOption {
  type: WidgetType;
  name: string;
  icon: string;
  description: string;
}

// Available widgets
const WIDGET_OPTIONS: WidgetOption[] = [
  { 
    type: 'calendar', 
    name: 'Calendar', 
    icon: '📅',
    description: 'Track events and appointments'
  },
  { 
    type: 'calculator', 
    name: 'Calculator', 
    icon: '🧮',
    description: 'Perform quick calculations' 
  },
  { 
    type: 'todo', 
    name: 'To-Do List', 
    icon: '✓',
    description: 'Manage your tasks and priorities' 
  },
  { 
    type: 'notes', 
    name: 'Notes', 
    icon: '📝',
    description: 'Capture ideas and information' 
  },
  { 
    type: 'weather', 
    name: 'Weather', 
    icon: '☁️',
    description: 'Current conditions and forecast' 
  },
  { 
    type: 'clock', 
    name: 'Clock', 
    icon: '⏰',
    description: 'Time across multiple zones' 
  },
  {
    type: 'timer',
    name: 'Timer',
    icon: '⏱️',
    description: 'Track work sessions and breaks'
  },
  {
    type: 'contacts',
    name: 'Contacts',
    icon: '👤',
    description: 'Quick access to key contacts'
  }
];

export default function DeskPage() {
  // State to track which box was clicked
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
  // State to show/hide widget selection modal
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  // State to track widget placements (12 empty slots initially)
  const [widgets, setWidgets] = useState<Array<WidgetType | null>>(Array(12).fill(null));
  // State to track if we're in management mode
  const [isManageMode, setIsManageMode] = useState(false);
  // State for drag operation
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // State to track the next available empty position
  const [nextEmptyIndex, setNextEmptyIndex] = useState<number>(0);
  // State to track expanded widgets
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  
  // Find the next empty index whenever widgets change
  useEffect(() => {
    // In manage mode, we don't need to update the next empty index
    if (isManageMode) return;
    
    const index = widgets.findIndex(widget => widget === null);
    setNextEmptyIndex(index !== -1 ? index : -1); // -1 means all slots are filled
  }, [widgets, isManageMode]);
  
  // Toggle manage mode
  const toggleManageMode = () => {
    setIsManageMode(!isManageMode);
    // If closing manage mode, also reset any other states as needed
    if (isManageMode) {
      setDragIndex(null);
      
      // When exiting manage mode, recalculate the next empty index
      const index = widgets.findIndex(widget => widget === null);
      setNextEmptyIndex(index !== -1 ? index : -1);
    }
  };
    // Handle widget expansion
  const handleWidgetExpand = (widgetId: string) => {
    setExpandedWidget(widgetId);
  };

  const handleWidgetClose = () => {
    setExpandedWidget(null);
  };

  // Render the appropriate widget component
  const renderWidget = (widget: WidgetType, index: number) => {
    const widgetId = `${widget}-${index}`;
    const isExpanded = expandedWidget === widgetId;
    
    switch (widget) {
      case 'clock':
        return (
          <ClockWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      case 'calculator':
        return (
          <CalculatorWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      case 'todo':
        return (
          <TodoWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      case 'notes':
        return (
          <NotesWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      case 'weather':
        return (
          <WeatherWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      case 'timer':        return (
          <TimerWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      case 'calendar':
        return (
          <CalendarWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      case 'contacts':
        return (
          <ContactsWidget
            onExpand={() => handleWidgetExpand(widgetId)}
            isExpanded={isExpanded}
            onClose={handleWidgetClose}
          />
        );
      default:
        return (
          <div className="widget-content">
            <div className="widget-icon">
              {WIDGET_OPTIONS.find(opt => opt.type === widget)?.icon}
            </div>
            <div className="widget-name">
              {WIDGET_OPTIONS.find(opt => opt.type === widget)?.name}
            </div>
          </div>
        );
    }
  };

  // Handle widget box click
  const handleBoxClick = (index: number) => {
    if (isManageMode) return; // Don't open modal in manage mode
    
    // Only allow clicking on the next empty box
    if (!widgets[index] && index === nextEmptyIndex) {
      setSelectedBoxIndex(index);
      setShowWidgetModal(true);
    }
  };

  // Handle widget selection
  const handleWidgetSelect = (widgetType: WidgetType) => {
    if (selectedBoxIndex !== null) {
      const newWidgets = [...widgets];
      newWidgets[selectedBoxIndex] = widgetType;
      setWidgets(newWidgets);
      setShowWidgetModal(false);
      setSelectedBoxIndex(null);
      
      // Next empty position will be updated via useEffect
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowWidgetModal(false);
    setSelectedBoxIndex(null);
  };
  
  // Handle widget deletion
  const handleDeleteWidget = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent box click
    const newWidgets = [...widgets];
    newWidgets[index] = null;
    setWidgets(newWidgets);
  };
  
  // Drag start handler
  const handleDragStart = (index: number) => {
    if (!isManageMode) return;
    setDragIndex(index);
  };
    // Drag over handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };
    // Drop handler - swap widgets
  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || !isManageMode) return;
    
    const newWidgets = [...widgets];
    const draggedWidget = newWidgets[dragIndex];
    newWidgets[dragIndex] = newWidgets[targetIndex];
    newWidgets[targetIndex] = draggedWidget;
    
    setWidgets(newWidgets);
    setDragIndex(null);
  };

  // Determine if a widget box should be visible
  const isBoxVisible = (index: number, widget: WidgetType | null) => {
    // In manage mode, all boxes are visible
    if (isManageMode) return true;
    
    // If this box has a widget, it's visible
    if (widget !== null) return true;
    
    // If this is the next empty box, it's visible
    if (index === nextEmptyIndex) return true;
    
    // Otherwise, hide it
    return false;
  };

  return (
    <div className="desk-container">
      <div className="desk-header-container">
        <h1 className="desk-header">Your Desk</h1>
        
        <button 
          className={`manage-desk-button ${isManageMode ? 'manage-active' : ''}`}
          onClick={toggleManageMode}
        >
          {isManageMode ? 'Done' : 'Manage Desk'}
        </button>
      </div>
      
      <div className="widget-grid">
        {widgets.map((widget, index) => (
          <div 
            key={index} 
            className={`widget-box ${isManageMode ? 'widget-jiggle' : ''} ${!isBoxVisible(index, widget) ? 'widget-hidden' : ''}`}
            onClick={() => handleBoxClick(index)}
            draggable={isManageMode && widget !== null}            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            {isManageMode && widget && (
              <button 
                className="widget-delete-button" 
                onClick={(e) => handleDeleteWidget(index, e)}
                aria-label="Delete widget"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path 
                    d="M18 6L6 18M6 6l12 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
              {!widget ? (
              <div className="add-widget-icon">
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <div className="add-widget-text">Add Widget</div>
              </div>
            ) : (
              renderWidget(widget, index)
            )}
          </div>
        ))}
      </div>

      {showWidgetModal && (
        <div className="widget-modal-overlay" onClick={handleCloseModal}>
          <div className="widget-modal" onClick={e => e.stopPropagation()}>
            <h2 className="widget-modal-header">Select a Widget</h2>
            <div className="widget-list">
              {WIDGET_OPTIONS.map((widget, index) => (
                <div 
                  key={index} 
                  className="widget-option"
                  onClick={() => handleWidgetSelect(widget.type)}
                >
                  <div className="widget-option-icon">{widget.icon}</div>
                  <div className="widget-option-name">{widget.name}</div>
                  <div className="widget-option-description">{widget.description}</div>
                </div>
              ))}
            </div>
            <div className="widget-modal-buttons">
              <button 
                className="widget-modal-button cancel-button"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}