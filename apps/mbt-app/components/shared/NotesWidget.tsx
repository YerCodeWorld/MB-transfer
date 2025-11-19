"use client";

import { useState, useEffect } from 'react';
import { FaStickyNote, FaEye } from 'react-icons/fa';
import { Note } from './Notes';

interface NotesWidgetProps {
  selectedDate: string;
  onViewAll: () => void;
  className?: string;
}

const NotesWidget = ({ selectedDate, onViewAll, className = "" }: NotesWidgetProps) => {
  const [notes, setNotes] = useState<Note[]>([]);

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

  const getTagColor = (tag: string = 'general') => {
    switch (tag) {
      case 'important': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'reminder': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'meeting': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'todo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-accent-100 text-accent-800 dark:bg-accent-900/20 dark:text-accent-300';
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className={`bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FaStickyNote className="text-accent-500" />
          <h3 className="text-sm font-semibold text-navy-700 dark:text-white">
            Notas ({notes.length})
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-accent-600 hover:text-accent-700 hover:bg-accent-50 dark:text-accent-400 dark:hover:text-accent-300 dark:hover:bg-accent-900/20 rounded transition-colors"
        >
          <FaEye />
          Ver todas 
        </button>
      </div>

      {/* Notes Preview */}
      <div className="p-4">
        {notes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Aún no hay notas para esta fecha
            </p>
            <button
              onClick={onViewAll}
              className="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
            >
              Añade una primera nota
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="p-2 bg-gray-50 dark:bg-navy-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-medium text-navy-700 dark:text-white truncate">
                    {note.title}
                  </h4>
                  <span className={`px-1 py-0.5 rounded text-xs font-medium ${getTagColor(note.tag)}`}>
                    {note.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {truncateText(note.content, 60)}
                </p>
              </div>
            ))}
            {notes.length > 3 && (
              <button
                onClick={onViewAll}
                className="w-full text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 py-1"
              >
                +{notes.length - 3} more notes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesWidget;
