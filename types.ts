export interface LyricLine {
  chords: string;
  lyrics: string;
  timestamp?: number;
}

export interface SongData {
  songTitle: string;
  artist: string;
  lines: LyricLine[];
}