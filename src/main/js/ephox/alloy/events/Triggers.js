import DescribedHandler from './DescribedHandler';
import EventSource from './EventSource';
import SimulatedEvent from './SimulatedEvent';
import { Adt } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

var adt = Adt.generate([
  { stopped: [ ] },
  { resume: [ 'element' ] },
  { complete: [ ] }
]);

var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
  var handler = lookup(eventType, target);

  var simulatedEvent = SimulatedEvent.fromSource(rawEvent, source);

  return handler.fold(function () {
    // No handler, so complete.
    logger.logEventNoHandlers(eventType, target);
    return adt.complete();
  }, function (handlerInfo) {
    var descHandler = handlerInfo.descHandler();
    var eventHandler = DescribedHandler.getHandler(descHandler);
    eventHandler(simulatedEvent);

    // Now, check if the event was stopped.
    if (simulatedEvent.isStopped()) {
      logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
      return adt.stopped();
    }
    // Now, check if the event was cut
    else if (simulatedEvent.isCut()) {
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
  var simulatedEvent = SimulatedEvent.fromExternal(rawEvent);

  Arr.each(listeners, function (listener) {
    var descHandler = listener.descHandler();
    var handler = DescribedHandler.getHandler(descHandler);
    handler(simulatedEvent);
  });

  return simulatedEvent.isStopped();
};

var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
  var rawTarget = rawEvent.target();
  return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
};

var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
  var source = EventSource.derive(rawEvent, rawTarget);
  return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
};

export default <any> {
  triggerHandler: triggerHandler,
  triggerUntilStopped: triggerUntilStopped,
  triggerOnUntilStopped: triggerOnUntilStopped,
  broadcast: broadcast
};