import { Browser } from '../core/Browser';
import { detect as eagerDetect } from './PlatformDetection';
import { OperatingSystem } from '../core/OperatingSystem';
import { PlatformDetection } from '../core/PlatformDetection';
import { DeviceType } from '../detect/DeviceType';
import * as LazyTouch from '../detect/LazyTouch';

export type Browser = Browser;
export type OperatingSystem = OperatingSystem;
export type DeviceType = DeviceType;

export const detect = (): PlatformDetection => {
  const platform = eagerDetect();
  return {
    os: platform.os,
    browser: platform.browser,
    deviceType: {
      ...platform.deviceType,
      isTouch: LazyTouch.isTouch
    }
  };
};
