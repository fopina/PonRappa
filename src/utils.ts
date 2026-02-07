// Helper function to parse the notes from the URL anchor
export function getNotesFromAnchor(): string[] {
  const anchor = window.location.hash;
  if (!anchor || !anchor.startsWith('#m=')) {
    return [];
  }
  const notesString = anchor.substring(3);
  if (!notesString || notesString.trim() === '') {
    return [];
  }
  return notesString.split(',').filter(note => note.trim() !== '');
}

// Helper function to generate a random song
export function generateRandomSong(): string[] {
  const availableNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const songLength = 8 + Math.floor(Math.random() * 9); // 8-16 notes
  const randomNotes: string[] = [];

  for (let i = 0; i < songLength; i++) {
    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    randomNotes.push(availableNotes[randomIndex]);
  }

  return randomNotes;
}
