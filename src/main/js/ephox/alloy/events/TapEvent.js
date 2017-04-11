define(
  'ephox.alloy.events.TapEvent',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'global!Math'
  ],

  function (SystemEvents, Cell, Option, Compare, Math) {
    var SIGNIFICANT_MOVE = 5;

    var getTouch = function (event) {
      if (event.raw().touches === undefined || event.raw().touches.length !== 1) return Option.none();
      return Option.some(event.raw().touches[0]);
    };

    // Check to see if the touch has changed a *significant* amount
    var isFarEnough = function (touch, data) {
      var distX = Math.abs(touch.clientX - data.x);
      var distY = Math.abs(touch.clientY - data.y);
      return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
    };

    var monitor = function (settings) {
      /* A tap event is a combination of touchstart and touchend on the same element
       * without a *significant* touchmove in between.
       */

      // Need a return value, so can't use Singleton.value;
      var state = Cell(Option.none());

      var fireIfReady = function (event, type) {
        if (type === 'touchstart') {
          getTouch(event).each(function (touch) {
            state.set(Option.some({
              target: event.target(),
              x: touch.clientX,
              y: touch.clientY
            }));
          });
          return Option.none();
        } else if (type === 'touchmove') {
          getTouch(event).each(function (touch) {
            state.get().each(function (data) {
              if (isFarEnough(touch, data)) state.set(Option.none());
            });
          });
          return Option.none();
        } else if (type === 'touchend') {
          return state.get().filter(function (data) {
            return Compare.eq(data.target, event.target());
          }).map(function (data) {
            return settings.triggerEvent(SystemEvents.tap(), event);
          });
        } else {
          return Option.none();
        }
      };

      return {
        fireIfReady: fireIfReady
      };
    };

    return {
      monitor: monitor
    };
  }
);
