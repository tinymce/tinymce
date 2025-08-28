import { PRange, PRegExp } from '../pattern/Types';

/**
 * Returns the offset pairs of all matches of pattern on the input string, adjusting for prefix and suffix offsets
 */
const all = (input: string, pattern: PRegExp): PRange[] => {
  const term = pattern.term();
  const r: PRange[] = [];
  let match = term.exec(input);
  while (match) {
    const start = match.index + pattern.prefix(match);
    const length = match[0].length - pattern.prefix(match) - pattern.suffix(match);
    r.push({
      start,
      finish: start + length
    });
    term.lastIndex = start + length;
    match = term.exec(input);
  }
  return r;
};

export {
  all
};
