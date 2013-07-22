define(
  'ephox.snooker.activate.ColumnMutation',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.adjust.Mutation',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Option, Event, Events, Mutation, Class, SelectorFind, Traverse) {
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

      return {
        assign: assign,
        mutate: delegate.mutate,
        events: events.registry
      };
    };
  }
);
