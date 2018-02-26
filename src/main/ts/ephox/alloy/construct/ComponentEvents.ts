import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import * as ObjIndex from '../alien/ObjIndex';
import PrioritySort from '../alien/PrioritySort';
import DescribedHandler from '../events/DescribedHandler';
import EventHandler from './EventHandler';

/*
 * The process of combining a component's events
 *
 * - Generate all the handlers based on the behaviour and the base events
 * - Create an index (eventName -> [tuples(behaviourName, handler)])
 * - Map over this index:
 *    - if the list == length 1, then collapse it to the head value
 *    - if the list > length 1, then:
 *        - sort the tuples using the behavour name ordering specified using
            eventOrder[event]. Return error if insufficient
 *        - generate a can, run, and abort that combines the handlers of the
            tuples in the sorted order
 *
 * So at the end, you should have Result(eventName -> single function)
 */
const behaviourTuple = function (name, handler) {
  return {
    name: Fun.constant(name),
    handler: Fun.constant(handler)
  };
};

const nameToHandlers = function (behaviours, info) {
  const r = {};
  Arr.each(behaviours, function (behaviour) {
    r[behaviour.name()] = behaviour.handlers(info);
  });
  return r;
};

const groupByEvents = function (info, behaviours, base) {
  const behaviourEvents = Merger.deepMerge(base, nameToHandlers(behaviours, info));
  // Now, with all of these events, we need to index by event name
  return ObjIndex.byInnerKey(behaviourEvents, behaviourTuple);
};

const combine = function (info, eventOrder, behaviours, base) {
  const byEventName = groupByEvents(info, behaviours, base);
  return combineGroups(byEventName, eventOrder);
};

const assemble = function (rawHandler) {
  const handler = EventHandler.read(rawHandler);
  return function (component, simulatedEvent/*, others */) {
    const args = Array.prototype.slice.call(arguments, 0);
    if (handler.abort.apply(undefined, args)) {
      simulatedEvent.stop();
    } else if (handler.can.apply(undefined, args)) {
      handler.run.apply(undefined, args);
    }
  };
};

const missingOrderError = function (eventName, tuples) {
  return Result.error([
    'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' +
    'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' +
    'can trigger it are: ' + Json.stringify(Arr.map(tuples, function (c) { return c.name(); }), null, 2)
  ]);
};

const fuse = function (tuples, eventOrder, eventName) {
  // ASSUMPTION: tuples.length will never be 0, because it wouldn't have an entry if it was 0
  const order = eventOrder[eventName];
  if (! order) { return missingOrderError(eventName, tuples); } else { return PrioritySort.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
    const handlers = Arr.map(sortedTuples, function (tuple) { return tuple.handler(); });
    return EventHandler.fuse(handlers);
  });
  }
};

const combineGroups = function (byEventName, eventOrder) {
  const r = Obj.mapToArray(byEventName, function (tuples, eventName) {
    const combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse(tuples, eventOrder, eventName);
    return combined.map(function (handler) {
      const assembled = assemble(handler);
      const purpose = tuples.length > 1 ? Arr.filter(eventOrder, function (o) {
        return Arr.contains(tuples, function (t) { return t.name() === o; });
      }).join(' > ') : tuples[0].name();
      return Objects.wrap(eventName, DescribedHandler.nu(assembled, purpose));
    });
  });

  return Objects.consolidate(r, {});
};

export {
  combine
};