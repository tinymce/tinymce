define(
  'ephox.snooker.api.TableResize',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.ColBarManager',
    'ephox.snooker.resize.RowBarManager'
  ],

  function (Event, Events, Adjustments, ColBarManager, RowBarManager) {
    /*
     * Creates and sets up a bar-based column resize manager.
     * Wire is used to provide the parent, view, and origin
     */
    return function (wire, vdirection, hdirection) {
      var vmanager = ColBarManager(wire, vdirection);
      var hmanager = RowBarManager(wire, hdirection);


      var events = Events.create({
        beforeResize: Event([]),
        afterResize: Event([]),
        startDrag: Event([])
      });

      hmanager.events.adjustHeight.bind(function (event) {
        events.trigger.beforeResize();
        var delta = hdirection.delta(event.delta(), event.table());
        Adjustments.adjustHeight(event.table(), delta, event.row(), hdirection);
        events.trigger.afterResize();
      });

      hmanager.events.startAdjust.bind(function (event) {
        events.trigger.startDrag();
      });

      vmanager.events.adjustWidth.bind(function (event) {
        events.trigger.beforeResize();
        var delta = vdirection.delta(event.delta(), event.table());
        Adjustments.adjust(event.table(), delta, event.column(), vdirection);
        events.trigger.afterResize();
      });

      vmanager.events.startAdjust.bind(function (event) {
        events.trigger.startDrag();
      });

      var destroy = function () {
        hmanager.destroy();
        vmanager.destroy();
      };

      var on = function () {
        hmanager.on();
        vmanager.on();
      };

      var off = function () {
        hmanager.off();
        vmanager.off();
      };

      var hideBars = function () {
        hmanager.hideBars();
        vmanager.hideBars();
      };

      var showBars = function () {
        hmanager.showBars();
        vmanager.showBars();
      };

      return {
        on: on,
        off: off,
        hideBars: hideBars,
        showBars: showBars,
        destroy: destroy,
        events: events.registry
      };
    };
  }
);
