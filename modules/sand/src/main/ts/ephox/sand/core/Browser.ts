import { Fun } from '@ephox/katamari';

import { Version } from '../detect/Version';
import { UaInfo } from '../info/UaInfo';

const edge = 'Edge';
const chromium = 'Chromium';
const ie = 'IE';
const opera = 'Opera';
const firefox = 'Firefox';
const safari = 'Safari';

export interface Browser extends UaInfo {
  readonly isEdge: () => boolean;
  readonly isChromium: () => boolean;
  readonly isIE: () => boolean;
  readonly isOpera: () => boolean;
  readonly isFirefox: () => boolean;
  readonly isSafari: () => boolean;
}

const unknown = (): Browser => {
  return nu({
    current: undefined,
    version: Version.unknown()
  });
};

const nu = (info: UaInfo): Browser => {
  const current = info.current;
  const version = info.version;

  const isBrowser = (name: string) => (): boolean => current === name;

  return {
    current,
    version,

    isEdge: isBrowser(edge),
    isChromium: isBrowser(chromium),
    // NOTE: isIe just looks too weird
    isIE: isBrowser(ie),
    isOpera: isBrowser(opera),
    isFirefox: isBrowser(firefox),
    isSafari: isBrowser(safari)
  };
};

export const Browser = {
  unknown,
  nu,
  edge: Fun.constant(edge),
  chromium: Fun.constant(chromium),
  ie: Fun.constant(ie),
  opera: Fun.constant(opera),
  firefox: Fun.constant(firefox),
  safari: Fun.constant(safari)
};
