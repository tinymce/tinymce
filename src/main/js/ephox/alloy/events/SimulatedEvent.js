define(
  'ephox.alloy.events.SimulatedEvent',

  [
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'global!Error'
  ],

  function (Cell, Fun, Error) {
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

    // Events that come from outside of the alloy root (e.g. window scroll)
    var fromExternal = function (event) {
      var stopper = Cell(false);

      var stop = function () {
        stopper.set(true);
      };

      return {
        stop: stop,
        cut: Fun.noop, // cutting has no meaning for a broadcasted event
        isStopped: stopper.get,
        isCut: Fun.constant(false),
        event: Fun.constant(event),
        // Nor do targets really
        setTarget: Fun.die(
          new Error('Cannot set target of a broadcasted event')
        ),
        getTarget: Fun.die(
          new Error('Cannot get target of a broadcasted event')
        )
      };
    };

    var fromTarget = function (event, target) {
      var source = Cell(target);
      return fromSource(event, source);
    };

    return {
      fromSource: fromSource,
      fromExternal: fromExternal,
      fromTarget: fromTarget
    };
  }
);
