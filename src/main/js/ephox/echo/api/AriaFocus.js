define(
  'ephox.echo.api.AriaFocus',

  [
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Option, Compare, Focus, PredicateFind, Traverse) {
    var preserve = function (f, container) {
      var ownerDoc = Traverse.owner(container);

      var refocus = Focus.active(ownerDoc).bind(function (focused) {
        var hasFocus = function (elem) {
          return Compare.eq(focused, elem);
        };
        return hasFocus(container) ? Option.some(container) : PredicateFind.descendant(container, hasFocus);
      });

      var result = f(container);

      // If there is a focussed element, the F function may cause focus to be lost (such as by hiding elements). Restore it afterwards.
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