import { Browser } from '../core/Browser';
import { detect as eagerDetect } from './PlatformDetection';
import { OperatingSystem } from '../core/OperatingSystem';
import { PlatformDetection } from '../core/PlatformDetection';
import { DeviceType } from '../detect/DeviceType';
import * as TouchDetect from '../detect/TouchDetect';

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
      isTouch: TouchDetect.isTouch
    }
  };
};
