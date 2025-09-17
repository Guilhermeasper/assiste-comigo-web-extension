import { VideoDetector } from '@content/video-detector';
import { VideoElement } from '@content/types/video-element.types';
import { VideoDetectionDebouncer } from '@content/utils/debounce-manager';

export class VideoObserver {
  private mutationObserver: MutationObserver;
  private videoDetector: VideoDetector;
  private onVideoDetected: (videos: VideoElement[]) => void;
  private debouncer: VideoDetectionDebouncer;

  constructor(
    videoDetector: VideoDetector,
    onVideoDetected: (videos: VideoElement[]) => void
  ) {
    this.videoDetector = videoDetector;
    this.onVideoDetected = onVideoDetected;
    this.debouncer = new VideoDetectionDebouncer();
    this.mutationObserver = new MutationObserver(this.handleMutations.bind(this));
  }

  start(): void {
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'data-src', 'class', 'style']
    });
  }

  stop(): void {
    this.mutationObserver.disconnect();
    this.debouncer.cancel();
  }

  private handleMutations(mutations: MutationRecord[]): void {
    const hasRelevantChanges = mutations.some(mutation => 
      this.isRelevantMutation(mutation)
    );

    if (hasRelevantChanges) {
      this.debouncedDetection();
    }
  }

  private isRelevantMutation(mutation: MutationRecord): boolean {
    // Check if a video element was added
    if (mutation.type === 'childList') {
      return Array.from(mutation.addedNodes).some(node => 
        node instanceof Element && this.containsVideoElement(node)
      );
    }

    // Check if relevant attributes were changed
    if (mutation.type === 'attributes') {
      const target = mutation.target as Element;
      return target.tagName === 'VIDEO' || 
             target.tagName === 'IFRAME' ||
             this.containsVideoElement(target);
    }

    return false;
  }

  private containsVideoElement(element: Element): boolean {
    return element.tagName === 'VIDEO' ||
           element.tagName === 'IFRAME' ||
           element.querySelector('video') !== null ||
           element.querySelector('iframe') !== null ||
           element.classList.contains('video-player') ||
           element.classList.contains('player-container');
  }

  private debouncedDetection(): void {
    this.debouncer.debouncedDetection(() => {
      const videos = this.videoDetector.detectAllVideos();
      if (videos.length > 0) {
        this.onVideoDetected(videos);
      }
    }, 300);
  }
}
