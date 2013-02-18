define(
  'ephox.dragster.api.Dragger',

  [
    'ephox.dragster.detect.Blocker',
    'ephox.dragster.detect.Movement',
    'ephox.sugar.api.Event',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (Blocker, Movement, Event, Insert, Remove) {
    
    var transform = function (body, anchor, mutation) {
      // ASSUMPTION: it's z-index won't be a problem where it is used.
      var blocker = Blocker();
      var movement = Movement(anchor);

      var drop = function () {
        movement.off();
        Remove.remove(blocker);
      };

      var mousedown = function (event, ui) {
        Insert.append(body, blocker);
        movement.on();
      };

      var mouseup = function (event, ui) {
        drop();
      };

      var mousemove = function (event, ui) {
        movement.onEvent(event);
      };

      movement.events.move.bind(function (event) {
        mutation(event.x(), event.y());
      });

      Event.bind(anchor, 'mousedown', mousedown);
      Event.bind(blocker, 'mouseup', mouseup);
      Event.bind(blocker, 'mousemove', mousemove);
      Event.bind(blocker, 'mouseout', drop);


      // need to have a destroy somehow.
    };
    
    return {
      transform: transform
    };
  }
);
