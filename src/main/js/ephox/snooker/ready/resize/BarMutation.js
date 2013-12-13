define(
  'ephox.snooker.ready.resize.BarMutation',

  [
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.ready.resize.Mutation'
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
          // There is always going to be this padding / border collapse / margin problem with widths. I'll have to resolve that.
          events.trigger.drag(event.xDelta(), event.yDelta(), t);
        });
      });

      var assign = function (t) {
        target = Option.some(t);
      };

      var get = function () {
        return target;
      };

      return {
        assign: assign,
        get: get,
        mutate: delegate.mutate,
        events: events.registry
      };
    };
  }
);
