define(
  'ephox.sugar.impl.NodeValue',

  [
    'ephox.sand.api.PlatformDetection',
    'ephox.katamari.api.Option',
    'global!Error'
  ],

  function (PlatformDetection, Option, Error) {
    return function (is, name) {
      var get = function (element) {
        if (!is(element)) throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
        return getOption(element).getOr('');
      };

      var getOptionIE10 = function (element) {
        // Prevent IE10 from throwing exception when setting parent innerHTML clobbers (TBIO-451).
        try {
          return getOptionSafe(element);
        } catch (e) {
          return Option.none();
        }
      };

      var getOptionSafe = function (element) {
        return is(element) ? Option.from(element.dom().nodeValue) : Option.none();
      };

      var browser = PlatformDetection.detect().browser;
      var getOption = browser.isIE() && browser.version.major === 10 ? getOptionIE10 : getOptionSafe;

      var set = function (element, value) {
        if (!is(element)) throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
        element.dom().nodeValue = value;
      };

      return {
        get: get,
        getOption: getOption,
        set: set
      };
    };
  }
);