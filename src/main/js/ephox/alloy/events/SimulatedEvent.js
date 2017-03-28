define(
  'ephox.alloy.events.SimulatedEvent',

  [
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (Cell, Fun) {
    var fromSource = function (event, source) {
      var stopper = Cell(false);

      var cutter = Cell(false);

      var stop = function () {
        stopper.set(true);
      };
      
      var cut = function () {
        cutter.set(true);
      };

      return {
        stop: stop,
        cut: cut,
        isStopped: stopper.get,
        isCut: cutter.get,
        event: Fun.constant(event),
        setSource: source.set,
        getSource: source.get
      };
    };

    var fromTarget = function (event, target) {
      var source = Cell(target);
      return fromSource(event, source);
    };

    return {
      fromSource: fromSource,
      fromTarget: fromTarget
    };
  }
);
