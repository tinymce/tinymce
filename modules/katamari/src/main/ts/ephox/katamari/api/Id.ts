import * as IdUtils from '../util/IdUtils';

import * as Num from './Num';

/**
 * Generate a unique identifier.
 *
 * The unique portion of the identifier only contains an underscore
 * and digits, so that it may safely be used within HTML attributes.
 *
 * The chance of generating a non-unique identifier has been minimized
 * by combining the current time, a random number and a one-up counter.
 *
 * generate :: String -> String
 */
let unique = 0;

const generate = (prefix: string): string => {
  const date = new Date();
  const time = date.getTime();
  const random = Math.floor(Num.random() * 1000000000);

  unique++;

  return prefix + '_' + random + unique + String(time);
};

/**
 * Generate a uuidv4 string
 * In accordance with RFC 4122 (https://datatracker.ietf.org/doc/html/rfc4122)
 */
const uuidV4 = (): `${string}-${string}-${string}-${string}-${string}` => {

  if (window.isSecureContext) {
    return window.crypto.randomUUID();
  } else {
    return IdUtils.uuidV4String();
  }
};

export {
  generate,
  uuidV4
};
