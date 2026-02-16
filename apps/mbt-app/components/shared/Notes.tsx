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
  FaCalendarAlt,
  FaSpinner
} from 'react-icons/fa';
import { apiClient } from '@/utils/api';
import { Note as NoteType } from '@/types/services';

interface NotesProps {
  selectedDate: string;
  className?: string;
}

interface NoteModalProps {
  note: NoteType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<NoteType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedDate: string;
}

const NoteModal = ({ note, isOpen, onClose, onSave, selectedDate }: NoteModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    caption: '',
    tag: 'REMINDER' as NoteType['tag'],
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
        caption: note.caption || '',
        tag: note.tag || 'REMINDER',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        caption: '',
        tag: 'REMINDER',
      });
    }
  }, [note, isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      onSave({
        ...formData,
        caption: formData.caption || undefined,
      });
      onClose();
    }
  }, [formData, onSave, onClose]);

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

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'EMERGENCY': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
      case 'IMPORTANT': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300';
      case 'REMINDER': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300';
      case 'MINOR': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
      case 'IDEA': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300';
      case 'SUGGESTION': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'text-accent-600 bg-accent-50 dark:bg-accent-900/20 dark:text-accent-300';
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center backdrop-blur-sm justify-center bg-black/50 p-4"
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
                {note ? 'Edición' : 'Nueva Nota'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Para el {new Date(selectedDate).toLocaleDateString('es-ES', {
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
              Título
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

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtítulo (opcional)
            </label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => handleFormChange('caption', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              placeholder="Note caption..."
            />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Etiqueta
            </label>
            <select
              value={formData.tag}
              onChange={(e) => handleFormChange('tag', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              <option value="REMINDER">Recordatorio</option>
              <option value="IMPORTANT">Importante</option>
              <option value="EMERGENCY">Emergencia</option>
              <option value="MINOR">Menor</option>
              <option value="IDEA">Idea</option>
              <option value="SUGGESTION">Sugerencia</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenido
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleFormChange('content', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              placeholder="Escribe tu nota aquí..."
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
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaSave />
              {note ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const Notes = ({ selectedDate, className = "" }: NotesProps) => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load notes for selected date
  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getNotes({ date: selectedDate });

      if (response.success && response.data) {
        setNotes(response.data);
      } else {
        setNotes([]);
      }
    } catch (err: any) {
      console.error('Error loading notes:', err);
      setError(err.message || 'Failed to load notes');
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: NoteType) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData: Omit<NoteType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // First, get the itinerary for this date
      const itineraryResponse = await apiClient.getItineraryByDate(selectedDate);
      let itineraryId: string | undefined;

      if (itineraryResponse.success && itineraryResponse.data) {
        itineraryId = itineraryResponse.data.id;
      }

      if (editingNote) {
        // Update existing note
        const response = await apiClient.updateNote(editingNote.id, noteData);

        if (response.success) {
          await loadNotes();
        } else {
          alert(response.message || 'Failed to update note');
        }
      } else {
        // Create new note
        const response = await apiClient.createNote({
          ...noteData,
          itineraryId,
        });

        if (response.success) {
          await loadNotes();
        } else {
          alert(response.message || 'Failed to create note');
        }
      }

      setEditingNote(null);
    } catch (err: any) {
      console.error('Error saving note:', err);
      alert(err.message || 'Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await apiClient.deleteNote(noteId);

        if (response.success) {
          await loadNotes();
        } else {
          alert(response.message || 'Failed to delete note');
        }
      } catch (err: any) {
        console.error('Error deleting note:', err);
        alert(err.message || 'Failed to delete note');
      }
    }
  };

  const getTagColor = (tag: string = 'REMINDER') => {
    switch (tag) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'IMPORTANT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'REMINDER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'MINOR': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'IDEA': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'SUGGESTION': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-accent-100 text-accent-800 dark:bg-accent-900/20 dark:text-accent-300';
    }
  };

  const getTagBorderColor = (tag: string = 'REMINDER') => {
    switch (tag) {
      case 'EMERGENCY': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'IMPORTANT': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'REMINDER': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
      case 'MINOR': return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      case 'IDEA': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/10';
      case 'SUGGESTION': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/10';
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
                Notas
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
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus />
            Nueva Nota
          </button>
        </div>

        {/* Notes List */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-4xl text-accent-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Cargando notas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadNotes}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                No hay notas para esta fecha. Haga click en &quot;Nueva Nota&quot; para empezar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 border-l-4 rounded-lg ${getTagBorderColor(note.tag)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-navy-700 dark:text-white">
                        {note.title}
                      </h4>
                      {note.caption && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {note.caption}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
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
                    {note.updatedAt !== note.createdAt ? 'Actualizada' : 'Creada'} {' el '}
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
