/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const each = function (o, cb, s?) {
  let n, l;

  if (!o) {
    return 0;
  }

  s = s || o;

  if (o.length !== undefined) {
    // Indexed arrays, needed for Safari
    for (n = 0, l = o.length; n < l; n++) {
      if (cb.call(s, o[n], n, o) === false) {
        return 0;
      }
    }
  } else {
    // Hashtables
    for (n in o) {
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false) {
          return 0;
        }
      }
    }
  }

  return 1;
};

const map = function (array, callback) {
  const out = [];

  each(array, function (item, index) {
    out.push(callback(item, index, array));
  });

  return out;
};

export default {
  each,
  map
};