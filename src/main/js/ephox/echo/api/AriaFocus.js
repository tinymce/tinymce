define(
  'ephox.echo.api.AriaFocus',

  [
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Traverse'
  ],

  function (Compare, Focus, Traverse) {
    var preserve = function (f, container) {
      var ownerDoc = Traverse.owner(container);

      // If there is a focussed element, the F function may cause focus to be lost (such as by hiding elements). Restore it afterwards.
      var refocus = Focus.active(ownerDoc);

      var result = f(container);
      refocus.each(function (oldFocus) {
        Focus.active(ownerDoc).filter(function (newFocus) {
          return Compare.eq(newFocus, oldFocus);
        }).orThunk(function () {
          // Only refocus if the focus has changed, otherwise we break IE
          Focus.focus(oldFocus);
        });
      });
      return result;
    };

    return {
      preserve: preserve
    };
  }
);