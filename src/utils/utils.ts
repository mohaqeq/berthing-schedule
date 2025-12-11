

export function meterToEm(meters: number, scale: number = 0.1): string {
  return `${meters * scale}em`;
}

export function hourToEm(hours: number, scale: number = 1): string {
  return `${hours * scale}em`;
}

export function hourDifference(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 3600000;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(date: Date, locale?: string): string {
  const dateStr = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = formatTime(date);
  return `${dateStr} ${timeStr}`;
}

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

export function toCSS(color?: number | string): string {
  if (color === undefined) return 'transparent';
  if (typeof color === 'string') return color;
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

export function spatialRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

export function generateId(): string {
  return `bs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
