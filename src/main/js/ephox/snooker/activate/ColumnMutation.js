define(
  'ephox.snooker.activate.ColumnMutation',

  [
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.adjust.Mutation'
  ],

  function (Option, Event, Events, Mutation) {
    return function () {
      var events = Events.create({
        drag: Event(['xDelta', 'yDelta', 'target'])
      });

      var target = Option.none();

      var delegate = Mutation();

      delegate.events.drag.bind(function (event) {
        target.each(function (t) {
          events.trigger.drag(event.xDelta(), event.yDelta(), t);
        });
      });

      var assign = function (t) {
        target = Option.some(t);
      };

      return {
        assign: assign,
        mutate: delegate.mutate,
        events: events.registry
      };
    };
  }
);
