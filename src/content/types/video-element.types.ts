export interface VideoElement {
  element: HTMLVideoElement | HTMLIFrameElement;
  platform: string;
  type: 'native' | 'iframe' | 'nested';
  metadata: VideoMetadata;
}

export interface VideoMetadata {
  title: string;
  url: string;
  duration: number;
  currentTime: number;
  paused: boolean;
  episode?: string;
  channel?: string;
  author?: string;
  isLive?: boolean;
}

export interface PlatformConfig {
  name: string;
  selectors: string[];
  validationFn: (element: Element) => boolean;
  videoExtractor: (element: Element) => HTMLVideoElement | null;
  metadataExtractor: (element: Element) => Partial<VideoMetadata>;
}

export interface VideoListeners {
  play: (event: Event) => void;
  pause: (event: Event) => void;
  seeked: (event: Event) => void;
  waiting: (event: Event) => void;
  canplay: (event: Event) => void;
  timeupdate: (event: Event) => void;
}
