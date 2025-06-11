import { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import './ContactsWidget.css';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  favorite: boolean;
  avatar?: string;
  createdAt: Date;
}

interface ContactsWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

export default function ContactsWidget({ onExpand, isExpanded, onClose }: ContactsWidgetProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    favorite: false
  });

  // Load contacts from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('flexdesk-contacts');
    if (savedContacts) {
      const parsedContacts = JSON.parse(savedContacts).map((contact: any) => ({
        ...contact,
        createdAt: new Date(contact.createdAt)
      }));
      setContacts(parsedContacts);
    }
  }, []);

  // Save contacts to localStorage whenever contacts change
  useEffect(() => {
    localStorage.setItem('flexdesk-contacts', JSON.stringify(contacts));
  }, [contacts]);

  const favoriteContacts = contacts.filter(contact => contact.favorite).slice(0, 3);
  const totalContacts = contacts.length;

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const addContact = () => {
    if (newContact.name.trim()) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name.trim(),
        email: newContact.email.trim() || undefined,
        phone: newContact.phone.trim() || undefined,
        company: newContact.company.trim() || undefined,
        notes: newContact.notes.trim() || undefined,
        favorite: newContact.favorite,
        createdAt: new Date()
      };
      setContacts([contact, ...contacts]);
      resetForm();
    }
  };

  const updateContact = () => {
    if (editingContact && newContact.name.trim()) {
      const updatedContact: Contact = {
        ...editingContact,
        name: newContact.name.trim(),
        email: newContact.email.trim() || undefined,
        phone: newContact.phone.trim() || undefined,
        company: newContact.company.trim() || undefined,
        notes: newContact.notes.trim() || undefined,
        favorite: newContact.favorite
      };
      setContacts(contacts.map(contact => 
        contact.id === editingContact.id ? updatedContact : contact
      ));
      resetForm();
    }
  };

  const deleteContact = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
  };

  const toggleFavorite = (contactId: string) => {
    setContacts(contacts.map(contact =>
      contact.id === contactId 
        ? { ...contact, favorite: !contact.favorite }
        : contact
    ));
  };

  const startEditing = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      notes: contact.notes || '',
      favorite: contact.favorite
    });
    setShowContactForm(true);
  };

  const resetForm = () => {
    setNewContact({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
      favorite: false
    });
    setEditingContact(null);
    setShowContactForm(false);
  };

  const formatPhone = (phone: string): string => {
    // Simple phone number formatting
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const widgetContent = (
    <div className="contacts-widget-content">
      <div className="contacts-summary">
        <div className="total-contacts">
          <span className="contact-count">{totalContacts}</span>
          <span className="contact-label">Contact{totalContacts !== 1 ? 's' : ''}</span>
        </div>
        
        {favoriteContacts.length > 0 && (
          <div className="favorite-contacts">
            <div className="favorites-label">Favorites</div>
            <div className="favorite-list">
              {favoriteContacts.map(contact => (
                <div key={contact.id} className="favorite-contact">
                  <div className="contact-avatar">
                    {getInitials(contact.name)}
                  </div>
                  <span className="favorite-name">{contact.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const expandedContent = (
    <div className="contacts-expanded">
      {/* Header with Search and Add Button */}
      <div className="contacts-header">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="search-input"
            />
          </div>
        </div>
        <button 
          onClick={() => setShowContactForm(true)}
          className="add-contact-btn"
        >
          + Add Contact
        </button>
      </div>

      {/* Contacts List */}
      <div className="contacts-list">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div key={contact.id} className="contact-item">
              <div className="contact-avatar">
                {getInitials(contact.name)}
              </div>
              
              <div className="contact-details">
                <div className="contact-name">
                  {contact.name}
                  {contact.favorite && (
                    <svg className="favorite-star" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>
                  )}
                </div>
                
                {contact.company && (
                  <div className="contact-company">{contact.company}</div>
                )}
                
                <div className="contact-info">
                  {contact.email && (
                    <button 
                      className="contact-link email-link"
                      onClick={() => handleEmailClick(contact.email!)}
                      title={contact.email}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      {contact.email}
                    </button>
                  )}
                  
                  {contact.phone && (
                    <button 
                      className="contact-link phone-link"
                      onClick={() => handlePhoneClick(contact.phone!)}
                      title={contact.phone}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      {formatPhone(contact.phone)}
                    </button>
                  )}
                </div>
              </div>

              <div className="contact-actions">
                <button 
                  onClick={() => toggleFavorite(contact.id)}
                  className={`favorite-btn ${contact.favorite ? 'active' : ''}`}
                  title={contact.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={contact.favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                  </svg>
                </button>
                
                <button 
                  onClick={() => startEditing(contact)}
                  className="edit-btn"
                  title="Edit contact"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                
                <button 
                  onClick={() => deleteContact(contact.id)}
                  className="delete-btn"
                  title="Delete contact"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-contacts">
            {searchQuery ? 'No contacts found' : 'No contacts yet'}
          </div>
        )}
      </div>

      {/* Contact Form */}
      {showContactForm && (
        <div className="contact-form-overlay">
          <div className="contact-form">
            <div className="form-header">
              <h3>{editingContact ? 'Edit Contact' : 'Add Contact'}</h3>
              <button 
                onClick={resetForm}
                className="close-form-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="form-content">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Enter full name"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Add notes (optional)"
                  rows={3}
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newContact.favorite}
                    onChange={(e) => setNewContact({ ...newContact, favorite: e.target.checked })}
                  />
                  <span className="checkbox-text">Add to favorites</span>
                </label>
              </div>
              
              <div className="form-actions">
                <button onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button 
                  onClick={editingContact ? updateContact : addContact} 
                  className="save-btn"
                  disabled={!newContact.name.trim()}
                >
                  {editingContact ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BaseWidget
      title="Contacts"
      icon="👤"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
      className="contacts-widget"
    >
      {widgetContent}
    </BaseWidget>
  );
}
