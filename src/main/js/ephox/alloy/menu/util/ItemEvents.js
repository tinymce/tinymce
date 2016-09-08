define(
  'ephox.alloy.menu.util.ItemEvents',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Focus'
  ],

  function (EventHandler, Fun, Focus) {
    var hoverEvent = 'alloy.item-hover';
    var focusEvent = 'alloy.item-focus';

    var hoverHandler = EventHandler.nu({
      run: function (item) {
        // Firstly, check that the focus isn't already inside the item. This
        // is to handle situations like widgets where the widget is inside the item
        // and it has the focus, so as you slightly adjust the mouse, you don't
        // want to lose focus on the widget. Note, that because this isn't API based
        // (i.e. we are manually searching for focus), it may not be that flexible.
        if (Focus.search(item.element()).isNone() || item.apis().isFocused()) {
          if (! item.apis().isFocused()) item.apis().focus();
          var target = item.element();
          item.getSystem().triggerEvent(hoverEvent, target, {
            target: Fun.constant(target),
            item: Fun.constant(item)
          });
        }
      }
    });

    var onFocus = function (item) {
      var target = item.element();
      item.getSystem().triggerEvent(focusEvent, target, {
        target: Fun.constant(target),
        item: Fun.constant(item)
      });
    };

    return {
      hover: Fun.constant(hoverEvent),
      focus: Fun.constant(focusEvent),

      hoverHandler: hoverHandler,
      onFocus: onFocus
    };
  }
);