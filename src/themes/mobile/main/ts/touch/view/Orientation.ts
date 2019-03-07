/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DomEvent, Element } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';

const INTERVAL = 50;
const INSURANCE = 1000 / INTERVAL;

const get = function (outerWindow) {
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
const getActualWidth = function (outerWindow) {
  const isIos = PlatformDetection.detect().os.isiOS();
  const isPortrait = get(outerWindow).isPortrait();
  return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
};

const onChange = function (outerWindow, listeners) {
  const win = Element.fromDom(outerWindow);
  let poller = null;

  const change = function () {
    // If a developer is spamming orientation events in the simulator, clear our last check
    Delay.clearInterval(poller);

    const orientation = get(outerWindow);
    listeners.onChange(orientation);

    onAdjustment(function () {
      // We don't care about whether there was a resize or not.
      listeners.onReady(orientation);
    });
  };

  const orientationHandle = DomEvent.bind(win, 'orientationchange', change);

  const onAdjustment = function (f) {
    // If a developer is spamming orientation events in the simulator, clear our last check
    Delay.clearInterval(poller);

    const flag = outerWindow.innerHeight;
    let insurance = 0;
    poller = Delay.setInterval(function () {
      if (flag !== outerWindow.innerHeight) {
        Delay.clearInterval(poller);
        f(Option.some(outerWindow.innerHeight));
      } else if (insurance > INSURANCE) {
        Delay.clearInterval(poller);
        f(Option.none());
      }
      insurance++;
    }, INTERVAL);
  };

  const destroy = function () {
    orientationHandle.unbind();
  };

  return {
    onAdjustment,
    destroy
  };
};

export default {
  get,
  onChange,
  getActualWidth
};