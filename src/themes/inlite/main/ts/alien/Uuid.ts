/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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