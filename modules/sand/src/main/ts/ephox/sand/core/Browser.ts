import { Fun } from '@ephox/katamari';
import { Version } from '../detect/Version';
import { UaString } from '../detect/UaString';

const edge = 'Edge';
const chrome = 'Chrome';
const ie = 'IE';
const opera = 'Opera';
const firefox = 'Firefox';
const safari = 'Safari';

export interface Browser {
  current: string | undefined;
  version: Version;
  isEdge: () => boolean;
  isChrome: () => boolean;
  isIE: () => boolean;
  isOpera: () => boolean;
  isFirefox: () => boolean;
  isSafari: () => boolean;
}

const isBrowser = function (name: string, current: string) {
  return function () {
    return current === name;
  };
};

const unknown = function () {
  return nu({
    current: undefined,
    version: Version.unknown()
  });
};

const nu = function (info: UaString): Browser {
  const current = info.current;
  const version = info.version;

  return {
    current: current,
    version: version,

    isEdge: isBrowser(edge, current),
    isChrome: isBrowser(chrome, current),
    // NOTE: isIe just looks too weird
    isIE: isBrowser(ie, current),
    isOpera: isBrowser(opera, current),
    isFirefox: isBrowser(firefox, current),
    isSafari: isBrowser(safari, current)
  };
};

export const Browser = {
  unknown: unknown,
  nu: nu,
  edge: Fun.constant(edge),
  chrome: Fun.constant(chrome),
  ie: Fun.constant(ie),
  opera: Fun.constant(opera),
  firefox: Fun.constant(firefox),
  safari: Fun.constant(safari)
};