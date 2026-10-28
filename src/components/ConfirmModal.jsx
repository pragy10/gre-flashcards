import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Delete", 
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/70 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1c1a18] rounded-2xl w-full max-w-sm border border-stone-200 dark:border-[#2f2b28] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
              {title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-[#2f2b28]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-50 dark:hover:bg-[#282522] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
