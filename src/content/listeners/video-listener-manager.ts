import { VideoListeners } from '@content/types/video-element.types';

export class VideoListenerManager {
  private listeners: Map<HTMLVideoElement, VideoListeners> = new Map();
  // private observer: MutationObserver;
  private eventCallbacks: {
    onPlay?: (video: HTMLVideoElement) => void;
    onPause?: (video: HTMLVideoElement) => void;
    onSeeked?: (video: HTMLVideoElement) => void;
    onWaiting?: (video: HTMLVideoElement) => void;
    onCanPlay?: (video: HTMLVideoElement) => void;
    onTimeUpdate?: (video: HTMLVideoElement) => void;
  } = {};

  constructor() {
    // this.observer = new MutationObserver(this.handleMutations.bind(this));
    // this.observer.observe(document.body, {
    //   childList: true,
    //   subtree: true
    // });
  }

  setEventCallbacks(callbacks: typeof this.eventCallbacks): void {
    this.eventCallbacks = { ...this.eventCallbacks, ...callbacks };
  }

  addListeners(videoElement: HTMLVideoElement): void {
    if (this.listeners.has(videoElement)) {
      return; // Already has listeners
    }

    const listeners: VideoListeners = {
      play: this.createPlayListener(videoElement),
      pause: this.createPauseListener(videoElement),
      seeked: this.createSeekListener(videoElement),
      waiting: this.createWaitingListener(videoElement),
      canplay: this.createCanPlayListener(videoElement),
      timeupdate: this.createTimeUpdateListener(videoElement),
    };

    // Add listeners
    videoElement.addEventListener('play', listeners.play);
    videoElement.addEventListener('pause', listeners.pause);
    videoElement.addEventListener('seeked', listeners.seeked);
    videoElement.addEventListener('waiting', listeners.waiting);
    videoElement.addEventListener('canplay', listeners.canplay);
    videoElement.addEventListener('timeupdate', listeners.timeupdate);

    this.listeners.set(videoElement, listeners);
  }

  removeListeners(videoElement: HTMLVideoElement): void {
    const listeners = this.listeners.get(videoElement);
    if (!listeners) return;

    // Remove listeners
    videoElement.removeEventListener('play', listeners.play);
    videoElement.removeEventListener('pause', listeners.pause);
    videoElement.removeEventListener('seeked', listeners.seeked);
    videoElement.removeEventListener('waiting', listeners.waiting);
    videoElement.removeEventListener('canplay', listeners.canplay);
    videoElement.removeEventListener('timeupdate', listeners.timeupdate);

    this.listeners.delete(videoElement);
  }

  private createPlayListener(video: HTMLVideoElement) {
    return (event: Event) => {
      this.eventCallbacks.onPlay?.(video);
    };
  }

  private createPauseListener(video: HTMLVideoElement) {
    return (event: Event) => {
      this.eventCallbacks.onPause?.(video);
    };
  }

  private createSeekListener(video: HTMLVideoElement) {
    return (event: Event) => {
      this.eventCallbacks.onSeeked?.(video);
    };
  }

  private createWaitingListener(video: HTMLVideoElement) {
    return (event: Event) => {
      this.eventCallbacks.onWaiting?.(video);
    };
  }

  private createCanPlayListener(video: HTMLVideoElement) {
    return (event: Event) => {
      this.eventCallbacks.onCanPlay?.(video);
    };
  }

  private createTimeUpdateListener(video: HTMLVideoElement) {
    return (event: Event) => {
      this.eventCallbacks.onTimeUpdate?.(video);
    };
  }

  // private handleMutations(mutations: MutationRecord[]): void {
  //   mutations.forEach(mutation => {
  //     if (mutation.type === 'childList') {
  //       mutation.removedNodes.forEach(node => {
  //         if (node instanceof Element) {
  //           const videos = node.querySelectorAll('video');
  //           videos.forEach(video => this.removeListeners(video));

  //           if (node.tagName === 'VIDEO') {
  //             this.removeListeners(node as HTMLVideoElement);
  //           }
  //         }
  //       });
  //     }
  //   });
  // }

  cleanup(): void {
    this.listeners.forEach((_, videoElement) => {
      this.removeListeners(videoElement);
    });
    this.listeners.clear();
    // this.observer.disconnect();
  }
}
