import { Fun } from '@ephox/katamari';
import { UaString } from '../detect/UaString';
import { Version } from '../detect/Version';

export interface OperatingSystem {
  readonly current: string | undefined;
  readonly version: Version;
  readonly isWindows: () => boolean;
  readonly isiOS: () => boolean;
  readonly isAndroid: () => boolean;
  readonly isOSX: () => boolean;
  readonly isLinux: () => boolean;
  readonly isSolaris: () => boolean;
  readonly isFreeBSD: () => boolean;
  readonly isChromeOS: () => boolean;
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

const unknown = function (): OperatingSystem {
  return nu({
    current: undefined,
    version: Version.unknown()
  });
};

const nu = function (info: UaString): OperatingSystem {
  const current = info.current;
  const version = info.version;

  const isOS = (name: string) => (): boolean => current === name;

  return {
    current,
    version,

    isWindows: isOS(windows),
    // TODO: Fix capitalisation
    isiOS: isOS(ios),
    isAndroid: isOS(android),
    isOSX: isOS(osx),
    isLinux: isOS(linux),
    isSolaris: isOS(solaris),
    isFreeBSD: isOS(freebsd),
    isChromeOS: isOS(chromeos)
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
