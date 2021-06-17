/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DomEvent, SugarElement } from '@ephox/sugar';

import Delay from 'tinymce/core/api/util/Delay';

const INTERVAL = 50;
const INSURANCE = 1000 / INTERVAL;

const get = (outerWindow) => {
  // We need to use this because the window shrinks due to an app keyboard,
  // width > height is no longer reliable.
  const isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
  return {
    isPortrait: Fun.constant(isPortrait)
  };
};

// In iOS the width of the window is not swapped properly when the device is
// rotated causing problems.
// getActualWidth will return the actual width of the window accurated with the
// orientation of the device.
const getActualWidth = (outerWindow) => {
  const isIos = PlatformDetection.detect().os.isiOS();
  const isPortrait = get(outerWindow).isPortrait();
  return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
};

const onChange = (outerWindow, listeners) => {
  const win = SugarElement.fromDom(outerWindow);
  let poller = null;

  const change = () => {
    // If a developer is spamming orientation events in the simulator, clear our last check
    Delay.clearInterval(poller);

    const orientation = get(outerWindow);
    listeners.onChange(orientation);

    onAdjustment(() => {
      // We don't care about whether there was a resize or not.
      listeners.onReady(orientation);
    });
  };

  const orientationHandle = DomEvent.bind(win, 'orientationchange', change);

  const onAdjustment = (f) => {
    // If a developer is spamming orientation events in the simulator, clear our last check
    Delay.clearInterval(poller);

    const flag = outerWindow.innerHeight;
    let insurance = 0;
    poller = Delay.setInterval(() => {
      if (flag !== outerWindow.innerHeight) {
        Delay.clearInterval(poller);
        f(Optional.some(outerWindow.innerHeight));
      } else if (insurance > INSURANCE) {
        Delay.clearInterval(poller);
        f(Optional.none());
      }
      insurance++;
    }, INTERVAL);
  };

  const destroy = () => {
    orientationHandle.unbind();
  };

  return {
    onAdjustment,
    destroy
  };
};

export {
  get,
  onChange,
  getActualWidth
};
