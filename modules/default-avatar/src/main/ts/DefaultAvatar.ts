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

/* For a given string returns integer between 0 and maxValue (inclusive).
  This function is based on the djb2 hash algorithm reported by Dan Bernstein.
  You can find more informations here: http://www.cse.yorku.ca/~oz/hash.html
  The hashing algorithm is using bitwise operators to multiply by 32, and later to ensure a positive integer.
  The result is then reduced to the range of 0 to maxValue using modulo operation.
*/
const djb2Hash = (key: string, maxValue: number) => {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = ((hash << 5) + hash) + key.charCodeAt(i);
  }
  // eslint-disable-next-line no-bitwise
  return (hash >>> 0) % (maxValue + 1);
};

const getColor = (id: string): string => {
  const colorIdx = djb2Hash(id ?? '', AvatarColors.length - 1);
  return AvatarColors[colorIdx];
};

const generateAvatarSvg = (content: string, color: string, size: number): string => {
  const halfSize = size / 2;
  return `<svg height="${size}" width="${size}" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="${halfSize}" cy="${halfSize}" r="${halfSize}" fill="${color}"/>` +
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="#FFF" font-family="sans-serif" font-size="${halfSize}">` +
    content +
    `</text>` +
  '</svg>';
};

/**
 * Generates a data URL for an SVG avatar with the specified content, color, and size.
 *
 * @param content The text content to display in the avatar (typically a single character)
 * @param color The background color of the avatar (hex color string)
 * @param size The size of the avatar in pixels (width and height)
 * @returns A data URL string containing the encoded SVG avatar
 */
const generateAvatar = (content: string, color: string, size: number): string =>
  'data:image/svg+xml,' + encodeURIComponent(generateAvatarSvg(content, color, size));

/**
 * Generates a user avatar based on the user's name and ID.
 *
 * @param user User object containing id and name properties
 * @param user.id Unique identifier used to determine the avatar color
 * @param user.name User's name, first character will be displayed in the avatar
 * @param config Configuration object for the avatar
 * @param config.size The size of the avatar in pixels (defaults to 36)
 * @returns A data URL string containing the encoded SVG avatar
 */
const generateUserAvatar = (user: { id: string; name: string }, config = { size: 36 }): string =>
  generateAvatar(getFirstChar(user.name), getColor(user.id), config.size);

export { generateAvatar, generateUserAvatar };
