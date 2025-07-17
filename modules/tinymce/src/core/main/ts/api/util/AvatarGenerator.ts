import { Num } from '@ephox/katamari';

interface ImageSourceOptions {
  color?: string;
  size?: number;
}

interface AvatarBuilder {
  /** Get the avatar as an SVG string */
  getSvg: () => string;
  /** Get the avatar as an image source URL for use in <img> elements */
  getImageSource: () => string;
}

interface AvatarGenerator {
  /**
   * Creates an avatar builder that can output different formats.
   *
   * @param {string} name - The name to use in the avatar.
   * @param {Object} [options] - Options for the avatar.
   * @param {string} [options.color] - The color of the avatar background.
   * @param {number} [options.size=36] - The size of the avatar.
   * @returns {AvatarBuilder} A builder for getting different avatar formats
   *
   * @example
   * // Get an image source URL
   * const imgSrc = AvatarGenerator.create('John Doe').getImageSource();
   *
   * // Get raw SVG
   * const svg = AvatarGenerator.create('John Doe', { color: '#FF0000' }).getSvg();
   */
  create: (name: string, options?: ImageSourceOptions) => AvatarBuilder;
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

const getSvg = (name: string, color: string, size: number = 36): string => {
  const halfSize = size / 2;
  return `<svg height="${size}" width="${size}" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="${halfSize}" cy="${halfSize}" r="${halfSize}" fill="${color}"/>` +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="#FFF" font-family="sans-serif" font-size="${halfSize}">` +
    getFirstChar(name) +
    `</text>` +
    '</svg>';
};

const create = (name: string, options: ImageSourceOptions = {}): AvatarBuilder => {
  const { color = getRandomColor(), size = 36 } = options;

  return {
    getSvg: () => getSvg(name, color, size),
    getImageSource: () =>
      'data:image/svg+xml,' + encodeURIComponent(getSvg(name, color, size))
  };
};

const AvatarGenerator: AvatarGenerator = {
  create
};

export default AvatarGenerator;
