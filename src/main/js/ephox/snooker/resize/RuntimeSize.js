define(
  'ephox.snooker.resize.RuntimeSize',

  [
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Width'
  ],

  function (PlatformDetection, Css, Height, Width) {
    var platform = PlatformDetection.detect();

    var needManualCalc = function () {
      return platform.browser.isIE() || platform.browser.isEdge();
    };

    var toNumber = function (px, fallback) {
      var num = parseFloat(px.replace(/px/, ''));
      return isNaN(num) ? fallback : num;
    };

    var getProp = function (elm, name, fallback) {
      return toNumber(Css.get(elm, name), fallback);
    };

    var getHeight = function (cell) {
      return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', Height.get(cell));
    };

    var getCalculatedHeight = function (cell) {
      var paddingTop = getProp(cell, 'padding-top', 0);
      var paddingBottom = getProp(cell, 'padding-bottom', 0);
      var borderTop = getProp(cell, 'border-top-width', 0);
      var borderBottom = getProp(cell, 'border-bottom-width', 0);
      var height = cell.dom().getBoundingClientRect().height;

      return height - paddingTop - paddingBottom - borderTop - borderBottom;
    };

    var getWidth = function (cell) {
      return getProp(cell, 'width', Width.get(cell));
    };

    var getHeight = function (cell) {
      return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', Height.get(cell));
    };

    return {
      getWidth: getWidth,
      getHeight: getHeight
    };
  }
);
