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
  readonly current: string | undefined;
  readonly version: Version;
  readonly isEdge: () => boolean;
  readonly isChrome: () => boolean;
  readonly isIE: () => boolean;
  readonly isOpera: () => boolean;
  readonly isFirefox: () => boolean;
  readonly isSafari: () => boolean;
}

const unknown = function () {
  return nu({
    current: undefined,
    version: Version.unknown()
  });
};

const nu = function (info: UaString): Browser {
  const current = info.current;
  const version = info.version;

  const isBrowser = (name: string) => (): boolean => current === name;

  return {
    current,
    version,

    isEdge: isBrowser(edge),
    isChrome: isBrowser(chrome),
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
  chrome: Fun.constant(chrome),
  ie: Fun.constant(ie),
  opera: Fun.constant(opera),
  firefox: Fun.constant(firefox),
  safari: Fun.constant(safari)
};
