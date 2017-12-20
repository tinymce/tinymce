import Browser from './Browser';
import OperatingSystem from './OperatingSystem';
import DeviceType from '../detect/DeviceType';
import UaString from '../detect/UaString';
import PlatformInfo from '../info/PlatformInfo';

var detect = function (userAgent) {
  var browsers = PlatformInfo.browsers();
  var oses = PlatformInfo.oses();

  var browser = UaString.detectBrowser(browsers, userAgent).fold(
    Browser.unknown,
    Browser.nu
  );
  var os = UaString.detectOs(oses, userAgent).fold(
    OperatingSystem.unknown,
    OperatingSystem.nu
  );
  var deviceType = DeviceType(os, browser, userAgent);

  return {
    browser: browser,
    os: os,
    deviceType: deviceType
  };
};

export default <any> {
  detect: detect
};