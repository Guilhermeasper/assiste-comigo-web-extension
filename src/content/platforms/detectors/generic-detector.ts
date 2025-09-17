import { BasePlatformDetector } from '@content/platforms/base/base-platform-detector';
import { VideoElement, VideoMetadata, PlatformConfig } from '@content/types/video-element.types';
import { PLATFORM_SELECTORS } from '@content/platforms/configs/platform-selectors';

export class GenericDetector extends BasePlatformDetector {
  private readonly GENERIC_SELECTORS = [
    'video',
    'iframe[src*="youtube.com/embed"]',
    'iframe[src*="vimeo.com/video"]',
    'iframe[src*="player.twitch.tv"]',
    '[data-video-id] video',
    '.video-player video',
    '.player-container video',
    '.media-player video'
  ];

  constructor() {
    const config: PlatformConfig = {
      name: 'generic',
      selectors: [],
      validationFn: () => true,
      videoExtractor: (element) => this.extractGenericVideo(element),
      metadataExtractor: (element) => this.extractGenericMetadata(element)
    };
    
    super('generic', config);
  }

  detect(): VideoElement[] {
    const videos: VideoElement[] = [];
    const seenElements = new Set<Element>();
    
    this.GENERIC_SELECTORS.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (seenElements.has(element)) return;
        seenElements.add(element);
        
        const video = this.processGenericElement(element);
        if (video) {
          videos.push(video);
        }
      });
    });
    
    return this.deduplicateVideos(videos);
  }

  private processGenericElement(element: Element): VideoElement | null {
    if (element instanceof HTMLVideoElement && this.isValidVideo(element)) {
      return this.createVideoElement(element, 'native');
    }
    
    if (element instanceof HTMLIFrameElement) {
      const platform = this.detectIframePlatform(element);
      return {
        element,
        platform,
        type: 'iframe',
        metadata: this.extractIframeMetadata(element)
      };
    }
    
    const nestedVideo = element.querySelector('video');
    if (nestedVideo instanceof HTMLVideoElement && this.isValidVideo(nestedVideo)) {
      return this.createVideoElement(nestedVideo, 'nested');
    }
    
    return null;
  }

  private detectIframePlatform(iframe: HTMLIFrameElement): string {
    const src = iframe.src;
    if (src.includes('youtube.com')) return 'youtube-embed';
    if (src.includes('vimeo.com')) return 'vimeo-embed';
    if (src.includes('twitch.tv')) return 'twitch-embed';
    return 'generic-iframe';
  }

  private extractGenericVideo(element: Element): HTMLVideoElement | null {
    if (element instanceof HTMLVideoElement) {
      return element;
    }
    const video = element.querySelector('video');
    return video instanceof HTMLVideoElement ? video : null;
  }

  private extractGenericMetadata(element: Element): Partial<VideoMetadata> {
    return {
      title: document.title,
      url: window.location.href
    };
  }

  private extractIframeMetadata(iframe: HTMLIFrameElement): VideoMetadata {
    return {
      title: document.title,
      url: window.location.href,
      duration: 0,
      currentTime: 0,
      paused: true
    };
  }

  private deduplicateVideos(videos: VideoElement[]): VideoElement[] {
    const seen = new Set<HTMLVideoElement>();
    return videos.filter(video => {
      if (video.element instanceof HTMLVideoElement) {
        if (seen.has(video.element)) {
          return false;
        }
        seen.add(video.element);
      }
      return true;
    });
  }
}
