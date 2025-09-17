import { registerHandlers } from '@content/register-handlers';
import { VideoManager } from '@content/video-manager';

registerHandlers();

// Start video detection and management
const videoManager = VideoManager.getInstance();

setTimeout(() => videoManager.start(), 3000);

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
  videoManager.stop();
});

console.log('Content script started with enhanced video detection');
