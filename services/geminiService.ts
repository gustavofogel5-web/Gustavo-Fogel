
import { GoogleGenAI, Type } from "@google/genai";
import type { SongData, SongSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Schema for the first step: identifying the song
const findSongSchema = {
    type: Type.OBJECT,
    properties: {
        resolvedSong: {
            type: Type.OBJECT,
            description: "The single, most likely song match. Use this ONLY if you are highly confident.",
            properties: {
                songTitle: { type: Type.STRING },
                artist: { type: Type.STRING }
            }
        },
        suggestions: {
            type: Type.ARRAY,
            description: "A list of potential song matches. Use this if the query is ambiguous or could refer to multiple songs.",
            items: {
                type: Type.OBJECT,
                properties: {
                    songTitle: { type: Type.STRING },
                    artist: { type: Type.STRING }
                }
            }
        },
        notFound: {
            type: Type.BOOLEAN,
            description: "Set to true if no relevant song could be found for the query."
        }
    }
};


// Schema for the second step: getting chords
const getChordsSchema = {
  type: Type.OBJECT,
  properties: {
    songTitle: { type: Type.STRING, description: "The title of the song." },
    artist: { type: Type.STRING, description: "The artist or band who performs the song." },
    lines: {
      type: Type.ARRAY,
      description: "An array of objects, each representing a line of the song with its chords and lyrics.",
      items: {
        type: Type.OBJECT,
        properties: {
          chords: { type: Type.STRING, description: "A string of chords aligned above the lyrics. Can be empty if there are no chords for this line." },
          lyrics: { type: Type.STRING, description: "The corresponding line of lyrics." },
        },
        required: ["chords", "lyrics"],
      },
    },
  },
  required: ["songTitle", "artist", "lines"],
};

// Step 1: Find and identify the song
export const findSong = async (query: string): Promise<{ resolved?: SongSuggestion; suggestions?: SongSuggestion[]; notFound?: boolean; }> => {
    try {
        const prompt = `
            You are a music expert AI. A user is looking for a song with the query: "${query}".
            Your task is to identify the most likely song or songs they are looking for.
            Do not invent songs. Only use real, existing songs.

            - If you are very confident about a single song (e.g., the query is "Stairway to Heaven by Led Zeppelin"), populate the 'resolvedSong' field.
            - If the query is ambiguous and could refer to several songs (e.g., "Yesterday" which has been covered many times, or a common title), provide a list of the 3-5 most likely candidates in the 'suggestions' field.
            - If you cannot find any plausible song matching the query, set 'notFound' to true.
            - Prioritize original artists but include popular covers if they are very well-known.
            - Only one of 'resolvedSong', 'suggestions', or 'notFound' should be populated in the response.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: findSongSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);

        if (parsedData.resolvedSong) {
            return { resolved: parsedData.resolvedSong };
        }
        if (parsedData.suggestions && parsedData.suggestions.length > 0) {
            return { suggestions: parsedData.suggestions };
        }
        return { notFound: true };

    } catch (error) {
        console.error("Error in findSong:", error);
        throw new Error("Failed to search for the song.");
    }
};

// Step 2: Get chords for a specific song
export const getSongChords = async (song: SongSuggestion): Promise<SongData | null> => {
  try {
    const prompt = `
      Analyze the song "${song.songTitle}" by "${song.artist}" and provide its guitar chords and original lyrics.
      
      Follow these instructions precisely:
      1.  Identify the song title and original artist, confirming it is "${song.songTitle}" by "${song.artist}".
      2.  Break down the song into lines of lyrics.
      3.  For each line of lyrics, determine the correct guitar chords that should be played.
      4.  Place the chord names in a string directly above the lyric syllable where the chord change occurs.
      5.  Ensure the 'chords' and 'lyrics' strings in the output are properly aligned for display in a monospaced font. Use spaces in the chord line to position chords correctly over the lyrics.
      6.  If a line is instrumental (like an intro or solo), represent it in the lyrics field (e.g., "[Guitar Solo]") and provide the chords above it.
      7.  If a line has no chords, the 'chords' field should be an empty string.
      8.  Format the entire output as a single JSON object matching the provided schema. Do not include any text or markdown formatting before or after the JSON object.
      9.  Do NOT invent or create lyrics/chords if the song is not found. If you cannot analyze this specific song, the response should be an empty JSON object.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getChordsSchema,
      },
    });
    
    const jsonString = response.text.trim();
    if (jsonString === '{}') { // Handle the "not found" case from the prompt
        return null;
    }

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