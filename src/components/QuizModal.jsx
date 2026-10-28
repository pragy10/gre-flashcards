import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  Volume2, 
  Settings2, 
  CheckSquare, 
  Square,
  Play
} from 'lucide-react';

export default function QuizModal({ isOpen, onClose, initialDay, allDays }) {
  // Days selected for this test
  const [selectedDayIds, setSelectedDayIds] = useState([]);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  // Initialize selected days when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialDay) {
        setSelectedDayIds([initialDay.id]);
      } else if (allDays && allDays.length > 0) {
        setSelectedDayIds(allDays.map(d => d.id));
      }
      setIsConfiguring(false);
    }
  }, [isOpen, initialDay, allDays]);

  // Generate quiz questions
  const generateQuiz = () => {
    const includedDays = (allDays || []).filter(d => selectedDayIds.includes(d.id));
    const allQuizCards = [];
    includedDays.forEach(d => {
      (d.cards || []).forEach(c => {
        if (c.synonyms && c.synonyms.length > 0) {
          allQuizCards.push({ ...c, originDay: d.dayNumber });
        }
      });
    });

    if (allQuizCards.length === 0) {
      setQuestions([]);
      return;
    }

    // Collect distractors pool from all days
    const distractorPool = [];
    (allDays || []).forEach(d => {
      (d.cards || []).forEach(c => {
        if (c.synonyms) distractorPool.push(...c.synonyms);
        if (c.antonyms) distractorPool.push(...c.antonyms);
      });
    });

    const uniquePool = Array.from(new Set(distractorPool.map(w => w.trim()).filter(Boolean)));
    const fallbackWords = [
      "ephemeral", "pragmatic", "meticulous", "tenacious", "esoteric",
      "garrulous", "reticent", "cogent", "audacious", "lucid",
      "pellucid", "sycophant", "prosaic", "ebullient", "pedantic"
    ];

    const generated = allQuizCards.map((card, idx) => {
      const correctSynonym = card.synonyms[Math.floor(Math.random() * card.synonyms.length)].trim();
      const cardSynonymsLower = (card.synonyms || []).map(s => s.toLowerCase());
      const cardWordLower = card.word.toLowerCase();

      const candidateDistractors = uniquePool.filter(d => {
        const lower = d.toLowerCase();
        return lower !== correctSynonym.toLowerCase() && 
               lower !== cardWordLower &&
               !cardSynonymsLower.includes(lower);
      });

      const combinedDistractors = candidateDistractors.length >= 3 
        ? candidateDistractors 
        : Array.from(new Set([...candidateDistractors, ...fallbackWords.filter(f => f.toLowerCase() !== cardWordLower && !cardSynonymsLower.includes(f.toLowerCase()))]));

      const shuffledDistractors = [...combinedDistractors].sort(() => Math.random() - 0.5);
      const chosenDistractors = shuffledDistractors.slice(0, 3);
      const options = [correctSynonym, ...chosenDistractors].sort(() => Math.random() - 0.5);

      return {
        id: card.id || `q-${idx}`,
        word: card.word,
        partOfSpeech: card.partOfSpeech || 'word',
        definition: card.definition,
        correctSynonym,
        options,
        originDay: card.originDay
      };
    });

    setQuestions(generated.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setUserAnswers([]);
    setIsConfiguring(false);
  };

  useEffect(() => {
    if (isOpen && selectedDayIds.length > 0) {
      generateQuiz();
    }
  }, [isOpen, selectedDayIds.join(',')]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleToggleDay = (dayId) => {
    setSelectedDayIds(prev => 
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
  };

  const handleSelectAllDays = () => {
    setSelectedDayIds((allDays || []).map(d => d.id));
  };

  const handleDeselectAllDays = () => {
    setSelectedDayIds([]);
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.toLowerCase() === currentQ.correctSynonym.toLowerCase();
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => [
      ...prev,
      {
        word: currentQ.word,
        selected: option,
        correct: currentQ.correctSynonym,
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/70 backdrop-blur-[2px]">
      <div className="bg-white dark:bg-[#1c1a18] rounded-2xl w-full max-w-xl border border-stone-200 dark:border-[#2f2b28] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-[#2f2b28] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-50 dark:hover:bg-[#282522] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 dark:text-stone-100">
                {isConfiguring ? 'Customize Test Days' : 'Synonym Recall Test'}
              </h3>
              <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                {isConfiguring ? 'Select which day batches to include' : `Testing across ${selectedDayIds.length} ${selectedDayIds.length === 1 ? 'day' : 'days'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isComplete && (
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className={`p-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 border ${
                  isConfiguring 
                    ? 'border-stone-800 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' 
                    : 'border-stone-200 dark:border-[#38332e] text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#282522]'
                }`}
                title="Customize test days"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Days</span>
              </button>
            )}

            {!isConfiguring && questions.length > 0 && !isComplete && (
              <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-stone-900 dark:text-stone-100">{currentIndex + 1}</span> / {questions.length}
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Day Customizer Screen */}
          {isConfiguring ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400 pb-2 border-b border-stone-100 dark:border-[#2f2b28]">
                <span>Select Days for Question Pool:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSelectAllDays}
                    className="hover:text-stone-900 dark:hover:text-stone-100 underline"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button 
                    onClick={handleDeselectAllDays}
                    className="hover:text-stone-900 dark:hover:text-stone-100 underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {(allDays || []).map((d) => {
                  const isChecked = selectedDayIds.includes(d.id);
                  const validCards = (d.cards || []).filter(c => c.synonyms && c.synonyms.length > 0).length;

                  return (
                    <div
                      key={d.id}
                      onClick={() => handleToggleDay(d.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'border-stone-800 dark:border-stone-300 bg-stone-50 dark:bg-[#24211e]' 
                          : 'border-stone-200 dark:border-[#2f2b28] hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-stone-900 dark:text-stone-100 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                        <div className="truncate">
                          <span className="font-serif text-sm font-medium text-stone-900 dark:text-stone-100 block">
                            Day {d.dayNumber}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 truncate block">
                            {d.title || d.createdAt}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 shrink-0">
                        {validCards} words
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-[#2f2b28] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfiguring(false)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-50 dark:hover:bg-[#282522] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedDayIds.length === 0}
                  onClick={() => generateQuiz()}
                  className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Custom Quiz</span>
                </button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <HelpCircle className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
              <p className="text-sm font-serif text-stone-600 dark:text-stone-400">
                No words with synonyms found in the selected day batches.
              </p>
              <button
                onClick={() => setIsConfiguring(true)}
                className="mt-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-lg"
              >
                Select Different Days
              </button>
            </div>
          ) : isComplete ? (
            /* Results Screen */
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex p-4 rounded-full bg-stone-100 dark:bg-[#282522] text-stone-800 dark:text-stone-200">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mb-1">
                  Quiz Completed!
                </h4>
                <p className="text-xs font-mono text-stone-500 dark:text-stone-400">
                  You scored <strong className="text-stone-900 dark:text-stone-100 text-base">{score}</strong> out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
                </p>
              </div>

              {/* Breakdown */}
              <div className="text-left space-y-2 border-t border-b border-stone-100 dark:border-[#2f2b28] py-4 max-h-56 overflow-y-auto">
                {userAnswers.map((ans, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-stone-50 dark:bg-[#201d1a]"
                  >
                    <div className="flex items-center gap-2">
                      {ans.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                      )}
                      <span className="font-medium text-stone-900 dark:text-stone-100">{ans.word}</span>
                    </div>

                    <div className="text-right">
                      {ans.isCorrect ? (
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{ans.correct}</span>
                      ) : (
                        <span>
                          <span className="line-through text-stone-400 mr-2">{ans.selected}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ans.correct}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => generateQuiz()}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-stone-200 dark:border-[#38332e] text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#282522] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setIsConfiguring(true)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-stone-200 dark:border-[#38332e] text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#282522] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Change Days</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Active Question */
            <div className="space-y-6">
              {/* Question Card */}
              <div className="p-6 bg-stone-50 dark:bg-[#24211e] rounded-xl border border-stone-200/80 dark:border-[#332e2a] text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    Select the synonym of:
                  </span>
                  {currentQ.originDay && (
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 bg-stone-200/50 dark:bg-[#282522] px-1.5 py-0.2 rounded">
                      Day {currentQ.originDay}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-stone-100 tracking-tight">
                    {currentQ.word}
                  </h2>
                  <button
                    onClick={() => handleSpeak(currentQ.word)}
                    title="Pronounce"
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-200/60 dark:bg-[#2f2b28] text-stone-600 dark:text-stone-400">
                  {currentQ.partOfSpeech}
                </span>
              </div>

              {/* 4 MCQ Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option.toLowerCase() === currentQ.correctSynonym.toLowerCase();

                  let btnStyle = "border-stone-200 dark:border-[#2f2b28] bg-white dark:bg-[#1c1a18] hover:border-stone-400 dark:hover:border-stone-600 text-stone-800 dark:text-stone-200";

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-600";
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500";
                    } else {
                      btnStyle = "border-stone-200 dark:border-[#2f2b28] bg-white dark:bg-[#1c1a18] text-stone-400 dark:text-stone-600 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswered}
                      className={`p-4 rounded-xl border text-left font-serif text-base transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-400 dark:text-stone-500 w-4">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswered && (
                        <div>
                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Definition helper when answered */}
              {isAnswered && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 flex-1">
                    <span className="font-medium text-stone-800 dark:text-stone-200">{currentQ.word}:</span> {currentQ.definition}
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{currentIndex === questions.length - 1 ? 'View Results' : 'Next Word'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
