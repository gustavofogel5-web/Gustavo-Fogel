
export interface LyricLine {
  chords: string;
  lyrics: string;
}

export interface SongData {
  songTitle: string;
  artist: string;
  lines: LyricLine[];
}

export interface SongSuggestion {
  songTitle: string;
  artist: string;
}