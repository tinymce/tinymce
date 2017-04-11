define(
  'ephox.alloy.events.TapEvent',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare'
  ],

  function (SystemEvents, Cell, Option, Compare) {
    // TODO: If required, we can make an abstraction for this later.module.label

    var monitor = function (settings) {
      /* A tap event is a combination of touchstart and touchend on the same element
       * without a *significant* touchmove in between. Note, that at the moment, any
       * touchmove will be considered significant, but this can be improved over time
       */

      // Need a return value, so can't use Singleton.value;
      var state = Cell(Option.none());

      var fireIfReady = function (event, type) {
        if (type === 'touchstart') {
          if (event.raw().touches === undefined || event.raw().touches.length !== 1) return Option.none();
          var touch = event.raw().touches[0];
          state.set(Option.some({
            target: event.target(),
            x: touch.clientX,
            y: touch.clientY
          }));
          return Option.none();
        } else if (type === 'touchmove') {
          if (event.raw().touches === undefined || event.raw().touches.length !== 1) return Option.none();
          var touch = event.raw().touches[0];
          state.get().each(function (data) {
            var distX = Math.abs(touch.clientX - data.x);
            var distY = Math.abs(touch.clientY - data.y);
            if (distX > 5 || distY > 5) {
              state.set(Option.none());
            }
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
