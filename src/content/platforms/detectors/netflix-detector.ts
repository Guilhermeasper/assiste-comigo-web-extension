import { BasePlatformDetector } from '@content/platforms/base/base-platform-detector';
import { VideoElement, VideoMetadata, PlatformConfig } from '@content/types/video-element.types';
import { PLATFORM_SELECTORS } from '@content/platforms/configs/platform-selectors';

export class NetflixDetector extends BasePlatformDetector {
  constructor() {
    const config: PlatformConfig = {
      name: 'netflix',
      selectors: PLATFORM_SELECTORS.netflix.video.split(', '),
      validationFn: (element) => this.isNetflixContext(),
      videoExtractor: (element) => element as HTMLVideoElement,
      metadataExtractor: (element) => this.extractNetflixMetadata(element)
    };
    
    super('netflix', config);
  }

  detect(): VideoElement[] {
    const videos: VideoElement[] = [];
    
    if (!this.isNetflixContext()) {
      return videos;
    }

    const videoElements = document.querySelectorAll(PLATFORM_SELECTORS.netflix.video);
    
    videoElements.forEach(video => {
      if (video instanceof HTMLVideoElement && this.isValidNetflixVideo(video)) {
        videos.push(this.createVideoElement(video, 'native'));
      }
    });
    
    return videos;
  }

  private isNetflixContext(): boolean {
    return window.location.hostname.includes('netflix.com');
  }

  private isValidNetflixVideo(video: HTMLVideoElement): boolean {
    const container = video.closest(PLATFORM_SELECTORS.netflix.container);
    return container !== null && 
           !container.classList.contains('preview') &&
           this.isValidVideo(video);
  }

  private extractNetflixMetadata(element: Element): Partial<VideoMetadata> {
    const titleElement = document.querySelector(PLATFORM_SELECTORS.netflix.title);
    const episodeElement = document.querySelector(PLATFORM_SELECTORS.netflix.episode);
    
    return {
      title: titleElement?.textContent || document.title,
      episode: episodeElement?.textContent || '',
      url: window.location.href
    };
  }
}
