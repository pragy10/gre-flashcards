import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Layers } from 'lucide-react';

export default function DayModal({ isOpen, onClose, onCreateDay, nextDayNumber }) {
  const [dayNumber, setDayNumber] = useState(nextDayNumber);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateDay({
      id: `day-${Date.now()}`,
      dayNumber: Number(dayNumber),
      title: title.trim() || `Day ${dayNumber} Vocabulary`,
      createdAt: date,
      cards: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-md border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-stone-900">
            Start New Day Deck
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Day Number
            </label>
            <input
              type="number"
              min="1"
              required
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Title / Topic Focus (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Tone & Sentiment Words, GregMat Group 4..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 font-mono transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-900 border border-transparent rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 rounded-lg hover:bg-stone-800 transition-colors"
            >
              Create Day
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
