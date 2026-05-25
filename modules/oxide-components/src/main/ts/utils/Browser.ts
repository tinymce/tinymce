import { PlatformDetection } from '@ephox/sand';

export const isSafari = (): boolean => PlatformDetection.detect().browser.isSafari();
