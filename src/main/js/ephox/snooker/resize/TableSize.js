define(
  'ephox.snooker.resize.Sizes',

  [
    'ephox.sugar.api.view.Width',
    'ephox.katamari.api.Fun',
    'ephox.snooker.resize.Sizes'
  ],

  function (Width, Fun, Sizes) {
    var percentageBasedSizeRegex = new RegExp(/(\d+(\.\d+)?)%/);
    var pixelBasedSizeRegex = new RegExp(/(\d+(\.\d+)?)px|em/);

    var percentageSize = function (width) {
      var intWidth = parseInt(width, 10);
      var pixelWidth = Width.get(cell);
      return {
        percentageBased: Fun.constant(true),
        width: Fun.constant(intWidth),
        pixelWidth: Fun.constant(pixelWidth)
      };
    };

    var pixelSize = function (width) {
      var intWidth = parseInt(width, 10);
      return {
        percentageBased: Fun.constant(false),
        width: Fun.constant(intWidth),
        pixelWidth: Fun.constant(intWidth)
      };
    };

    var chooseSize = function (element, width) {
      if (percentageBasedSizeRegex.test(width)) {
        var percentMatch = percentageBasedSizeRegex.exec(width);
        return percentageSize(percentMatch[1]);
      } else if (pixelBasedSizeRegex.test(width)) {
        var pixelMatch = pixelBasedSizeRegex.exec(width);
        return pixelSize(pixelMatch[1]);
      } else {
        var fallbackWidth = Width.get(element);
        return pixelSize(fallbackWidth);
      }
    };

    var getTableSize = function (element) {
      var width = Sizes.getRawWidth(element);
      // If we have no width still, return a pixel width at least.
      return width.fold(function () {
        var fallbackWidth = Width.get(cell);
        return pixelSize(fallbackWidth);
      }, function (width) {
        return chooseSize(element, width);
      });
    };

    return {
      getTableSize: getTableSize
    };
});