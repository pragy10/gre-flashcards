import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Plus, 
  Calendar as CalendarIcon, 
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
  Sparkles, 
  Sun, 
  Moon, 
  HelpCircle,
  LayoutGrid
} from 'lucide-react';
import { INITIAL_DAYS, STORAGE_KEY } from './data/sampleData';
import { fetchDays, saveDayToCloud, syncAllDaysToCloud, deleteDayFromCloud } from './services/api';
import DayView from './components/DayView';
import FlashcardPlayer from './components/FlashcardPlayer';
import CardModal from './components/CardModal';
import DayModal from './components/DayModal';
import QuizModal from './components/QuizModal';
import CalendarView from './components/CalendarView';
import ConfirmModal from './components/ConfirmModal';

const THEME_KEY = "gre_theme_mode";

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Apply dark theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
  const [mainView, setMainView] = useState('deck'); // 'deck' | 'calendar'
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerMode, setPlayerMode] = useState('day'); // 'day' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizDay, setQuizDay] = useState(null);

  // Confirm delete modal state
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: () => {}
  });

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

  // Card Deletion with Confirmation Modal
  const requestDeleteCard = (card) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Delete "${card.word}"?`,
      message: "This card will be permanently removed from this day session.",
      confirmText: "Delete Card",
      onConfirm: () => {
        let updatedDay = null;
        const nextDays = days.map(d => {
          if (d.id !== activeDayId) return d;
          updatedDay = {
            ...d,
            cards: d.cards.filter(c => c.id !== card.id)
          };
          return updatedDay;
        });

        setDays(nextDays);
        if (updatedDay) {
          saveDayToCloud(updatedDay);
        }
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
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

  // Day Actions (Create or Edit existing day details)
  const handleSaveDay = (dayData) => {
    if (editingDay) {
      // Editing existing day
      const nextDays = days.map(d => d.id === dayData.id ? dayData : d);
      // Re-sort by dayNumber
      nextDays.sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
      setDays(nextDays);
      saveDayToCloud(dayData);
      setEditingDay(null);
    } else {
      // Create new day
      const nextDays = [...days, dayData].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
      setDays(nextDays);
      setActiveDayId(dayData.id);
      saveDayToCloud(dayData);
    }
  };

  // Day Deletion with Confirmation Modal
  const requestDeleteDay = (dayToDelete) => {
    const targetDay = dayToDelete || currentDay;
    if (!targetDay) return;

    setConfirmModalConfig({
      isOpen: true,
      title: `Delete Day ${targetDay.dayNumber}?`,
      message: `Are you sure you want to delete Day ${targetDay.dayNumber} ("${targetDay.title}") and all its ${targetDay.cards?.length || 0} flashcards?`,
      confirmText: "Delete Day",
      onConfirm: () => {
        const remaining = days.filter(d => d.id !== targetDay.id);
        setDays(remaining);
        deleteDayFromCloud(targetDay.id);
        if (remaining.length > 0) {
          setActiveDayId(remaining[0].id);
        } else {
          setActiveDayId(null);
        }
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
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
    setConfirmModalConfig({
      isOpen: true,
      title: "Reset to Sample GRE Deck?",
      message: "This will replace your current days with the standard 3-day GRE sample deck. Any customized entries will be overwritten.",
      confirmText: "Reset Deck",
      onConfirm: () => {
        setDays(INITIAL_DAYS);
        setActiveDayId(INITIAL_DAYS[0].id);
        setIsPlaying(false);
        syncAllDaysToCloud(INITIAL_DAYS);
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Quiz launcher
  const handleStartQuiz = (day) => {
    setQuizDay(day);
    setIsQuizModalOpen(true);
  };

  // Cards for player
  const playerDeck = playerMode === 'all' 
    ? days.flatMap(d => d.cards || [])
    : currentDay?.cards || [];

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#141413] text-stone-900 dark:text-stone-100 font-sans flex flex-col transition-colors duration-200">
      {/* Minimal Header */}
      <header className="border-b border-stone-200 dark:border-[#2a2623] bg-white/80 dark:bg-[#1a1816]/80 backdrop-blur-sm sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-950 flex items-center justify-center font-serif text-lg font-bold">
              GRE
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-none">
                  Lexicon
                </h1>
                {/* Cloud sync status indicator */}
                <span 
                  title={isCloudSynced ? "Connected to MongoDB Atlas" : "Local mode (connect MongoDB Atlas for cloud sync)"}
                  className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-[#282522] dark:text-stone-400 px-1.5 py-0.5 rounded"
                >
                  {isCloudSynced ? (
                    <>
                      <Cloud className="w-3 h-3 text-stone-700 dark:text-stone-300" />
                      <span className="text-stone-700 dark:text-stone-300">Atlas</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-stone-400" />
                      <span>Local</span>
                    </>
                  )}
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Daily Flashcard Companion</span>
            </div>
          </div>

          {/* Nav Views & Actions */}
          <div className="flex items-center gap-3 text-xs font-mono">
            {/* View switcher: Decks vs Calendar */}
            {!isPlaying && (
              <div className="flex bg-stone-100 dark:bg-[#282522] p-0.5 rounded-lg">
                <button
                  onClick={() => setMainView('deck')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    mainView === 'deck'
                      ? 'bg-white dark:bg-[#1c1a18] text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Decks</span>
                </button>
                <button
                  onClick={() => setMainView('calendar')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    mainView === 'calendar'
                      ? 'bg-white dark:bg-[#1c1a18] text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
              </div>
            )}

            <div className="hidden md:flex items-center gap-4 text-stone-500 dark:text-stone-400 border-r border-stone-200 dark:border-[#2f2b28] pr-4">
              <span>Total: <strong className="text-stone-900 dark:text-stone-100">{totalCards}</strong></span>
              <span>Mastered: <strong className="text-stone-900 dark:text-stone-100">{totalMastered}</strong></span>
            </div>

            {/* Comprehensive Quiz Button in Header */}
            {totalCards > 0 && !isPlaying && (
              <button
                onClick={() => handleStartQuiz(null)}
                className="px-3 py-1.5 border border-stone-200 dark:border-[#38332e] hover:border-stone-300 dark:hover:border-stone-500 bg-white dark:bg-[#1c1a18] text-stone-800 dark:text-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                title="Test yourself with customizable MCQ test"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Test</span>
              </button>
            )}

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
              className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-[#282522] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {totalCards > 0 && !isPlaying && (
              <button
                onClick={() => {
                  setPlayerMode('all');
                  setIsPlaying(true);
                }}
                className="px-3 py-1.5 bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors flex items-center gap-1.5"
                title="Review entire library"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Play All</span>
              </button>
            )}

            <button
              onClick={handleExportJSON}
              title="Export backup"
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded hover:bg-stone-100 dark:hover:bg-[#282522] transition-colors"
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
            onDeleteCard={requestDeleteCard}
            onExit={() => setIsPlaying(false)}
          />
        ) : mainView === 'calendar' ? (
          /* Calendar View Page */
          <CalendarView 
            days={days}
            onSelectDay={(dayId) => {
              setActiveDayId(dayId);
              setMainView('deck');
            }}
            onStartStudy={(session) => {
              setActiveDayId(session.id);
              setPlayerMode('day');
              setIsPlaying(true);
            }}
            onStartQuiz={(session) => {
              handleStartQuiz(session);
            }}
            onNewDayForDate={(dateStr) => {
              setEditingDay({
                dayNumber: (days.length ? Math.max(...days.map(d => d.dayNumber || 0)) : 0) + 1,
                title: '',
                createdAt: dateStr
              });
              setIsDayModalOpen(true);
            }}
          />
        ) : (
          /* Dashboard & Day Management */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sidebar: Day Sessions List */}
            <aside className="md:col-span-4 lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-mono text-stone-400 dark:text-stone-500">
                  Study Days
                </span>
                <button
                  onClick={() => {
                    setEditingDay(null);
                    setIsDayModalOpen(true);
                  }}
                  className="text-xs font-mono text-stone-800 dark:text-stone-200 hover:underline flex items-center gap-1"
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
                          ? 'border-stone-800 bg-white dark:border-stone-400 dark:bg-[#1c1a18] shadow-xs ring-1 ring-stone-800 dark:ring-stone-400'
                          : 'border-stone-200 dark:border-[#2f2b28] bg-white dark:bg-[#1c1a18] hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-serif font-medium text-stone-900 dark:text-stone-100 text-sm">
                          Day {day.dayNumber}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                          {dayCards.length} {dayCards.length === 1 ? 'word' : 'words'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mb-2 font-light">
                        {day.title || `Vocabulary day ${day.dayNumber}`}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 dark:text-stone-500 pt-1 border-t border-stone-100 dark:border-[#282522]">
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
                  <div className="p-4 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl text-center">
                    <p className="text-xs text-stone-400 font-mono mb-2">No days added yet.</p>
                    <button
                      onClick={() => {
                        setEditingDay(null);
                        setIsDayModalOpen(true);
                      }}
                      className="text-xs font-mono text-stone-800 dark:text-stone-200 underline"
                    >
                      Create Day 1
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions Footer in Sidebar */}
              <div className="pt-4 border-t border-stone-200 dark:border-[#2f2b28] space-y-2">
                <button
                  onClick={handleResetSampleData}
                  className="w-full text-left px-2 py-1.5 text-[11px] font-mono text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center gap-1.5"
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
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  placeholder="Search across all days (word, definition, synonym)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2f2b28] text-stone-900 dark:text-stone-100 rounded-xl text-sm focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search Results Display if active */}
              {searchQuery.trim() !== '' ? (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1c1a18] rounded-2xl border border-stone-200 dark:border-[#2f2b28] text-stone-400 dark:text-stone-500 text-sm">
                      No words match "{searchQuery}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {searchResults.map((card) => (
                        <div 
                          key={card.id}
                          className="bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2f2b28] p-4 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-medium text-stone-900 dark:text-stone-100">{card.word}</span>
                              <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500">Day {card.dayNumber}</span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{card.definition}</p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveDayId(card.dayId);
                              setSearchQuery('');
                            }}
                            className="text-xs font-mono text-stone-800 dark:text-stone-200 hover:underline flex items-center gap-1"
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
                  onStartQuiz={handleStartQuiz}
                  onAddCard={() => {
                    setEditingCard(null);
                    setIsCardModalOpen(true);
                  }}
                  onEditCard={(card) => {
                    setEditingCard(card);
                    setIsCardModalOpen(true);
                  }}
                  onDeleteCard={requestDeleteCard}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteDay={() => requestDeleteDay(currentDay)}
                  onEditDayDetails={(day) => {
                    setEditingDay(day);
                    setIsDayModalOpen(true);
                  }}
                />
              ) : (
                <div className="text-center py-20 bg-white dark:bg-[#1c1a18] rounded-2xl border border-stone-200 dark:border-[#2f2b28]">
                  <p className="text-stone-500 dark:text-stone-400 text-sm font-serif">Select a day or create one to start adding words.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-[#2a2623] bg-white dark:bg-[#1a1816] py-6 mt-12 text-center text-xs font-mono text-stone-400 dark:text-stone-500 transition-colors">
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
        onClose={() => {
          setIsDayModalOpen(false);
          setEditingDay(null);
        }}
        onSaveDay={handleSaveDay}
        nextDayNumber={(days.length ? Math.max(...days.map(d => d.dayNumber || 0)) : 0) + 1}
        editingDay={editingDay}
      />

      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => {
          setIsQuizModalOpen(false);
          setQuizDay(null);
        }}
        initialDay={quizDay}
        allDays={days}
      />

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
