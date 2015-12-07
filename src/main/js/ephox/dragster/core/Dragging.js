define(
  'ephox.dragster.core.Dragging',

  [
    'ephox.dragster.api.DragApis',
    'ephox.dragster.detect.Movement',
    'ephox.peanut.DelayedFunction',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'global!Array'
  ],

  function (DragApis, Movement, DelayedFunction, Event, Events, Array) {
    var setup = function (mutation, mode, settings) {
      var active = false;

      var events = Events.create({
        start: Event([]),
        stop: Event([])
      });

      var movement = Movement();

      var drop = function () {
        sink.stop();
        if (movement.isOn()) {
          movement.off();
          events.trigger.stop();
        }
      };

      var delayDrop = DelayedFunction(drop, 200);

      var go = function (parent) {
        sink.start(parent);
        movement.on();
        events.trigger.start();
      };

      var mouseup = function (event, ui) {
        drop();
      };

      var mousemove = function (event, ui) {
        delayDrop.cancel();
        movement.onEvent(event, mode);
      };

      movement.events.move.bind(function (event) {
        mode.mutate(mutation, event.info());
      });

      var on = function () {
        active = true;
      };

      var off = function () {
        active = false;
        // acivate some events here?
      };

      var runIfActive = function (f) {
        return function () {
          var args = Array.prototype.slice.call(arguments, 0);
          if (active) {
            return f.apply(null, args);
          }
        };
      };

      var sink = mode.sink(DragApis.api({
        // ASSUMPTION: runIfActive is not needed for mousedown. This is pretty much a safety measure for
        // inconsistent situations so that we don't block input.
        forceDrop: drop,
        drop: runIfActive(drop),
        move: runIfActive(mousemove),
        delayDrop: runIfActive(delayDrop.schedule)
      }), settings);
    
      var destroy = function () {
        sink.destroy();
      };

      return {
        element: sink.element,
        go: go,
        on: on,
        off: off,
        destroy: destroy,
        events: events.registry
      };
    };

    return {
      setup: setup
    };
  }
);