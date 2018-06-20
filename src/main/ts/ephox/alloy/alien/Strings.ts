// TODO: Migrate to katamari

const checkRange = (str: string, substr: string, start: number): boolean => {
  if (substr === '') { return true; }
  if (str.length < substr.length) { return false; }
  const x = str.substr(start, start + substr.length);
  return x === substr;
};

/** Does 'str' start with 'prefix'?
 *  Note: all strings start with the empty string.
 *        More formally, for all strings x, startsWith(x, "").
 *        This is so that for all strings x and y, startsWith(y + x, y)
 */
const startsWith = (str: string, prefix: string): boolean => {
  return checkRange(str, prefix, 0);
};

export {
  startsWith
};