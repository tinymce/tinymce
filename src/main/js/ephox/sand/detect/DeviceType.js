define(
  'ephox.sand.detect.DeviceType',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    return function (os, browser, userAgent) {
      var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
      var isiPhone = os.isiOS() && !isiPad;
      var isAndroid3 = os.isAndroid() && os.version.major === 3;
      var isAndroid4 = os.isAndroid() && os.version.major === 4;
      var isTablet = isiPad || isAndroid3 || ( isAndroid4 && /mobile/i.test(userAgent) === true );
      var isTouch = os.isiOS() || os.isAndroid();
      var isPhone = isTouch && !isTablet;

      var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;

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
  }
);