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
    'global!Array'
  ],

  function (Blocker, Movement, Event, Events, DomEvent, Insert, Remove, Array) {
    
    var transform = function (mutation, options) {
      var settings = options !== undefined ? options : {};
      var active = false;

      var events = Events.create({
        start: Event([]),
        stop: Event([])
      });

      var blocker = Blocker(settings);
      var movement = Movement();

      var drop = function () {
        Remove.remove(blocker.element());
        if (movement.isOn()) {
          movement.off();
          events.trigger.stop();
        }
      };

      var go = function (parent) {
        Insert.append(parent, blocker.element());
        movement.on();
        events.trigger.start();
      };

      var mouseup = function (event, ui) {
        drop();
      };

      var mousemove = function (event, ui) {
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

      var mup = DomEvent.bind(blocker.element(), 'mouseup', runIfActive(mouseup));
      var mmove = DomEvent.bind(blocker.element(), 'mousemove', runIfActive(mousemove));
      var mout = DomEvent.bind(blocker.element(), 'mouseout', runIfActive(drop));

      var destroy = function () {
        blocker.destroy();
        mup.unbind();
        mmove.unbind();
        mout.unbind();
      };

      return {
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
