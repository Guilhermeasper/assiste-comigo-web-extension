export class DebounceManager {
  private timers: Map<string, number> = new Map();
  private readonly DEFAULT_DELAY = 300;

  debounce<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    delay: number = this.DEFAULT_DELAY
  ): T {
    return ((...args: Parameters<T>) => {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key)!);
      }

      const timer = window.setTimeout(() => {
        fn(...args);
        this.timers.delete(key);
      }, delay);

      this.timers.set(key, timer);
    }) as T;
  }

  cancel(key: string): void {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
  }

  cancelAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

export class VideoDetectionDebouncer {
  private debounceManager: DebounceManager;
  private detectionKey = 'video-detection';

  constructor() {
    this.debounceManager = new DebounceManager();
  }

  debouncedDetection(
    detectionFn: () => void,
    delay: number = 300
  ): void {
    const debouncedFn = this.debounceManager.debounce(
      this.detectionKey,
      detectionFn,
      delay
    );

    debouncedFn();
  }

  cancel(): void {
    this.debounceManager.cancel(this.detectionKey);
  }
}
