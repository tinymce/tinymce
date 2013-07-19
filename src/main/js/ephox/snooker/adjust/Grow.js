define(
  'ephox.snooker.adjust.Grow',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events'
  ],

  function (Event, Events) {
    return function () {
      var events = Events.create({
        'grow': Event(['x', 'y'])
      });

      var mutate = function (x, y) {
        events.trigger.grow(x, y);
      };

      return {
        mutate: mutate,
        events: events.registry
      };
    };

  }
);
