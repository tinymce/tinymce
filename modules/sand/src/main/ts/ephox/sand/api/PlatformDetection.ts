import { navigator, window } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';

import { Browser as BrowserCore } from '../core/Browser';
import { OperatingSystem as OperatingSystemCore } from '../core/OperatingSystem';
import { PlatformDetection } from '../core/PlatformDetection';
import { DeviceType as DeviceTypeCore } from '../detect/DeviceType';

export type Browser = BrowserCore;
export type OperatingSystem = OperatingSystemCore;
export type DeviceType = DeviceTypeCore;

const mediaMatch = (query: string) => window.matchMedia(query).matches;

const platform = Cell<PlatformDetection>(PlatformDetection.detect(navigator.userAgent, mediaMatch));

export const detect = (): PlatformDetection => platform.get();

export const override = (overrides: Partial<PlatformDetection>) => {
  platform.set({
    ...platform.get(),
    ...overrides
  });
};
