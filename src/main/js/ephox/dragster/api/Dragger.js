define(
  'ephox.dragster.api.Dragger',

  [
    'ephox.dragster.detect.Blocker',
    'ephox.dragster.detect.Movement',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.peanut.DelayedFunction',
    'global!Array'
  ],

  function (Blocker, Movement, Event, Events, DomEvent, Insert, Remove, DelayedFunction, Array) {

    var transform = function (mutation, options) {
      var settings = options !== undefined ? options : {};
      var active = false;

      var events = Events.create({
        start: Event([]),
        stop: Event([])
      });

      var blocker = Blocker(settings);
      var movement = Movement();

      var drop = function (event) {
        Remove.remove(blocker.element());
        if (movement.isOn()) {
          movement.off();
          events.trigger.stop();
        }
      };

      var delayDrop = DelayedFunction(drop, 200);

      var go = function (parent) {
        Insert.append(parent, blocker.element());
        movement.on();
        events.trigger.start();
      };

      var mouseup = function (event, ui) {
        drop();
      };

      var mousemove = function (event, ui) {
        delayDrop.cancel();
        movement.onEvent(event);
      };

      movement.events.move.bind(function (event) {
        mutation.mutate(event.x(), event.y());
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

      // ASSUMPTION: runIfActive is not needed for mousedown. This is pretty much a safety measure for
      // inconsistent situations so that we don't block input.
      var mdown = DomEvent.bind(blocker.element(), 'mousedown', drop);
      var mup = DomEvent.bind(blocker.element(), 'mouseup', runIfActive(mouseup));
      var mmove = DomEvent.bind(blocker.element(), 'mousemove', runIfActive(mousemove));
      var mout = DomEvent.bind(blocker.element(), 'mouseout', runIfActive(delayDrop.schedule));

      var destroy = function () {
        blocker.destroy();
        mup.unbind();
        mmove.unbind();
        mout.unbind();
        mdown.unbind();
      };

      return {
        element: blocker.element,
        go: go,
        on: on,
        off: off,
        destroy: destroy,
        events: events.registry
      };
    };

    return {
      transform: transform
    };
  }
);
