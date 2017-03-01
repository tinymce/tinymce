define(
  'ephox.alloy.events.Triggers',

  [
    'ephox.alloy.events.DescribedHandler',
    'ephox.alloy.events.EventSource',
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (DescribedHandler, EventSource, Adt, Arr, Cell, Fun, Traverse, Error) {
    var adt = Adt.generate([
      { stopped: [ ] },
      { resume: [ 'element' ] },
      { complete: [ ] }
    ]);

    var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
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
        logger.logEventNoHandlers(eventType, target);
        return adt.complete();
      }, function (handlerInfo) {
        var descHandler = handlerInfo.descHandler();
        var eventHandler = DescribedHandler.getHandler(descHandler);
        eventHandler(simulatedEvent);

        // Now, check if the event was stopped.
        if (stopper.get() === true) {
          logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
          return adt.stopped();
        }
        // Now, check if the event was cut
        else if (cutter.get() === true) {
          logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
          return adt.complete();
        }
        else return Traverse.parent(handlerInfo.element()).fold(function () {
          logger.logNoParent(eventType, handlerInfo.element(), descHandler.purpose());
          // No parent, so complete.
          return adt.complete();
        }, function (parent) {
          logger.logEventResponse(eventType, handlerInfo.element(), descHandler.purpose());
          // Resume at parent
          return adt.resume(parent);
        });
      });
    };

    var doTriggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, source, logger) {
      return doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(function () {
        // stopped.
        return true;
      }, function (parent) {
        // Go again.
        return doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source, logger);
      }, function () {
        // completed
        return false;
      });
    };

    var triggerHandler = function (lookup, eventType, rawEvent, target, logger) {
      var source = EventSource.derive(rawEvent, target);
      return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
    };

    var broadcast = function (listeners, rawEvent, logger) {
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
        var descHandler = listener.descHandler();
        var handler = DescribedHandler.getHandler(descHandler);
        handler(simulatedEvent);
      });

      return stopper.get() === true;
    };

    var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
      var rawTarget = rawEvent.target();
      return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
    };

    var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
      var source = EventSource.derive(rawEvent, rawTarget);
      return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
    };

    return {
      triggerHandler: triggerHandler,
      triggerUntilStopped: triggerUntilStopped,
      triggerOnUntilStopped: triggerOnUntilStopped,
      broadcast: broadcast
    };
  }
);