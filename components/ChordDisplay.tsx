import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactPlayer from 'react-player/youtube';
import type { SongData } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface ChordDisplayProps {
  songData: SongData;
}

const ChordDisplay: React.FC<ChordDisplayProps> = ({ songData }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playerRef = useRef<ReactPlayer | null>(null);

  const hasTimestamps = useMemo(() => 
    songData.lines.some(line => typeof line.timestamp === 'number' && line.timestamp >= 0), 
    [songData.lines]
  );

  useEffect(() => {
    lineRefs.current = lineRefs.current.slice(0, songData.lines.length);
    setActiveLineIndex(-1);
    setPlayedSeconds(0);
    if(playerRef.current) {
        playerRef.current.seekTo(0);
    }
  }, [songData]);

  useEffect(() => {
    if (!isPlaying) return;

    const findCurrentLine = () => {
      const { lines } = songData;
      let newActiveLineIndex = -1;
      
      for (let i = lines.length - 1; i >= 0; i--) {
        if (typeof lines[i].timestamp === 'number' && (lines[i].timestamp as number) <= playedSeconds) {
          newActiveLineIndex = i;
          break;
        }
      }
      
      if (newActiveLineIndex !== -1 && newActiveLineIndex !== activeLineIndex) {
        setActiveLineIndex(newActiveLineIndex);
        lineRefs.current[newActiveLineIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    findCurrentLine();
  }, [playedSeconds, isPlaying, songData, activeLineIndex]);

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYoutubeUrl(urlInputValue);
    setIsPlaying(false);
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
  };
  
  const AutoscrollController = () => (
    <div className="px-6 pb-4">
      <div className="bg-zinc-900/70 p-4 rounded-lg border border-zinc-700">
        <h3 className="text-base font-semibold text-zinc-200 mb-2">Autoscroll with Music</h3>
        <p className="text-xs text-zinc-400 mb-3">Paste a YouTube link for the song to sync lyrics automatically.</p>
        <form onSubmit={handleUrlSubmit} className="flex items-center gap-2 mb-3">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="e.g., https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button type="submit" className="flex-shrink-0 px-4 py-2 text-sm bg-zinc-700 text-white font-semibold rounded-md hover:bg-zinc-600 transition-colors">
            Load
          </button>
        </form>
        {youtubeUrl && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center w-10 h-10 bg-amber-600 text-white rounded-full hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
            </button>
            <div className="text-sm text-zinc-400">
              <p>Status: <span className="font-medium text-zinc-300">{isPlaying ? 'Playing' : 'Paused'}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg w-full shadow-2xl animate-fade-in flex flex-col">
      <div className="p-6">
        <div className="pb-4 border-b border-zinc-600">
          <h2 className="text-3xl font-bold text-amber-400">{songData.songTitle}</h2>
          <p className="text-xl text-zinc-300">{songData.artist}</p>
        </div>
      </div>
      
      {hasTimestamps && <AutoscrollController />}

      <div className="font-roboto-mono text-sm sm:text-base whitespace-pre-wrap overflow-x-auto p-6 pt-2 flex-grow max-h-[60vh] overflow-y-auto">
        {songData.lines.map((line, index) => (
          <div
            key={index}
            ref={el => { if (el) lineRefs.current[index] = el; }}
            className={`mb-4 leading-tight p-2 rounded-md transition-all duration-300 ${index === activeLineIndex ? 'bg-amber-900/50 border border-amber-700' : 'border border-transparent'}`}
          >
            <div className="text-yellow-400 font-bold h-5">{line.chords || ' '}</div>
            <div className="text-zinc-100">{line.lyrics}</div>
          </div>
        ))}
      </div>

      <div className="h-0 w-0 overflow-hidden">
        {youtubeUrl && (
          <ReactPlayer
            ref={playerRef}
            url={youtubeUrl}
            playing={isPlaying}
            onProgress={handleProgress}
            progressInterval={250}
            width="1px"
            height="1px"
          />
        )}
      </div>
    </div>
  );
};

export default ChordDisplay;