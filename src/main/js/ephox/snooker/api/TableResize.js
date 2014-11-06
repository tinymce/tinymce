define(
  'ephox.snooker.api.TableResize',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.BarManager'
  ],

  function (Event, Events, Adjustments, BarManager) {
    /* 
     * Creates and sets up a bar-based column resize manager 
     */
    return function (container, direction) {
      var manager = BarManager(container, direction);

      var events = Events.create({
        beforeResize: Event([]),
        afterResize: Event([]),
        startDrag: Event([])
      });

      manager.events.adjustWidth.bind(function (event) {
        events.trigger.beforeResize();
        var delta = direction.delta(event.delta());
        console.log('delta: ', delta);
        Adjustments.adjust(event.table(), delta, event.column());
        events.trigger.afterResize();
      });

      manager.events.startAdjust.bind(function (event) {
        events.trigger.startDrag();
      });

      var destroy = function () {
        manager.destroy();
      };

      return {
        on: manager.on,
        off: manager.off,
        destroy: destroy,
        events: events.registry
      };
    };
  }
);
