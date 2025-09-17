export class VisibilityChecker {
  private intersectionObserver: IntersectionObserver;
  private visibleElements: Set<Element> = new Set();
  private static instance: VisibilityChecker;

  private constructor() {
    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );
  }

  static getInstance(): VisibilityChecker {
    if (!VisibilityChecker.instance) {
      VisibilityChecker.instance = new VisibilityChecker();
    }
    return VisibilityChecker.instance;
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.visibleElements.add(entry.target);
      } else {
        this.visibleElements.delete(entry.target);
      }
    });
  }

  isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top >= 0 && 
                        rect.left >= 0 && 
                        rect.bottom <= window.innerHeight && 
                        rect.right <= window.innerWidth;
    
    return isInViewport && this.visibleElements.has(element);
  }

  observeElement(element: Element): void {
    this.intersectionObserver.observe(element);
  }

  unobserveElement(element: Element): void {
    this.intersectionObserver.unobserve(element);
  }

  cleanup(): void {
    this.visibleElements.clear();
    this.intersectionObserver.disconnect();
  }
}
