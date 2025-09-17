import { BasePlatformDetector } from '@content/platforms/base/base-platform-detector';
import { GenericDetector } from '@content/platforms/detectors/generic-detector';
import { NetflixDetector } from '@content/platforms/detectors/netflix-detector';
import { TwitchDetector } from '@content/platforms/detectors/twitch-detector';
import { VimeoDetector } from '@content/platforms/detectors/vimeo-detector';
import { YouTubeDetector } from '@content/platforms/detectors/youtube-detector';
import { VideoElement } from '@content/types/video-element.types';
import { VisibilityChecker } from '@content/utils/visibility-checker';

export class VideoDetector {
  private static instance: VideoDetector;
  private detectors: BasePlatformDetector[];
  private visibilityChecker: VisibilityChecker;
  private detectedVideos: Set<HTMLVideoElement> = new Set();

  private constructor() {
    this.detectors = [
      new YouTubeDetector(),
      new NetflixDetector(),
      new TwitchDetector(),
      new VimeoDetector(),
      new GenericDetector() // Always last as fallback
    ];
    this.visibilityChecker = VisibilityChecker.getInstance();
  }

  static getInstance(): VideoDetector {
    if (!VideoDetector.instance) {
      VideoDetector.instance = new VideoDetector();
    }
    return VideoDetector.instance;
  }

  detectAllVideos(): VideoElement[] {
    const allVideos: VideoElement[] = [];
    const seenElements = new Set<Element>();

    // Try platform-specific detectors first
    for (const detector of this.detectors) {
      const platformVideos = detector.detect();
      
      for (const video of platformVideos) {
        if (!seenElements.has(video.element)) {
          seenElements.add(video.element);
          
          allVideos.push(video);
          this.detectedVideos.add(video.element as HTMLVideoElement);

        }
      }
      
      // If we found videos with a specific detector, don't use generic
      if (platformVideos.length > 0 && detector.constructor.name !== 'GenericDetector') {
        break;
      }
    }

    return allVideos;
  }

  private isVideoVisible(element: Element): boolean {
    return this.visibilityChecker.isElementVisible(element);
  }

  startObserving(element: Element): void {
    this.visibilityChecker.observeElement(element);
  }

  stopObserving(element: Element): void {
    this.visibilityChecker.unobserveElement(element);
  }

  getDetectedVideos(): Set<HTMLVideoElement> {
    return new Set(this.detectedVideos);
  }

  clearDetectedVideos(): void {
    this.detectedVideos.clear();
  }

  cleanup(): void {
    this.detectedVideos.clear();
    this.visibilityChecker.cleanup();
  }
}
