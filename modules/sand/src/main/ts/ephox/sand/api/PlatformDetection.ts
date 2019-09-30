import { navigator } from '@ephox/dom-globals';
import { Thunk } from '@ephox/katamari';

import { Browser } from '../core/Browser';
import { OperatingSystem } from '../core/OperatingSystem';
import { PlatformDetection } from '../core/PlatformDetection';
import { DeviceType } from '../detect/DeviceType';

export type Browser = Browser;
export type OperatingSystem = OperatingSystem;
export type DeviceType = DeviceType;

export const detect: () => PlatformDetection = Thunk.cached(function () {
  const userAgent = navigator.userAgent;
  return PlatformDetection.detect(userAgent);
});
