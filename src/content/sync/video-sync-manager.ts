import { VideoElement } from '@content/types/video-element.types';
import { DebounceManager } from '@content/utils/debounce-manager';
import { Dispatcher } from '@shared/dispatcher';

export class VideoSyncManager {
  private static instance: VideoSyncManager;
  private debounceManager: DebounceManager;
  private dispatcher: Dispatcher;
  private currentVideo!: HTMLVideoElement;
  private isFromServer = false;
  private lastSyncTime = 0;
  private bufferingState = false;
  private sessionActive = false;

  private constructor() {
    this.debounceManager = new DebounceManager();
    this.dispatcher = Dispatcher.getInstance();
    this.setupServerEventListeners();
  }

  static getInstance(): VideoSyncManager {
    if (!VideoSyncManager.instance) {
      VideoSyncManager.instance = new VideoSyncManager();
    }
    return VideoSyncManager.instance;
  }

  setCurrentVideo(videoElement: VideoElement): void {
    if (videoElement.element instanceof HTMLVideoElement) {
      this.currentVideo = videoElement.element;
      console.log('VideoSyncManager: Set current video for synchronization');
    }
  }

  setSessionActive(active: boolean): void {
    this.sessionActive = active;
    if (!active) {
      this.bufferingState = false;
    }
  }

  private setupServerEventListeners(): void {
    // These will be called when events are received from the server
    this.dispatcher.register(
      'sync-play',
      'background',
      this.handleServerPlay.bind(this),
    );
    this.dispatcher.register(
      'sync-pause',
      'background',
      this.handleServerPause.bind(this),
    );
    this.dispatcher.register(
      'sync-seek',
      'background',
      this.handleServerSeek.bind(this),
    );
    this.dispatcher.register(
      'sync-buffering',
      'background',
      this.handleServerBuffering.bind(this),
    );
  }

  private handleServerPlay(data: any): void {
    console.log('VideoSyncManager: Received server play event', data);

    this.isFromServer = true;

    // Sync time if necessary
    const timeDiff = Math.abs(
      this.currentVideo.currentTime - (data.currentTime || 0),
    );
    if (timeDiff > 1) {
      // More than 1 second difference
      this.currentVideo.currentTime = data.currentTime || 0;
    }

    // Play the video
    this.currentVideo.play().catch((error) => {
      console.error('VideoSyncManager: Failed to play video:', error);
    });
  }

  private handleServerPause(data: any): void {
    console.log('VideoSyncManager: Received server pause event', data);

    this.isFromServer = true;

    // Sync time if necessary
    const timeDiff = Math.abs(
      this.currentVideo.currentTime - (data.currentTime || 0),
    );
    if (timeDiff > 1) {
      // More than 1 second difference
      this.currentVideo.currentTime = data.currentTime || 0;
    }

    // Pause the video
    this.currentVideo.pause();
  }

  private handleServerSeek(data: any): void {
    console.log('VideoSyncManager: Received server seek event', data);

    this.isFromServer = true;

    // Seek to the target time
    this.currentVideo.currentTime = data.targetTime || 0;
  }

  private handleServerBuffering(data: any): void {
    console.log('VideoSyncManager: Received server buffering event', data);

    // Pause during other user's buffering
    this.isFromServer = true;
    this.currentVideo.pause();
  }

  cleanup(): void {
    this.debounceManager.cancelAll();
    this.sessionActive = false;
    this.bufferingState = false;
  }
}
