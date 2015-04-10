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

      // If there is a focussed element, the F function may cause focus to be lost (such as by hiding elements). Restore it afterwards.
      var refocuser = Focus.active(ownerDoc).bind(function (focused) {
        var hasFocus = function (elem) {
          return Compare.eq(focused, elem);
        };
        return hasFocus(container) ? Option.some(container) : PredicateFind.descendant(container, hasFocus);
      });

      var result = f(container);
      refocuser.each(Focus.focus);
      return result;
    };

    return {
      preserve: preserve
    };
  }
);