import { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import './TodoWidget.css';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

export default function TodoWidget({ onExpand, isExpanded, onClose }: TodoWidgetProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('flexdesk-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('flexdesk-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const widgetContent = (
    <div className="todo-widget-content">
      <div className="todo-summary">
        <div className="todo-count">{pendingTodos.length}</div>
        <div className="todo-label">pending</div>
      </div>
      {pendingTodos.length > 0 && (
        <div className="todo-preview">
          {pendingTodos.slice(0, 2).map(todo => (
            <div key={todo.id} className="todo-preview-item">
              • {todo.text.length > 20 ? todo.text.substring(0, 20) + '...' : todo.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const expandedContent = (
    <div className="todo-expanded">
      <div className="todo-input-section">
        <div className="todo-input-container">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="todo-input"
          />
          <button onClick={addTodo} className="todo-add-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="todo-stats">
        <span>{pendingTodos.length} pending</span>
        <span>{completedTodos.length} completed</span>
        {completedTodos.length > 0 && (
          <button onClick={clearCompleted} className="clear-completed-btn">
            Clear Completed
          </button>
        )}
      </div>

      <div className="todo-lists">
        {pendingTodos.length > 0 && (
          <div className="todo-section">
            <h3>Pending Tasks</h3>
            <div className="todo-list">
              {pendingTodos.map(todo => (
                <div key={todo.id} className="todo-item">
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </button>
                  <span className="todo-text">{todo.text}</span>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="todo-delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTodos.length > 0 && (
          <div className="todo-section">
            <h3>Completed Tasks</h3>
            <div className="todo-list">
              {completedTodos.map(todo => (
                <div key={todo.id} className="todo-item completed">
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className="todo-checkbox checked"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </button>
                  <span className="todo-text">{todo.text}</span>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="todo-delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {todos.length === 0 && (
          <div className="todo-empty">
            <p>No tasks yet. Add one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BaseWidget
      title="To-Do List"
      icon="✓"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
      className="todo-widget"
    >
      {widgetContent}
    </BaseWidget>
  );
}
