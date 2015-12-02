define(
  'ephox.dragster.api.Dragger',

  [
    'ephox.dragster.api.MouseDrag',
    'ephox.dragster.detect.Blocker',
    'ephox.dragster.detect.Movement',
    'ephox.peanut.DelayedFunction',
    'ephox.peanut.Fun',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!Array'
  ],

  function (MouseDrag, Blocker, Movement, DelayedFunction, Fun, Event, Events, DomEvent, Insert, Remove, Array) {

    var transform = function (mutation, options) {
      var settings = options !== undefined ? options : {};
      var mode = settings.mode !== undefined ? settings.mode : MouseDrag;
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


      var unused = { unbind: Fun.noop };

      var bindEvent = function (eventType, action) {
        return eventType.fold(function () {
          return { unbind: Fun.noop };
        }, function (evt) {
          return DomEvent.bind(blocker.element(), evt, action);
        });
      };

      // ASSUMPTION: runIfActive is not needed for mousedown. This is pretty much a safety measure for
      // inconsistent situations so that we don't block input.
      var mdown = bindEvent(mode.onStart(), drop);
      var mup = bindEvent(mode.onStop(), runIfActive(mouseup));
      var mmove = bindEvent(mode.onMove(), runIfActive(mousemove));
      var mout = bindEvent(mode.onExit(), runIfActive(delayDrop.schedule));

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
