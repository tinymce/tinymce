/**
 * Sanitises a string for use in a CSS class name
 */
const css = (str: string): string => {
  // special case; the first character must a letter. More strict than CSS, but easier to implement.
  const r = /^[a-zA-Z]/.test(str) ? '' : 'e';

  // any non-word character becomes a hyphen
  const sanitised = str.replace(/[^\w]/gi, '-');

  return r + sanitised;
};

export {
  css
};
