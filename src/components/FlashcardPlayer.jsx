import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Check, 
  Clock, 
  Sparkles,
  Shuffle,
  Trash2
} from 'lucide-react';

export default function FlashcardPlayer({ day, cards, onUpdateStatus, onDeleteCard, onExit }) {
  const [deck, setDeck] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setDeck(cards);
    if (currentIndex >= cards.length) {
      setCurrentIndex(Math.max(0, cards.length - 1));
    }
  }, [cards]);

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowMnemonic(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setShowMnemonic(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleDeleteCurrent = () => {
    if (!currentCard) return;
    if (window.confirm(`Delete "${currentCard.word}"?`)) {
      if (onDeleteCard) {
        onDeleteCard(currentCard.id);
      }
    }
  };

  const handleSpeak = (e, text) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, deck.length]);

  if (!currentCard || deck.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-stone-200">
        <p className="text-stone-500 text-sm">No cards remaining in this session.</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 text-xs uppercase tracking-wider text-stone-800 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
        >
          Back to List
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
        <button
          onClick={onExit}
          className="hover:text-stone-900 transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Day {day.dayNumber}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Top Delete Card Button */}
          {onDeleteCard && (
            <button
              onClick={handleDeleteCurrent}
              title="Delete this card"
              className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Card</span>
            </button>
          )}

          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="p-1.5 rounded-md hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <span>
            {currentIndex + 1} / {deck.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-stone-800 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flashcard with 3D Flip */}
      <div 
        className="perspective-1000 cursor-pointer min-h-[380px] select-none"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-[380px] rounded-2xl transition-transform duration-500 transform-style-3d border border-stone-200 shadow-sm ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase tracking-widest font-mono">
                {currentCard.partOfSpeech || 'word'}
              </span>
              <button
                type="button"
                onClick={(e) => handleSpeak(e, currentCard.word)}
                className={`p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors ${
                  isSpeaking ? 'text-stone-900' : ''
                }`}
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-6">
              <h2 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-stone-900 mb-2">
                {currentCard.word}
              </h2>
              <p className="text-stone-400 text-xs font-mono">Click card or press Space to reveal</p>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
              <span className="capitalize">Status: {currentCard.status || 'new'}</span>
              <span className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded">
                Front
              </span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#fdfdfc] rounded-2xl p-8 flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-serif text-lg font-medium text-stone-900">
                {currentCard.word}
              </span>
              <span className="text-[11px] font-mono uppercase text-stone-400">
                {currentCard.partOfSpeech}
              </span>
            </div>

            <div className="py-2 space-y-3.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                  Definition
                </span>
                <p className="text-stone-800 text-base leading-relaxed">
                  {currentCard.definition}
                </p>
              </div>

              {currentCard.example && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                    Example
                  </span>
                  <p className="text-stone-600 text-xs italic leading-relaxed border-l-2 border-stone-200 pl-3">
                    "{currentCard.example}"
                  </p>
                </div>
              )}

              {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mr-1">
                    Synonyms:
                  </span>
                  {currentCard.synonyms.map((syn, i) => (
                    <span 
                      key={i} 
                      className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              )}

              {currentCard.antonyms && currentCard.antonyms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mr-1">
                    Antonyms:
                  </span>
                  {currentCard.antonyms.map((ant, i) => (
                    <span 
                      key={i} 
                      className="text-[11px] font-mono text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded"
                    >
                      {ant}
                    </span>
                  ))}
                </div>
              )}

              {currentCard.mnemonic && (
                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMnemonic(!showMnemonic);
                    }}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 font-mono"
                  >
                    <Sparkles className="w-3 h-3 text-stone-400" />
                    <span>{showMnemonic ? 'Hide Mnemonic' : 'Reveal Memory Aid'}</span>
                  </button>
                  {showMnemonic && (
                    <p className="text-xs text-stone-600 font-mono mt-1.5 bg-stone-100/70 p-2.5 rounded-lg border border-stone-200">
                      💡 {currentCard.mnemonic}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-stone-400 font-mono border-t border-stone-100 pt-3">
              <span className="text-[11px] text-stone-400">Click to flip back</span>
              <span className="text-[11px] bg-stone-200/60 text-stone-700 px-2.5 py-1 rounded">
                Back
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mastery & Status Actions */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateStatus(day.id, currentCard.id, 'learning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 border ${
              currentCard.status === 'learning' 
                ? 'border-stone-800 bg-stone-800 text-white' 
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Still Learning</span>
          </button>

          <button
            onClick={() => onUpdateStatus(day.id, currentCard.id, 'mastered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 border ${
              currentCard.status === 'mastered' 
                ? 'border-stone-800 bg-stone-800 text-white' 
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            <Check className="w-3 h-3" />
            <span>Mastered</span>
          </button>
        </div>

        {/* Previous / Next Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 border border-stone-200 bg-white rounded-lg text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === deck.length - 1}
            className="p-2 border border-stone-200 bg-white rounded-lg text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="text-center text-[11px] text-stone-400 font-mono">
        Hotkeys: <kbd className="px-1.5 py-0.5 bg-stone-200/50 rounded border border-stone-300 text-stone-600">Space</kbd> Flip &nbsp;•&nbsp; 
        <kbd className="px-1.5 py-0.5 bg-stone-200/50 rounded border border-stone-300 text-stone-600">←</kbd> Prev &nbsp;•&nbsp; 
        <kbd className="px-1.5 py-0.5 bg-stone-200/50 rounded border border-stone-300 text-stone-600">→</kbd> Next
      </div>
    </div>
  );
}
