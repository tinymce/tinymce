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
    
    var transform = function (body, anchor, mutation) {

      var active = false;

      var events = Events.create({
        start: Event([]),
        stop: Event([])
      });

      // ASSUMPTION: it's z-index won't be a problem where it is used.
      var blocker = Blocker();
      var movement = Movement(anchor);

      var drop = function () {
        movement.off();
        Remove.remove(blocker);
        events.trigger.stop();
      };

      var mousedown = function (event, ui) {
        Insert.append(body, blocker);
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

      var mdown = DomEvent.bind(anchor, 'mousedown', runIfActive(mousedown));
      var mup = DomEvent.bind(blocker, 'mouseup', runIfActive(mouseup));
      var mmove = DomEvent.bind(blocker, 'mousemove', runIfActive(mousemove));
      var mout = DomEvent.bind(blocker, 'mouseout', runIfActive(drop));

      var destroy = function () {
        Remove.remove(blocker);
        mdown.unbind();
        mup.unbind();
        mmove.unbind();
        mout.unbind();
      };

      return {
        on: on,
        off: off,
        destroy: destroy,
        events: events.registry
      };

      // need to have a destroy somehow.
    };
    
    return {
      transform: transform
    };
  }
);
