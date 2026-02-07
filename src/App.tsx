import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';

// Mock Tone.js for this example (replace with actual Tone.js in a real app)
interface ToneSynth {
  triggerAttackRelease: (note: string, duration: string) => void;
  dispose: () => void;
  currentTimeout: NodeJS.Timeout | null;
}
const Tone = {
  Synth: function () {
    this.triggerAttackRelease = (note: string, duration: string) => {
      console.log(`Playing: ${note} for ${duration}`);
      // Simulate sound with a timeout
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
      }
      this.currentTimeout = setTimeout(() => {
        console.log(`Stopped: ${note}`);
      }, duration * 1000);
    };
    this.currentTimeout = null;
    this.dispose = () => {
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
      }
    };
  } as unknown as new () => ToneSynth,
  now: () => 0, // Mock current time
};

// Helper function to parse the notes from the URL anchor
function getNotesFromAnchor(): string[] {
  const anchor = window.location.hash;
  if (!anchor || !anchor.startsWith('#m=')) {
    return [];
  }
  return anchor.substring(3).split(',');
}

// Helper function to generate a random song
function generateRandomSong(): string[] {
  const availableNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const songLength = 8 + Math.floor(Math.random() * 9); // 8-16 notes
  const randomNotes: string[] = [];

  for (let i = 0; i < songLength; i++) {
    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    randomNotes.push(availableNotes[randomIndex]);
  }

  return randomNotes;
}

// Main App component
function App() {
  const [notes, setNotes] = useState<string[]>(getNotesFromAnchor());
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);
  const currentNoteIndex = useRef<number>(0);
  const synth = useRef<ToneSynth>(new Tone.Synth());

  useEffect(() => {
    const handleHashChange = () => {
      setNotes(getNotesFromAnchor());
      currentNoteIndex.current = 0;
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      synth.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (isButtonPressed) {
      if (notes.length === 0) return;
      const note = notes[currentNoteIndex.current % notes.length];
      synth.current.triggerAttackRelease(note, '1n');
      currentNoteIndex.current++;

      const interval = setInterval(() => {
        if (!isButtonPressed) {
          clearInterval(interval);
          return;
        }
        const note = notes[currentNoteIndex.current % notes.length];
        synth.current.triggerAttackRelease(note, '1n');
        currentNoteIndex.current++;
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isButtonPressed, notes]);

  const handleButtonDown = () => {
    setIsButtonPressed(true);
  };

  const handleButtonUp = () => {
    setIsButtonPressed(false);
  };

  const handleGenerateRandom = () => {
    const randomNotes = generateRandomSong();
    window.location.hash = `#m=${randomNotes.join(',')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        gap: '16px',
      }}
    >
      <button
        onMouseDown={handleButtonDown}
        onMouseUp={handleButtonUp}
        onTouchStart={handleButtonDown}
        onTouchEnd={handleButtonUp}
        disabled={notes.length === 0}
        style={{ padding: '20px 40px', fontSize: '24px' }}
      >
        Play Notes
      </button>
      <button
        onClick={handleGenerateRandom}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Generate Random Song
      </button>
    </div>
  );
}

export default App;
