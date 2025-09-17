import { BasePlatformDetector } from '@content/platforms/base/base-platform-detector';
import { PLATFORM_SELECTORS } from '@content/platforms/configs/platform-selectors';
import { PlatformConfig, VideoElement, VideoMetadata } from '@content/types/video-element.types';

export class YouTubeDetector extends BasePlatformDetector {
  constructor() {
    const config: PlatformConfig = {
      name: 'youtube',
      selectors: [PLATFORM_SELECTORS.youtube.video],
      validationFn: (element) => this.isYouTubeContext(),
      videoExtractor: (element) => element as HTMLVideoElement,
      metadataExtractor: (element) => this.extractYouTubeMetadata(element)
    };
    
    super('youtube', config);
  }

  detect(): VideoElement[] {
    const videos: VideoElement[] = [];
    
    if (!this.isYouTubeContext()) {
      return videos;
    }

    // Use existing YouTube detection logic
    const playerFound = this.getYouTubePlayer();
    const onWatchPage = document.location.pathname === '/watch';

    if (onWatchPage && playerFound) {
      videos.push(this.createVideoElement(playerFound, 'native'));
    }
    
    return videos;
  }

  private getYouTubePlayer(): HTMLVideoElement | null {
    const video = document.querySelector(PLATFORM_SELECTORS.youtube.video);
    return video instanceof HTMLVideoElement ? video : null;
  }

  private isYouTubeContext(): boolean {
    return window.location.hostname.includes('youtube.com');
  }

  private extractYouTubeMetadata(element: Element): Partial<VideoMetadata> {
    const titleElement = document.querySelector(PLATFORM_SELECTORS.youtube.title);
    const channelElement = document.querySelector(PLATFORM_SELECTORS.youtube.channel);
    
    return {
      title: titleElement?.textContent || document.title,
      channel: channelElement?.textContent || '',
      url: window.location.href
    };
  }
}
