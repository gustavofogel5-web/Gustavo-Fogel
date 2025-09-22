
import React from 'react';
import type { SongSuggestion } from '../types';
import { MusicNoteIcon } from './icons/MusicNoteIcon';

interface SongSuggestionsProps {
  suggestions: SongSuggestion[];
  onSelect: (suggestion: SongSuggestion) => void;
  isLoading: boolean;
}

const SongSuggestions: React.FC<SongSuggestionsProps> = ({ suggestions, onSelect, isLoading }) => {
  return (
    <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg w-full shadow-2xl animate-fade-in p-6">
      <h2 className="text-2xl font-bold text-amber-400 mb-4">Did you mean...?</h2>
      <div className="flex flex-col gap-3">
        {suggestions.map((song, index) => (
          <button
            key={index}
            onClick={() => onSelect(song)}
            disabled={isLoading}
            className="w-full text-left p-4 bg-zinc-700/50 rounded-lg border border-zinc-600 hover:bg-zinc-700 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
          >
            <div className="flex items-center gap-4">
                <MusicNoteIcon className="w-6 h-6 text-zinc-400 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-zinc-100">{song.songTitle}</p>
                    <p className="text-sm text-zinc-400">{song.artist}</p>
                </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SongSuggestions;
