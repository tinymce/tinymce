define(
  'ephox.dragster.transform.Relocate',

  [
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Location'
  ],

  function (Css, Location) {
    var both = function (element) {
      return function (x, y) {
        var location = Location.absolute(element);
        Css.setAll(element, {
          left: location.left() + x,
          top: location.top() + y
        });
      };
    };

    return {
      both: both
    };
  }
);
