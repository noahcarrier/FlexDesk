import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './BaseWidget.css';

interface BaseWidgetProps {
  title: string;
  icon: string;
  children: ReactNode;
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
  expandedContent?: ReactNode;
  className?: string;
}

export default function BaseWidget({ 
  title, 
  icon, 
  children, 
  onExpand, 
  isExpanded = false, 
  onClose, 
  expandedContent,
  className = '' 
}: BaseWidgetProps) {
  return (
    <>
      {/* Widget container */}
      <div className={`base-widget ${className}`} onClick={onExpand}>
        <div className="widget-header">
          <div className="widget-icon">{icon}</div>
          <div className="widget-title">{title}</div>
        </div>
        <div className="widget-body">
          {children}
        </div>
        {onExpand && (
          <div className="widget-expand-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,3 21,3 21,9"></polyline>
              <polyline points="9,21 3,21 3,15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </div>
        )}
      </div>      {/* Expanded modal */}
      {isExpanded && createPortal(
        <div className="widget-modal-overlay" onClick={onClose}>
          <div className="widget-modal-container" onClick={e => e.stopPropagation()}>
            <div className="widget-modal-header">
              <div className="widget-modal-title">
                <span className="widget-modal-icon">{icon}</span>
                {title}
              </div>
              <button className="widget-modal-close" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="widget-modal-content">
              {expandedContent || children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
