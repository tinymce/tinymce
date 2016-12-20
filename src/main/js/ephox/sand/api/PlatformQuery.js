define(
  'ephox.sand.api.PlatformQuery',

  [

  ],

  function () {
    var isEdge = function (platform) {
      return platform.browser.isEdge();
    };

    var isChrome = function (platform) {
      return platform.browser.isChrome();
    };

    var isFirefox = function (platform) {
      return platform.browser.isFirefox();
    };

    var isIE11 = function (platform) {
      return isIE(platform) && platform.browser.version.major === 11;
    };

    var isIE = function (platform) {
      return platform.browser.isIE();
    };

    var isSafari = function (platform) {
      return platform.browser.isSafari();
    };

    var isOpera = function (platform) {
      return platform.browser.isOpera();
    };

    // Add other helper methods as required.

    return {
      isEdge: isEdge,
      isChrome: isChrome,
      isFirefox: isFirefox,
      isOpera: isOpera,
      isIE11: isIE11,
      isIE: isIE,
      isSafari: isSafari
    };
  }
);