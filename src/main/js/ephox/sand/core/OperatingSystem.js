define(
  'ephox.sand.core.OperatingSystem',

  [
    'ephox.katamari.api.Fun',
    'ephox.sand.detect.Version'
  ],

  function (Fun, Version) {
    var windows = 'Windows';
    var ios = 'iOS';
    var android = 'Android';
    var linux = 'Linux';
    var osx = 'OSX';
    var solaris = 'Solaris';
    var freebsd = 'FreeBSD';

    // Though there is a bit of dupe with this and Browser, trying to 
    // reuse code makes it much harder to follow and change.
    var isOS = function (name, current) {
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

        isWindows: isOS(windows, current),
        // TODO: Fix capitalisation
        isiOS: isOS(ios, current),
        isAndroid: isOS(android, current),
        isOSX: isOS(osx, current),
        isLinux: isOS(linux, current),
        isSolaris: isOS(solaris, current),
        isFreeBSD: isOS(freebsd, current)
      };
    };

    return {
      unknown: unknown,
      nu: nu,

      windows: Fun.constant(windows),
      ios: Fun.constant(ios),
      android: Fun.constant(android),
      linux: Fun.constant(linux),
      osx: Fun.constant(osx),
      solaris: Fun.constant(solaris),
      freebsd: Fun.constant(freebsd)
    };
  }
);