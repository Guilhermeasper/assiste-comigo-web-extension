import { VideoListenerManager } from '@content/listeners/video-listener-manager';
import { VideoObserver } from '@content/observers/video-observer';
import { VideoRemovalObserver } from '@content/observers/video-removal-observer';
import { OverlayManager } from '@content/overlay/overlay-manager';
import { SessionManager } from '@content/session/session-manager';
import { VideoElement } from '@content/types/video-element.types';
import { DebounceManager } from '@content/utils/debounce-manager';
import { VideoDetector } from '@content/video-detector';

export class VideoManager {
  private static instance: VideoManager;
  private videoDetector: VideoDetector;
  private videoObserver: VideoObserver;
  private removalObserver: VideoRemovalObserver;
  private listenerManager: VideoListenerManager;
  private overlayManager: OverlayManager;
  private sessionManager: SessionManager;
  private debounceManager: DebounceManager;
  private currentVideos: Map<Element, VideoElement> = new Map();
  private hoverTimeouts: Map<Element, number> = new Map();

  private constructor() {
    this.videoDetector = VideoDetector.getInstance();
    this.overlayManager = OverlayManager.getInstance();
    this.sessionManager = SessionManager.getInstance();
    this.debounceManager = new DebounceManager();
    this.listenerManager = new VideoListenerManager();

    this.videoObserver = new VideoObserver(
      this.videoDetector,
      this.handleVideosDetected.bind(this),
    );

    this.setupVideoListeners();
  }

  static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
    }
    return VideoManager.instance;
  }

  start(): void {
    console.log('VideoManager: Starting video detection and management');

    // Initial detection
    this.detectAndSetupVideos();

    // Start observers
    this.videoObserver.start();
    this.removalObserver.start();
  }

  stop(): void {
    console.log('VideoManager: Stopping video detection and management');

    this.videoObserver.stop();
    this.removalObserver.stop();
    this.cleanup();
  }

  private detectAndSetupVideos(): void {
    const videos = this.videoDetector.detectAllVideos();
    this.handleVideosDetected(videos);
  }

  private handleVideosDetected(videos: VideoElement[]): void {
    console.log(`VideoManager: Detected ${videos.length} videos`);

    videos.forEach((video) => {
      if (!this.currentVideos.has(video.element)) {
        this.setupVideoInteraction(video);
      }
    });
  }

  private setupVideoInteraction(video: VideoElement): void {
    this.currentVideos.set(video.element, video);

    // Start observing visibility
    this.videoDetector.startObserving(video.element);

    // Track for removal detection
    this.removalObserver.trackVideo(video);

    // Set up video event listeners if it's a native video
    if (video.element instanceof HTMLVideoElement) {
      this.listenerManager.addListeners(video.element);
    }

    // Set up hover interaction
    this.setupHoverInteraction(video);

    console.log(`VideoManager: Set up interaction for ${video.platform} video`);
  }

  private setupHoverInteraction(video: VideoElement): void {
    const element = video.element;

    const onMouseEnter = () => {
      // Clear any existing timeout
      // const existingTimeout = this.hoverTimeouts.get(element);
      // if (existingTimeout) {
      //   clearTimeout(existingTimeout);
      // }

      // Set delay before showing overlay
      // const timeout = window.setTimeout(() => {
      this.overlayManager.showOverlay(video);
      // this.hoverTimeouts.delete(element);
      // }, 300);

      // this.hoverTimeouts.set(element, timeout);
    };

    const onMouseLeave = () => {
      // Clear show timeout
      // const timeout = this.hoverTimeouts.get(element);
      // if (timeout) {
      //   clearTimeout(timeout);
      //   this.hoverTimeouts.delete(element);
      // }
      this.overlayManager.hideOverlay(element);
    };

    element.addEventListener('mouseenter', onMouseEnter.bind(this));
    element.addEventListener('mouseleave', onMouseLeave.bind(this));

    // Store cleanup for later
    const cleanup = () => {
      const timeout = this.hoverTimeouts.get(element);
      if (timeout) {
        clearTimeout(timeout);
        this.hoverTimeouts.delete(element);
      }
      element.removeEventListener('mouseenter', onMouseEnter.bind(this));
      element.removeEventListener('mouseleave', onMouseLeave.bind(this));
    };

    // Store cleanup function on the element for later retrieval
    (element as any).__ac_cleanup = cleanup;
  }

  private handleVideoRemoved(video: VideoElement): void {
    console.log(`VideoManager: Video removed: ${video.platform}`);

    const element = video.element;

    // Stop observing
    this.videoDetector.stopObserving(element);

    // Remove from current videos
    this.currentVideos.delete(element);

    // Clean up listeners
    if (element instanceof HTMLVideoElement) {
      this.listenerManager.removeListeners(element);
    }

    // Clean up hover interaction
    const cleanup = (element as any).__ac_cleanup;
    if (cleanup) {
      cleanup();
      delete (element as any).__ac_cleanup;
    }

    // Hide overlay
    this.overlayManager.hideOverlay(element);
  }

  private setupVideoListeners(): void {
    this.listenerManager.setEventCallbacks({
      onPlay: (video) => {
        console.log('VideoManager: Video play event', video);

        this.sessionManager.sendVideoPlay(
          video.metadata.url,
          video.currentTime,
        );
      },
      onPause: (video) => {
        console.log('VideoManager: Video pause event', video);
        // This will be connected to session sync later
      },
      onSeeked: (video) => {
        console.log('VideoManager: Video seek event', video);
        // This will be connected to session sync later
      },
      onWaiting: (video) => {
        console.log('VideoManager: Video buffering event', video);
        // This will be connected to session sync later
      },
      onCanPlay: (video) => {
        console.log('VideoManager: Video ready event', video);
        // This will be connected to session sync later
      },
      onTimeUpdate: (video) => {
        // This will be connected to session sync later
        // Don't log this one as it fires frequently
      },
    });
  }

  async updateSessionState(
    isActive: boolean,
    sessionInfo?: any,
  ): Promise<void> {
    this.overlayManager.updateSessionState(isActive, sessionInfo);

    if (isActive) {
      // Hide all overlays when session becomes active
      this.overlayManager.hideAllOverlays();

      // Set the current video for synchronization if we have one
      const sessionState = await this.sessionManager.getCurrentSession();
      if (sessionState.videoInfo) {
        const currentVideo = this.findVideoByUrl(sessionState.videoInfo.url);
        if (currentVideo) {
          const { VideoSyncManager } = await import(
            '@content/sync/video-sync-manager'
          );
          const videoSyncManager = VideoSyncManager.getInstance();
          videoSyncManager.setCurrentVideo(currentVideo);
        }
      }
    }
  }

  private findVideoByUrl(url: string): VideoElement | null {
    for (const video of this.currentVideos.values()) {
      if (video.metadata.url === url) {
        return video;
      }
    }
    return null;
  }

  getCurrentVideos(): VideoElement[] {
    return Array.from(this.currentVideos.values());
  }

  private cleanup(): void {
    // Clean up all hover timeouts
    this.hoverTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.hoverTimeouts.clear();

    // Clean up current videos
    this.currentVideos.forEach((video, element) => {
      const cleanup = (element as any).__ac_cleanup;
      if (cleanup) {
        cleanup();
        delete (element as any).__ac_cleanup;
      }
    });
    this.currentVideos.clear();

    // Clean up managers
    this.sessionManager.destroy();
    this.listenerManager.cleanup();
    this.overlayManager.cleanup();
    this.removalObserver.cleanup();
    this.videoDetector.cleanup();
    this.debounceManager.cancelAll();
  }
}
