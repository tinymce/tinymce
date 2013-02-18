define(
  'ephox.dragster.transform.Grow',

  [
    'ephox.peanut.Fun',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width'
  ],

  function (Fun, Event, Events, Height, Width) {

    var grower = function (f) {
      return function (element) {
        var events = Events.create({
          'grow': Event(['x', 'y'])
        });

        var mutate =  function (x, y) {
          var output = f(x, y);
          var width = Width.get(element);
          var height = Height.get(element);
          Width.set(element, width + output.x());
          Height.set(element, height + output.y());
          events.trigger.grow(output.x(), output.y());
        };

        return {
          mutate: mutate,
          events: events.registry
        };
      };
    };

    var both = grower(function (x, y) {
      return {
        x: Fun.constant(x),
        y: Fun.constant(y)
      };
    });

    var horizontal = grower(function (x, y) {
      return {
        x: Fun.constant(x),
        y: Fun.constant(0)
      };
    });

    var vertical = grower(function (x, y) {
      return {
        x: Fun.constant(0),
        y: Fun.constant(y)
      };
    });

    return {
      both: both,
      horizontal: horizontal,
      vertical: vertical
    };
  }
);
