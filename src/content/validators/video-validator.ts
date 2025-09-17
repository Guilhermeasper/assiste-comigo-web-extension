export class VideoValidator {
  static isValidVideo(video: HTMLVideoElement): boolean {
    return true;
    // this.hasValidDuration(video) &&
    //        this.hasValidReadyState(video) &&
    //        this.isNotPlaceholder(video);
  }

  private static hasValidDuration(video: HTMLVideoElement): boolean {
    return !isNaN(video.duration) && 
           video.duration > 0 && 
           isFinite(video.duration);
  }

  private static hasValidReadyState(video: HTMLVideoElement): boolean {
    return video.readyState >= 2; // HAVE_CURRENT_DATA
  }

  private static isNotPlaceholder(video: HTMLVideoElement): boolean {
    const hasSource = !!(video.src || 
                        video.querySelector('source') || 
                        video.currentSrc);
    
    const hasContent = video.videoWidth > 0 && video.videoHeight > 0;
    
    return hasSource && hasContent;
  }

  static waitForVideoReady(video: HTMLVideoElement): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isValidVideo(video)) {
        resolve(true);
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals

      const checkReady = () => {
        attempts++;
        
        if (this.isValidVideo(video)) {
          resolve(true);
        } else if (attempts >= maxAttempts) {
          resolve(false);
        } else if (video.readyState >= 1) {
          setTimeout(checkReady, 100);
        } else {
          resolve(false);
        }
      };

      const handleLoadedMetadata = () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        checkReady();
      };

      const handleCanPlay = () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        checkReady();
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      
      // Start checking immediately
      setTimeout(checkReady, 100);
    });
  }
}
