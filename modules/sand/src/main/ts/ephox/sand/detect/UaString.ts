import { Arr, Optional } from '@ephox/katamari';

import { PlatformInfo } from '../info/PlatformInfo';
import { UaInfo } from '../info/UaInfo';
import { Version } from './Version';

const detect = (candidates: PlatformInfo[], userAgent: any): Optional<PlatformInfo> => {
  const agent = String(userAgent).toLowerCase();
  return Arr.find(candidates, (candidate) => {
    return candidate.search(agent);
  });
};

// They (browser and os) are the same at the moment, but they might
// not stay that way.
const detectBrowser = (browsers: PlatformInfo[], userAgent: any): Optional<UaInfo> => {
  return detect(browsers, userAgent).map((browser): UaInfo => {
    const version = Version.detect(browser.versionRegexes, userAgent);
    return {
      current: browser.name,
      version
    };
  });
};

const detectOs = (oses: PlatformInfo[], userAgent: any): Optional<UaInfo> => {
  return detect(oses, userAgent).map((os): UaInfo => {
    const version = Version.detect(os.versionRegexes, userAgent);
    return {
      current: os.name,
      version
    };
  });
};

export {
  detectBrowser,
  detectOs
};
