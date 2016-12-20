define(
  'ephox.sugar.api.events.DomEvent',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.impl.FilteredEvent'
  ],

  function (Fun, FilteredEvent) {
    var filter = Fun.constant(true); // no filter on plain DomEvents

    var bind = function (element, event, handler) {
      return FilteredEvent.bind(element, event, filter, handler);
    };

    var capture = function (element, event, handler) {
      return FilteredEvent.capture(element, event, filter, handler);
    };

    return {
      bind: bind,
      capture: capture
    };
  }
);
