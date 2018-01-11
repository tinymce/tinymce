/**
 * Uuid.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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

export default {
  uuid
};