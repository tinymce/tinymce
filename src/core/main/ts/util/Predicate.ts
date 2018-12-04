/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const slice = [].slice;

const or = function (...x: any[]) {
  const args = slice.call(arguments);

  return function (x) {
    for (let i = 0; i < args.length; i++) {
      if (args[i](x)) {
        return true;
      }
    }

    return false;
  };
};

const and = function (...x: any[]) {
  const args = slice.call(arguments);

  return function (x) {
    for (let i = 0; i < args.length; i++) {
      if (!args[i](x)) {
        return false;
      }
    }

    return true;
  };
};

export default {
  and,
  or
};
