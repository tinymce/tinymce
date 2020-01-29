import { Fun } from '@ephox/katamari';
import { UaString } from '../detect/UaString';
import { Version } from '../detect/Version';

export interface OperatingSystem {
  current: string | undefined;
  version: Version;
  isWindows: () => boolean;
  isiOS: () => boolean;
  isAndroid: () => boolean;
  isOSX: () => boolean;
  isLinux: () => boolean;
  isSolaris: () => boolean;
  isFreeBSD: () => boolean;
  isChromeOS: () => boolean;
}

const windows = 'Windows';
const ios = 'iOS';
const android = 'Android';
const linux = 'Linux';
const osx = 'OSX';
const solaris = 'Solaris';
const freebsd = 'FreeBSD';
const chromeos = 'ChromeOS';

// Though there is a bit of dupe with this and Browser, trying to
// reuse code makes it much harder to follow and change.
const isOS = function (name: string, current: string) {
  return function () {
    return current === name;
  };
};

const unknown = function (): OperatingSystem {
  return nu({
    current: undefined,
    version: Version.unknown()
  });
};

const nu = function (info: UaString): OperatingSystem {
  const current = info.current;
  const version = info.version;

  return {
    current,
    version,

    isWindows: isOS(windows, current),
    // TODO: Fix capitalisation
    isiOS: isOS(ios, current),
    isAndroid: isOS(android, current),
    isOSX: isOS(osx, current),
    isLinux: isOS(linux, current),
    isSolaris: isOS(solaris, current),
    isFreeBSD: isOS(freebsd, current),
    isChromeOS: isOS(chromeos, current)
  };
};

export const OperatingSystem = {
  unknown,
  nu,

  windows: Fun.constant(windows),
  ios: Fun.constant(ios),
  android: Fun.constant(android),
  linux: Fun.constant(linux),
  osx: Fun.constant(osx),
  solaris: Fun.constant(solaris),
  freebsd: Fun.constant(freebsd),
  chromeos: Fun.constant(chromeos)
};
