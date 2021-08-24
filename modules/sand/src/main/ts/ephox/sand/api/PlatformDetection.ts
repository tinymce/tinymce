import { Fun, Optional, Thunk } from '@ephox/katamari';

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
// Note: navigator.userAgentData is not part of the native typescript types yet
let platform = Thunk.cached(() => PlatformDetection.detect(navigator.userAgent, Optional.from(((navigator as any).userAgentData)), mediaMatch));

export const detect = (): PlatformDetection => platform();

export const override = (overrides: Partial<PlatformDetection>): void => {
  platform = Fun.constant({
    ...detect(),
    ...overrides
  });
};
