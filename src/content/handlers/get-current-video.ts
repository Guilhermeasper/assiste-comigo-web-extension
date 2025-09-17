import { VideoManager } from '@content/video-manager';
import { Handler } from '@shared/types';

export const getCurrentVideo: Handler = {
  event: 'get-current-video',
  origin: 'popup',
  handler: async (message, sender, sendResponse) => {
    try {
      const videoManager = VideoManager.getInstance();
      const currentVideos = videoManager.getCurrentVideos();
      
      if (currentVideos.length === 0) {
        sendResponse(null);
        return;
      }
      
      // Return the first detected video (in most cases there should only be one)
      const video = currentVideos[0];
      const videoInfo = {
        title: video.metadata.title,
        url: video.metadata.url,
        platform: video.platform,
        duration: video.metadata.duration,
        currentTime: video.metadata.currentTime,
        paused: video.metadata.paused
      };
      
      sendResponse(videoInfo);
    } catch (error) {
      console.error('Content: Failed to get current video:', error);
      sendResponse(null);
    }
  },
  bidirectional: true
};
