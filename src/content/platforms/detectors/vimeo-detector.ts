import { BasePlatformDetector } from '@content/platforms/base/base-platform-detector';
import { VideoElement, VideoMetadata, PlatformConfig } from '@content/types/video-element.types';
import { PLATFORM_SELECTORS } from '@content/platforms/configs/platform-selectors';

export class VimeoDetector extends BasePlatformDetector {
  constructor() {
    const config: PlatformConfig = {
      name: 'vimeo',
      selectors: [PLATFORM_SELECTORS.vimeo.video, PLATFORM_SELECTORS.vimeo.iframe],
      validationFn: (element) => this.isVimeoContext(element),
      videoExtractor: (element) => this.extractVimeoVideo(element),
      metadataExtractor: (element) => this.extractVimeoMetadata(element)
    };
    
    super('vimeo', config);
  }

  detect(): VideoElement[] {
    const videos: VideoElement[] = [];
    
    // Detect Vimeo iframes
    const iframes = document.querySelectorAll(PLATFORM_SELECTORS.vimeo.iframe);
    iframes.forEach(iframe => {
      if (iframe instanceof HTMLIFrameElement) {
        videos.push(this.createVideoElement(iframe, 'iframe'));
      }
    });
    
    // Detect native videos (for Vimeo embeds)
    const nativeVideos = document.querySelectorAll(PLATFORM_SELECTORS.vimeo.video);
    nativeVideos.forEach(video => {
      if (video instanceof HTMLVideoElement && this.isVimeoVideo(video)) {
        videos.push(this.createVideoElement(video, 'native'));
      }
    });
    
    return videos;
  }

  private isVimeoContext(element: Element): boolean {
    if (element instanceof HTMLIFrameElement) {
      return element.src.includes('player.vimeo.com');
    }
    return window.location.hostname.includes('vimeo.com') || this.isVimeoVideo(element);
  }

  private isVimeoVideo(element: Element): boolean {
    if (!(element instanceof HTMLVideoElement)) return false;
    
    const src = element.src || element.currentSrc;
    return src.includes('vimeo.com') || 
           element.closest('[data-vimeo-id]') !== null;
  }

  private extractVimeoVideo(element: Element): HTMLVideoElement | null {
    if (element instanceof HTMLVideoElement) {
      return element;
    }
    // For iframes, we can't access the video element directly
    return null;
  }

  private extractVimeoMetadata(element: Element): Partial<VideoMetadata> {
    const titleElement = document.querySelector(PLATFORM_SELECTORS.vimeo.title);
    const authorElement = document.querySelector(PLATFORM_SELECTORS.vimeo.author);
    
    return {
      title: titleElement?.textContent || document.title,
      author: authorElement?.textContent || '',
      url: window.location.href
    };
  }
}
