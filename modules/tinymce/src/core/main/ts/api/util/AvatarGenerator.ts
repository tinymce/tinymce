import { Fun, Num, Obj, Optional } from '@ephox/katamari';

/**
 * This class handles generating default avatars for users.
 *
 * @class tinymce.util.AvatarGenerator
 * @example
 * // Get an image source URL for use in an <img> element
 * const imgSrc = tinymce.util.AvatarGenerator.create('John Doe').getImageSource();
 *
 * // Get raw SVG with custom color and size
 * const svg = tinymce.util.AvatarGenerator.create('John Doe', {
 *   color: '#FF0000',
 *   size: 48
 * }).getSvg();
 *
 * // Use caching for repeated avatars
 * const avatar = tinymce.util.AvatarGenerator.create('John Doe', {
 *   useCache: true
 * }).getImageSource();
 */

interface ImageSourceOptions {
  /** The color of the avatar background */
  readonly color?: string;
  /** The size of the avatar in pixels (default: 36) */
  readonly size?: number;
  /** Whether to cache the generated avatar. Cache is shared globally across the editor instance. */
  readonly useCache?: boolean;
}

interface AvatarBuilder {
  /**
   * Gets the avatar as an SVG string.
   *
   * @method getSvg
   * @return {string} The SVG markup.
   */
  readonly getSvg: () => string;

  /**
   * Gets the avatar as a data URI that can be used as an image source.
   *
   * @method getImageSource
   * @return {string} Data URI containing the encoded SVG.
   */
  readonly getImageSource: () => string;
}

interface AvatarCache {
  readonly lookup: (cacheKey: string) => Optional<string>;
  readonly store: (cacheKey: string, imageSource: string) => void;
}

export interface AvatarGenerator {
  /**
   * Creates an avatar builder that can output different formats.
   *
   * @method create
   * @param {string} name The name to use in the avatar.
   * @param {Object} options Options for the avatar.
   * @param {string} options.color The color of the avatar background.
   * @param {number} options.size The size of the avatar in pixels (default: 36).
   * @param {boolean} options.useCache Whether to cache the generated avatar.
   * @return {AvatarBuilder} A builder for getting different avatar formats.
   */
  readonly create: (name: string, options?: ImageSourceOptions) => AvatarBuilder;
}

const AvatarColors = [
  '#E41B60', // Pink
  '#AD1457', // Dark Pink
  '#1939EC', // Indigo
  '#001CB5', // Dark Indigo
  '#648000', // Lime
  '#465B00', // Dark Lime
  '#006CE7', // Blue
  '#0054B4', // Dark Blue
  '#00838F', // Cyan
  '#006064', // Dark Cyan
  '#00866F', // Turquoise
  '#004D40', // Dark Turquoise
  '#51742F', // Green
  '#385021', // Dark Green
  '#CF4900', // Orange
  '#A84600', // Dark Orange
  '#CC0000', // Red
  '#6A1B9A', // Dark Red
  '#9C27B0', // Purple
  '#6A00AB', // Dark Purple
  '#3041BA', // Navy Blue
  '#0A1877', // Dark Navy Blue
  '#774433', // Brown
  '#452B24', // Dark Brown
  '#607D8B', // Blue Gray
  '#455A64', // Dark Blue Gray
];

const getFirstChar = (name: string): string => {
  if (Intl.Segmenter) {
    const segmenter = new Intl.Segmenter();
    const iterator = segmenter.segment(name)[Symbol.iterator]();
    return `${iterator.next().value?.segment}`;
  } else {
    return name.trim()[0];
  }
};

const getRandomColor = (): string => {
  const colorIdx = Math.floor(Num.random() * AvatarColors.length);
  return AvatarColors[colorIdx];
};

const getSvg = (name: string, color: string, size: number): string => {
  const halfSize = size / 2;
  return `<svg height="${size}" width="${size}" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="${halfSize}" cy="${halfSize}" r="${halfSize}" fill="${color}"/>` +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="#FFF" font-family="sans-serif" font-size="${halfSize}">` +
    getFirstChar(name) +
    `</text>` +
    '</svg>';
};

const getImageSource = (name: string, color: string, size: number): string => {
  const svg = getSvg(name, color, size);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const initCache = (): AvatarCache => {
  const cache: Record<string, string> = {};

  const lookup = (cacheKey: string) =>
    Obj.get(cache, cacheKey);

  const store = (cacheKey: string, imageSource: string) => {
    cache[cacheKey] = imageSource;
  };

  return {
    lookup,
    store
  };
};

const globalCache = initCache();

const create = (name: string, options: ImageSourceOptions = {}): AvatarBuilder => {
  const { size = 36, useCache = false } = options;
  const cacheKey = `${name}-${size}`;

  if (useCache) {
    const imageSource = globalCache.lookup(cacheKey).getOrThunk(() => {
      // Generate and cache new avatar
      const color = options.color ?? getRandomColor();
      const newImageSource = getImageSource(name, color, size);
      globalCache.store(cacheKey, newImageSource);
      return newImageSource;
    });

    return {
      getSvg: () => decodeURIComponent(imageSource.replace('data:image/svg+xml,', '')),
      getImageSource: Fun.constant(imageSource)
    };
  }

  // Non-cached path
  const color = options.color ?? getRandomColor();
  const svg = getSvg(name, color, size);
  const imageSource = getImageSource(name, color, size);

  return {
    getSvg: Fun.constant(svg),
    getImageSource: Fun.constant(imageSource)
  };
};

const createAvatarGenerator: AvatarGenerator = {
  create
};

export { createAvatarGenerator };
