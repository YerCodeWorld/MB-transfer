"use client";

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaSave,
  FaStickyNote,
  FaCalendarAlt
} from 'react-icons/fa';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  priority?: 'low' | 'medium' | 'high';
  tag?: 'general' | 'important' | 'reminder' | 'meeting' | 'todo';
}

interface NotesProps {
  selectedDate: string;
  className?: string;
}

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedDate: string;
}

const NoteModal = ({ note, isOpen, onClose, onSave, selectedDate }: NoteModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as Note['priority'],
    tag: 'general' as Note['tag']
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        priority: note.priority || 'medium',
        tag: note.tag || 'general'
      });
    } else {
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        tag: 'general'
      });
    }
  }, [note, isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSave({
        ...formData,
        date: selectedDate
      });
      onClose();
    }
  }, [formData, selectedDate, onSave, onClose]);

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'important': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
      case 'reminder': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300';
      case 'meeting': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300';
      case 'todo': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'text-accent-600 bg-accent-50 dark:bg-accent-900/20 dark:text-accent-300';
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-navy-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FaStickyNote className="text-2xl text-accent-500" />
            <div>
              <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                {note ? 'Edit Note' : 'New Note'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                For {new Date(selectedDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              placeholder="Note title..."
              required
            />
          </div>

          {/* Priority and Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tag
              </label>
              <select
                value={formData.tag}
                onChange={(e) => handleFormChange('tag', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              >
                <option value="general">General</option>
                <option value="important">Important</option>
                <option value="reminder">Reminder</option>
                <option value="meeting">Meeting</option>
                <option value="todo">To Do</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleFormChange('content', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              placeholder="Write your note here..."
              required
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaSave />
              {note ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const Notes = ({ selectedDate, className = "" }: NotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load notes for selected date
  useEffect(() => {
    const loadNotes = () => {
      const notesKey = `mbt_notes_${selectedDate}`;
      const savedNotes = localStorage.getItem(notesKey);
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (error) {
          console.error('Error loading notes:', error);
          setNotes([]);
        }
      } else {
        setNotes([]);
      }
    };

    loadNotes();
  }, [selectedDate]);

  const saveNotesToStorage = (notesToSave: Note[]) => {
    const notesKey = `mbt_notes_${selectedDate}`;
    localStorage.setItem(notesKey, JSON.stringify(notesToSave));
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingNote) {
      // Update existing note
      const updatedNotes = notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData, updatedAt: now }
          : note
      );
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
    } else {
      // Create new note
      const newNote: Note = {
        ...noteData,
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
    }
    
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
    }
  };

  const getPriorityColor = (priority: string = 'medium') => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getTagColor = (tag: string = 'general') => {
    switch (tag) {
      case 'important': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'reminder': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'meeting': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'todo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-accent-100 text-accent-800 dark:bg-accent-900/20 dark:text-accent-300';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FaStickyNote className="text-xl text-accent-500" />
            <div>
              <h3 className="text-lg font-semibold text-navy-700 dark:text-white">
                Notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(selectedDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors"
          >
            <FaPlus />
            New Note
          </button>
        </div>

        {/* Notes List */}
        <div className="p-4">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                No notes for this date. Click &quot;New Note&quot; to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 border-l-4 rounded-lg ${getPriorityColor(note.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-navy-700 dark:text-white">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(note.tag)}`}>
                        {note.tag}
                      </span>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1 text-gray-500 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded transition-colors"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {note.updatedAt !== note.createdAt ? 'Updated' : 'Created'} {' '}
                    {new Date(note.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      <NoteModal
        note={editingNote}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Notes;