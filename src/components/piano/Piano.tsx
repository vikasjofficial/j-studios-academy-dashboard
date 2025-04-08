
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { playPianoNote, getPianoKeyboardMap, preloadPianoSounds } from "@/lib/piano-utils";
import { toast } from "sonner";

interface PianoKey {
  note: string;
  octave: number;
  isSharp: boolean;
}

export function Piano() {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pianoRef = useRef<HTMLDivElement>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
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
  
  useEffect(() => {
    // Preload piano sounds for better performance
    setIsLoading(true);
    preloadPianoSounds();
    
    // Show welcome message with instructions the first time
    if (showInstructions) {
      toast.info("Piano is ready. Use your keyboard or click the keys to play.", {
        duration: 5000,
      });
      setShowInstructions(false);
    }
    
    // Simulate loading complete
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [showInstructions]);
  
  // Play a note when a key is clicked
  const playNote = (key: PianoKey) => {
    if (isMuted) return;
    
    const noteId = `${key.note}${key.octave}`;
    
    // Add to active keys
    setActiveKeys(prev => [...prev, noteId]);
    
    // Play the note using our updated utility
    playPianoNote(key.note, key.octave, volume);
    
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
    const keyMap = getPianoKeyboardMap();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        const pianoKey = keyMap[key];
        const keyInfo = pianoKeys.find(k => k.note === pianoKey.note && k.octave === pianoKey.octave);
        if (keyInfo) {
          playNote(keyInfo);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, isMuted, pianoKeys]);
  
  return (
    <div className="rounded-lg overflow-hidden border shadow-lg bg-card/90 backdrop-blur-sm p-4">
      <h2 className="text-lg font-semibold mb-2">Practice Piano</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading piano sounds...</p>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
