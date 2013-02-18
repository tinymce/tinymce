define(
  'ephox.dragster.detect.InDrag',

  [
    'ephox.dragster.detect.Delta',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events'
  ],

  function (Delta, Event, Events) {
    return function () {

      var delta = Delta();

      var onEvent = function (event) {
        var offset = delta.update(event.x(), event.y());
        offset.each(function (v) {
          events.trigger.move(v.left(), v.top());
        });
      };

      var events = Events.create({
        move: Event(['x', 'y'])
      });

      return {
        onEvent: onEvent,
        reset: delta.reset,
        events: events.registry
      };
    };

  }
);
