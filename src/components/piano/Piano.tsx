
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/sound-utils";
import { Slider } from "@/components/ui/slider";

interface PianoKey {
  note: string;
  octave: number;
  isSharp: boolean;
}

export function Piano() {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const pianoRef = useRef<HTMLDivElement>(null);
  
  // Generate piano keys for 3 octaves (C3 to B5)
  const generatePianoKeys = (): PianoKey[] => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keys: PianoKey[] = [];
    
    for (let octave = 3; octave <= 5; octave++) {
      notes.forEach(note => {
        keys.push({
          note: note,
          octave: octave,
          isSharp: note.includes('#')
        });
      });
    }
    
    return keys;
  };
  
  const pianoKeys = generatePianoKeys();
  
  // Play a note when a key is clicked
  const playNote = (key: PianoKey) => {
    if (isMuted) return;
    
    const noteId = `${key.note}${key.octave}`;
    const audioSrc = `/sounds/piano/${noteId.replace('#', 's')}.mp3`;
    
    // Add to active keys
    setActiveKeys(prev => [...prev, noteId]);
    
    // Play the sound
    playSound(audioSrc, volume);
    
    // Remove from active keys after animation
    setTimeout(() => {
      setActiveKeys(prev => prev.filter(k => k !== noteId));
    }, 300);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Keyboard controls
  useEffect(() => {
    const keyMap: Record<string, PianoKey> = {
      'z': { note: 'C', octave: 3, isSharp: false },
      's': { note: 'C#', octave: 3, isSharp: true },
      'x': { note: 'D', octave: 3, isSharp: false },
      'd': { note: 'D#', octave: 3, isSharp: true },
      'c': { note: 'E', octave: 3, isSharp: false },
      'v': { note: 'F', octave: 3, isSharp: false },
      'g': { note: 'F#', octave: 3, isSharp: true },
      'b': { note: 'G', octave: 3, isSharp: false },
      'h': { note: 'G#', octave: 3, isSharp: true },
      'n': { note: 'A', octave: 3, isSharp: false },
      'j': { note: 'A#', octave: 3, isSharp: true },
      'm': { note: 'B', octave: 3, isSharp: false },
      
      'q': { note: 'C', octave: 4, isSharp: false },
      '2': { note: 'C#', octave: 4, isSharp: true },
      'w': { note: 'D', octave: 4, isSharp: false },
      '3': { note: 'D#', octave: 4, isSharp: true },
      'e': { note: 'E', octave: 4, isSharp: false },
      'r': { note: 'F', octave: 4, isSharp: false },
      '5': { note: 'F#', octave: 4, isSharp: true },
      't': { note: 'G', octave: 4, isSharp: false },
      '6': { note: 'G#', octave: 4, isSharp: true },
      'y': { note: 'A', octave: 4, isSharp: false },
      '7': { note: 'A#', octave: 4, isSharp: true },
      'u': { note: 'B', octave: 4, isSharp: false },
      
      'i': { note: 'C', octave: 5, isSharp: false },
      '9': { note: 'C#', octave: 5, isSharp: true },
      'o': { note: 'D', octave: 5, isSharp: false },
      '0': { note: 'D#', octave: 5, isSharp: true },
      'p': { note: 'E', octave: 5, isSharp: false },
      '[': { note: 'F', octave: 5, isSharp: false },
      '=': { note: 'F#', octave: 5, isSharp: true },
      ']': { note: 'G', octave: 5, isSharp: false },
      // Remaining octave 5 keys skipped for simplicity
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        playNote(keyMap[key]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, isMuted]);
  
  return (
    <div className="rounded-lg overflow-hidden border shadow-lg bg-card/90 backdrop-blur-sm p-4">
      <h2 className="text-lg font-semibold mb-2">Practice Piano</h2>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={toggleMute} 
            className="h-8 w-8 p-1"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          <div className="w-24">
            <Slider
              disabled={isMuted}
              value={[volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Use keyboard to play
        </div>
      </div>
      
      <div 
        ref={pianoRef} 
        className="relative h-36 bg-neutral-900 rounded overflow-hidden flex"
      >
        {/* White keys */}
        <div className="relative flex flex-1 z-0">
          {pianoKeys.filter(key => !key.isSharp).map((key) => {
            const noteId = `${key.note}${key.octave}`;
            const isActive = activeKeys.includes(noteId);
            return (
              <div
                key={noteId}
                className={cn(
                  "flex-1 h-full border-r border-neutral-300 bg-white hover:bg-gray-100 cursor-pointer transition-colors relative",
                  isActive && "bg-blue-50"
                )}
                onClick={() => playNote(key)}
              >
                <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500">
                  {key.note}{key.octave}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Black keys */}
        <div className="absolute top-0 left-0 right-0 h-20 flex">
          {pianoKeys.map((key, index) => {
            if (!key.isSharp) return null;
            
            const noteId = `${key.note}${key.octave}`;
            const isActive = activeKeys.includes(noteId);
            const position = index / pianoKeys.length * 100;
            
            return (
              <div
                key={noteId}
                className={cn(
                  "absolute w-[4%] h-full bg-neutral-800 hover:bg-neutral-700 cursor-pointer z-10 rounded-b-sm",
                  isActive && "bg-neutral-700"
                )}
                style={{ 
                  left: `calc(${position}% - 2%)` 
                }}
                onClick={() => playNote(key)}
              />
            );
          })}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-center text-muted-foreground">
        <span className="block sm:inline">Keyboard map: Z-M (lower octave), </span>
        <span className="block sm:inline">Q-U (middle octave), </span>
        <span className="block sm:inline">I-] (upper octave)</span>
      </div>
    </div>
  );
}
