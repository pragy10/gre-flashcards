import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, ClipboardPaste, Check } from 'lucide-react';

export default function CardModal({ isOpen, onClose, onSave, editingCard = null }) {
  // When adding, default to 'paste'. When editing an existing card, default to 'manual'.
  const [mode, setMode] = useState('paste');
  const [pasteText, setPasteText] = useState('');
  const [pasteParsedStatus, setPasteParsedStatus] = useState('');

  const [word, setWord] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [synonymsText, setSynonymsText] = useState('');
  const [antonymsText, setAntonymsText] = useState('');
  const [isFetchingDict, setIsFetchingDict] = useState(false);
  const [dictError, setDictError] = useState('');

  // Reset or initialize state every time modal opens or editingCard changes
  useEffect(() => {
    if (isOpen) {
      if (editingCard) {
        setMode('manual');
        setWord(editingCard.word || '');
        setPartOfSpeech(editingCard.partOfSpeech || 'noun');
        setDefinition(editingCard.definition || '');
        setExample(editingCard.example || '');
        setMnemonic(editingCard.mnemonic || '');
        setSynonymsText(editingCard.synonyms?.join(', ') || '');
        setAntonymsText(editingCard.antonyms?.join(', ') || '');
      } else {
        // Clear all fields completely for a fresh add
        setMode('paste');
        setPasteText('');
        setPasteParsedStatus('');
        setWord('');
        setPartOfSpeech('noun');
        setDefinition('');
        setExample('');
        setMnemonic('');
        setSynonymsText('');
        setAntonymsText('');
      }
      setDictError('');
      setIsFetchingDict(false);
    }
  }, [isOpen, editingCard]);

  // Parser function for structured GRE text
  const parseFormattedText = (text) => {
    if (!text.trim()) return null;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = {};

    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const label = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();

      if (label === 'word') {
        parsed.word = value;
      } else if (label === 'type' || label === 'part of speech') {
        const lowerType = value.toLowerCase();
        if (lowerType.includes('noun')) parsed.partOfSpeech = 'noun';
        else if (lowerType.includes('verb')) parsed.partOfSpeech = 'verb';
        else if (lowerType.includes('adj')) parsed.partOfSpeech = 'adjective';
        else if (lowerType.includes('adv')) parsed.partOfSpeech = 'adverb';
        else parsed.partOfSpeech = lowerType;
      } else if (label === 'definition') {
        parsed.definition = value;
      } else if (label.includes('example')) {
        parsed.example = value;
      } else if (label.includes('mnemonic') || label.includes('hook') || label.includes('memory')) {
        parsed.mnemonic = value;
      } else if (label.includes('synonym')) {
        parsed.synonyms = value;
      } else if (label.includes('antonym')) {
        parsed.antonyms = value;
      }
    }

    return parsed;
  };

  const handleApplyPaste = () => {
    const parsed = parseFormattedText(pasteText);
    if (!parsed || !parsed.word) {
      setPasteParsedStatus('Could not detect word or format. Make sure it has "Word: ...", "Definition: ...", etc.');
      return;
    }

    if (parsed.word) setWord(parsed.word);
    if (parsed.partOfSpeech) setPartOfSpeech(parsed.partOfSpeech);
    if (parsed.definition) setDefinition(parsed.definition);
    if (parsed.example) setExample(parsed.example);
    if (parsed.mnemonic) setMnemonic(parsed.mnemonic);
    if (parsed.synonyms) setSynonymsText(parsed.synonyms);
    if (parsed.antonyms) setAntonymsText(parsed.antonyms);

    setMode('manual');
    setPasteParsedStatus('');
  };

  // Auto-fetch definition from free dictionary API as a helper
  const handleAutoDefine = async () => {
    if (!word.trim()) return;
    setIsFetchingDict(true);
    setDictError('');
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
      if (!res.ok) throw new Error('Word definition not found automatically');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const firstEntry = data[0];
        const meaning = firstEntry.meanings?.[0];
        if (meaning) {
          if (meaning.partOfSpeech) {
            setPartOfSpeech(meaning.partOfSpeech.toLowerCase());
          }
          const defObj = meaning.definitions?.[0];
          if (defObj?.definition) {
            setDefinition(defObj.definition);
          }
          if (defObj?.example) {
            setExample(defObj.example);
          }
          if (meaning.synonyms && meaning.synonyms.length > 0) {
            setSynonymsText(meaning.synonyms.slice(0, 5).join(', '));
          }
          if (meaning.antonyms && meaning.antonyms.length > 0) {
            setAntonymsText(meaning.antonyms.slice(0, 5).join(', '));
          }
        }
      }
    } catch (err) {
      setDictError('Could not fetch auto definition. You can fill it in manually.');
    } finally {
      setIsFetchingDict(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) return;

    const synonyms = synonymsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const antonyms = antonymsText
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    onSave({
      id: editingCard?.id || `c-${Date.now()}`,
      word: word.trim(),
      partOfSpeech,
      definition: definition.trim(),
      example: example.trim(),
      mnemonic: mnemonic.trim(),
      synonyms,
      antonyms,
      status: editingCard?.status || 'new',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/70 backdrop-blur-[2px]">
      <div className="bg-white dark:bg-[#1c1a18] rounded-2xl w-full max-w-lg border border-stone-200 dark:border-[#2f2b28] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 dark:border-[#2f2b28] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              {editingCard ? 'Edit Word Card' : 'Add Word'}
            </h3>
            {/* Mode switch tabs */}
            {!editingCard && (
              <div className="flex bg-stone-100 dark:bg-[#282522] p-0.5 rounded-lg text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setMode('paste')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                    mode === 'paste' 
                      ? 'bg-white dark:bg-[#1c1a18] text-stone-900 dark:text-stone-100 shadow-xs' 
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste Format</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    mode === 'manual' 
                      ? 'bg-white dark:bg-[#1c1a18] text-stone-900 dark:text-stone-100 shadow-xs' 
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  Form
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-50 dark:hover:bg-[#282522] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'paste' ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                Paste Formatted Word Block
              </label>
              <textarea
                rows={9}
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value);
                  setPasteParsedStatus('');
                }}
                placeholder={`Word: Divulge\nType: Verb\nDefinition: To make known, reveal, or disclose secret or confidential information.\nExample Sentence: Despite intense pressure from regulatory authorities, the executive refused to divulge...\nMnemonic / Memory Hook: Divulge sounds like...\nSynonyms: Disclose, Impart, Promulgate\nAntonyms: Conceal, Suppress, Withhold`}
                className="w-full px-3 py-2 text-xs font-mono border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors leading-relaxed resize-none"
              />
            </div>

            {pasteParsedStatus && (
              <p className="text-xs text-red-500 font-mono">{pasteParsedStatus}</p>
            )}

            <div className="pt-2 flex justify-between items-center border-t border-stone-100 dark:border-[#2f2b28]">
              <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                Auto-extracts word, type, definition, example, mnemonic, synonyms & antonyms
              </span>
              <button
                type="button"
                onClick={handleApplyPaste}
                disabled={!pasteText.trim()}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Parse & Populate</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Word & POS */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Word *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ephemeral"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Type
                </label>
                <select
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 capitalize transition-colors"
                >
                  <option value="noun">noun</option>
                  <option value="adjective">adjective</option>
                  <option value="verb">verb</option>
                  <option value="adverb">adverb</option>
                </select>
              </div>
            </div>

            {/* Quick Auto-fetch button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleAutoDefine}
                disabled={isFetchingDict || !word.trim()}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 font-mono disabled:opacity-40 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isFetchingDict ? 'Looking up...' : 'Auto-fill definition'}</span>
              </button>
              {dictError && <span className="text-[11px] text-stone-400 dark:text-stone-500 italic font-mono">{dictError}</span>}
            </div>

            {/* Definition */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                Definition *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Clear, concise GRE-standard meaning..."
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors resize-none"
              />
            </div>

            {/* Example Sentence */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                Example Sentence (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Contextual sentence illustrating usage..."
                value={example}
                onChange={(e) => setExample(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors resize-none"
              />
            </div>

            {/* Mnemonic / Memory Aid */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                Mnemonic / Memory Hook (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Sounds like..."
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors"
              />
            </div>

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Synonyms (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Disclose, Impart, Unveil"
                  value={synonymsText}
                  onChange={(e) => setSynonymsText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Antonyms (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Conceal, Suppress, Withhold"
                  value={antonymsText}
                  onChange={(e) => setAntonymsText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-[#38332e] bg-white dark:bg-[#141413] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-800 dark:focus:border-stone-400 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100 dark:border-[#2f2b28]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent rounded-lg hover:bg-stone-50 dark:hover:bg-[#282522] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors"
              >
                {editingCard ? 'Save Changes' : 'Add Card'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
