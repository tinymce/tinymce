define(
  'ephox.snooker.api.TableResize',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.api.ResizeDirection',
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.BarManager'
  ],

  function (Event, Events, ResizeDirection, Adjustments, BarManager) {
    /*
     * Creates and sets up a bar-based column resize manager.
     * Wire is used to provide the parent, view, and origin
     */
    return function (wire, vdirection) {
      var hdirection = ResizeDirection.height;
      var manager = BarManager(wire, vdirection, hdirection);

      var events = Events.create({
        beforeResize: Event([]),
        afterResize: Event([]),
        startDrag: Event([])
      });

      manager.events.adjustHeight.bind(function (event) {
        events.trigger.beforeResize();
        var delta = hdirection.delta(event.delta(), event.table());
        Adjustments.adjustHeight(event.table(), delta, event.row(), hdirection);
        events.trigger.afterResize();
      });

      manager.events.startAdjust.bind(function (event) {
        events.trigger.startDrag();
      });

      manager.events.adjustWidth.bind(function (event) {
        events.trigger.beforeResize();
        var delta = vdirection.delta(event.delta(), event.table());
        Adjustments.adjust(event.table(), delta, event.column(), vdirection);
        events.trigger.afterResize();
      });

      return {
        on: manager.on,
        off: manager.off,
        hideBars: manager.hideBars,
        showBars: manager.showBars,
        destroy: manager.destroy,
        events: events.registry
      };
    };
  }
);
