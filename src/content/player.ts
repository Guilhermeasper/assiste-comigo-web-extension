import { Dispatcher } from '@shared/dispatcher';
import { platform } from 'os';

export class AssisteComigoPlayer {
  dispatcher = Dispatcher.getInstance();
  platform = { name: '' };
  videoElement: HTMLVideoElement | null = null;
  waitingServerPlay = false;
  waitingServerPause = false;
  waitingForSeek = false;
  serverPlay = false;
  serverPause = false;
  serverSeek = false;

  // this class should be a singleton
  static instance: AssisteComigoPlayer;
  static getInstance(platform: any = null): AssisteComigoPlayer {
    if (!AssisteComigoPlayer.instance) {
      AssisteComigoPlayer.instance = new AssisteComigoPlayer(platform);
    }
    return AssisteComigoPlayer.instance;
  }

  private constructor(platform: any) {
    this.platform = platform;
    this.videoElement = platform.videoElement();
  }

  play() {
    if (this.waitingServerPlay) {
      this.waitingServerPlay = false;
      return;
    }
    this.videoElement?.play();
  }

  pause() {
    if (this.waitingServerPause) {
      this.waitingServerPause = false;
      return;
    }
    this.videoElement?.pause();
  }

  seek(time: number) {
    console.log(`Seeking to ${time}`);
  }

  onPlay(): void {
    console.log(new Date().toISOString());
    if (this.serverPlay) {
      this.serverPlay = false;
      return;
    }
    this.waitingServerPlay = true;
    try {
      this.dispatcher.sendMessage(
        {
          type: 'play',
          payload: { platform: this.platform.name },
          source: 'content',
        },
        () => {},
      );
    } catch (error) {
      console.error(error);
    }
  }

  onPause(): void {
    if (this.serverPause) {
      this.serverPause = false;
      return;
    }
    this.waitingServerPause = true;
    try {
      this.dispatcher.sendMessage(
        {
          type: 'pause',
          payload: { platform: this.platform.name },
          source: 'content',
        },
        () => {},
      );
    } catch (error) {
      console.error(error);
    }
  }

  onSeek(): void {
    try {
      this.dispatcher.sendMessage(
        {
          type: 'seek',
          payload: { platform: this.platform.name },
          source: 'content',
        },
        () => {},
      );
    } catch (error) {
      console.error(error);
    }
  }

  appendListeners() {
    this.videoElement?.addEventListener('play', this.onPlay.bind(this));
    this.videoElement?.addEventListener('pause', this.onPause.bind(this));
    this.videoElement?.addEventListener('seeked', this.onSeek.bind(this));
  }

  setVolume(volume: number) {
    console.log(`Setting volume to ${volume}`);
  }

  getVolume() {
    console.log('Getting volume');
  }

  getDuration() {
    console.log('Getting duration');
  }

  getCurrentTime() {
    console.log('Getting current time');
  }

  getPlaybackRate() {
    console.log('Getting playback rate');
  }

  setPlaybackRate(rate: number) {
    console.log(`Setting playback rate to ${rate}`);
  }

  getVideoInfo() {
    console.log('Getting video info');
  }
}
