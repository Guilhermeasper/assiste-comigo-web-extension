import { VideoOverlay } from '@content/overlay/components/VideoOverlay';
import { OverlayPosition, SessionInfo } from '@content/overlay/types/overlay.types';
import { PositionCalculator } from '@content/overlay/utils/position-calculator';
import { VideoElement } from '@content/types/video-element.types';
import { DebounceManager } from '@content/utils/debounce-manager';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

export class OverlayManager {
  private static instance: OverlayManager;
  private activeOverlays: Map<Element, OverlayInstance> = new Map();
  private debounceManager: DebounceManager;
  private isSessionActive: boolean = false;
  private sessionInfo: SessionInfo | null = null;

  private constructor() {
    this.debounceManager = new DebounceManager();
    this.injectStyles();
    this.injectOverlayRoot();
  }

  static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }

  showOverlay(videoElement: VideoElement): void {
    // Don't show if session is active, in fullscreen, or popup is open
    if (this.shouldPreventOverlay()) {
      return;
    }

    const element = videoElement.element;
    
    // Remove existing overlay for this element
    this.hideOverlay(element);
    this.createOverlay(videoElement)

    // Debounce the overlay creation
    this.debounceManager.debounce(
      `overlay-${this.getElementId(element)}`,
      () => {},
      300
    );
  }

  hideOverlay(element: Element): void {
    const overlayInstance = this.activeOverlays.get(element);
    if (overlayInstance) {
      this.removeOverlay(overlayInstance);
      this.activeOverlays.delete(element);
    }
  }

  hideAllOverlays(): void {
    this.activeOverlays.forEach((overlayInstance, element) => {
      this.removeOverlay(overlayInstance);
    });
    this.activeOverlays.clear();
  }

  updateSessionState(isActive: boolean, sessionInfo?: SessionInfo): void {
    this.isSessionActive = isActive;
    this.sessionInfo = sessionInfo || null;
    
    // Hide all overlays if session becomes active
    if (isActive) {
      this.hideAllOverlays();
    }
  }

  private shouldPreventOverlay(): boolean {
    // Check if in session
    if (this.isSessionActive) {
      return true;
    }

    // Check if in fullscreen
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      return true;
    }

    // Check if popup is open (would need to communicate with background script)
    // For now, we'll implement this check later
    
    return false;
  }

  private createOverlay(videoElement: VideoElement): void {
    const element = videoElement.element;
    
    const container = document.querySelector('.ac-overlay-container') as HTMLElement;

    // Position the overlay
    const position = this.calculatePosition(element);
    this.setOverlayPosition(container, position);

    // Create React root and render
    const root = createRoot(container);
    root.render(
      React.createElement(VideoOverlay, {
        videoElement,
        onCreateSession: this.handleCreateSession.bind(this),
        onJoinSession: this.handleJoinSession.bind(this),
        isSessionActive: this.isSessionActive,
        sessionInfo: this.sessionInfo || undefined
      })
    );

    // Show popover if supported
      (container as any).showPopover();

    // Store overlay instance
    const overlayInstance: OverlayInstance = {
      container,
      root,
      element,
      videoElement
    };
    
    this.activeOverlays.set(element, overlayInstance);

    // Set up hover management
    this.setupHoverManagement(overlayInstance);
  }

  private removeOverlay(overlayInstance: OverlayInstance): void {
    // // Hide popover if supported
    // if ('hidePopover' in overlayInstance.container) {
    //   try {
    //     (overlayInstance.container as any).hidePopover();
    //   } catch (e) {
    //     // Popover might already be hidden
    //   }
    // }

    // // Cleanup React
    // overlayInstance.root.unmount();
    
  }

  private calculatePosition(element: Element): OverlayPosition {
    const basePosition = PositionCalculator.calculatePosition(element);
    return PositionCalculator.adjustForViewport(basePosition);
  }

  private setOverlayPosition(container: HTMLElement, position: OverlayPosition): void {
    container.style.position = 'fixed';
    container.style.top = `${position.top}px`;
    container.style.left = `${position.left}px`;
    container.style.zIndex = '999999';
  }

  private setupHoverManagement(overlayInstance: OverlayInstance): void {
    let hideTimer: number | null = null;
    
    const cancelHide = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const scheduleHide = () => {
      cancelHide();
      hideTimer = window.setTimeout(() => {
        this.hideOverlay(overlayInstance.element);
      }, 100);
    };

    // Video element hover
    const onVideoMouseEnter = () => cancelHide();
    const onVideoMouseLeave = () => scheduleHide();

    // Overlay hover
    const onOverlayMouseEnter = () => cancelHide();
    const onOverlayMouseLeave = () => scheduleHide();

    // Add listeners
    overlayInstance.element.addEventListener('mouseenter', onVideoMouseEnter);
    overlayInstance.element.addEventListener('mouseleave', onVideoMouseLeave);
    overlayInstance.container.addEventListener('mouseenter', onOverlayMouseEnter);
    overlayInstance.container.addEventListener('mouseleave', onOverlayMouseLeave);

    // Store cleanup function
    overlayInstance.cleanup = () => {
      cancelHide();
      overlayInstance.element.removeEventListener('mouseenter', onVideoMouseEnter);
      overlayInstance.element.removeEventListener('mouseleave', onVideoMouseLeave);
      overlayInstance.container.removeEventListener('mouseenter', onOverlayMouseEnter);
      overlayInstance.container.removeEventListener('mouseleave', onOverlayMouseLeave);
    };
  }

  private async handleCreateSession(videoElement: VideoElement): Promise<void> {
    try {
      // Import SessionManager dynamically to avoid circular dependencies
      const { SessionManager } = await import('@content/session/session-manager');
      const sessionManager = SessionManager.getInstance();
      
      const sessionId = await sessionManager.createSession(videoElement);
      console.log('OverlayManager: Session created successfully:', sessionId);
      
      // Hide overlay after creating session
      this.hideOverlay(videoElement.element);
    } catch (error) {
      console.error('OverlayManager: Failed to create session:', error);
      // Could show error notification in overlay
    }
  }

  private async handleJoinSession(sessionId: string): Promise<void> {
    try {
      // Import SessionManager dynamically to avoid circular dependencies
      const { SessionManager } = await import('@content/session/session-manager');
      const sessionManager = SessionManager.getInstance();
      
      await sessionManager.joinSession(sessionId);
      console.log('OverlayManager: Joined session successfully:', sessionId);
      
      // Hide all overlays after joining session
      this.hideAllOverlays();
    } catch (error) {
      console.error('OverlayManager: Failed to join session:', error);
      // Could show error notification in overlay
    }
  }

  private injectStyles(): void {
    if (document.getElementById('ac-overlay-styles')) {
      return; // Already injected
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'ac-overlay-styles';
    styleElement.textContent = `
      .ac-overlay-container {
        position: fixed;
        background-color: #fff;
        color: #000;
      }
    `;
    
    document.head.appendChild(styleElement);

    // Import the main stylesheet (this would need to be bundled properly)
    // For now, we'll inject basic styles inline
  }

  private injectOverlayRoot(): void {
    const container = document.createElement('div');
    container.className = 'ac-overlay-container';
    container.setAttribute('popover', 'manual');
      container.classList.add('ac-popover');
    document.body.appendChild(container);
  }

  private getElementId(element: Element): string {
    return element.tagName + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  cleanup(): void {
    this.hideAllOverlays();
    this.debounceManager.cancelAll();
  }
}

interface OverlayInstance {
  container: HTMLElement;
  root: Root;
  element: Element;
  videoElement: VideoElement;
  cleanup?: () => void;
}
