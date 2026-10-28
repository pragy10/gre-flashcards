import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Plus, 
  Calendar, 
  Play, 
  Layers, 
  Search, 
  RotateCcw, 
  ChevronRight,
  TrendingUp,
  Download,
  Upload,
  Cloud,
  CloudOff,
  Sparkles
} from 'lucide-react';
import { INITIAL_DAYS, STORAGE_KEY } from './data/sampleData';
import { fetchDays, saveDayToCloud, syncAllDaysToCloud, deleteDayFromCloud } from './services/api';
import DayView from './components/DayView';
import FlashcardPlayer from './components/FlashcardPlayer';
import CardModal from './components/CardModal';
import DayModal from './components/DayModal';

export default function App() {
  const [days, setDays] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading localStorage', e);
    }
    return INITIAL_DAYS;
  });

  const [activeDayId, setActiveDayId] = useState(() => days[0]?.id || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerMode, setPlayerMode] = useState('day'); // 'day' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Initial load from cloud (MongoDB API) with local fallback
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsSyncing(true);
      const res = await fetchDays();
      if (isMounted) {
        if (res.days && res.days.length > 0) {
          setDays(res.days);
          setActiveDayId(res.days[0]?.id || null);
        }
        setIsCloudSynced(res.isCloud);
        setIsSyncing(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    } catch (e) {
      console.error('Failed saving localStorage', e);
    }
  }, [days]);

  // Derived current day
  const currentDay = days.find(d => d.id === activeDayId) || days[0];

  // Global calculations
  const totalCards = days.reduce((acc, d) => acc + (d.cards?.length || 0), 0);
  const totalMastered = days.reduce(
    (acc, d) => acc + (d.cards?.filter(c => c.status === 'mastered').length || 0), 
    0
  );
  const totalLearning = days.reduce(
    (acc, d) => acc + (d.cards?.filter(c => c.status === 'learning').length || 0), 
    0
  );

  // Search filtered cards across all days
  const searchResults = searchQuery.trim() === '' ? [] : days.flatMap(d => 
    (d.cards || []).filter(c => 
      c.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.synonyms?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    ).map(c => ({ ...c, dayNumber: d.dayNumber, dayId: d.id }))
  );

  // Add / Edit Card
  const handleSaveCard = async (cardData) => {
    let updatedDay = null;
    const nextDays = days.map(d => {
      if (d.id !== activeDayId) return d;
      const existingIdx = d.cards.findIndex(c => c.id === cardData.id);
      let updatedCards;
      if (existingIdx >= 0) {
        updatedCards = [...d.cards];
        updatedCards[existingIdx] = cardData;
      } else {
        updatedCards = [cardData, ...d.cards];
      }
      updatedDay = { ...d, cards: updatedCards };
      return updatedDay;
    });

    setDays(nextDays);
    if (updatedDay) {
      saveDayToCloud(updatedDay);
    }
  };

  const handleDeleteCard = (cardId) => {
    let updatedDay = null;
    const nextDays = days.map(d => {
      if (d.id !== activeDayId) return d;
      updatedDay = {
        ...d,
        cards: d.cards.filter(c => c.id !== cardId)
      };
      return updatedDay;
    });

    setDays(nextDays);
    if (updatedDay) {
      saveDayToCloud(updatedDay);
    }
  };

  const handleUpdateStatus = (dayId, cardId, newStatus) => {
    let updatedDay = null;
    const nextDays = days.map(d => {
      if (d.id !== dayId) return d;
      updatedDay = {
        ...d,
        cards: d.cards.map(c => c.id === cardId ? { ...c, status: newStatus } : c)
      };
      return updatedDay;
    });

    setDays(nextDays);
    if (updatedDay) {
      saveDayToCloud(updatedDay);
    }
  };

  // Day Actions
  const handleCreateDay = (newDay) => {
    setDays(prev => [...prev, newDay]);
    setActiveDayId(newDay.id);
    saveDayToCloud(newDay);
  };

  const handleDeleteDay = (dayId) => {
    if (!window.confirm("Are you sure you want to delete this day and all its words?")) return;
    const remaining = days.filter(d => d.id !== dayId);
    setDays(remaining);
    deleteDayFromCloud(dayId);
    if (remaining.length > 0) {
      setActiveDayId(remaining[0].id);
    } else {
      setActiveDayId(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(days, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gre-vocabulary-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetSampleData = () => {
    if (window.confirm("Reset all data to sample GRE words? Any custom additions will be replaced.")) {
      setDays(INITIAL_DAYS);
      setActiveDayId(INITIAL_DAYS[0].id);
      setIsPlaying(false);
      syncAllDaysToCloud(INITIAL_DAYS);
    }
  };

  // Cards for player
  const playerDeck = playerMode === 'all' 
    ? days.flatMap(d => d.cards || [])
    : currentDay?.cards || [];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-lg font-bold">
              GRE
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-stone-900 leading-none">
                  Lexicon
                </h1>
                {/* Cloud sync status indicator */}
                <span 
                  title={isCloudSynced ? "Connected to MongoDB Atlas" : "Local mode (connect MongoDB Atlas for cloud sync)"}
                  className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded"
                >
                  {isCloudSynced ? (
                    <>
                      <Cloud className="w-3 h-3 text-stone-700" />
                      <span className="text-stone-700">Atlas</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-stone-400" />
                      <span>Local</span>
                    </>
                  )}
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">Daily Flashcard Companion</span>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-4 text-stone-500 border-r border-stone-200 pr-4">
              <span>Total: <strong className="text-stone-900">{totalCards}</strong></span>
              <span>Mastered: <strong className="text-stone-900">{totalMastered}</strong></span>
              <span>In Progress: <strong className="text-stone-900">{totalLearning}</strong></span>
            </div>

            {totalCards > 0 && !isPlaying && (
              <button
                onClick={() => {
                  setPlayerMode('all');
                  setIsPlaying(true);
                }}
                className="px-3 py-1.5 bg-stone-900 text-stone-50 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                title="Review entire library"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Play All</span>
              </button>
            )}

            <button
              onClick={handleExportJSON}
              title="Export backup"
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {isPlaying ? (
          /* Active Playing Screen */
          <FlashcardPlayer 
            day={playerMode === 'all' ? { id: 'all', dayNumber: 'All' } : currentDay}
            cards={playerDeck}
            onUpdateStatus={handleUpdateStatus}
            onExit={() => setIsPlaying(false)}
          />
        ) : (
          /* Dashboard & Day Management */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sidebar: Day Sessions List */}
            <aside className="md:col-span-4 lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-mono text-stone-400">
                  Study Days
                </span>
                <button
                  onClick={() => setIsDayModalOpen(true)}
                  className="text-xs font-mono text-stone-800 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Day</span>
                </button>
              </div>

              {/* Day Cards Navigation */}
              <div className="space-y-2">
                {days.map((day) => {
                  const isSelected = day.id === activeDayId;
                  const dayCards = day.cards || [];
                  const masteredInDay = dayCards.filter(c => c.status === 'mastered').length;
                  
                  return (
                    <button
                      key={day.id}
                      onClick={() => setActiveDayId(day.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-stone-800 bg-white shadow-xs ring-1 ring-stone-800'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-serif font-medium text-stone-900 text-sm">
                          Day {day.dayNumber}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {dayCards.length} {dayCards.length === 1 ? 'word' : 'words'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-1 mb-2 font-light">
                        {day.title || `Vocabulary day ${day.dayNumber}`}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-100">
                        <span>{day.createdAt}</span>
                        {dayCards.length > 0 && (
                          <span>
                            {masteredInDay}/{dayCards.length} mastered
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {days.length === 0 && (
                  <div className="p-4 border border-dashed border-stone-300 rounded-xl text-center">
                    <p className="text-xs text-stone-400 font-mono mb-2">No days added yet.</p>
                    <button
                      onClick={() => setIsDayModalOpen(true)}
                      className="text-xs font-mono text-stone-800 underline"
                    >
                      Create Day 1
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions Footer in Sidebar */}
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <button
                  onClick={handleResetSampleData}
                  className="w-full text-left px-2 py-1.5 text-[11px] font-mono text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Sample GRE Deck</span>
                </button>
              </div>
            </aside>

            {/* Main Day Content Area */}
            <section className="md:col-span-8 lg:col-span-9 space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search across all days (word, definition, synonym)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-800 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 hover:text-stone-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search Results Display if active */}
              {searchQuery.trim() !== '' ? (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-stone-500">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-400 text-sm">
                      No words match "{searchQuery}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {searchResults.map((card) => (
                        <div 
                          key={card.id}
                          className="bg-white border border-stone-200 p-4 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-medium text-stone-900">{card.word}</span>
                              <span className="text-[10px] font-mono uppercase text-stone-400">Day {card.dayNumber}</span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1">{card.definition}</p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveDayId(card.dayId);
                              setSearchQuery('');
                            }}
                            className="text-xs font-mono text-stone-800 hover:underline flex items-center gap-1"
                          >
                            <span>Go to Day</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : currentDay ? (
                <DayView
                  day={currentDay}
                  onStartStudy={() => {
                    setPlayerMode('day');
                    setIsPlaying(true);
                  }}
                  onAddCard={() => {
                    setEditingCard(null);
                    setIsCardModalOpen(true);
                  }}
                  onEditCard={(card) => {
                    setEditingCard(card);
                    setIsCardModalOpen(true);
                  }}
                  onDeleteCard={handleDeleteCard}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteDay={() => handleDeleteDay(currentDay.id)}
                />
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                  <p className="text-stone-500 text-sm font-serif">Select a day or create one to start adding words.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs font-mono text-stone-400">
        Minimalist GRE Vocabulary Builder & Spaced Practice
      </footer>

      {/* Modals */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        editingCard={editingCard}
      />

      <DayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        onCreateDay={handleCreateDay}
        nextDayNumber={(days.length ? Math.max(...days.map(d => d.dayNumber || 0)) : 0) + 1}
      />
    </div>
  );
}
