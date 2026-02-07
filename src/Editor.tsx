import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { WebAudioSynth } from './synth';
import { getNotesFromAnchor } from './utils';

const AVAILABLE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const AVAILABLE_OCTAVES = ['3', '4', '5', '6'];

function Editor() {
  const [notes, setNotes] = useState<string[]>(getNotesFromAnchor());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const synth = useRef<WebAudioSynth>(new WebAudioSynth());
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      synth.current.dispose();
    };
  }, []);

  const addNote = (note: string, octave: string) => {
    const fullNote = `${note}${octave}`;
    const newNotes = [...notes, fullNote];
    setNotes(newNotes);

    // Play the note briefly
    synth.current.startNote(fullNote);
    setTimeout(() => synth.current.stopNote(), 300);
  };

  const removeNote = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
  };

  const clearAll = () => {
    setNotes([]);
  };

  const handleDone = () => {
    const newHash = notes.length > 0 ? `#m=${notes.join(',')}` : '#m=';
    window.location.href = `/${newHash}`;
  };

  const handleCancel = () => {
    window.location.href = `/${window.location.hash}`;
  };

  const playNote = (note: string) => {
    synth.current.startNote(note);
    setTimeout(() => synth.current.stopNote(), 300);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent, overIndex: number) => {
    e.preventDefault();
    setDragOverIndex(overIndex);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newNotes = [...notes];
      const [draggedNote] = newNotes.splice(draggedIndex, 1);
      newNotes.splice(dragOverIndex, 0, draggedNote);
      setNotes(newNotes);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTouchStart = (index: number, e: TouchEvent) => {
    // Start a long press timer
    longPressTimer.current = window.setTimeout(() => {
      setDraggedIndex(index);
      playNote(notes[index]);
    }, 200); // 200ms long press
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Cancel long press if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (draggedIndex === null) return;

    e.preventDefault();

    // Find which note we're hovering over
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const noteElement = elements.find(el => el.getAttribute('data-note-index'));

    if (noteElement) {
      const overIndex = parseInt(noteElement.getAttribute('data-note-index') || '0');
      setDragOverIndex(overIndex);
    }
  };

  const handleTouchEnd = () => {
    // Cancel long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newNotes = [...notes];
      const [draggedNote] = newNotes.splice(draggedIndex, 1);
      newNotes.splice(dragOverIndex, 0, draggedNote);
      setNotes(newNotes);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        gap: '20px',
      }}
    >
      <h1 style={{ margin: '20px 0', color: '#673ab8' }}>Song Editor</h1>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleCancel}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleDone}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>

      {/* Current sequence */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Current Sequence</h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            minHeight: '80px',
          }}
        >
          {notes.length === 0 ? (
            <p style={{ color: '#999', margin: '20px auto' }}>No notes yet. Add notes below to create your song.</p>
          ) : (
            notes.map((note, index) => (
              <div
                key={index}
                data-note-index={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(index, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  position: 'relative',
                  minWidth: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  backgroundColor: draggedIndex === index ? '#7CB342' : '#4CAF50',
                  color: 'white',
                  cursor: 'move',
                  userSelect: 'none',
                  opacity: draggedIndex === index ? 0.5 : 1,
                  transform: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
                onClick={() => playNote(note)}
              >
                {note}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNote(index);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: '1',
                    padding: '0',
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        {notes.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Note picker */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Add Notes</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          Click on any note to add it to your sequence
        </p>

        {AVAILABLE_OCTAVES.map((octave) => (
          <div key={octave} style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#999' }}>
              Octave {octave}
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {AVAILABLE_NOTES.map((note) => (
                <button
                  key={`${note}${octave}`}
                  onClick={() => addNote(note, octave)}
                  style={{
                    minWidth: '60px',
                    height: '60px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#673ab8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7e4ec9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#673ab8';
                  }}
                >
                  {note}{octave}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Editor;
