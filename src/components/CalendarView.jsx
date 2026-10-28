import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Play, 
  Plus, 
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CalendarView({ days, onSelectDay, onStartStudy, onStartQuiz, onNewDayForDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Map of YYYY-MM-DD -> array of day objects
  const daysByDate = {};
  days.forEach(d => {
    if (d.createdAt) {
      if (!daysByDate[d.createdAt]) daysByDate[d.createdAt] = [];
      daysByDate[d.createdAt].push(d);
    }
  });

  // Calculate calendar grid
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      sessions: daysByDate[dateStr] || []
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Selected date details for the bottom panel
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const activeSessions = daysByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2f2b28] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400 mb-1">
            <span className="uppercase tracking-widest font-semibold text-stone-700 dark:text-stone-300">Consistency Tracker</span>
            <span>•</span>
            <span>Flashcards & Study Days</span>
          </div>
          <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 border border-stone-200 dark:border-[#38332e] text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-stone-50 dark:hover:bg-[#282522] text-stone-700 dark:text-stone-300 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-stone-200 dark:border-[#38332e] rounded-xl overflow-hidden">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-stone-50 dark:hover:bg-[#282522] text-stone-600 dark:text-stone-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-stone-50 dark:hover:bg-[#282522] text-stone-600 dark:text-stone-300 transition-colors border-l border-stone-200 dark:border-[#38332e]"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2f2b28] rounded-2xl p-4 sm:p-6 transition-colors shadow-xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs uppercase tracking-wider text-stone-400 dark:text-stone-500 pb-3 border-b border-stone-100 dark:border-[#2f2b28]">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1.5 pt-3">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-24 rounded-xl bg-stone-50/40 dark:bg-[#161513]/40 border border-transparent" />;
            }

            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDateStr;
            const hasCards = cell.sessions.length > 0;
            const totalWordsInDay = cell.sessions.reduce((acc, s) => acc + (s.cards?.length || 0), 0);
            const totalMasteredInDay = cell.sessions.reduce(
              (acc, s) => acc + (s.cards?.filter(c => c.status === 'mastered').length || 0), 0
            );

            // Check if passed without study (skipped)
            const isPast = cell.dateStr < todayStr;
            const isSkipped = isPast && !hasCards;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[92px] p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-stone-800 dark:border-stone-200 ring-2 ring-stone-800 dark:ring-stone-200 shadow-sm'
                    : isToday
                    ? 'border-stone-400 dark:border-stone-500 bg-stone-50/70 dark:bg-[#201d1a]'
                    : hasCards
                    ? 'border-stone-200 dark:border-[#2f2b28] bg-white dark:bg-[#1c1a18] hover:border-stone-400 dark:hover:border-stone-500'
                    : isSkipped
                    ? 'border-stone-100 dark:border-[#221f1d] bg-stone-50/30 dark:bg-[#161513] opacity-60 hover:opacity-100'
                    : 'border-stone-100 dark:border-[#221f1d] bg-white dark:bg-[#1c1a18] hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-medium ${
                    isToday ? 'text-stone-900 dark:text-stone-100 font-bold underline decoration-2' : 'text-stone-600 dark:text-stone-400'
                  }`}>
                    {cell.dayNumber}
                  </span>

                  {hasCards && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" title="Flashcards active" />
                  )}
                  {isSkipped && (
                    <span className="text-[10px] text-stone-300 dark:text-stone-600 font-mono">•</span>
                  )}
                </div>

                {hasCards ? (
                  <div className="space-y-1">
                    {cell.sessions.map((s) => (
                      <div 
                        key={s.id} 
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#282522] text-stone-800 dark:text-stone-200 truncate"
                        title={s.title || `Day ${s.dayNumber}`}
                      >
                        D{s.dayNumber}: {s.cards?.length || 0}w
                      </div>
                    ))}
                    {totalWordsInDay > 0 && (
                      <span className="block text-[9px] font-mono text-stone-400 dark:text-stone-500">
                        {totalMasteredInDay}/{totalWordsInDay} done
                      </span>
                    )}
                  </div>
                ) : isSkipped ? (
                  <span className="text-[10px] font-mono text-stone-300 dark:text-stone-600 italic">
                    Skipped
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-stone-200 dark:text-stone-800">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-6 mt-4 border-t border-stone-100 dark:border-[#2f2b28] text-xs font-mono text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Flashcards studied/created</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-400 italic">Skipped</span>
            <span>Past date with no flashcard entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded border border-stone-800 dark:border-stone-200" />
            <span>Today's date</span>
          </div>
        </div>
      </div>

      {/* Selected Date Session Details */}
      <div className="bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-[#2f2b28] rounded-2xl p-6 transition-colors space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#2f2b28] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Details for Date
            </span>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              {selectedDateStr} {selectedDateStr === todayStr && "(Today)"}
            </h3>
          </div>

          <button
            onClick={() => onNewDayForDate(selectedDateStr)}
            className="px-3.5 py-2 border border-stone-200 dark:border-[#38332e] hover:border-stone-300 dark:hover:border-stone-500 text-stone-800 dark:text-stone-200 text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-stone-50 dark:hover:bg-[#282522] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day on this Date</span>
          </button>
        </div>

        {activeSessions.length === 0 ? (
          <p className="text-xs font-mono text-stone-400 dark:text-stone-500 py-4">
            No flashcard day sessions were assigned to this date.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSessions.map((session) => (
              <div 
                key={session.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-[#2f2b28] bg-stone-50/50 dark:bg-[#201d1a] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-medium text-stone-900 dark:text-stone-100">
                    Day {session.dayNumber}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                    {session.cards?.length || 0} words
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                  {session.title}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSelectDay(session.id)}
                    className="px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg text-xs font-mono flex items-center gap-1 hover:bg-stone-800 dark:hover:bg-white transition-colors"
                  >
                    <span>Open Day</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onStartStudy(session)}
                    disabled={!session.cards || session.cards.length === 0}
                    className="p-1.5 border border-stone-200 dark:border-[#38332e] text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-[#282522] disabled:opacity-40 transition-colors"
                    title="Study Deck"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => onStartQuiz(session)}
                    disabled={!session.cards || session.cards.length === 0}
                    className="p-1.5 border border-stone-200 dark:border-[#38332e] text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-[#282522] disabled:opacity-40 transition-colors"
                    title="Take Test"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
