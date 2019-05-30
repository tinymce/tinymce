import { Fun } from '@ephox/katamari';
import { OperatingSystem } from '../core/OperatingSystem';
import { Browser } from '../core/Browser';

export interface DeviceType {
  isiPad: () => boolean;
  isiPhone: () => boolean;
  isTablet: () => boolean;
  isPhone: () => boolean;
  isTouch: () => boolean;
  isAndroid: () => boolean;
  isiOS: () => boolean;
  isWebView: () => boolean;
}

export const DeviceType = function (os: OperatingSystem, browser: Browser, userAgent: string): DeviceType {
  const isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
  const isiPhone = os.isiOS() && !isiPad;
  const isAndroid3 = os.isAndroid() && os.version.major === 3;
  const isAndroid4 = os.isAndroid() && os.version.major === 4;
  const isTablet = isiPad || isAndroid3 || ( isAndroid4 && /mobile/i.test(userAgent) === true );
  const isTouch = os.isiOS() || os.isAndroid();
  const isPhone = isTouch && !isTablet;

  const iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;

  return {
    isiPad : Fun.constant(isiPad),
    isiPhone: Fun.constant(isiPhone),
    isTablet: Fun.constant(isTablet),
    isPhone: Fun.constant(isPhone),
    isTouch: Fun.constant(isTouch),
    isAndroid: os.isAndroid,
    isiOS: os.isiOS,
    isWebView: Fun.constant(iOSwebview)
  };
};