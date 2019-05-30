import { Fun } from '@ephox/katamari';
import { PRegExp, PRange } from '../pattern/Types';

/**
 * Returns the offset pairs of all matches of pattern on the input string, adjusting for prefix and suffix offsets
 */
const all = function (input: string, pattern: PRegExp) {
  const term = pattern.term();
  const r: PRange[] = [];
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

export {
  all
};