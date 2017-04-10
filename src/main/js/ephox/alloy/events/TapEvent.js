define(
  'ephox.alloy.events.TapEvent',

  [
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare'
  ],

  function (Cell, Option, Compare) {
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
          state.set(Option.some(event.target()));
          return Option.none();
        } else if (type === 'touchmove') {
          state.set(Option.none());
          return Option.none();
        } else if (type === 'touchend') {
          return state.get().filter(function (tgt) {
            return Compare.eq(tgt, event.target());
          }).map(function (tgt) {
            return settings.triggerEvent('tap', event);
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
