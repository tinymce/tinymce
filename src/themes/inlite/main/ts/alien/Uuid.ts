/**
 * Uuid.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Generates unique ids this is the same as in core but since
 * it's not exposed as a global we can't access it.
 */

let count = 0;

const seed = function () {
  const rnd = function () {
    return Math.round(Math.random() * 0xFFFFFFFF).toString(36);
  };

  return 's' + Date.now().toString(36) + rnd() + rnd() + rnd();
};

const uuid = function (prefix: string) {
  return prefix + (count++) + seed();
};

export default {
  uuid
};