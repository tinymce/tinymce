import { Fun } from '@ephox/katamari';

/**
 * Returns the offset pairs of all matches of pattern on the input string, adjusting for prefix and suffix offsets
 */
const all = function (input, pattern) {
  const term = pattern.term();
  const r = [];
  let match = term.exec(input);
  while (match) {
    const start = match.index + pattern.prefix(match);
    const length = match[0].length - pattern.prefix(match) - pattern.suffix(match);
    r.push({
      start: Fun.constant(start),
      finish: Fun.constant(start + length)
    });
    term.lastIndex = start + length;
    match = term.exec(input);
  }
  return r;
};

export default <any> {
  all
};