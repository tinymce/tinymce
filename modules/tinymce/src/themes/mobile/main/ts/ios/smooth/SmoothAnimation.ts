/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import Delay from 'tinymce/core/api/util/Delay';

const adjust = (value, destination, amount) => {
  if (Math.abs(value - destination) <= amount) {
    return Optional.none();
  } else if (value < destination) {
    return Optional.some(value + amount);
  } else {
    return Optional.some(value - amount);
  }
};

const create = () => {
  let interval = null;

  const animate = (getCurrent, destination, amount, increment, doFinish, rate) => {
    let finished = false;

    const finish = (v) => {
      finished = true;
      doFinish(v);
    };

    Delay.clearInterval(interval);

    const abort = (v) => {
      Delay.clearInterval(interval);
      finish(v);
    };

    interval = Delay.setInterval(() => {
      const value = getCurrent();
      adjust(value, destination, amount).fold(() => {
        Delay.clearInterval(interval);
        finish(destination);
      }, (s) => {
        increment(s, abort);
        if (!finished) {
          const newValue = getCurrent();
          // Jump to the end if the increment is no longer working.
          if (newValue !== s || Math.abs(newValue - destination) > Math.abs(value - destination)) {
            Delay.clearInterval(interval);
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

export {
  create,
  adjust
};
