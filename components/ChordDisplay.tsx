
import React from 'react';
import type { SongData } from '../types';

interface ChordDisplayProps {
  songData: SongData;
}

const ChordDisplay: React.FC<ChordDisplayProps> = ({ songData }) => {
  return (
    <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg w-full shadow-2xl animate-fade-in flex flex-col">
      <div className="p-6">
        <div className="pb-4 border-b border-zinc-600">
          <h2 className="text-3xl font-bold text-amber-400">{songData.songTitle}</h2>
          <p className="text-xl text-zinc-300">{songData.artist}</p>
        </div>
      </div>

      <div className="font-roboto-mono text-sm sm:text-base whitespace-pre-wrap overflow-x-auto p-6 pt-2 flex-grow max-h-[70vh] overflow-y-auto">
        {songData.lines.map((line, index) => (
          <div
            key={index}
            className="mb-4 leading-tight"
          >
            <div className="text-yellow-400 font-bold h-5">{line.chords || ' '}</div>
            <div className="text-zinc-100">{line.lyrics}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChordDisplay;