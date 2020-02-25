/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * Generates unique ids.
 *
 * @class tinymce.util.Uuid
 * @private
 */

let count = 0;

const seed = function () {
  const rnd = function () {
    return Math.round(Math.random() * 0xFFFFFFFF).toString(36);
  };

  const now = new Date().getTime();
  return 's' + now.toString(36) + rnd() + rnd() + rnd();
};

const uuid = function (prefix) {
  return prefix + (count++) + seed();
};

export {
  uuid
};
