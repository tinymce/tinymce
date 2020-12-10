import { Arr, Optional } from '@ephox/katamari';
import { PlatformInfo } from '../info/PlatformInfo';
import { Version } from './Version';

export interface UaString {
  current: string | undefined;
  version: Version;
}

const detect = (candidates: PlatformInfo[], userAgent: any): Optional<PlatformInfo> => {
  const agent = String(userAgent).toLowerCase();
  return Arr.find(candidates, (candidate) => {
    return candidate.search(agent);
  });
};

// They (browser and os) are the same at the moment, but they might
// not stay that way.
const detectBrowser = (browsers: PlatformInfo[], userAgent: any): Optional<UaString> => {
  return detect(browsers, userAgent).map((browser): UaString => {
    const version = Version.detect(browser.versionRegexes, userAgent);
    return {
      current: browser.name,
      version
    };
  });
};

const detectOs = (oses: PlatformInfo[], userAgent: any): Optional<UaString> => {
  return detect(oses, userAgent).map((os): UaString => {
    const version = Version.detect(os.versionRegexes, userAgent);
    return {
      current: os.name,
      version
    };
  });
};

export const UaString = {
  detectBrowser,
  detectOs
};
