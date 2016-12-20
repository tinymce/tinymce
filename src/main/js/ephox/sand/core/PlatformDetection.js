define(
  'ephox.sand.core.PlatformDetection',

  [
    'ephox.sand.core.Browser',
    'ephox.sand.core.OperatingSystem',
    'ephox.sand.detect.DeviceType',
    'ephox.sand.detect.UaString',
    'ephox.sand.info.PlatformInfo'
  ],

  function (Browser, OperatingSystem, DeviceType, UaString, PlatformInfo) {
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

    return {
      detect: detect
    };
  }
);