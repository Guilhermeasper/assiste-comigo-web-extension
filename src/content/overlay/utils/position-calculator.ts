import { OverlayPosition } from '@content/overlay/types/overlay.types';

export class PositionCalculator {
  private static readonly POPOVER_WIDTH = 300;
  private static readonly POPOVER_HEIGHT = 200;
  private static readonly MARGIN = 10;

  static calculatePosition(videoElement: Element): OverlayPosition {
    const rect = videoElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Try positioning to the right first
    if (rect.right + this.POPOVER_WIDTH + this.MARGIN <= viewport.width) {
      return {
        top: rect.top + rect.height / 2 - this.POPOVER_HEIGHT / 2,
        left: rect.right + this.MARGIN,
        placement: 'right'
      };
    }

    // Try positioning to the left
    if (rect.left - this.POPOVER_WIDTH - this.MARGIN >= 0) {
      return {
        top: rect.top + rect.height / 2 - this.POPOVER_HEIGHT / 2,
        left: rect.left - this.POPOVER_WIDTH - this.MARGIN,
        placement: 'left'
      };
    }

    // Try positioning below
    if (rect.bottom + this.POPOVER_HEIGHT + this.MARGIN <= viewport.height) {
      return {
        top: rect.bottom + this.MARGIN,
        left: rect.left + rect.width / 2 - this.POPOVER_WIDTH / 2,
        placement: 'bottom'
      };
    }

    // Position above as fallback
    return {
      top: rect.top - this.POPOVER_HEIGHT - this.MARGIN,
      left: rect.left + rect.width / 2 - this.POPOVER_WIDTH / 2,
      placement: 'top'
    };
  }

  static adjustForViewport(position: OverlayPosition): OverlayPosition {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let adjustedPosition = { ...position };

    // Adjust horizontal position
    if (adjustedPosition.left < 0) {
      adjustedPosition.left = this.MARGIN;
    } else if (adjustedPosition.left + this.POPOVER_WIDTH > viewport.width) {
      adjustedPosition.left = viewport.width - this.POPOVER_WIDTH - this.MARGIN;
    }

    // Adjust vertical position
    if (adjustedPosition.top < 0) {
      adjustedPosition.top = this.MARGIN;
    } else if (adjustedPosition.top + this.POPOVER_HEIGHT > viewport.height) {
      adjustedPosition.top = viewport.height - this.POPOVER_HEIGHT - this.MARGIN;
    }

    return adjustedPosition;
  }
}
