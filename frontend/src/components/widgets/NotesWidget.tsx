import { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import './NotesWidget.css';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

export default function NotesWidget({ onExpand, isExpanded, onClose }: NotesWidgetProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('flexdesk-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('flexdesk-notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        title: editTitle || 'Untitled Note',
        content: editContent,
        updatedAt: new Date()
      };
      setNotes(notes.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
      setIsEditing(false);
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const selectNote = (note: Note) => {
    if (isEditing) {
      saveNote();
    }
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const recentNote = notes[0];

  const widgetContent = (
    <div className="notes-widget-content">
      <div className="notes-summary">
        <div className="notes-count">{notes.length}</div>
        <div className="notes-label">notes</div>
      </div>
      {recentNote && (
        <div className="notes-preview">
          <div className="note-preview-title">
            {recentNote.title.length > 15 ? recentNote.title.substring(0, 15) + '...' : recentNote.title}
          </div>
          <div className="note-preview-content">
            {recentNote.content.length > 30 ? recentNote.content.substring(0, 30) + '...' : recentNote.content || 'Empty note'}
          </div>
        </div>
      )}
    </div>
  );

  const expandedContent = (
    <div className="notes-expanded">
      <div className="notes-header">
        <button onClick={createNewNote} className="new-note-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Note
        </button>
      </div>

      <div className="notes-container">
        <div className="notes-sidebar">
          <div className="notes-list">
            {notes.map(note => (
              <div 
                key={note.id} 
                className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                onClick={() => selectNote(note)}
              >
                <div className="note-item-header">
                  <div className="note-item-title">{note.title}</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="note-delete-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="note-item-preview">
                  {note.content.substring(0, 50) || 'Empty note'}
                  {note.content.length > 50 && '...'}
                </div>
                <div className="note-item-date">
                  {note.updatedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="notes-empty">
                <p>No notes yet. Create your first note!</p>
              </div>
            )}
          </div>
        </div>

        <div className="notes-editor">
          {selectedNote ? (
            <div className="editor-container">
              <div className="editor-header">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="note-title-input"
                    placeholder="Note title..."
                  />
                ) : (
                  <h2 className="note-title">{selectedNote.title}</h2>
                )}
                <div className="editor-actions">
                  {isEditing ? (
                    <button onClick={saveNote} className="save-btn">Save</button>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="note-content-input"
                  placeholder="Write your note here..."
                />
              ) : (
                <div className="note-content">
                  {selectedNote.content || 'This note is empty. Click Edit to add content.'}
                </div>
              )}
              
              <div className="note-meta">
                Created: {selectedNote.createdAt.toLocaleString()}<br/>
                Updated: {selectedNote.updatedAt.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="no-note-selected">
              <p>Select a note to view or edit it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BaseWidget
      title="Notes"
      icon="📝"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
      className="notes-widget"
    >
      {widgetContent}
    </BaseWidget>
  );
}
