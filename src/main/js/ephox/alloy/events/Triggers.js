define(
  'ephox.alloy.events.Triggers',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.ADT',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Traverse'
  ],

  function (Fun, Adt, Cell, Traverse) {
    var adt = Adt.generate([
      { stopped: [ ] },
      { resume: [ 'element' ] },
      { complete: [ ] }
    ]);

    var triggerHandler = function (lookup, eventType, rawEvent, target) {
      var handler = lookup(eventType, target);

      var stopper = Cell(false);

      var stop = function () {
        stopper.set(true);
      };

      var simulatedEvent = {
        stop: stop,
        event: Fun.constant(rawEvent)
      };

      return handler.fold(function () {
        // No handler, so complete.
        return adt.complete();
      }, function (handlerInfo) {
        handlerInfo.handler(simulatedEvent);

        // Now, check if the event was stopped.
        if (stopper.get() === true) return adt.stopped();
        else return Traverse.parent(handlerInfo.element()).fold(function () {
          // No parent, so complete.
          return adt.complete();
        }, function (parent) {
          // Resume at parent
          return adt.resume(parent);
        });
      });
    };

    var triggerUntilStopped = function (lookup, eventType, rawEvent) {
      var rawTarget = rawEvent.target();
      return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget);
    };

    var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget) {
      return triggerHandler(lookup, eventType, rawEvent, rawTarget).fold(function () {
        // stopped.
        return true;
      }, function (parent) {
        // Go again.
        return triggerOnUntilStopped(lookup, eventType, rawEvent, parent);
      }, function () {
        // completed
        return false;
      });
    };

    return {
      triggerHandler: triggerHandler,
      triggerUntilStopped: triggerUntilStopped,
      triggerOnUntilStopped: triggerOnUntilStopped
    };
  }
);