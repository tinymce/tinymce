define(
  'ephox.snooker.api.TableResize',

  [
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.BarManager'
  ],

  function (Adjustments, BarManager) {
    /* 
     * Creates and sets up a bar-based column resize manager 
     */
    return function (container) {
      var manager = BarManager(container);

      manager.events.adjustWidth.bind(function (event) {
        Adjustments.adjust(event.table(), event.delta(), event.column());
      });

      var destroy = function () {
        manager.destroy();
      };

      return {
        on: manager.on,
        off: manager.off,
        destroy: destroy
      };
    };
  }
);
