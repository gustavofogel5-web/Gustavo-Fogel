import { GoogleGenAI, Type } from "@google/genai";
import type { SongData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const schema = {
  type: Type.OBJECT,
  properties: {
    songTitle: {
      type: Type.STRING,
      description: "The title of the song.",
    },
    artist: {
      type: Type.STRING,
      description: "The artist or band who performs the song.",
    },
    lines: {
      type: Type.ARRAY,
      description: "An array of objects, each representing a line of the song with its chords and lyrics.",
      items: {
        type: Type.OBJECT,
        properties: {
          chords: {
            type: Type.STRING,
            description: "A string of chords aligned above the lyrics. Can be empty if there are no chords for this line.",
          },
          lyrics: {
            type: Type.STRING,
            description: "The corresponding line of lyrics.",
          },
          timestamp: {
            type: Type.NUMBER,
            description: "The starting time of this lyric line in seconds from the beginning of the song. Required for autoscroll functionality.",
          },
        },
        required: ["chords", "lyrics", "timestamp"],
      },
    },
  },
  required: ["songTitle", "artist", "lines"],
};

export const getSongChords = async (songName: string): Promise<SongData | null> => {
  try {
    const prompt = `
      Analyze the song "${songName}" and provide its guitar chords and original lyrics.
      
      Follow these instructions precisely:
      1.  Identify the song title and original artist.
      2.  Break down the song into lines of lyrics.
      3.  For each line of lyrics, determine the correct guitar chords that should be played.
      4.  Place the chord names in a string directly above the lyric syllable where the chord change occurs.
      5.  Ensure the 'chords' and 'lyrics' strings in the output are properly aligned for display in a monospaced font. Use spaces in the chord line to position chords correctly over the lyrics.
      6.  If a line is instrumental (like an intro or solo), represent it in the lyrics field (e.g., "[Guitar Solo]") and provide the chords above it.
      7.  If a line has no chords, the 'chords' field should be an empty string.
      8.  For each line, provide a 'timestamp' in seconds indicating when that line starts in the song. This is crucial for the autoscroll feature.
      9.  Format the entire output as a single JSON object matching the provided schema. Do not include any text or markdown formatting before or after the JSON object.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString) as SongData;

    if (!parsedData.songTitle || !parsedData.artist || !parsedData.lines) {
        throw new Error("The returned data is incomplete. The song might be obscure or the analysis failed.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error fetching or parsing song data from Gemini API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the response from the AI. The data format was invalid.");
    }
    throw new Error("Could not retrieve chord data. The API might be unavailable or the request failed.");
  }
};