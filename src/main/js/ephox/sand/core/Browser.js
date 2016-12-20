define(
  'ephox.sand.core.Browser',

  [
    'ephox.katamari.api.Fun',
    'ephox.sand.detect.Version'
  ],

  function (Fun, Version) {
    var edge = 'Edge';
    var chrome = 'Chrome';
    var ie = 'IE';
    var opera = 'Opera';
    var firefox = 'Firefox';
    var safari = 'Safari';

    var isBrowser = function (name, current) {
      return function () {
        return current === name;
      };
    };

    var unknown = function () {
      return nu({
        current: undefined,
        version: Version.unknown()
      });
    };

    var nu = function (info) {
      var current = info.current;
      var version = info.version;

      return {
        current: current,
        version: version,

        // INVESTIGATE: Rename to Edge ?
        isEdge: isBrowser(edge, current),
        isChrome: isBrowser(chrome, current),
        // NOTE: isIe just looks too weird
        isIE: isBrowser(ie, current),
        isOpera: isBrowser(opera, current),
        isFirefox: isBrowser(firefox, current),
        isSafari: isBrowser(safari, current)
      };
    };

    return {
      unknown: unknown,
      nu: nu,
      edge: Fun.constant(edge),
      chrome: Fun.constant(chrome),
      ie: Fun.constant(ie),
      opera: Fun.constant(opera),
      firefox: Fun.constant(firefox),
      safari: Fun.constant(safari)
    };
  }
);