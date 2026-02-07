import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { WebAudioSynth } from './synth';
import { getNotesFromAnchor, generateRandomSong } from './utils';

function Player() {
  const [notes, setNotes] = useState<string[]>(getNotesFromAnchor());
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const synth = useRef<WebAudioSynth>(new WebAudioSynth());

  useEffect(() => {
    const handleHashChange = () => {
      setNotes(getNotesFromAnchor());
      setCurrentNoteIndex(0);
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
    if (isButtonPressed && notes.length > 0) {
      // Play just the current note continuously
      const note = notes[currentNoteIndex % notes.length];
      synth.current.startNote(note);

      return () => {
        synth.current.stopNote();
      };
    } else {
      synth.current.stopNote();
    }
  }, [isButtonPressed, notes, currentNoteIndex]);

  const handleButtonDown = (e: Event) => {
    e.preventDefault();
    if (!isButtonPressed && notes.length > 0) {
      setIsButtonPressed(true);
    }
  };

  const handleButtonUp = (e: Event) => {
    e.preventDefault();
    setIsButtonPressed(false);
    // Advance to next note after release
    if (notes.length > 0) {
      setCurrentNoteIndex((prev) => (prev + 1) % notes.length);
    }
  };

  const handleTouchCancel = (e: Event) => {
    e.preventDefault();
    setIsButtonPressed(false);
    // Advance to next note after touch cancel
    if (notes.length > 0) {
      setCurrentNoteIndex((prev) => (prev + 1) % notes.length);
    }
  };

  const handleGenerateRandom = () => {
    const randomNotes = generateRandomSong();
    window.location.hash = `#m=${randomNotes.join(',')}`;
  };

  const handleNoteClick = (index: number) => {
    setCurrentNoteIndex(index);
    // Play the clicked note briefly
    const note = notes[index];
    synth.current.startNote(note);
    setTimeout(() => {
      if (!isButtonPressed) {
        synth.current.stopNote();
      }
    }, 300);
  };

  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-scroll carousel to keep current note centered
  useEffect(() => {
    if (carouselRef.current && notes.length > 0) {
      const noteElements = carouselRef.current.children;
      const currentElement = noteElements[currentNoteIndex] as HTMLElement;
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentNoteIndex, notes]);

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
        touchAction: 'manipulation',
      }}
    >
      {notes.length > 0 && (
        <div
          ref={carouselRef}
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '16px',
            maxWidth: '90vw',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {notes.map((note, index) => (
            <div
              key={index}
              onClick={() => handleNoteClick(index)}
              style={{
                minWidth: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: 'bold',
                backgroundColor: index === currentNoteIndex ? '#4CAF50' : '#e0e0e0',
                color: index === currentNoteIndex ? 'white' : '#333',
                transition: 'all 0.3s ease',
                border: index === currentNoteIndex ? '3px solid #2E7D32' : '2px solid transparent',
                boxShadow: index === currentNoteIndex ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {note}
            </div>
          ))}
        </div>
      )}
      <button
        onMouseDown={handleButtonDown}
        onMouseUp={handleButtonUp}
        onMouseLeave={handleButtonUp}
        onTouchStart={handleButtonDown}
        onTouchEnd={handleButtonUp}
        onTouchCancel={handleTouchCancel}
        disabled={notes.length === 0}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Play Notes
      </button>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleGenerateRandom}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          Random Song
        </button>
        <button
          onClick={() => window.location.href = `/editor${window.location.hash}`}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          {notes.length > 0 ? 'Edit Song' : 'Create Song'}
        </button>
      </div>
      <div
        style={{
          maxWidth: '400px',
          textAlign: 'center',
          padding: '16px',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.6',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '18px' }}>PonRappa</p>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontStyle: 'italic' }}>
          Japanese for "trumpet (rappa) tapping sound (pon)"
        </p>
        <p style={{ margin: '0 0 4px 0', fontStyle: 'italic' }}>
          A simple musical note sequencer for creating and playing melodies
        </p>
        <p style={{ margin: '0 0 12px 0' }}>
          <a
            href="https://github.com/fopina/PonRappa"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#673ab8', textDecoration: 'none' }}
          >
            View on GitHub
          </a>
        </p>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>How to Use</p>
        <p style={{ margin: '0 0 4px 0' }}>
          Press and hold the button to play the highlighted note
        </p>
        <p style={{ margin: '0 0 4px 0' }}>
          Release to advance to the next note
        </p>
        <p style={{ margin: '0' }}>
          Click any note in the carousel to jump to it
        </p>
      </div>
    </div>
  );
}

export default Player;
