define(
  'ephox.alloy.ui.slider.SliderModel',

  [
    'global!Math'
  ],

  function (Math) {
    var reduceBy = function (value, min, max, step) {
      if (value < min) return value;
      else if (value > max) return max;
      else if (value === min) return min - 1;
      else return Math.max(min, value - step);
    };

    var increaseBy = function (value, min, max, step) {
      if (value > max) return value;
      else if (value < min) return min;
      else if (value === max) return max + 1;
      else return Math.min(max, value + step);
    };

    var capValue = function (value, min, max) {
      return Math.max(
        min,
        Math.min(max, value)
      );
    };

    var snapValueOfX = function (bounds, value, min, max, step) {
      // We are snapping by the step size. Therefore, find the nearest multiple of
      // the step
      var initValue = value - min;
      var extraValue = Math.round(initValue / step) * step;
      return capValue(min + extraValue, min - 1, max + 1);
    };

    var findValueOfX = function (bounds, min, max, xValue, step, snapToGrid) {
      var range = max - min;
      if (xValue < bounds.left) return min - 1;
      else if (xValue > bounds.right) return max + 1;
      else {
        var xOffset = Math.min(bounds.right, Math.max(xValue, bounds.left)) - bounds.left;
        var newValue = capValue(Math.round((xOffset / bounds.width) * range) + min, min - 1, max + 1);
        return snapToGrid && newValue >= min && newValue <= max ? snapValueOfX(bounds, newValue, min, max, step) : newValue;
      }
    };

    return {
      reduceBy: reduceBy,
      increaseBy: increaseBy,
      findValueOfX: findValueOfX
    };
  }
);