import { Arr, Optional } from '@ephox/katamari';

import { PlatformInfo } from '../info/PlatformInfo';
import { UaInfo } from '../info/UaInfo';
import { Version } from './Version';

// There are no native typescript types for navigator.UserAgentData at this stage so have to manually define it

export interface UserAgentDataBrand {
  readonly brand: string;
  readonly version: string;
}

export interface UserAgentData {
  readonly brands: UserAgentDataBrand[];
  readonly mobile: boolean;
}

const detectBrowser = (browsers: PlatformInfo[], userAgentData: UserAgentData): Optional<UaInfo> => {
  return Arr.findMap<UserAgentDataBrand, UaInfo>(userAgentData.brands, (uaBrand) => {
    const lcBrand = uaBrand.brand.toLowerCase();
    return Arr.find(browsers, (browser) => lcBrand === browser.brand?.toLowerCase())
      .map((info) => ({
        current: info.name,
        version: Version.nu(parseInt(uaBrand.version, 10), 0)
      }));
  });
};

export {
  detectBrowser
};
