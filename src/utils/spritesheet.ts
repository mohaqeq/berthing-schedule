/**
 * Spritesheet loader utility
 * Loads and caches sprite positions from spritesheet.json
 */

interface SpriteFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

interface SpriteSheet {
  frames: Record<string, SpriteFrame>;
  meta: {
    version: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
}

let spritesheetData: SpriteSheet | null = null;
let loadingPromise: Promise<SpriteSheet> | null = null;

/**
 * Load the spritesheet.json file
 */
export async function loadSpritesheet(): Promise<SpriteSheet> {
  if (spritesheetData) {
    return spritesheetData;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = fetch('/assets/spritesheet.json')
    .then((response) => response.json())
    .then((data: SpriteSheet) => {
      spritesheetData = data;
      loadingPromise = null;
      return data;
    })
    .catch((error) => {
      loadingPromise = null;
      console.error('Failed to load spritesheet:', error);
      throw error;
    });

  return loadingPromise;
}

/**
 * Get sprite position for a given sprite name
 */
export function getSpritePosition(
  spriteName: string
): { x: number; y: number; w: number; h: number } | null {
  if (!spritesheetData) {
    return null;
  }

  const frame = spritesheetData.frames[spriteName];
  if (!frame) {
    return null;
  }

  return frame.frame;
}

/**
 * Get spritesheet dimensions
 */
export function getSpritesheetSize(): { w: number; h: number } | null {
  if (!spritesheetData) {
    return null;
  }

  return spritesheetData.meta.size;
}

/**
 * Generate CSS for sprite positioning
 * @param spriteName - Name of the sprite in the spritesheet
 * @param scale - Scale factor for the sprite (default: 0.5)
 * @param transformOrigin - CSS transform-origin value (default: 'top left')
 */
export function getSpriteCss(
  spriteName: string,
  scale: number = 0.5,
  transformOrigin: string = 'top left'
): string {
  const pos = getSpritePosition(spriteName);
  const size = getSpritesheetSize();

  if (!pos || !size) {
    return '';
  }

  const bgPosX = -pos.x;
  const bgPosY = -pos.y;

  return `background-position: ${bgPosX}px ${bgPosY}px; background-size: ${size.w}px ${size.h}px; width: ${pos.w}px; height: ${pos.h}px; transform-origin: ${transformOrigin}; scale: ${scale};`;
}
