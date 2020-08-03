import { Arr } from '@ephox/katamari';
import { PlatformInfo } from '../info/PlatformInfo';
import { Version } from './Version';

export interface UaString {
  current: string | undefined;
  version: Version;
}

const detect = function (candidates: PlatformInfo[], userAgent: any) {
  const agent = String(userAgent).toLowerCase();
  return Arr.find(candidates, function (candidate) {
    return candidate.search(agent);
  });
};

// They (browser and os) are the same at the moment, but they might
// not stay that way.
const detectBrowser = function (browsers: PlatformInfo[], userAgent: any) {
  return detect(browsers, userAgent).map(function (browser): UaString {
    const version = Version.detect(browser.versionRegexes, userAgent);
    return {
      current: browser.name,
      version
    };
  });
};

const detectOs = function (oses: PlatformInfo[], userAgent: any) {
  return detect(oses, userAgent).map(function (os): UaString {
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
