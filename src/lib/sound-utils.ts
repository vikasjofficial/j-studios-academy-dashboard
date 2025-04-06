
// Sound utility functions

/**
 * Plays a sound effect
 * @param soundPath Path to the sound file
 * @param volume Volume level from 0 to 1
 */
export const playSound = (soundPath: string, volume = 0.5): void => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play().catch(error => {
      // Some browsers require user interaction before playing audio
      console.warn('Audio playback failed:', error);
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

/**
 * Predefined sound effects
 */
export const Sounds = {
  loginSuccess: '/sounds/login-success.mp3'  // Path relative to public directory
};
