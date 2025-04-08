
import { playSound } from "./sound-utils";

interface Note {
  note: string;
  octave: number;
}

// Generate a tone using the Web Audio API as a fallback when sound files aren't available
const generateTone = (frequency: number, volume: number, duration = 500): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'piano'; // Using 'piano' type for a richer sound than 'sine'
    oscillator.frequency.value = frequency;
    
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    // Stop the tone after the specified duration
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, duration);
  } catch (error) {
    console.error('Error generating tone:', error);
  }
};

// Map note names to frequencies (Hz)
const getNoteFrequency = (note: string, octave: number): number => {
  const noteMap: Record<string, number> = {
    'C': 0,
    'C#': 1,
    'D': 2,
    'D#': 3,
    'E': 4,
    'F': 5,
    'F#': 6,
    'G': 7,
    'G#': 8,
    'A': 9,
    'A#': 10,
    'B': 11
  };
  
  // A4 is 440Hz, each octave is a doubling/halving of frequency
  // Each semitone is the 12th root of 2 (about 1.059463) times the previous semitone
  const semitoneFromA4 = (octave - 4) * 12 + noteMap[note] - noteMap['A'];
  return 440 * Math.pow(2, semitoneFromA4 / 12);
};

// Preload piano sounds for better performance and reduced latency
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload the most common piano sounds
export const preloadPianoSounds = (): void => {
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];
  const octaves = [3, 4, 5];
  
  notes.forEach(note => {
    octaves.forEach(octave => {
      const noteId = `${note}${octave}`;
      const audioSrc = `/sounds/piano/${noteId.replace('#', 's')}.mp3`;
      
      // Create and cache the audio element
      const audio = new Audio();
      audio.src = audioSrc;
      audio.preload = 'auto';
      audioCache[noteId] = audio;
      
      // Load the audio file
      audio.load();
    });
  });
};

// Play a piano note with the given parameters
export const playPianoNote = (note: string, octave: number, volume = 0.5): void => {
  const noteId = `${note}${octave}`;
  
  // Use cached audio if available
  if (audioCache[noteId]) {
    // Clone the audio node to allow overlapping notes
    const audioNode = audioCache[noteId].cloneNode() as HTMLAudioElement;
    audioNode.volume = volume;
    audioNode.play().catch(error => {
      console.error('Error playing cached sound:', error);
      fallbackToGeneratedTone(note, octave, volume);
    });
    return;
  }
  
  // If not cached, try to load and play directly
  const audioSrc = `/sounds/piano/${noteId.replace('#', 's')}.mp3`;
  const audio = new Audio(audioSrc);
  audio.volume = volume;
  
  // Try to play the sound file with minimal latency
  audio.play().catch(error => {
    console.error('Error playing piano sound:', error);
    fallbackToGeneratedTone(note, octave, volume);
  });
};

// Fallback to generated tone when audio file fails
const fallbackToGeneratedTone = (note: string, octave: number, volume: number): void => {
  const frequency = getNoteFrequency(note, octave);
  generateTone(frequency, volume);
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
