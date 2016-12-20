define(
  'ephox.agar.api.RealClipboard',

  [
    'ephox.agar.api.RealKeys',
    'ephox.agar.server.SeleniumAction',
    'ephox.sand.api.PlatformDetection'
  ],

  function (RealKeys, SeleniumAction, PlatformDetection) {
    var platform = PlatformDetection.detect();

    var sImportToClipboard = function (filename) {
      return SeleniumAction.sPerform('/clipboard', {
        'import': filename
      });
    };

    var sCopy = function (selector) {
      var modifiers = platform.os.isOSX() ? { metaKey: true } : { ctrlKey: true };
      return RealKeys.sSendKeysOn(selector, [
        RealKeys.combo(modifiers, 'c')
      ]);
    };

    var sPaste = function (selector) {
      var modifiers = platform.os.isOSX() ? { metaKey: true } : { ctrlKey: true };
      return RealKeys.sSendKeysOn(selector, [
        RealKeys.combo(modifiers, 'v')
      ]);
    };

    return {
      sImportToClipboard: sImportToClipboard,
      sCopy: sCopy,
      sPaste: sPaste
    };
  }
);