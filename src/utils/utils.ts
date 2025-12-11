/**
 * Utility functions for the berthing schedule component
 */

/**
 * Calculate CSS size from meters (using em units)
 * @param meters - Length in meters
 * @param scale - Scale factor (default 1em = 10 meters)
 */
export function meterToEm(meters: number, scale: number = 0.1): string {
  return `${meters * scale}em`;
}

/**
 * Calculate CSS size from hours (using em units)
 * @param hours - Duration in hours
 * @param scale - Scale factor (default 1em = 1 hour)
 */
export function hourToEm(hours: number, scale: number = 1): string {
  return `${hours * scale}em`;
}

/**
 * Calculate hour difference between two dates
 */
export function hourDifference(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 3600000;
}

/**
 * Format time as HH:MM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format date and time as "MMM DD HH:MM"
 */
export function formatDateTime(date: Date, locale?: string): string {
  const dateStr = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = formatTime(date);
  return `${dateStr} ${timeStr}`;
}

/**
 * Format date based on format type
 */
export function formatDate(
  date: Date,
  format: 'Weekday' | 'DayMonth' | 'Full',
  locale?: string
): string {
  switch (format) {
    case 'Weekday':
      return date.toLocaleDateString(locale, { weekday: 'long' });
    case 'DayMonth':
      return date.toLocaleDateString(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    case 'Full':
      return date.toLocaleDateString(locale);
    default:
      return date.toLocaleDateString(locale);
  }
}

/**
 * Create a DOM element with classes and styles
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    classes?: string[];
    styles?: Partial<CSSStyleDeclaration>;
    attributes?: Record<string, string>;
    dataset?: Record<string, string>;
    textContent?: string;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options?.classes) {
    element.classList.add(...options.classes);
  }

  if (options?.styles) {
    Object.assign(element.style, options.styles);
  }

  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options?.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
  }

  if (options?.textContent) {
    element.textContent = options.textContent;
  }

  return element;
}

/**
 * Convert color value to CSS color string
 */
export function toCSS(color?: number | string): string {
  if (color === undefined) return 'transparent';
  if (typeof color === 'string') return color;
  return `#${color.toString(16).padStart(6, '0')}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Check if two spatial ranges overlap
 */
export function spatialRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `bs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
