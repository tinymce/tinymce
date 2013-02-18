define(
  'ephox.dragster.transform.Grow',

  [
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width'
  ],

  function (Height, Width) {
    var both = function (element) {
      return function (x, y) {
        var width = Width.get(element);
        var height = Height.get(element);
        Width.set(element, width + x);
        Height.set(element, height + y);
      };
    };

    var horizontal = function (element) {
      return function (x, _y) {

      };
    };

    var vertical = function (element) {
      return function (_x, y) {

      };
    };

    return {
      both: both,
      horizontal: horizontal,
      vertical: vertical
    };
  }
);
