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
    return function (container) {
      var manager = BarManager(container);

      var events = Events.create({
        beforeResize: Event([]),
        afterResize: Event([]),
        startDrag: Event([])
      });

      manager.events.adjustWidth.bind(function (event) {
        events.trigger.beforeResize();
        Adjustments.adjust(event.table(), event.delta(), event.column());
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
