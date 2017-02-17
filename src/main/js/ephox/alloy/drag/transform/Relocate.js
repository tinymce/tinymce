define(
  'ephox.dragster.transform.Relocate',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Location'
  ],

  function (Event, Events, Css, Location) {
    var both = function (element) {
      var mutate = function (x, y) {
        var location = Location.absolute(element);
        Css.setAll(element, {
          left: (location.left() + x) + 'px',
          top: (location.top() + y) + 'px'
        });
        events.trigger.relocate(x, y);
      };

      var events = Events.create({
        'relocate': Event(['x', 'y'])
      });

      return {
        mutate: mutate,
        events: events.registry
      };
    };

    return {
      both: both
    };
  }
);
