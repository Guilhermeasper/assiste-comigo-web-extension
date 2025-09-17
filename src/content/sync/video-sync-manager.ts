import { VideoElement } from '@content/types/video-element.types';
import { DebounceManager } from '@content/utils/debounce-manager';
import { Dispatcher } from '@shared/dispatcher';

export class VideoSyncManager {
  private static instance: VideoSyncManager;
  private debounceManager: DebounceManager;
  private dispatcher: Dispatcher;
  private currentVideo: HTMLVideoElement | null = null;
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
    if (this.currentVideo) {
      this.removeVideoListeners(this.currentVideo);
    }

    if (videoElement.element instanceof HTMLVideoElement) {
      this.currentVideo = videoElement.element;
      this.addVideoListeners(this.currentVideo);
      console.log('VideoSyncManager: Set current video for synchronization');
    }
  }

  setSessionActive(active: boolean): void {
    this.sessionActive = active;
    if (!active) {
      this.currentVideo = null;
      this.bufferingState = false;
    }
  }

  private addVideoListeners(video: HTMLVideoElement): void {
    video.addEventListener('play', this.handlePlay.bind(this));
    video.addEventListener('pause', this.handlePause.bind(this));
    video.addEventListener('seeked', this.handleSeeked.bind(this));
    video.addEventListener('waiting', this.handleWaiting.bind(this));
    video.addEventListener('canplay', this.handleCanPlay.bind(this));
    video.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
  }

  private removeVideoListeners(video: HTMLVideoElement): void {
    video.removeEventListener('play', this.handlePlay.bind(this));
    video.removeEventListener('pause', this.handlePause.bind(this));
    video.removeEventListener('seeked', this.handleSeeked.bind(this));
    video.removeEventListener('waiting', this.handleWaiting.bind(this));
    video.removeEventListener('canplay', this.handleCanPlay.bind(this));
    video.removeEventListener('timeupdate', this.handleTimeUpdate.bind(this));
  }

  private handlePlay(): void {
    if (!this.sessionActive || !this.currentVideo || this.isFromServer) {
      this.isFromServer = false;
      return;
    }

    console.log('VideoSyncManager: Local play event');
    
    this.debounceManager.debounce('play-event', () => {
      this.sendVideoEvent('play', {
        currentTime: this.currentVideo?.currentTime || 0
      });
    }, 100);
  }

  private handlePause(): void {
    if (!this.sessionActive || !this.currentVideo || this.isFromServer) {
      this.isFromServer = false;
      return;
    }

    // Don't send pause if it's due to buffering
    if (this.bufferingState) {
      return;
    }

    console.log('VideoSyncManager: Local pause event');
    
    this.debounceManager.debounce('pause-event', () => {
      this.sendVideoEvent('pause', {
        currentTime: this.currentVideo?.currentTime || 0
      });
    }, 100);
  }

  private handleSeeked(): void {
    if (!this.sessionActive || !this.currentVideo || this.isFromServer) {
      this.isFromServer = false;
      return;
    }

    console.log('VideoSyncManager: Local seek event');
    
    this.debounceManager.debounce('seek-event', () => {
      this.sendVideoEvent('seek', {
        currentTime: this.currentVideo?.currentTime || 0,
        targetTime: this.currentVideo?.currentTime || 0
      });
    }, 500);
  }

  private handleWaiting(): void {
    if (!this.sessionActive || !this.currentVideo) {
      return;
    }

    this.bufferingState = true;
    console.log('VideoSyncManager: Video buffering started');
    
    this.sendVideoEvent('buffering', {
      currentTime: this.currentVideo.currentTime
    });
  }

  private handleCanPlay(): void {
    if (!this.sessionActive || !this.currentVideo) {
      return;
    }

    if (this.bufferingState) {
      this.bufferingState = false;
      console.log('VideoSyncManager: Video buffering ended');
      
      this.sendVideoEvent('ready', {
        currentTime: this.currentVideo.currentTime
      });
    }
  }

  private handleTimeUpdate(): void {
    // This is called frequently, so we don't log it
    // Could be used for periodic sync checks in the future
  }

  private sendVideoEvent(event: string, data: any): void {
    try {
      this.dispatcher.sendMessage({
        type: `video-${event}`,
        payload: data,
        source: 'content'
      });
    } catch (error) {
      console.error('VideoSyncManager: Failed to send video event:', error);
    }
  }

  private setupServerEventListeners(): void {
    // These will be called when events are received from the server
    this.dispatcher.register('sync-play', 'background', this.handleServerPlay.bind(this));
    this.dispatcher.register('sync-pause', 'background', this.handleServerPause.bind(this));
    this.dispatcher.register('sync-seek', 'background', this.handleServerSeek.bind(this));
    this.dispatcher.register('sync-buffering', 'background', this.handleServerBuffering.bind(this));
  }

  private handleServerPlay(data: any): void {
    if (!this.currentVideo || !this.sessionActive) {
      return;
    }

    console.log('VideoSyncManager: Received server play event', data);
    
    this.isFromServer = true;
    
    // Sync time if necessary
    const timeDiff = Math.abs(this.currentVideo.currentTime - (data.currentTime || 0));
    if (timeDiff > 1) { // More than 1 second difference
      this.currentVideo.currentTime = data.currentTime || 0;
    }
    
    // Play the video
    this.currentVideo.play().catch(error => {
      console.error('VideoSyncManager: Failed to play video:', error);
    });
  }

  private handleServerPause(data: any): void {
    if (!this.currentVideo || !this.sessionActive) {
      return;
    }

    console.log('VideoSyncManager: Received server pause event', data);
    
    this.isFromServer = true;
    
    // Sync time if necessary
    const timeDiff = Math.abs(this.currentVideo.currentTime - (data.currentTime || 0));
    if (timeDiff > 1) { // More than 1 second difference
      this.currentVideo.currentTime = data.currentTime || 0;
    }
    
    // Pause the video
    this.currentVideo.pause();
  }

  private handleServerSeek(data: any): void {
    if (!this.currentVideo || !this.sessionActive) {
      return;
    }

    console.log('VideoSyncManager: Received server seek event', data);
    
    this.isFromServer = true;
    
    // Seek to the target time
    this.currentVideo.currentTime = data.targetTime || 0;
  }

  private handleServerBuffering(data: any): void {
    if (!this.currentVideo || !this.sessionActive) {
      return;
    }

    console.log('VideoSyncManager: Received server buffering event', data);
    
    // Pause during other user's buffering
    this.isFromServer = true;
    this.currentVideo.pause();
  }

  cleanup(): void {
    if (this.currentVideo) {
      this.removeVideoListeners(this.currentVideo);
      this.currentVideo = null;
    }
    
    this.debounceManager.cancelAll();
    this.sessionActive = false;
    this.bufferingState = false;
  }
}
