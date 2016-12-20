define(
  'ephox.sugar.api.view.Platform',

  [
    'ephox.katamari.api.Arr',
    'ephox.sand.api.PlatformDetection',
    'ephox.katamari.api.Option',
    'global!window'
  ],

  function (Arr, PlatformDetection, Option, window) {
    var platform = PlatformDetection.detect();
    var isTouch = platform.deviceType.isTouch;

    // TODO: Work out what these values are supposed to be.
    var MINIMUM_LARGE_WIDTH = 620;
    var MINIMUM_LARGE_HEIGHT = 700;

    // window.screen.width and window.screen.height do not change with the orientation,
    // however window.screen.availableWidth and window.screen.availableHeight,
    // do change according to the orientation.
    var isOfSize = function (width, height) {
      return window.screen.width >= width && window.screen.height >= height;
    };

    var choice = function (options, fallback) {
      var target = Arr.foldl(options, function (b, option) {
        return b.orThunk(function () {
          return option.predicate() ? Option.some(option.value()) : Option.none();
        });
      }, Option.none());

      return target.getOr(fallback);
    };

    var isLargeTouch = function () {
      return isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();
    };

    var isLargeDesktop = function () {
      return isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && !isTouch();
    };

    var isSmallTouch = function () {
      return !isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();
    };

    var isLarge = function () {
      return isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT);
    };

    var isSmallAndroid = function () {
      return isSmallTouch() && platform.deviceType.isAndroid();
    };

    return {
      isTouch: isTouch,
      choice: choice,
      isLarge: isLarge,
      isLargeTouch: isLargeTouch,
      isSmallTouch: isSmallTouch,
      isLargeDesktop: isLargeDesktop,
      isSmallAndroid: isSmallAndroid
    };
  }
);