import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Edit3, 
  Volume2, 
  CheckCircle2, 
  Clock, 
  CircleDot,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function DayView({ 
  day, 
  onStartStudy, 
  onAddCard, 
  onEditCard, 
  onDeleteCard,
  onUpdateStatus,
  onDeleteDay
}) {
  const [filter, setFilter] = useState('all'); // all | learning | mastered | new

  const cards = day.cards || [];
  const masteredCount = cards.filter(c => c.status === 'mastered').length;
  const learningCount = cards.filter(c => c.status === 'learning').length;
  const newCount = cards.filter(c => !c.status || c.status === 'new').length;

  const filteredCards = cards.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'new') return !c.status || c.status === 'new';
    return c.status === filter;
  });

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Day Overview Banner */}
      <div className="bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2f2b28] rounded-2xl p-6 sm:p-8 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400 mb-1">
              <span className="uppercase tracking-widest font-semibold text-stone-700 dark:text-stone-300">Day {day.dayNumber}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {day.createdAt}
              </span>
            </div>
            <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 tracking-tight">
              {day.title || `Day ${day.dayNumber} Vocabulary`}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => onStartStudy(day)}
              disabled={cards.length === 0}
              className="px-4 py-2.5 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-40 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Study Deck ({cards.length})</span>
            </button>
            <button
              onClick={onAddCard}
              className="px-3.5 py-2.5 border border-stone-200 dark:border-[#38332e] hover:border-stone-300 dark:hover:border-stone-500 bg-stone-50 dark:bg-[#24211e] text-stone-800 dark:text-stone-200 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Word</span>
            </button>
            <button
              onClick={onDeleteDay}
              title="Delete this entire day session"
              className="p-2.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-stone-200 dark:border-[#38332e] rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-stone-100 dark:border-[#2f2b28] text-center">
          <div 
            onClick={() => setFilter(filter === 'mastered' ? 'all' : 'mastered')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filter === 'mastered' 
                ? 'border-stone-800 dark:border-stone-300 bg-stone-50 dark:bg-[#282522]' 
                : 'border-stone-100 dark:border-[#2a2623] hover:border-stone-200 dark:hover:border-[#38332e]'
            }`}
          >
            <span className="block text-xl font-serif text-stone-900 dark:text-stone-100 font-medium">{masteredCount}</span>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-stone-700 dark:text-stone-300" /> Mastered
            </span>
          </div>

          <div 
            onClick={() => setFilter(filter === 'learning' ? 'all' : 'learning')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filter === 'learning' 
                ? 'border-stone-800 dark:border-stone-300 bg-stone-50 dark:bg-[#282522]' 
                : 'border-stone-100 dark:border-[#2a2623] hover:border-stone-200 dark:hover:border-[#38332e]'
            }`}
          >
            <span className="block text-xl font-serif text-stone-900 dark:text-stone-100 font-medium">{learningCount}</span>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-stone-500 dark:text-stone-400" /> Learning
            </span>
          </div>

          <div 
            onClick={() => setFilter(filter === 'new' ? 'all' : 'new')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filter === 'new' 
                ? 'border-stone-800 dark:border-stone-300 bg-stone-50 dark:bg-[#282522]' 
                : 'border-stone-100 dark:border-[#2a2623] hover:border-stone-200 dark:hover:border-[#38332e]'
            }`}
          >
            <span className="block text-xl font-serif text-stone-900 dark:text-stone-100 font-medium">{newCount}</span>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <CircleDot className="w-3 h-3 text-stone-400 dark:text-stone-500" /> New
            </span>
          </div>
        </div>
      </div>

      {/* Cards List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400 px-1">
          <span>Words in this batch ({filteredCards.length})</span>
          {filter !== 'all' && (
            <button 
              onClick={() => setFilter('all')}
              className="text-stone-800 dark:text-stone-200 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1c1a18] rounded-2xl border border-stone-200 dark:border-[#2f2b28]">
            <p className="text-stone-400 dark:text-stone-500 text-sm font-serif">No flashcards found for this filter.</p>
            <button
              onClick={onAddCard}
              className="mt-3 text-xs font-mono text-stone-700 dark:text-stone-300 underline"
            >
              Add your first word
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredCards.map((card) => (
              <div 
                key={card.id}
                className="group bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2f2b28] hover:border-stone-400 dark:hover:border-stone-600 rounded-xl p-4 sm:p-5 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-serif font-medium text-stone-900 dark:text-stone-100 tracking-tight">
                        {card.word}
                      </h4>
                      <button
                        onClick={() => handleSpeak(card.word)}
                        title="Pronounce"
                        className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#282522]">
                        {card.partOfSpeech || 'word'}
                      </span>
                      <span className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded-full ${
                        card.status === 'mastered' 
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200' 
                          : card.status === 'learning'
                          ? 'bg-stone-100 dark:bg-[#282522] text-stone-600 dark:text-stone-400'
                          : 'bg-stone-50 dark:bg-[#1f1d1b] text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-[#38332e]'
                      }`}>
                        {card.status || 'new'}
                      </span>
                    </div>

                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
                      {card.definition}
                    </p>

                    {card.example && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                        "{card.example}"
                      </p>
                    )}

                    {card.mnemonic && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                        💡 <span className="text-stone-700 dark:text-stone-300">{card.mnemonic}</span>
                      </p>
                    )}

                    {card.synonyms && card.synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center pt-1">
                        <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500">Synonyms:</span>
                        {card.synonyms.map((s, i) => (
                          <span key={i} className="text-[11px] font-mono text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-[#282522] px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {card.antonyms && card.antonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center pt-0.5">
                        <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500">Antonyms:</span>
                        {card.antonyms.map((a, i) => (
                          <span key={i} className="text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#201d1a] border border-stone-200 dark:border-[#38332e] px-1.5 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Individual Card Actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditCard(card)}
                      title="Edit Card"
                      className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded hover:bg-stone-100 dark:hover:bg-[#282522] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      title="Delete Card"
                      className="p-1.5 text-stone-400 hover:text-red-700 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
