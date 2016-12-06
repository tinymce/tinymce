define(
  'ephox.alloy.events.Triggers',

  [
    'ephox.alloy.events.EventSource',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.ADT',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Traverse',
    'global!Error'
  ],

  function (EventSource, Objects, Arr, Fun, Option, Adt, Cell, Traverse, Error) {
    var adt = Adt.generate([
      { stopped: [ ] },
      { resume: [ 'element' ] },
      { complete: [ ] }
    ]);

    var doTriggerHandler = function (lookup, eventType, rawEvent, target, source) {
      var handler = lookup(eventType, target);

      var stopper = Cell(false);

      var cutter = Cell(false);

      var stop = function () {
        stopper.set(true);
      };
    
      
      var cut = function () {
        cutter.set(true);
      };

      var simulatedEvent = {
        stop: stop,
        cut: cut,
        event: Fun.constant(rawEvent),
        setSource: source.set,
        getSource: source.get
      };

      return handler.fold(function () {
        // No handler, so complete.
        return adt.complete();
      }, function (handlerInfo) {
        handlerInfo.handler(simulatedEvent);

        // Now, check if the event was stopped.
        if (stopper.get() === true) return adt.stopped();
        // Now, check if the event was cut
        else if (cutter.get() === true) return adt.complete();
        else return Traverse.parent(handlerInfo.element()).fold(function () {
          // No parent, so complete.
          return adt.complete();
        }, function (parent) {
          // Resume at parent
          return adt.resume(parent);
        });
      });
    };

    var doTriggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, source) {
      return doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source).fold(function () {
        // stopped.
        console.log('Stopped event', eventType);
        return true;
      }, function (parent) {
        // Go again.
        console.log('Continuing event', eventType);
        return doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source);
      }, function () {
        // completed
        console.log('Completed event', eventType);
        return false;
      });
    };

    var triggerHandler = function (lookup, eventType, rawEvent, target) {
      var source = EventSource.derive(rawEvent, target);
      return doTriggerHandler(lookup, eventType, rawEvent, target, source);
    };

    var broadcast = function (listeners, rawEvent) {
      /* TODO: Remove dupe */
      var stopper = Cell(false);

      var stop = function () {
        stopper.set(true);
      };

      var simulatedEvent = {
        stop: stop,
        cut: Fun.noop, // cutting has no meaning for a broadcasted event
        event: Fun.constant(rawEvent),
        // Nor do targets really
        setTarget: Fun.die(
          new Error('Cannot set target of a broadcasted event')
        ),
        getTarget: Fun.die(
          new Error('Cannot get target of a broadcasted event')
        )
      };

      Arr.each(listeners, function (listener) {
        listener.handler(simulatedEvent);
      });

      return stopper.get() === true;
    };

    var triggerUntilStopped = function (lookup, eventType, rawEvent) {
      var rawTarget = rawEvent.target();
      return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget);
    };

    var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget) {
      var source = EventSource.derive(rawEvent, rawTarget);
      return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source);
    };

    return {
      triggerHandler: triggerHandler,
      triggerUntilStopped: triggerUntilStopped,
      triggerOnUntilStopped: triggerOnUntilStopped,
      broadcast: broadcast
    };
  }
);