/**
 * Create a proper WAV file from any audio blob
 * This just creates a File object with the correct name and mime type
 */
export function createWavFile(audioBlob: Blob, filename: string = 'recording.wav'): File {
  if (!audioBlob) {
    throw new Error('audioBlob is required to create WAV file');
  }
  
  // Ensure .wav extension
  if (!filename.toLowerCase().endsWith('.wav')) {
    filename = filename.replace(/\.[^/.]+$/, '') + '.wav';
  }
  
  const file = new File([audioBlob], filename, { 
    type: 'audio/wav',
    lastModified: Date.now()
  });
  
  return file;
}