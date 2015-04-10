define(
  'ephox.echo.api.AriaFocus',

  [
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.Traverse'
  ],

  function (Option, Compare, Focus, PredicateFind, SelectorExists, Traverse) {
    // ASSUMPTION: If the focus has transferred to a panel or a dialog, keep it there
    var keepers = '.ephox-pastry-panel, .ephox-polish-dialog';

    var refresh = function (toolbar) {
      Focus.active().each(function (focused) {
        if (!SelectorExists.closest(focused, keepers)) {
          if (toolbar.focused()) toolbar.restore();
        }
      });
    };

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
      refresh: refresh,
      preserve: preserve
    };
  }
);