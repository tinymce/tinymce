import { Optional } from '@ephox/katamari';

import { DeviceType } from '../detect/DeviceType';
import * as UaData from '../detect/UaData';
import * as UaString from '../detect/UaString';
import { PlatformInfo } from '../info/PlatformInfo';
import { Browser } from './Browser';
import { OperatingSystem } from './OperatingSystem';

export interface PlatformDetection {
  readonly browser: Browser;
  readonly os: OperatingSystem;
  readonly deviceType: DeviceType;
}

const detect = (userAgent: string, userAgentDataOpt: Optional<UaData.UserAgentData>, mediaMatch: (query: string) => boolean): PlatformDetection => {
  const browsers = PlatformInfo.browsers();
  const oses = PlatformInfo.oses();

  const browser = userAgentDataOpt.bind((userAgentData) => UaData.detectBrowser(browsers, userAgentData))
    .orThunk(() => UaString.detectBrowser(browsers, userAgent))
    .fold(Browser.unknown, Browser.nu);

  const os = UaString.detectOs(oses, userAgent).fold(
    OperatingSystem.unknown,
    OperatingSystem.nu
  );
  const deviceType = DeviceType(os, browser, userAgent, mediaMatch);

  return {
    browser,
    os,
    deviceType
  };
};

export const PlatformDetection = {
  detect
};
