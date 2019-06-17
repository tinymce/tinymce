import { Arr } from '@ephox/katamari';
import { Version } from './Version';
import { PlatformInfo } from '../info/PlatformInfo';

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
      version: version
    };
  });
};

const detectOs = function (oses: PlatformInfo[], userAgent: any) {
  return detect(oses, userAgent).map(function (os): UaString {
    const version = Version.detect(os.versionRegexes, userAgent);
    return {
      current: os.name,
      version: version
    };
  });
};

export const UaString = {
  detectBrowser: detectBrowser,
  detectOs: detectOs
};