import { Adt, Arr, Option, Cell } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import * as DescribedHandler from './DescribedHandler';
import * as EventSource from './EventSource';
import { SugarElement } from '../alien/TypeDefinitions';
import { SimulatedEvent, EventFormat, fromSource, fromExternal } from './SimulatedEvent';
import { ElementAndHandler } from './EventRegistry';

type LookupEvent = (eventName: string, event: SimulatedEvent<EventFormat>) => Option<ElementAndHandler>;

const adt = Adt.generate([
  { stopped: [ ] },
  { resume: [ 'element' ] },
  { complete: [ ] }
]);

const doTriggerHandler = (lookup, eventType: string, rawEvent: EventFormat, target: SugarElement, source: Cell<SugarElement>, logger) => {
  const handler = lookup(eventType, target);

  const simulatedEvent = fromSource(rawEvent, source);

  return handler.fold(() => {
    // No handler, so complete.
    logger.logEventNoHandlers(eventType, target);
    return adt.complete();
  }, (handlerInfo) => {
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
    } else { return Traverse.parent(handlerInfo.element()).fold(() => {
      logger.logNoParent(eventType, handlerInfo.element(), descHandler.purpose());
      // No parent, so complete.
      return adt.complete();
    }, (parent) => {
      logger.logEventResponse(eventType, handlerInfo.element(), descHandler.purpose());
      // Resume at parent
      return adt.resume(parent);
    });
         }
  });
};

const doTriggerOnUntilStopped = (lookup, eventType, rawEvent, rawTarget, source, logger) => {
  return doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(() => {
    // stopped.
    return true;
  }, (parent) => {
    // Go again.
    return doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source, logger);
  }, () => {
    // completed
    return false;
  });
};

const triggerHandler = (lookup, eventType, rawEvent, target, logger) => {
  const source = EventSource.derive(rawEvent, target);
  return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
};

const broadcast = (listeners, rawEvent, logger?) => {
  const simulatedEvent = fromExternal(rawEvent);

  Arr.each(listeners, (listener) => {
    const descHandler = listener.descHandler();
    const handler = DescribedHandler.getHandler(descHandler);
    handler(simulatedEvent);
  });

  return simulatedEvent.isStopped();
};

const triggerUntilStopped = (lookup, eventType, rawEvent, logger) => {
  const rawTarget = rawEvent.target();
  return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
};

const triggerOnUntilStopped = (lookup, eventType, rawEvent, rawTarget, logger) => {
  const source = EventSource.derive(rawEvent, rawTarget);
  return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
};

export {
  triggerHandler,
  triggerUntilStopped,
  triggerOnUntilStopped,
  broadcast
};