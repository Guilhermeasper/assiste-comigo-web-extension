import { VideoElement, VideoMetadata, PlatformConfig } from '@content/types/video-element.types';
import { VideoValidator } from '@content/validators/video-validator';

export abstract class BasePlatformDetector {
  protected platformName: string;
  protected config: PlatformConfig;

  constructor(platformName: string, config: PlatformConfig) {
    this.platformName = platformName;
    this.config = config;
  }

  abstract detect(): VideoElement[];
  
  protected extractBasicMetadata(element: Element): VideoMetadata {
    return {
      title: document.title,
      url: window.location.href,
      duration: element instanceof HTMLVideoElement ? element.duration : 0,
      currentTime: element instanceof HTMLVideoElement ? element.currentTime : 0,
      paused: element instanceof HTMLVideoElement ? element.paused : true
    };
  }

  protected isValidVideo(video: HTMLVideoElement): boolean {
    return VideoValidator.isValidVideo(video);
  }

  protected extractVideoFromElement(element: Element): HTMLVideoElement | null {
    if (element instanceof HTMLVideoElement) {
      return element;
    }
    
    const video = element.querySelector('video');
    return video instanceof HTMLVideoElement ? video : null;
  }

  protected createVideoElement(
    element: HTMLVideoElement | HTMLIFrameElement, 
    type: 'native' | 'iframe' | 'nested'
  ): VideoElement {
    const metadata = this.config.metadataExtractor 
      ? { ...this.extractBasicMetadata(element), ...this.config.metadataExtractor(element) }
      : this.extractBasicMetadata(element);

    return {
      element,
      platform: this.platformName,
      type,
      metadata
    };
  }
}
