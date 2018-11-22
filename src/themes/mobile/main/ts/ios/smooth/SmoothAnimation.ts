/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';

const adjust = function (value, destination, amount) {
  if (Math.abs(value - destination) <= amount) {
    return Option.none();
  } else if (value < destination) {
    return Option.some(value + amount);
  } else {
    return Option.some(value - amount);
  }
};

const create = function () {
  let interval = null;

  const animate = function (getCurrent, destination, amount, increment, doFinish, rate) {
    let finished = false;

    const finish = function (v) {
      finished = true;
      doFinish(v);
    };

    clearInterval(interval);

    const abort = function (v) {
      clearInterval(interval);
      finish(v);
    };

    interval = setInterval(function () {
      const value = getCurrent();
      adjust(value, destination, amount).fold(function () {
        clearInterval(interval);
        finish(destination);
      }, function (s) {
        increment(s, abort);
        if (! finished) {
          const newValue = getCurrent();
          // Jump to the end if the increment is no longer working.
          if (newValue !== s || Math.abs(newValue - destination) > Math.abs(value - destination)) {
            clearInterval(interval);
            finish(destination);
          }
        }
      });
    }, rate);
  };

  return {
    animate
  };
};

export default {
  create,
  adjust
};