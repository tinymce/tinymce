import { navigator, window } from '@ephox/dom-globals';
import { Cell, Fun, Thunk } from '@ephox/katamari';

import { Browser as BrowserCore } from '../core/Browser';
import { OperatingSystem as OperatingSystemCore } from '../core/OperatingSystem';
import { PlatformDetection } from '../core/PlatformDetection';
import { DeviceType as DeviceTypeCore } from '../detect/DeviceType';

export type Browser = BrowserCore;
export type OperatingSystem = OperatingSystemCore;
export type DeviceType = DeviceTypeCore;

const mediaMatch = (query: string) => window.matchMedia(query).matches;

// IMPORTANT: Must be in a thunk, otherwise rollup thinks calling this immediately
// causes side effects and won't tree shake this away
const platform = Cell<() => PlatformDetection>(Thunk.cached(() => PlatformDetection.detect(navigator.userAgent, mediaMatch)));

export const detect = (): PlatformDetection => platform.get()();

export const override = (overrides: Partial<PlatformDetection>) => {
  platform.set(Fun.constant({
    ...detect(),
    ...overrides
  }));
};
