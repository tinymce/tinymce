import { Fun, Optional } from '@ephox/katamari';

import * as Chars from './Chars';
import { Custom } from './Custom';
import { PRegExp } from './Types';

/**
 * Tokens have no prefix or suffix
 */
const token = (input: string): PRegExp => {
  return Custom(input, Fun.constant(0), Fun.constant(0), Optional.none());
};

/**
 * Words have complex rules as to what a "word break" actually is.
 *
 * These are consumed by the regex and then excluded by prefix/suffix lengths.
 */
const word = (input: string): PRegExp => {
  const regex = `((?:^'?)|(?:` + Chars.wordbreak() + `+'?))` + input + `((?:'?$)|(?:'?` + Chars.wordbreak() + '+))';

  // ASSUMPTION: There are no groups in their input
  const prefix = (match: RegExpExecArray) => {
    return match.length > 1 ? match[1].length : 0;
  };

  const suffix = (match: RegExpExecArray) => {
    return match.length > 2 ? match[2].length : 0;
  };

  return Custom(regex, prefix, suffix, Optional.none());
};

export {
  token,
  word
};
