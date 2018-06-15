import { Adt, Arr, Option, Cell } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import * as DescribedHandler from './DescribedHandler';
import * as EventSource from './EventSource';
import { SugarElement, AdtInterface } from '../alien/TypeDefinitions';
import { SimulatedEvent, EventFormat, fromSource, fromExternal } from './SimulatedEvent';
import { ElementAndHandler, UidAndHandler } from './EventRegistry';

type LookupEvent = (eventName: string, target: SugarElement) => Option<ElementAndHandler>;

type DebuggerLogger = any;

export interface TriggerAdt extends AdtInterface { }

const adt = Adt.generate([
  { stopped: [ ] },
  { resume: [ 'element' ] },
  { complete: [ ] }
]) as {
  stopped: () => AdtInterface;
  resume: (elem: SugarElement) => AdtInterface;
  complete: () => AdtInterface;
}

const doTriggerHandler = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, target: SugarElement, source: Cell<SugarElement>, logger: DebuggerLogger): TriggerAdt => {
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
    } else {
      return Traverse.parent(handlerInfo.element()).fold(() => {
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

const doTriggerOnUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, rawTarget: SugarElement, source: Cell<SugarElement>, logger: DebuggerLogger): boolean => {
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

const triggerHandler = <T extends EventFormat>(lookup: LookupEvent, eventType: string, rawEvent: T, target: SugarElement, logger: DebuggerLogger): TriggerAdt => {
  const source = EventSource.derive(rawEvent, target);
  return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
};

const broadcast = (listeners: UidAndHandler[], rawEvent: EventFormat, logger?: DebuggerLogger): boolean => {
  const simulatedEvent = fromExternal(rawEvent);

  Arr.each(listeners, (listener) => {
    const descHandler = listener.descHandler();
    const handler = DescribedHandler.getHandler(descHandler);
    handler(simulatedEvent);
  });

  return simulatedEvent.isStopped();
};

const triggerUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, logger: DebuggerLogger): boolean => {
  const rawTarget = rawEvent.target();
  return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
};

const triggerOnUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, rawTarget: SugarElement, logger: DebuggerLogger) => {
  const source = EventSource.derive(rawEvent, rawTarget);
  return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
};

export {
  triggerHandler,
  triggerUntilStopped,
  triggerOnUntilStopped,
  broadcast
};