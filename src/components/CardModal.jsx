import React, { useState } from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';

export default function CardModal({ isOpen, onClose, onSave, editingCard = null }) {
  const [word, setWord] = useState(editingCard?.word || '');
  const [partOfSpeech, setPartOfSpeech] = useState(editingCard?.partOfSpeech || 'noun');
  const [definition, setDefinition] = useState(editingCard?.definition || '');
  const [example, setExample] = useState(editingCard?.example || '');
  const [mnemonic, setMnemonic] = useState(editingCard?.mnemonic || '');
  const [synonymsText, setSynonymsText] = useState(editingCard?.synonyms?.join(', ') || '');
  const [isFetchingDict, setIsFetchingDict] = useState(false);
  const [dictError, setDictError] = useState('');

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
            setSynonymsText(meaning.synonyms.slice(0, 4).join(', '));
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

    onSave({
      id: editingCard?.id || `c-${Date.now()}`,
      word: word.trim(),
      partOfSpeech,
      definition: definition.trim(),
      example: example.trim(),
      mnemonic: mnemonic.trim(),
      synonyms,
      status: editingCard?.status || 'new',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-stone-900">
            {editingCard ? 'Edit Word Card' : 'Add New Word'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Word & POS */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                Word *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ephemeral"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                Type
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 bg-white capitalize transition-colors"
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
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1.5 font-mono disabled:opacity-40 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isFetchingDict ? 'Looking up...' : 'Auto-fill definition'}</span>
            </button>
            {dictError && <span className="text-[11px] text-stone-400 italic font-mono">{dictError}</span>}
          </div>

          {/* Definition */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Definition *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Clear, concise GRE-standard meaning..."
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 transition-colors resize-none"
            />
          </div>

          {/* Example Sentence */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Example Sentence (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Contextual sentence illustrating usage..."
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 transition-colors resize-none"
            />
          </div>

          {/* Mnemonic / Memory Aid */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Mnemonic / Memory Hook (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Sounds like..."
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 transition-colors"
              />
            </div>
          </div>

          {/* Synonyms */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Synonyms (comma separated)
            </label>
            <input
              type="text"
              placeholder="fleeting, transient, brief"
              value={synonymsText}
              onChange={(e) => setSynonymsText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 transition-colors"
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
              {editingCard ? 'Save Changes' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
