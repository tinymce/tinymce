/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Options } from '@ephox/katamari';

/*

DEVICE SCREEN AND KEYBOARD SIZES

iPhone 4
320 x 480
portrait  : 297
landscape : 237

iPhone 5
320 x 568
portrait  : 297
landscape : 237

iPhone 6
375 x 667
portrait  : 302
landscape : 237

iPhone 6 +
414 x 736
portrait  : 314
landscape : 238

iPad (mini and full)
768 x 1024
portrait  : 313
landscape : 398

iPad Pro
1024 x 1366
portrait  : 371
landscape : 459

*/

export interface Keyboard {
  portrait: number;
  landscape: number;
}

export interface Device {
  width: number;
  height: number;
  keyboard: Keyboard;
}

export const findDevice = function (deviceWidth, deviceHeight): Keyboard {
  const devices: Device[] = [
    // iPhone 4 class
    { width: 320, height: 480, keyboard: { portrait: 300, landscape: 240 } },
    // iPhone 5 class
    { width: 320, height: 568, keyboard: { portrait: 300, landscape: 240 } },
    // iPhone 6 class
    { width: 375, height: 667, keyboard: { portrait: 305, landscape: 240 } },
    // iPhone 6+ class
    { width: 414, height: 736, keyboard: { portrait: 320, landscape: 240 } },
    // iPad class
    { width: 768, height: 1024, keyboard: { portrait: 320, landscape: 400 } },
    // iPad pro class
    { width: 1024, height: 1366, keyboard: { portrait: 380, landscape: 460 } }
  ];

  return Arr.findMap<Device, Keyboard>(devices, (device) =>
    Options.someIf(deviceWidth <= device.width && deviceHeight <= device.height, device.keyboard)
  ).getOr({ portrait: deviceHeight / 5, landscape: deviceWidth / 4 });
};
