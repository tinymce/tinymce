import { Adt, Arr } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import * as DescribedHandler from './DescribedHandler';
import * as EventSource from './EventSource';
import * as SimulatedEvent from './SimulatedEvent';

const adt = Adt.generate([
  { stopped: [ ] },
  { resume: [ 'element' ] },
  { complete: [ ] }
]);

const doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
  const handler = lookup(eventType, target);

  const simulatedEvent = SimulatedEvent.fromSource(rawEvent, source);

  return handler.fold(function () {
    // No handler, so complete.
    logger.logEventNoHandlers(eventType, target);
    return adt.complete();
  }, function (handlerInfo) {
    const descHandler = handlerInfo.descHandler();
    const eventHandler = DescribedHandler.getHandler(descHandler);
    eventHandler(simulatedEvent);

    // Now, check if the event was stopped.
    if (simulatedEvent.isStopped()) {
      logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
      return adt.stopped();
    } else if (simulatedEvent.isCut()) {
      logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
      return adt.complete();
    } else { return Traverse.parent(handlerInfo.element()).fold(function () {
      logger.logNoParent(eventType, handlerInfo.element(), descHandler.purpose());
      // No parent, so complete.
      return adt.complete();
    }, function (parent) {
      logger.logEventResponse(eventType, handlerInfo.element(), descHandler.purpose());
      // Resume at parent
      return adt.resume(parent);
    });
         }
  });
};

const doTriggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, source, logger) {
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

const triggerHandler = function (lookup, eventType, rawEvent, target, logger) {
  const source = EventSource.derive(rawEvent, target);
  return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
};

const broadcast = function (listeners, rawEvent, logger?) {
  const simulatedEvent = SimulatedEvent.fromExternal(rawEvent);

  Arr.each(listeners, function (listener) {
    const descHandler = listener.descHandler();
    const handler = DescribedHandler.getHandler(descHandler);
    handler(simulatedEvent);
  });

  return simulatedEvent.isStopped();
};

const triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
  const rawTarget = rawEvent.target();
  return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
};

const triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
  const source = EventSource.derive(rawEvent, rawTarget);
  return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
};

export {
  triggerHandler,
  triggerUntilStopped,
  triggerOnUntilStopped,
  broadcast
};