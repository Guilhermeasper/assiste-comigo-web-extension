import { VideoElement } from '@content/types/video-element.types';

export class VideoRemovalObserver {
  private trackedVideos: Map<HTMLVideoElement, VideoElement> = new Map();
  private onVideoRemoved: (video: VideoElement) => void;
  private checkInterval: number | null = null;

  constructor(onVideoRemoved: (video: VideoElement) => void) {
    this.onVideoRemoved = onVideoRemoved;
  }

  start(): void {
    if (this.checkInterval === null) {
      this.checkInterval = window.setInterval(() => {
        this.checkForRemovedVideos();
      }, 2000); // Check every 2 seconds
    }
  }

  stop(): void {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  trackVideo(videoElement: VideoElement): void {
    if (videoElement.element instanceof HTMLVideoElement) {
      this.trackedVideos.set(videoElement.element, videoElement);
    }
  }

  untrackVideo(videoElement: HTMLVideoElement): void {
    const tracked = this.trackedVideos.get(videoElement);
    if (tracked) {
      this.onVideoRemoved(tracked);
      this.trackedVideos.delete(videoElement);
    }
  }

  private checkForRemovedVideos(): void {
    const removedVideos: HTMLVideoElement[] = [];
    
    this.trackedVideos.forEach((videoElement, htmlElement) => {
      if (!document.contains(htmlElement)) {
        removedVideos.push(htmlElement);
      }
    });

    removedVideos.forEach(htmlElement => {
      this.untrackVideo(htmlElement);
    });
  }

  getTrackedVideos(): VideoElement[] {
    return Array.from(this.trackedVideos.values());
  }

  cleanup(): void {
    this.stop();
    this.trackedVideos.clear();
  }
}
