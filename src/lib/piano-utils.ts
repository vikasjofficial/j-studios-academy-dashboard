
import { playSound } from "./sound-utils";

interface Note {
  note: string;
  octave: number;
}

// Play a piano note with the given parameters
export const playPianoNote = (note: string, octave: number, volume = 0.5): void => {
  const noteId = `${note}${octave}`;
  const audioSrc = `/sounds/piano/${noteId.replace('#', 's')}.mp3`;
  
  playSound(audioSrc, volume);
};

// Get mapping of keyboard keys to piano notes
export const getPianoKeyboardMap = (): Record<string, Note> => {
  return {
    // Lower octave (Z-M)
    'z': { note: 'C', octave: 3 },
    's': { note: 'C#', octave: 3 },
    'x': { note: 'D', octave: 3 },
    'd': { note: 'D#', octave: 3 },
    'c': { note: 'E', octave: 3 },
    'v': { note: 'F', octave: 3 },
    'g': { note: 'F#', octave: 3 },
    'b': { note: 'G', octave: 3 },
    'h': { note: 'G#', octave: 3 },
    'n': { note: 'A', octave: 3 },
    'j': { note: 'A#', octave: 3 },
    'm': { note: 'B', octave: 3 },
    
    // Middle octave (Q-U)
    'q': { note: 'C', octave: 4 },
    '2': { note: 'C#', octave: 4 },
    'w': { note: 'D', octave: 4 },
    '3': { note: 'D#', octave: 4 },
    'e': { note: 'E', octave: 4 },
    'r': { note: 'F', octave: 4 },
    '5': { note: 'F#', octave: 4 },
    't': { note: 'G', octave: 4 },
    '6': { note: 'G#', octave: 4 },
    'y': { note: 'A', octave: 4 },
    '7': { note: 'A#', octave: 4 },
    'u': { note: 'B', octave: 4 },
    
    // Upper octave (I-])
    'i': { note: 'C', octave: 5 },
    '9': { note: 'C#', octave: 5 },
    'o': { note: 'D', octave: 5 },
    '0': { note: 'D#', octave: 5 },
    'p': { note: 'E', octave: 5 },
    '[': { note: 'F', octave: 5 },
    '=': { note: 'F#', octave: 5 },
    ']': { note: 'G', octave: 5 }
  };
};
