/**
 * Generates unique ids.
 *
 * @class tinymce.util.Uuid
 * @private
 */

import { Num } from '@ephox/katamari';

let count = 0;

const seed = (): string => {
  const rnd = () => {
    return Math.round(Num.random() * 0xFFFFFFFF).toString(36);
  };

  const now = new Date().getTime();
  return 's' + now.toString(36) + rnd() + rnd() + rnd();
};

const uuid = (prefix: string): string => {
  return prefix + (count++) + seed();
};

export {
  uuid
};
