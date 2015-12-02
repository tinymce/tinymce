define(
  'ephox.dragster.detect.InDrag',

  [
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events'
  ],

  function (Option, Event, Events) {
    return function () {

      var previous = Option.none();

      var reset = function () {
        previous = Option.none();
      };

      var update = function (mode, nu) {
        var result = previous.map(function (old) {
          return mode.compare(old, nu);
        });

        previous = Option.some(nu);
        return result;
      };

      var onEvent = function (event, mode) {
        var data = mode.extract(event);

        var offset = update(mode, data);
        offset.each(function (d) {
          events.trigger.move(d);
        });
      };

      var events = Events.create({
        move: Event([ 'info' ])
      });

      return {
        onEvent: onEvent,
        reset: reset,
        events: events.registry
      };
    };

  }
);
