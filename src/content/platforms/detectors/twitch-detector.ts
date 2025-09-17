import { BasePlatformDetector } from '@content/platforms/base/base-platform-detector';
import { VideoElement, VideoMetadata, PlatformConfig } from '@content/types/video-element.types';
import { PLATFORM_SELECTORS } from '@content/platforms/configs/platform-selectors';

export class TwitchDetector extends BasePlatformDetector {
  constructor() {
    const config: PlatformConfig = {
      name: 'twitch',
      selectors: [PLATFORM_SELECTORS.twitch.video],
      validationFn: (element) => this.isTwitchContext(),
      videoExtractor: (element) => element as HTMLVideoElement,
      metadataExtractor: (element) => this.extractTwitchMetadata(element)
    };
    
    super('twitch', config);
  }

  detect(): VideoElement[] {
    const videos: VideoElement[] = [];
    
    if (!this.isTwitchContext()) {
      return videos;
    }

    const videoElement = document.querySelector(PLATFORM_SELECTORS.twitch.video);
    
    if (videoElement instanceof HTMLVideoElement && this.isValidTwitchVideo(videoElement)) {
      videos.push(this.createVideoElement(videoElement, 'native'));
    }
    
    return videos;
  }

  private isTwitchContext(): boolean {
    return window.location.hostname.includes('twitch.tv');
  }

  private isValidTwitchVideo(video: HTMLVideoElement): boolean {
    const container = video.closest(PLATFORM_SELECTORS.twitch.container);
    return container !== null && 
           !container.classList.contains('offline') &&
           this.isValidVideo(video);
  }

  private extractTwitchMetadata(element: Element): Partial<VideoMetadata> {
    const titleElement = document.querySelector(PLATFORM_SELECTORS.twitch.title);
    const channelElement = document.querySelector(PLATFORM_SELECTORS.twitch.channel);
    
    return {
      title: titleElement?.textContent || document.title,
      channel: channelElement?.textContent || '',
      url: window.location.href,
      isLive: true
    };
  }
}
